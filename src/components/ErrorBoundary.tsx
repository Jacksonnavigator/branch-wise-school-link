import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details (consider sending to error tracking service in production)
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment) {
      console.error('Error caught by boundary:', error, errorInfo);
    } else {
      // In production, send to error tracking service (e.g., Sentry, LogRocket)
      // TODO: Integrate error tracking service
      console.error('An error occurred. Error ID:', Date.now());
    }
  }

  public render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
              <AlertDescription className="text-center space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                  <p className="text-sm text-muted-foreground">
                    An unexpected error occurred. Please try refreshing the page.
                  </p>
                  {isDevelopment && this.state.error && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer">Error details (development only)</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}
                </div>
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;