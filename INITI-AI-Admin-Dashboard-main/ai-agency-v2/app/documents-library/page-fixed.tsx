'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, FileUp, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from '../components/DashboardLayout';
import DocumentCard from '../components/DocumentCard';
import type { Document } from '../utils/document-service';

export default function DocumentsLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const { toast } = useToast();

  // Fetch documents from API
  const fetchDocuments = async () => {
    try {
      const queryParams = new URLSearchParams({
        limit: '12',
        offset: '0',
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/documents?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
      setTotalDocuments(data.total || 0);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error loading documents",
        description: error.message || "There was a problem loading your documents.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (mounted) {
      const debounceTimer = setTimeout(() => {
        fetchDocuments();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, mounted]);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Documents Library</h1>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents Library</h1>
          <p className="text-muted-foreground">
            Access and manage your uploaded documents
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Button onClick={() => window.location.href = '/upload-center'}>
            <FileUp className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-background/50">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search to find what you're looking for"
                : "Upload some documents to get started"}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => window.location.href = '/upload-center'}
                className="mt-4"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Upload Your First Document
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
