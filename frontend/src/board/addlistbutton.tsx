import { useState } from 'react';
import { useApp } from '../contexts/appcontext';
import { Plus, X } from 'lucide-react';
import { Button } from '../components/common/button';

export default function AddListButton() {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const { addList, activeProject } = useApp();

  const handleAddList = () => {
    if (title.trim() && activeProject) {
      addList(activeProject.id as string, title.trim());
      setTitle('');
      setIsEditing(false);
    }
  };

  return (
    <div className="shrink-0 w-82.5 h-fit">
      {!isEditing && (
        <Button 
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="w-full h-12 bg-transparent hover:bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-xl! flex items-center justify-center text-neutral-500 hover:text-neutral-700 hover:border-neutral-400 transition-colors"
        >
          <Plus className="w-4.5 h-4.5 mr-2" strokeWidth={2} />
          <span className="text-sm font-medium">Add another list</span>
        </Button>
      )}

      {isEditing && (
        <div className="w-full bg-card-bg border border-board-border p-3 rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.06)]">
          <input
            autoFocus
            type="text"
            placeholder="Enter list title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddList();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="w-full px-3 py-2 border border-primary-500 rounded-md bg-card-bg text-text-body text-sm mb-3 outline-none focus:ring-2 focus:ring-primary-100 placeholder:text-text-placeholder"
          />
          <div className="flex items-center gap-3">
            <Button 
              variant="primary"
              onClick={handleAddList}
              className="px-4! py-1.5! bg-primary-600! text-white text-sm font-bold rounded-md! hover:bg-primary-700!"
            >
              Add list
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(false)}
              className="text-icon-default hover:text-text-body"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
