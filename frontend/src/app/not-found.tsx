"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/src/components/common/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Page Not Found</h2>
        <p className="text-foreground/70 text-base">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4 flex justify-center">
          <Link href="/">
            <Button variant="primary" size="lg" className="shadow-lg">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
