import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { 
  ListBulletIcon,
  ViewColumnsIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { fetchCandidates, updateCandidateStage, setViewMode } from './candidatesSlice';
import { showToast } from '../../app/uiSlice';
import Button from '../../components/Button';
import KanbanColumn from './KanbanColumn';
import CandidateCard from './CandidateCard';

const stages = [
  { id: 'applied', label: 'Applied', color: 'bg-gray-100' },
  { id: 'screen', label: 'Screen', color: 'bg-blue-100' },
  { id: 'tech', label: 'Tech Interview', color: 'bg-purple-100' },
  { id: 'offer', label: 'Offer', color: 'bg-yellow-100' },
  { id: 'hired', label: 'Hired', color: 'bg-green-100' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100' },
];

export default function CandidatesKanban() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.candidates);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    dispatch(fetchCandidates({}));
  }, [dispatch]);

  // Group candidates by stage
  const candidatesByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = items.filter((c) => c.stage === stage.id);
    return acc;
  }, {});

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    if (!over) return;

    // You can add visual feedback here if needed
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const candidateId = active.id;
    const newStage = over.id;

    const candidate = items.find((c) => c.id === candidateId);
    if (!candidate || candidate.stage === newStage) return;

    // Update candidate stage
    try {
      await dispatch(
        updateCandidateStage({
          id: candidateId,
          stage: newStage,
          notes: `Moved to ${newStage}`,
        })
      ).unwrap();

      dispatch(
        showToast({
          type: 'success',
          message: `${candidate.name} moved to ${newStage}`,
        })
      );
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          message: 'Failed to update candidate stage',
        })
      );
    }
  };

  const activeCandidate = activeId
    ? items.find((c) => c.id === activeId)
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Candidates - Kanban View</h1>
          <p className="text-sm text-gray-500 mt-1">
            Drag candidates between stages
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(setViewMode('list'))}
            className="w-full sm:w-auto"
          >
            <ListBulletIcon className="h-5 w-5 sm:mr-2" />
            <span className="sm:inline">List View</span>
          </Button>
        </div>
      </div>

      {/* Scroll hint for mobile */}
      <div className="sm:hidden mb-3 text-xs text-gray-500 text-center">
        ← Swipe to see all stages →
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              candidates={candidatesByStage[stage.id] || []}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCandidate ? (
            <div className="rotate-3 opacity-80">
              <CandidateCard candidate={activeCandidate} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

