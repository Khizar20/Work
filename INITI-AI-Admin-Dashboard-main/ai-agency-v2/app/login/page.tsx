'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check for success messages from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'password-reset-success') {
      setSuccessMessage('Password reset successful! You can now log in with your new password.');
      // Clean up the URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('Attempting login with email:', email);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setError(error.message);
      } else {
        console.log('Login successful, user data:', data);

        // Force a refresh of the session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Session refreshed:', sessionData?.session ? 'Session exists' : 'No session');

        // Get the redirect URL or default to dashboard
        const urlParams = new URLSearchParams(window.location.search);
        const redirectedFrom = urlParams.get('redirectedFrom') || '/dashboard';

        router.push(redirectedFrom);
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-violet-900">
      <Card className="w-full max-w-md p-8 space-y-6 bg-black/50 backdrop-blur-sm text-white border-white/10">        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription className="text-sm text-white/70">Enter your credentials to access your account</CardDescription>
        </CardHeader>

        {successMessage && (
          <Alert className="bg-green-900/50 border-green-800 text-white">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <div className="bg-red-900/50 border-red-800 text-white p-4 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-white">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white focus-visible:ring-violet-500"
              required
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-white">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white focus-visible:ring-violet-500"
              required
              disabled={isLoading}
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            disabled={isLoading || email.length === 0 || password.length === 0}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <CardFooter className="text-center text-sm">
          <Link href="/forgot-password" className="text-violet-400 hover:text-violet-300">Forgot your password?</Link>
        </CardFooter>
      </Card>
    </div>
  );
}