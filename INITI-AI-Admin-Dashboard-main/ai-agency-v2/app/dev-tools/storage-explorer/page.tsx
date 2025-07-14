'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, File, FolderOpen, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { supabase } from '@/app/utils/supabase';
import { Separator } from '@/components/ui/separator';

type FileObject = {
  id: string;
  name: string;
  bucket_id: string;
  owner: string;
  size: number;
  created_at: string;
  updated_at: string;
  metadata: any;
  path: string;
  isFolder?: boolean;
};

export default function StorageExplorerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentBucket, setCurrentBucket] = useState('hotel_documents');
  const [currentPath, setCurrentPath] = useState('');
  const [buckets, setBuckets] = useState<string[]>([]);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const { toast } = useToast();

  // Load buckets
  useEffect(() => {
    const loadBuckets = async () => {
      try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) throw error;
        
        if (data) {
          const bucketNames = data.map(bucket => bucket.name);
          setBuckets(bucketNames);
          
          // Set default bucket if it exists
          if (bucketNames.includes('hotel_documents')) {
            setCurrentBucket('hotel_documents');
          } else if (bucketNames.length > 0) {
            setCurrentBucket(bucketNames[0]);
          }
        }
      } catch (error: any) {
        console.error('Error loading buckets:', error);
        toast({
          title: 'Error loading storage buckets',
          description: error.message || 'Failed to load storage buckets',
          variant: 'destructive'
        });
      }
    };
    
    loadBuckets();
  }, [toast]);

  // Load files when bucket or path changes
  useEffect(() => {
    const loadFiles = async () => {
      if (!currentBucket) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.storage
          .from(currentBucket)
          .list(currentPath, { sortBy: { column: 'name', order: 'asc' } });
          
        if (error) throw error;
        
        if (data) {
          // Extract folders and files
          const folderPaths: string[] = [];
          const fileObjects: FileObject[] = [];
          
          data.forEach(item => {
            if (item.id) { // It's a file
              fileObjects.push({
                ...item,
                size: item.metadata?.size ?? 0,
                path: currentPath ? `${currentPath}/${item.name}` : item.name
              });
            } else { // It's a folder
              folderPaths.push(item.name);
            }
          });
          
          setFolders(folderPaths);
          setFiles(fileObjects);
        }
      } catch (error: any) {
        console.error('Error loading files:', error);
        toast({
          title: 'Error loading files',
          description: error.message || 'Failed to load files from storage',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFiles();
  }, [currentBucket, currentPath, toast]);

  // Navigate to a subfolder
  const navigateToFolder = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };

  // Navigate to parent folder
  const navigateUp = () => {
    if (!currentPath) return;
    
    const pathParts = currentPath.split('/');
    pathParts.pop(); // Remove the last part
    setCurrentPath(pathParts.join('/'));
  };

  // Change bucket
  const changeBucket = (bucket: string) => {
    setCurrentBucket(bucket);
    setCurrentPath(''); // Reset path when changing bucket
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file URL
  const getFileUrl = (file: FileObject) => {
    const { data } = supabase.storage.from(currentBucket).getPublicUrl(file.path);
    return data.publicUrl;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storage Explorer</h1>
          <p className="text-muted-foreground">
            Browse and manage files in Supabase Storage buckets
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Bucket selection */}
          <div className="w-full sm:w-64">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Buckets</CardTitle>
              </CardHeader>
              <CardContent className="px-2 py-0">
                <div className="space-y-1">
                  {buckets.length === 0 && !isLoading ? (
                    <p className="text-center text-sm text-muted-foreground py-2">No buckets found</p>
                  ) : (
                    buckets.map(bucket => (
                      <Button
                        key={bucket}
                        variant={bucket === currentBucket ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => changeBucket(bucket)}
                      >
                        {bucket}
                      </Button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* File explorer */}
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader className="py-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">Files</CardTitle>
                    <CardDescription className="text-sm">
                      Bucket: {currentBucket || 'None selected'}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setFiles([]);
                      setFolders([]);
                      // Re-trigger the effect
                      const bucket = currentBucket;
                      setCurrentBucket('');
                      setTimeout(() => setCurrentBucket(bucket), 0);
                    }}
                    disabled={isLoading || !currentBucket}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>
                
                {/* Path navigation */}
                <div className="flex items-center gap-2 text-sm">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentPath('')}
                    disabled={!currentPath}
                  >
                    Root
                  </Button>
                  
                  {currentPath && (
                    <>
                      <span>/</span>
                      {currentPath.split('/').map((part, index, array) => (
                        <div key={index} className="flex items-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setCurrentPath(array.slice(0, index + 1).join('/'))}
                          >
                            {part}
                          </Button>
                          {index < array.length - 1 && <span>/</span>}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : folders.length === 0 && files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/60 mb-2" />
                    <p className="text-muted-foreground">No files or folders found in this location</p>
                  </div>
                ) : (
                  <div>
                    {/* Folders */}
                    {folders.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                          Folders
                        </div>
                        <div>
                          {folders.map(folder => (
                            <Button
                              key={folder}
                              variant="ghost"
                              className="w-full justify-start px-4 py-2 h-auto"
                              onClick={() => navigateToFolder(folder)}
                            >
                              <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
                              {folder}
                            </Button>
                          ))}
                        </div>
                        {files.length > 0 && <Separator className="my-2" />}
                      </>
                    )}
                    
                    {/* Files */}
                    {files.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                          Files
                        </div>
                        <div>
                          {files.map(file => (
                            <div 
                              key={file.id} 
                              className="flex items-center justify-between px-4 py-2 hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-center">
                                <File className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(file.metadata.size || 0)}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => window.open(getFileUrl(file), '_blank')}
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
