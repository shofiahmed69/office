'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, ...props }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)} {...props}>
      <Loader2 className={clsx('animate-spin text-teal-600', sizes[size])} />
    </div>
  );
};

export interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  fullScreen = false 
}) => (
  <div className={clsx(
    'flex flex-col items-center justify-center gap-3',
    fullScreen ? 'fixed inset-0 bg-white z-50' : 'py-12'
  )}>
    <Spinner size="lg" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

export { Spinner, LoadingState };
