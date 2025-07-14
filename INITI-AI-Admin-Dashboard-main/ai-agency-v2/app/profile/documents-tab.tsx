'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../utils/auth';
import { uploadHotelDocument, getHotelDocuments } from '../utils/hotel-documents';
import { getUserHotelId } from '../utils/supabase';
import {
  FileText,
  Upload,
  Plus,
  X as XIcon,
  FileIcon,
  AlertCircle,
  Check
} from 'lucide-react';

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp'
];

function getFileType(file: File): string {
  switch (file.type) {
    case 'application/pdf':
      return 'PDF';
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'Word Document';
    case 'text/plain':
      return 'Text Document';
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'Spreadsheet';
    case 'application/vnd.ms-powerpoint':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'Presentation';
    case 'image/jpeg':
    case 'image/png':
    case 'image/webp':
      return 'Image';
    default:
      return 'Unknown';
  }
}

export default function HotelDocumentsUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [documentType, setDocumentType] = useState<string>('policies');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [language, setLanguage] = useState<string>('english');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setErrors({
          ...errors,
          file: 'Invalid file type. Please upload a PDF, Word document, Excel, PowerPoint, or image file.'
        });
        return;
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setErrors({
          ...errors,
          file: 'File size exceeds 50MB limit.'
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Clear errors
      const newErrors = {...errors};
      delete newErrors.file;
      setErrors(newErrors);
      
      // Auto-populate title if empty
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };
  
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'Document title is required';
    }
    
    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    }
    
    if (!documentType) {
      newErrors.documentType = 'Document type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
    const [hotelId, setHotelId] = useState<string | null>(null);
  
  // Fetch the hotel ID when the component mounts
  useEffect(() => {
    const fetchHotelId = async () => {
      if (user) {
        const response = await getUserHotelId(user.id);
        if (response.data) {
          setHotelId(response.data);
        } else if (response.error) {
          toast({
            title: "Error",
            description: "Failed to get hotel information",
            variant: "destructive",
          });
        }
      }
    };
    
    fetchHotelId();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    if (!user || !selectedFile || !hotelId) {
      toast({
        title: "Error",
        description: "Missing required information: user, file, or hotel ID",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Use the hotel ID we fetched earlier
      
      const metadata = {
        title,
        description,
        hotelId,
        documentType,
        tags,
        language
      };
      
      const result = await uploadHotelDocument(user.id, hotelId, selectedFile, metadata);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Reset form
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setTags([]);
      setCurrentTag('');
      setDocumentType('policies');
      setLanguage('english');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // DocumentsList component to display uploaded documents
  interface DocumentsListProps {
    hotelId: string;
  }

  function DocumentsList({ hotelId }: DocumentsListProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
      const fetchDocuments = async () => {
        setIsLoading(true);
        try {
          const response = await getHotelDocuments(hotelId);
          if (response.data) {
            setDocuments(response.data);
          } else if (response.error) {
            toast({
              title: "Error",
              description: "Failed to load documents: " + response.error,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching documents:", error);
          toast({
            title: "Error",
            description: "An unexpected error occurred while loading documents",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDocuments();
    }, [hotelId, toast]);
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin text-white/30">⚪</div>
        </div>
      );
    }
    
    if (documents.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText size={48} className="mx-auto text-white/30 mb-4" />
            <p className="text-white font-medium">No documents yet</p>
            <p className="text-white/70 text-sm mt-1">
              Upload your first document to get started
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => document.querySelector('[value="upload"]')?.dispatchEvent(new MouseEvent('click'))}
            >
              <Upload size={16} className="mr-2" />
              Upload a Document
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden border border-white/10">
              <div className="p-4 bg-white/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded bg-white/10">
                      <FileIcon size={16} className="text-white" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-medium text-white truncate" title={doc.title}>{doc.title}</h4>
                      <p className="text-xs text-white/70">{doc.fileType}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 text-sm">
                {doc.description && (
                  <p className="text-white/70 mb-3 line-clamp-2">{doc.description}</p>
                )}
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.metadata?.tags?.map((tag: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-white/50">
                    Added: {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm" className="text-xs" asChild>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Hotel Documents</h2>
        <p className="text-white/70">
          Upload and manage documents related to your hotel
        </p>
      </div>
      
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="bg-white/10">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="manage">Manage Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Upload Document</h3>
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    selectedFile ? 'border-green-500 bg-green-500/10' : 'border-white/20 hover:border-white/40'
                  } transition-colors cursor-pointer`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={ACCEPTED_FILE_TYPES.join(',')}
                  />
                  
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="p-3 rounded-full bg-green-500/20 mb-3">
                        <Check size={24} className="text-green-400" />
                      </div>
                      <p className="text-white font-medium mb-1">{selectedFile.name}</p>
                      <p className="text-white/70 text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {getFileType(selectedFile)}
                      </p>
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="p-3 rounded-full bg-white/10 mb-3">
                        <Upload size={24} className="text-white/70" />
                      </div>
                      <p className="text-white font-medium">Drag and drop a file here, or click to browse</p>
                      <p className="text-white/70 text-sm mt-1">
                        PDF, Word, Excel, PowerPoint, or images up to 50MB
                      </p>
                    </div>
                  )}
                </div>
                
                {errors.file && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={14} />
                    {errors.file}
                  </p>
                )}
              </div>
              
              {/* Document Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter document title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`bg-white/5 border-white/10 ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} />
                      {errors.title}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter document description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/5 border-white/10 min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="documentType">Document Type</Label>
                  <select
                    id="documentType"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className={`w-full h-10 rounded-md border bg-white/5 border-white/10 ${
                      errors.documentType ? 'border-red-500' : ''
                    } p-2 text-white`}
                  >
                    <option value="policies">Hotel Policies</option>
                    <option value="procedures">Procedures</option>
                    <option value="menus">Restaurant Menus</option>
                    <option value="marketing">Marketing Materials</option>
                    <option value="forms">Forms</option>
                    <option value="training">Training Materials</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.documentType && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} />
                      {errors.documentType}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="language">Document Language</Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-10 rounded-md border bg-white/5 border-white/10 p-2 text-white"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="arabic">Arabic</option>
                    <option value="russian">Russian</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-4 md:col-span-2">
                  <Label htmlFor="tags">Tags</Label>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="Add tags (press Enter or click Add)"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        className="bg-white/5 border-white/10 flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={!currentTag.trim()}
                      >
                        <Plus size={16} className="mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <div
                            key={index}
                            className="px-3 py-1 rounded-full bg-white/10 text-white flex items-center gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-400 transition-colors"
                            >
                              <XIcon size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin mr-2">⚪</div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileText size={16} className="mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
          <TabsContent value="manage">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Manage Hotel Documents</h3>
              
              <p className="text-white/70">
                View and manage the documents you've uploaded. You can filter by document type, add or remove tags,
                and control who has access to each document.
              </p>
              
              {/* Documents list */}
              {hotelId ? (
                <DocumentsList hotelId={hotelId} />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto text-white/30 mb-4" />
                    <p className="text-white font-medium">No hotel association found</p>
                    <p className="text-white/70 text-sm mt-1">
                      You need to be associated with a hotel to manage documents
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
