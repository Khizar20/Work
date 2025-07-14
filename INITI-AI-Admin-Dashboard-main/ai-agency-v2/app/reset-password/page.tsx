'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ArrowLeft, Key, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Mount check to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle URL hash parameters and set up session
  useEffect(() => {
    if (!mounted) return;

    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL (Supabase sends auth data in URL hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (type === 'recovery' && accessToken && refreshToken) {
          // Set the session using the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            setError('Invalid or expired reset link. Please request a new one.');
          } else {
            setIsValidSession(true);
            // Clear the URL hash for security
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          // Check if we already have a valid session
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && !error) {
            setIsValidSession(true);
          } else {
            setError('Invalid or expired reset link. Please request a new one.');
          }
        }
      } catch (err) {
        console.error('Error handling auth callback:', err);
        setError('An error occurred while processing your reset link.');
      } finally {
        setCheckingSession(false);
      }
    };

    handleAuthCallback();
  }, [mounted, supabase.auth]);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    return errors;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(', ')}`);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error('Error updating password:', error);
        setError('Failed to update password. Please try again.');
      } else {
        setSuccess(true);
        toast({
          title: 'Password Updated Successfully',
          description: 'You can now log in with your new password.',
        });
        
        // Sign out and redirect to login after a brief delay
        setTimeout(async () => {
          await supabase.auth.signOut();
          router.push('/login?message=password-reset-success');
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state during server-side rendering
  if (!mounted || checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-violet-900">
        <Card className="w-full max-w-md p-8 space-y-4 bg-black/50 backdrop-blur-sm text-white border-white/10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-violet-700/50 p-3 rounded-full">
              <Key className="h-6 w-6 text-white/50" />
            </div>
            <h1 className="text-2xl font-bold text-center text-white">Reset Your Password</h1>
            <div className="w-8 h-8 border-4 border-t-violet-500 border-white/20 rounded-full animate-spin"></div>
            <p className="text-sm text-white/70">Verifying your reset link...</p>
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
            <Key className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
          <p className="text-sm text-white/70">
            {isValidSession ? 'Enter your new password below' : 'Please request a new reset link'}
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-800 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success ? (
          <div className="space-y-4">
            <Alert className="bg-green-900/50 border-green-800 text-white">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Password updated successfully! Redirecting to login...
              </AlertDescription>
            </Alert>
          </div>
        ) : isValidSession ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-violet-500 pr-10"
                  required
                  disabled={isLoading}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {password && (
                <div className="text-xs text-white/60 space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li className={password.length >= 8 ? 'text-green-400' : 'text-red-400'}>
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-red-400'}>
                      One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(password) ? 'text-green-400' : 'text-red-400'}>
                      One lowercase letter
                    </li>
                    <li className={/\d/.test(password) ? 'text-green-400' : 'text-red-400'}>
                      One number
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-violet-500 pr-10"
                  required
                  disabled={isLoading}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
              disabled={isLoading || password !== confirmPassword || password.length === 0}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⚪</span>
                  Updating Password...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-white/70">
              Your reset link is invalid or has expired.
            </p>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              onClick={() => router.push('/forgot-password')}
            >
              Request New Reset Link
            </Button>
          </div>
        )}
        
        <div className="text-center text-sm">
          <Link href="/login" className="text-violet-400 hover:text-violet-300 flex items-center justify-center gap-1">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
