"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/authcontext';
import { useApp } from '@/src/contexts/appcontext';
import { useLoader } from '@/src/contexts/loadercontext';
import { Trash2 } from 'lucide-react';
import ConfirmationModal from '@/src/components/modal/confirmationmodal';
import { Button } from '@/src/components/common/button';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeProject, projects, boardData, setActiveProject, searchQuery, deleteProject } = useApp();
  const { showLoader } = useLoader();
  const router = useRouter();
  const [projectToDelete, setProjectToDelete] = useState<{id: string | number, name: string} | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  useEffect(() => {
    if (activeProject) {
      setActiveProject('');
    }
    document.title = "Dashboard - ProjectsTask";
  }, [activeProject, setActiveProject]);

  const totalProjects = projects.length;
  let globalActive = 0;
  let globalCompleted = 0;

  const projectStats = projects.map(p => {
    const pLists = boardData[p.id] || [];
    let pCompleted = 0;
    let pTotal = 0;
    
    pLists.forEach(list => {
      const isDone = list.title.toLowerCase().includes('done') || list.title.toLowerCase().includes('complet');
      const tCount = list.tasks.length;
      pTotal += tCount;
      if (isDone) {
        pCompleted += tCount;
        globalCompleted += tCount;
      } else {
        globalActive += tCount;
      }
    });
    
    const progress = pTotal === 0 ? 0 : Math.round((pCompleted / pTotal) * 100);
    
    return { ...p, totalTasks: pTotal, progress };
  });

  const filteredProjects = projectStats.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col py-2 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 mt-2">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-neutral-500 mt-1.5 text-[15px]">Overview of your active projects and productivity.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card-bg border border-neutral-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <h3 className="text-sm font-medium text-neutral-500 mb-1.5">Total Projects</h3>
          <p className="text-3xl font-bold text-neutral-800">{totalProjects}</p>
        </div>
        <div className="bg-card-bg border border-neutral-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <h3 className="text-sm font-medium text-neutral-500 mb-1.5">Active Tasks</h3>
          <p className="text-3xl font-bold text-primary-700">{globalActive}</p>
        </div>
        <div className="bg-card-bg border border-neutral-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <h3 className="text-sm font-medium text-neutral-500 mb-1.5">Completed Tasks</h3>
          <p className="text-3xl font-bold text-neutral-800">{globalCompleted}</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-neutral-900 mb-5">
        {searchQuery ? `Search Results for "${searchQuery}"` : "All Projects"}
      </h2>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-neutral-100 border-dashed">
          <p className="text-neutral-500 font-medium">No projects found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          {filteredProjects.map(p => (
            <div 
              key={p.id} 
              onClick={() => {
                showLoader(1000);
                setActiveProject(p.id);
              }}
              style={{ cursor: 'pointer' }}
              className="relative bg-card-bg border border-neutral-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-primary-100 transition-all cursor-pointer flex flex-col group"
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors truncate">{p.name}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-100">
                    {p.totalTasks} Tasks
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete({ id: p.id, name: p.name });
                    }}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-error-600 hover:bg-error-50 transition-opacity w-7 h-7 p-0 rounded-full"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </div>
              </div>
              
              <p className="text-[15px] text-neutral-500 line-clamp-2 mb-8 flex-1 leading-relaxed">
                {p.description || 'No description provided.'}
              </p>
              
              <div>
                <div className="flex justify-between text-[13px] font-medium text-neutral-500 mb-2.5">
                  <span>Progress</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete the project "${projectToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="delete"
      />
    </div>
  );
}
