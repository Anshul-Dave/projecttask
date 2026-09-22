"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/authcontext';
import { useApp } from '@/src/contexts/appcontext';
import KanbanBoard from '@/src/board/kanbanboard';

export default function DesktopProjectPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);
  const { user } = useAuth();
  const { activeProject, setActiveProject, projects } = useApp();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  useEffect(() => {
    // If the active project in context doesn't match the URL, set it.
    // This happens on direct navigation or refresh.
    if (projects.length > 0) {
      const projectExists = projects.find(p => p.name === decodedName);
      
      if (!projectExists) {
        router.replace('/');
        return;
      }

      if (!activeProject || activeProject.id !== projectExists.id) {
        setActiveProject(projectExists.id);
      }
      setIsReady(true);
    }
  }, [decodedName, activeProject, projects, setActiveProject, router]);



  if (!user) return null;
  if (!isReady || !activeProject) return null; // Wait for project to load

  return (
    <div className="h-full">
      <KanbanBoard />
    </div>
  );
}
