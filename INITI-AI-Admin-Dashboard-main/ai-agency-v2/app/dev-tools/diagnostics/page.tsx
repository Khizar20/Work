'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, AlertCircle, Upload, RefreshCw, Database } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Separator } from "@/components/ui/separator";

/**
 * This page is used to diagnose connection issues with Supabase
 * and ensure document management functionality works correctly.
 */
export default function SupabaseDiagnosticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionData, setConnectionData] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [refreshKey, setRefreshKey] = useState(0); // Used to force re-fetch
  const { toast } = useToast();

  // Test connection to backend
  useEffect(() => {
    async function checkConnection() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/test-connection');
        const data = await response.json();
        setConnectionData(data);
      } catch (error) {
        console.error('Error checking connection:', error);
        setConnectionData({ error: 'Failed to connect to API' });
      } finally {
        setIsLoading(false);
      }
    }
    
    checkConnection();
  }, [refreshKey]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle test upload
  const handleTestUpload = async () => {
    setUploadStatus('pending');
    
    try {
      // Create a simple text file for testing
      const testFile = new File(
        [`Test document created at ${new Date().toISOString()}`], 
        'test-document.txt', 
        { type: 'text/plain' }
      );
      
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('title', 'Diagnostic Test Document');
      formData.append('description', 'This document was created by the diagnostic tool to test functionality.');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      toast({
        title: "Document uploaded successfully",
        description: "Test upload completed successfully.",
        variant: "default"
      });
      
      setUploadStatus('success');
      // Refresh connection data to update document count
      setTimeout(() => {
        handleRefresh();
      }, 1000);
    } catch (error: any) {
      console.error('Test upload error:', error);
      toast({
        title: "Upload Test Failed",
        description: error.message || "There was a problem testing the upload functionality.",
        variant: "destructive"
      });
      setUploadStatus('error');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supabase Diagnostics</h1>
          <p className="text-muted-foreground">
            Test and diagnose Supabase connection and document management functionality
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>Verify connection to Supabase and authentication status</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : connectionData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-full 
                        ${connectionData.authenticated ? 'bg-green-100' : 'bg-red-100'}`}>
                        {connectionData.authenticated ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          {connectionData.authenticated ? 'User is authenticated' : 'Not authenticated'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-full 
                        ${connectionData.userHasHotel ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {connectionData.userHasHotel ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Hotel Association</p>
                        <p className="text-sm text-muted-foreground">
                          {connectionData.userHasHotel ? 'User associated with hotel' : 'User not associated with any hotel'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-full 
                        ${connectionData.apiConnectionStatus === 'Connected' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {connectionData.apiConnectionStatus === 'Connected' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">API Connection</p>
                        <p className="text-sm text-muted-foreground">
                          {connectionData.apiConnectionStatus || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {connectionData.hotel && (
                    <div className="space-y-3 border rounded-lg p-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Hotel</p>
                        <p className="font-medium">{connectionData.hotel.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Hotel Slug</p>
                        <p>{connectionData.hotel.slug}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Admin Role</p>
                        <p className="capitalize">{connectionData.hotelAdmin?.role || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Documents</p>
                        <p>{connectionData.documentCount || 0} documents</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {connectionData.error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                    <p className="font-medium text-red-600">Error</p>
                    <p className="text-sm text-red-600">{connectionData.error}</p>
                    {connectionData.errorDetails && (
                      <p className="text-xs text-red-500 mt-1">{connectionData.errorDetails}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <p className="font-medium text-yellow-600">No connection data available</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Last checked: {connectionData?.timestamp ? new Date(connectionData.timestamp).toLocaleString() : 'Never'}
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Management Tests</CardTitle>
            <CardDescription>Test document upload functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Test Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a test document to verify storage integration
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleTestUpload} 
                  disabled={uploadStatus === 'pending' || !connectionData?.authenticated || !connectionData?.userHasHotel}
                >
                  {uploadStatus === 'pending' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Test Document Upload
                    </>
                  )}
                </Button>
                
                {uploadStatus === 'success' && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Upload successful
                  </div>
                )}
                
                {uploadStatus === 'error' && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Upload failed
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Next Steps</h3>
                <p className="text-sm text-muted-foreground">
                  View and verify your documents in the Documents Library
                </p>
              </div>
              
              <Button variant="outline" onClick={() => window.location.href = '/documents-library'}>
                <Database className="h-4 w-4 mr-2" />
                Go to Documents Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
