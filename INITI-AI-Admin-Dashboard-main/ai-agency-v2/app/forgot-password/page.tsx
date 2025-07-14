'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Mount check to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    // Basic email validation
    if (!email || !email.includes('@') || email.trim().length < 5) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }    try {
      // Use the reset-password page directly as the redirect URL
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Password reset error:', error);
        setError(error.message);
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setMessage('Password reset instructions have been sent to your email');
        toast({
          title: "Email Sent",
          description: "Check your email for the password reset link",
          variant: "success"
        });
      }
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      setError('An unexpected error occurred. Please try again later.');
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };  // Return a simple loading state during server-side rendering
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-violet-900">
        <Card className="w-full max-w-md p-8 space-y-4 bg-black/50 backdrop-blur-sm text-white border-white/10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-violet-700/50 p-3 rounded-full">
              <Mail className="h-6 w-6 text-white/50" />
            </div>
            <h1 className="text-2xl font-bold text-center text-white">Password Recovery</h1>
            <div className="w-8 h-8 border-4 border-t-violet-500 border-white/20 rounded-full animate-spin"></div>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-violet-900">
      <Card className="w-full max-w-md p-8 space-y-6 bg-black/50 backdrop-blur-sm text-white border-white/10">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="bg-violet-700 p-3 rounded-full mb-2">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Password Recovery</h1>
          <p className="text-sm text-white/70">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        {message && (
          <Alert className="bg-green-900/50 border-green-800 text-white">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-800 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email Address
            </label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white focus-visible:ring-violet-500"
              required
              disabled={isLoading}
              placeholder="Enter your email address"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⚪</span>
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Reset Link
              </>
            )}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          <Link href="/login" className="text-violet-400 hover:text-violet-300 flex items-center justify-center gap-1">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}