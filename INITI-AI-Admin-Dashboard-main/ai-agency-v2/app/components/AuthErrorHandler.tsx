'use client';

import { useEffect } from 'react';
import { useToast } from '../../components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface AuthErrorHandlerProps {
  redirectTo?: string;
}

export default function AuthErrorHandler({ redirectTo = '/login' }: AuthErrorHandlerProps) {
  const { toast } = useToast();
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleHashParams = () => {
        // Parse URL hash for error parameters or query params
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        
        // Check for hash errors (Supabase format)
        if (hash && hash.includes('error=')) {
          // Extract error parameters from hash
          const errorType = hash.match(/error=([^&]*)/);
          const errorCode = hash.match(/error_code=([^&]*)/);
          const errorDescription = hash.match(/error_description=([^&]*)/);
          
          let errorTitle = 'Authentication Error';
          let errorMessage = 'An unknown error occurred during authentication.';
          
          // Build clear error message
          if (errorDescription) {
            errorMessage = decodeURIComponent(errorDescription[1].replace(/\+/g, ' '));
          }
          
          // Handle specific error codes
          if (errorCode && errorCode[1] === 'otp_expired') {
            errorTitle = 'Link Expired';
            errorMessage = 'Your password reset link has expired. Please request a new one.';
          } else if (errorType && errorType[1] === 'access_denied') {
            errorTitle = 'Access Denied';
            errorMessage = 'Unable to verify your identity. Please request a new password reset link.';
          } else if (errorCode && errorCode[1] === 'invalid_token') {
            errorTitle = 'Invalid Link';
            errorMessage = 'The password reset link is invalid or has been tampered with.';
          }
          
          // Show toast notification
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive",
          });
          
          // Clean the URL by redirecting to the base path without hash
          const cleanUrl = window.location.pathname;
          window.history.replaceState(null, '', cleanUrl);
          
          // For expired links, redirect to forgot password
          if (errorCode && (errorCode[1] === 'otp_expired' || errorCode[1] === 'invalid_token')) {
            setTimeout(() => {
              router.push('/forgot-password');
            }, 2000);
          }
        }
        // Check for query param errors (our custom format)
        else if (searchParams.has('error')) {
          const errorType = searchParams.get('error');
          
          let errorTitle = 'Error';
          let errorMessage = 'An error occurred. Please try again.';
          
          if (errorType === 'invalid_token') {
            errorTitle = 'Invalid Link';
            errorMessage = 'Your password reset link is invalid. Please request a new one.';
            
            // Redirect to forgot password
            setTimeout(() => {
              router.push('/forgot-password');
            }, 2000);
          } else if (errorType === 'server_error') {
            errorTitle = 'Server Error';
            errorMessage = 'An unexpected error occurred on the server. Please try again later.';
          }
          
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive",
          });
          
          // Clean the URL by redirecting to the base path without query params
          const cleanUrl = window.location.pathname;
          window.history.replaceState(null, '', cleanUrl);
        }
      };
      
      handleHashParams();
    }
  }, [toast, router, redirectTo]);
  
  // Render nothing - this is just a hook handler
  return null;
}
