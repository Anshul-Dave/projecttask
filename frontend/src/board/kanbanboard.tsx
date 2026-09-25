import { useApp } from '../contexts/appcontext';
import BoardColumn from './boardcolumn';
import AddListButton from './addlistbutton';
import { ReactSortable } from 'react-sortablejs';

export default function KanbanBoard() {
  const { boardData, activeProject, updateListsOrder } = useApp();

  if (!activeProject) {
    return null; // Should not reach here based on page.tsx logic, but safe guard.
  }

  const lists = boardData[activeProject.id as string] || [];

  return (
    <div className="flex flex-col h-full">
      <div className="-mx-8 -mt-8 px-8 py-6 bg-card-bg border-b border-board-border mb-8 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-heading line-clamp-2 break-all">{activeProject.name}</h1>
          <span className="px-3 py-1 rounded-full bg-badge-success-bg text-badge-success-text text-xs font-bold tracking-wide shrink-0">
            Active
          </span>
        </div>
        <p className="text-text-muted text-sm mt-1.5 font-medium break-all">
          {activeProject.description || "Manage tasks & track progress in real-time."}
        </p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar flex items-start gap-6 pb-4 pt-2">
        <ReactSortable
          list={lists}
          setList={(newLists) => updateListsOrder(activeProject.id as string, newLists)}
          group="kanban-lists"
          animation={150}
          className="flex items-start gap-6 h-full"
          ghostClass="opacity-50"
          dragClass="cursor-grabbing"
        >
          {lists.map(list => (
            <BoardColumn key={list.id} list={list} />
          ))}
        </ReactSortable>
        <AddListButton />
      </div>
    </div>
  );
}
