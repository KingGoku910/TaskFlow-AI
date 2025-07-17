'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Don't log clipboard errors as they're not critical
    if (error.message?.includes('writeText') || error.message?.includes('Clipboard')) {
      return;
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            reset={() => this.setState({ hasError: false, error: undefined })}
          />
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
