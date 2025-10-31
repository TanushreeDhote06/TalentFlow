import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EnvelopeIcon, FlagIcon } from '@heroicons/react/24/outline';

export default function CandidateCard({ candidate, isDragging = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <Link
          to={`/candidates/${candidate.id}`}
          className="text-sm font-medium text-gray-900 hover:text-primary-600 flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          {candidate.name}
        </Link>
        {candidate.followUp && (
          <FlagIcon className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />
        )}
      </div>

      <div className="flex items-center text-xs text-gray-500">
        <EnvelopeIcon className="h-3 w-3 mr-1" />
        <span className="truncate">{candidate.email}</span>
      </div>
    </div>
  );
}

