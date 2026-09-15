"use client";

import { useEffect } from 'react';
import { Button } from '@/src/components/common/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-9xl font-bold text-error-500">500</h1>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Something went wrong!</h2>
        <p className="text-foreground/70 text-base">
          We encountered an unexpected error. Please try again later.
        </p>
        <div className="pt-4 flex justify-center space-x-4">
          <Button variant="primary" size="lg" onClick={() => reset()} className="shadow-lg">
            Try again
          </Button>
          <Button variant="secondary" size="lg" onClick={() => window.location.href = '/'} className="shadow-md">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
