'use client';
import React from 'react';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  error?: Error;
  reset?: () => void;
}

export function ErrorBoundary({ children, error, reset }: ErrorBoundaryProps) {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.error('ErrorBoundary caught:', error);
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Application Error</AlertTitle>
          <AlertDescription>
            <p className="mb-4">{error.message}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button onClick={reset}>Try Again</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
}