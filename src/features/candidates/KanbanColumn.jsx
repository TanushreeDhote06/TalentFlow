import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import CandidateCard from './CandidateCard';

export default function KanbanColumn({ stage, candidates }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-shrink-0 w-72 sm:w-80">
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900">{stage.label}</h3>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
            {candidates.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[400px] sm:min-h-[500px] p-2 rounded-lg transition-colors ${
          isOver ? 'bg-primary-50 ring-2 ring-primary-300' : stage.color
        }`}
      >
        <SortableContext
          items={candidates.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

