'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingSpinner({ size = 'medium' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-10 w-10',
    large: 'h-16 w-16'
  };
  
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className={`animate-spin rounded-full border-t-2 border-blue-500 border-opacity-50 border-r-2 ${sizeClasses[size]}`}></div>
    </div>
  );
}