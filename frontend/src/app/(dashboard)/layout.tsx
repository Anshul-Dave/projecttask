import React from 'react';
import Sidebar from '@/src/components/sidebar/sidebar';
import Navbar from '@/src/components/navbar';
import { Metadata } from 'next';
import { PROJECT_NAME } from '@/src/constants';

export const metadata: Metadata = {
  title: `Dashboard - ${PROJECT_NAME}`,
  description: `Manage your projects in ${PROJECT_NAME}`,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 bg-primary-50/30 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
