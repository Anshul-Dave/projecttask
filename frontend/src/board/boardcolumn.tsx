import { useState } from 'react';
import { BoardList, Task, useApp } from '../contexts/appcontext';
import { useAuth } from '../contexts/authcontext';
import TaskCard from './taskcard';
import AddTaskButton from './addtaskbutton';
import TaskModal from '../components/modal/taskmodal';
import ListModal from '../components/modal/listmodal';
import ConfirmationModal from '../components/modal/confirmationmodal';
import { Button } from '../components/common/button';
import { Trash2 } from 'lucide-react';
import { ReactSortable } from 'react-sortablejs';

interface BoardColumnProps {
  list: BoardList;
}

export default function BoardColumn({ list }: BoardColumnProps) {
  const { activeProject, updateList, addTask, updateTask, deleteTask, updateListTasks, searchQuery, deleteList } = useApp();
  const { userInitials } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isDeleteListModalOpen, setIsDeleteListModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isModalReadOnly, setIsModalReadOnly] = useState(false);

  const handleOpenAddModal = () => {
    setEditingTask(undefined);
    setIsModalReadOnly(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalReadOnly(false);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (task: Task) => {
    setEditingTask(task);
    setIsModalReadOnly(true);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    if (!activeProject) return;
    
    if (editingTask) {
      updateTask(activeProject.id as string, list.id, editingTask.id, {
        ...editingTask,
        ...taskData,
      });
    } else {
      addTask(activeProject.id as string, list.id, {
        ...taskData,
        id: Date.now().toString(),
        assignees: [userInitials], 
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (!activeProject) return;
    deleteTask(activeProject.id as string, list.id, taskId);
  };

  const handleDeleteList = () => {
    if (!activeProject) return;
    deleteList(activeProject.id as string, list.id);
  };

  const getIndicatorColor = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('todo')) return 'bg-indicator-todo';
    if (t.includes('progress')) return 'bg-indicator-progress';
    if (t.includes('review')) return 'bg-indicator-review';
    if (t.includes('done')) return 'bg-indicator-done';
    return 'bg-foreground/20';
  };

  const filteredTasks = list.tasks.filter(task => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  return (
    <div className="shrink-0 w-82.5 bg-board-bg border border-board-border rounded-2xl flex flex-col max-h-full font-sans overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-board-border mb-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 group cursor-pointer" onClick={() => setIsListModalOpen(true)} title="Click to edit list title">
          <div className={`w-2.5 h-2.5 rounded-full ${getIndicatorColor(list.title)} shrink-0`} />
          <h3 className="font-bold text-base text-text-heading truncate">{list.title}</h3>
          <span className="bg-badge-default-bg text-badge-default-text text-xs px-2 py-0.5 rounded-full font-bold ml-1 shrink-0">
            {filteredTasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteListModalOpen(true)}
            className="text-text-placeholder hover:text-error-600 hover:bg-error-50 p-1.5 rounded-md"
            title="Delete List"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </Button>
          <AddTaskButton onClick={handleOpenAddModal} />
        </div>
      </div>

      <ReactSortable 
        list={filteredTasks}
        setList={(newTasks) => {
          if (activeProject) {
            // When filtering, we don't want to overwrite the whole list with just the filtered items
            // But ReactSortable might pass back only the filtered list. 
            // Proper handling for drag-and-drop while searching is complex.
            // For now, only update if not searching, or handle carefully.
            if (!searchQuery) {
              updateListTasks(activeProject.id as string, list.id, newTasks);
            }
          }
        }}
        group="kanban-tasks"
        animation={150}
        className="flex-1 overflow-y-auto px-5 pb-5 space-y-3.5 custom-scrollbar"
        ghostClass="opacity-50"
        dragClass="cursor-grabbing"
      >
        {filteredTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDelete={() => handleDeleteTask(task.id)}
            onEdit={() => handleOpenEditModal(task)}
            onClick={() => handleOpenViewModal(task)}
          />
        ))}
      </ReactSortable>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask}
        initialData={editingTask}
        isReadOnly={isModalReadOnly}
      />

      <ListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        initialTitle={list.title}
        onSave={(newTitle) => {
          if (activeProject) {
            updateList(activeProject.id as string, list.id, newTitle);
          }
        }}
      />
      
      <ConfirmationModal
        isOpen={isDeleteListModalOpen}
        onClose={() => setIsDeleteListModalOpen(false)}
        onConfirm={handleDeleteList}
        title="Delete List"
        description={`Are you sure you want to delete the list "${list.title}"? All tasks inside it will be permanently deleted.`}
        confirmText="Delete"
        type="delete"
      />
    </div>
  );
}
