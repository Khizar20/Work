'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, MoreVertical, Download, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import type { Document } from '../utils/document-service';

export default function DocumentCard({ 
  document, 
  onDocumentDeleted 
}: { 
  document: Document;
  onDocumentDeleted?: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fileTypeColor = () => {
    switch(document.file_type.toLowerCase()) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'docx': return 'bg-blue-100 text-blue-800';
      case 'pptx': return 'bg-orange-100 text-orange-800';
      case 'png':
      case 'jpg':
      case 'jpeg': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getFileTypeLabel = () => {
    switch(document.file_type.toLowerCase()) {
      case 'pdf': return 'PDF';
      case 'docx': return 'Word';
      case 'pptx': return 'PowerPoint';
      case 'png': return 'PNG Image';
      case 'jpg':
      case 'jpeg': return 'JPEG Image';
      default: return document.file_type.toUpperCase();
    }
  };
  
  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(document.created_at), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`);
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }
      const { downloadUrl } = await response.json();
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Download Failed',
        description: 'There was a problem downloading the document.',
        variant: 'destructive',
      });
    }
  };

  const handleView = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/view`);
      if (!response.ok) {
        throw new Error('Failed to get view URL');
      }
      const { viewUrl } = await response.json();
      window.open(viewUrl, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: 'View Failed',
        description: 'There was a problem viewing the document.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
        toast({
        title: 'Document Deleted',
        description: 'The document has been successfully deleted.',
      });
      
      // Call the callback to refresh the list instead of router.refresh()
      if (onDocumentDeleted) {
        onDocumentDeleted();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Delete Failed',
        description: 'There was a problem deleting the document.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${fileTypeColor().split(' ')[0]} bg-opacity-20`}>
              <FileText className={fileTypeColor().split(' ')[1]} />
            </div>
            <div>
              <h3 className="font-medium line-clamp-1" title={document.title}>
                {document.title}
              </h3>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <span>{getTimeAgo()}</span>
                <span className="mx-1">•</span>                <span>
                  {document.uploader?.user_id ? (
                    `User ${document.uploader.user_id.substring(0, 8)}...`
                  ) : (
                    'Unknown'
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={fileTypeColor()}>
              {getFileTypeLabel()}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleView}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600" 
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {document.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {document.description}
          </p>
        )}
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{document.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
