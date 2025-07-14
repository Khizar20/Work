'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./utils/auth";
import LoadingSpinner from "./components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // If user is logged in, redirect to dashboard
      if (user) {
        router.push('/dashboard');
      } 
      // If user is not logged in, redirect to login page (now using the correct path)
      else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // This will briefly show before redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">HospitalityAI</h1>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
