'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileType, Loader2 } from 'lucide-react';

export default function DocumentUploader({ 
  onSuccess = () => {}, 
  onCancel = () => {} 
}: { 
  onSuccess?: () => void,
  onCancel?: () => void
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['pdf', 'png', 'jpeg', 'jpg', 'docx', 'pptx'];
    
    if (fileExtension && allowedTypes.includes(fileExtension)) {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, PNG, JPEG, JPG, DOCX, or PPTX file.",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    const fileType = file.name.split('.').pop()?.toLowerCase();
    let color = "text-gray-400";
    
    switch (fileType) {
      case 'pdf': color = "text-red-500"; break;
      case 'docx': color = "text-blue-500"; break;
      case 'pptx': color = "text-orange-500"; break;
      case 'png':
      case 'jpg':
      case 'jpeg': color = "text-green-500"; break;
    }
    
    return <FileType className={`h-12 w-12 ${color}`} />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description.trim()) {
        formData.append('description', description);
      }
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }
      
      const data = await response.json();
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been uploaded and will be processed shortly.",
        variant: "default"
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      
      // Refresh the documents list
      router.refresh();
      onSuccess();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was a problem uploading your document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">Document Title</Label>
        <Input
          id="title"
          placeholder="Enter document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isUploading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Description (optional)</Label>
        <textarea
          id="description"
          placeholder="Describe the document content"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
          disabled={isUploading}
        />
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex flex-col items-center">
            {getFileIcon()}
            <p className="mt-2 font-medium text-sm">{file.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => setFile(null)}
              disabled={isUploading}
            >
              Select Different File
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm font-medium">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports: PDF, DOCX, PPTX, PNG, JPEG, JPG
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Select File
            </Button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
          accept=".pdf,.docx,.pptx,.png,.jpeg,.jpg"
          disabled={isUploading}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={!file || !title.trim() || isUploading}
          className="relative"
        >
          {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
    </form>
  );
}
