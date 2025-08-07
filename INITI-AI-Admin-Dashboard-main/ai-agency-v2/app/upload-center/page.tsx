'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import DashboardLayout from '../components/DashboardLayout';
import { useRouter, useSearchParams } from 'next/navigation';

interface UploadItem {
  id: string;
  name: string;
  size: string;
  type: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  createdAt: string;
}

export default function UploadCenter() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isMenuUpload = searchParams?.get('type') === 'menu';
  
  // Mock data
  const mockUploads: UploadItem[] = [
    {
      id: '1',
      name: 'Q2 Financial Report.pdf',
      size: '2.4 MB',
      type: 'PDF',
      progress: 100,
      status: 'complete',
      createdAt: '2025-06-06T10:23:00Z',
    },
    {
      id: '2',
      name: 'New Room Images.zip',
      size: '15.8 MB',
      type: 'ZIP',
      progress: 100,
      status: 'complete',
      createdAt: '2025-06-05T14:45:00Z',
    },
    {
      id: '3',
      name: 'Staff Training Video.mp4',
      size: '45.2 MB',
      type: 'MP4',
      progress: 35,
      status: 'uploading',
      createdAt: '2025-06-07T09:12:00Z',
    },
    {
      id: '4',
      name: 'Guest Survey Results.xlsx',
      size: '1.2 MB',
      type: 'Excel',
      progress: 100,
      status: 'processing',
      createdAt: '2025-06-07T08:30:00Z',
    },
    {
      id: '5',
      name: 'Room Service Menu Update.docx',
      size: '0.8 MB',
      type: 'Word',
      progress: 100,
      status: 'complete',
      createdAt: '2025-06-04T16:20:00Z',
    }
  ];

  useEffect(() => {
    setMounted(true);
    // In a real app, we'd fetch from Supabase
    setUploads(mockUploads);
  }, []);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Upload Center</h1>
        </div>
      </DashboardLayout>
    );
  }

  // Filter uploads based on the active tab
  const filteredUploads = uploads.filter(upload => {
    if (activeTab === 'all') return true;
    if (activeTab === 'uploading') return upload.status === 'uploading';
    if (activeTab === 'processing') return upload.status === 'processing';
    if (activeTab === 'complete') return upload.status === 'complete';
    if (activeTab === 'error') return upload.status === 'error';
    return true;
  });

  // Handle file upload (real implementation for menu uploads)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isMenuUpload) {
      // Only process the first file for menu upload
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('menuUpload', 'true');
      // Optionally add description or other fields
      try {
        // Show uploading status
        setUploads([{ id: `menu-${Date.now()}`, name: file.name, size: formatFileSize(file.size), type: getFileType(file.name), progress: 0, status: 'uploading', createdAt: new Date().toISOString() }, ...uploads]);
        const res = await fetch('/api/upload?type=menu', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          setUploads(prev => prev.map(u => u.name === file.name ? { ...u, progress: 100, status: 'complete' } : u));
          // Optionally show a toast or feedback
          alert('Menu uploaded and processed!');
        } else {
          setUploads(prev => prev.map(u => u.name === file.name ? { ...u, progress: 100, status: 'error' } : u));
          alert('Menu upload failed.');
        }
      } catch (err) {
        setUploads(prev => prev.map(u => u.name === file.name ? { ...u, progress: 100, status: 'error' } : u));
        alert('Menu upload failed.');
      }
      return;
    }

    // Create new upload items
    const newUploads = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name),
      progress: 0,
      status: 'uploading' as const,
      createdAt: new Date().toISOString(),
    }));

    // Add to uploads
    setUploads([...newUploads, ...uploads]);

    // Simulate upload progress
    newUploads.forEach(upload => {
      simulateUploadProgress(upload.id);
    });
  };

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Get file type helper
  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return 'PDF';
      case 'docx':
      case 'doc': return 'Word';
      case 'xlsx':
      case 'xls': return 'Excel';
      case 'pptx':
      case 'ppt': return 'PowerPoint';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'Image';
      case 'mp4':
      case 'mov': return 'Video';
      case 'zip': return 'ZIP';
      default: return ext.toUpperCase();
    }
  };

  // Simulate upload progress
  const simulateUploadProgress = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Update upload status to complete or processing
        setUploads(prevUploads => 
          prevUploads.map(upload => 
            upload.id === id 
              ? { ...upload, progress: 100, status: Math.random() > 0.5 ? 'complete' : 'processing' } 
              : upload
          )
        );
      } else {
        // Update upload progress
        setUploads(prevUploads => 
          prevUploads.map(upload => 
            upload.id === id ? { ...upload, progress } : upload
          )
        );
      }
    }, 500);
  };

  // Get status badge
  const getStatusBadge = (status: UploadItem['status']) => {
    switch (status) {
      case 'uploading':
        return <Badge className="bg-blue-500">Uploading</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case 'complete':
        return <Badge className="bg-green-500">Complete</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Center</h1>
          <p className="text-muted-foreground">
            Upload and manage files for your hotel
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="relative"
          >
            Upload Files
            <Input
              id="file-upload"
              type="file"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="uploading">Uploading</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="complete">Completed</TabsTrigger>
            <TabsTrigger value="error">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <Card className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1"></div>
                </div>
              </div>
              <div className="divide-y">
                {filteredUploads.map((upload) => (
                  <div key={upload.id} className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5 truncate">
                        <div className="font-medium truncate">{upload.name}</div>
                        <div className="text-xs text-gray-500">{new Date(upload.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="col-span-2">{upload.size}</div>
                      <div className="col-span-2">{upload.type}</div>
                      <div className="col-span-2">
                        {getStatusBadge(upload.status)}
                        {upload.status === 'uploading' && (
                          <Progress 
                            value={upload.progress} 
                            className="h-1 mt-2" 
                          />
                        )}
                      </div>
                      <div className="col-span-1 text-right">
                        <Button variant="ghost" size="sm">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUploads.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Upload files to see them here.
                    </p>
                    <div className="mt-6">
                      <Button
                        onClick={() => document.getElementById('file-upload-empty')?.click()}
                        size="sm"
                      >
                        Upload Files
                        <Input
                          id="file-upload-empty"
                          type="file"
                          multiple
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleFileUpload}
                        />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}