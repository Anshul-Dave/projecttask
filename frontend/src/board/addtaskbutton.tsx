import { Plus } from 'lucide-react';
import { Button } from '../components/common/button';

interface AddTaskButtonProps {
  onClick: () => void;
}

export default function AddTaskButton({ onClick }: AddTaskButtonProps) {
  return (
    <Button 
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="text-foreground/50 hover:text-foreground"
      title="Add Task"
    >
      <Plus className="w-5 h-5" strokeWidth={2} />
    </Button>
  );
}
