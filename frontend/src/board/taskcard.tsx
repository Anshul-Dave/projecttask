import { Task } from '../contexts/appcontext';
import { Trash2, Clock, Pencil, Maximize2, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import ConfirmationModal from '../components/modal/confirmationmodal';
import { Button } from '../components/common/button';

interface TaskCardProps {
  task: Task;
  onDelete: () => void;
  onEdit?: () => void;
  onClick?: () => void;
}

export default function TaskCard({ task, onDelete, onEdit, onClick }: TaskCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <div
      className={`bg-card-bg border border-board-border p-4 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-primary-200 transition-all duration-300 ease-out group relative font-sans ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >


      <div className="flex flex-col h-full">
        <div className="mb-3 flex items-center justify-between">
          {task.priority ? (
            <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold tracking-wide
              ${task.priority === 'High' ? 'bg-badge-danger-bg text-badge-danger-text' :
                task.priority === 'Medium' ? 'bg-badge-warning-bg text-badge-warning-text' :
                  'bg-badge-success-bg text-badge-success-text'}
            `}>
              {task.priority}
            </span>
          ) : (
            <div></div> // Empty div for flex layout if no priority
          )}

          <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="text-text-placeholder hover:text-icon-hover p-1! w-auto! h-auto! rounded-md"
                title="Edit task"
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }}
              className="text-text-placeholder hover:text-icon-hover p-1! w-auto! h-auto! rounded-md"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>

        <h4 className="font-bold text-neutral-900 mb-2.5 text-[15px] leading-snug tracking-tight break-all line-clamp-2 group-hover:text-primary-700 transition-colors">{task.title}</h4>

        {task.description && (
          <p className="text-[13px] text-neutral-500 leading-relaxed line-clamp-2 mb-4 break-all">
            {task.description}
          </p>
        )}

        {task.imageUrl && (
          <div
            className="mb-4 rounded-xl overflow-hidden h-36 bg-neutral-100 border border-neutral-200/50 relative group/image"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageModalOpen(true);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={task.imageUrl}
              alt={task.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold text-gray-900 shadow-lg transform translate-y-2 group-hover/image:translate-y-0 transition-transform duration-300">
                <Maximize2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                View
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-text-placeholder text-xs font-medium">
              <Clock className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
              {task.date || 'Today'}
            </div>

            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.map((assignee, idx) => (
                  <div
                    key={idx}
                    className="w-7 h-7 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-[10px] font-extrabold text-primary-700 shadow-sm"
                  >
                    {assignee}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDelete}
        title="Delete Task"
        description={`Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="delete"
      />

      {/* Image Viewer Lightbox */}
      <Dialog open={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} className="relative z-[100]">
        <DialogBackdrop className="fixed inset-0 bg-neutral-900/90 backdrop-blur-sm transition-opacity" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-5xl flex flex-col items-center justify-center h-full">
            <div className="w-full flex justify-end mb-4">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors font-bold"
              >
                <X className="w-6 h-6" strokeWidth={2.5} />
                Close
              </button>
            </div>
            {task.imageUrl && (
              <img
                src={task.imageUrl}
                alt={task.title}
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              />
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
