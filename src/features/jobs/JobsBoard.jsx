import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { fetchJobs, setFilters, setPage, optimisticReorder, reorderJobs, rollbackReorder } from './jobsSlice';
import { openJobFormModal } from '../../app/uiSlice';
import { showToast } from '../../app/uiSlice';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import JobCard from './JobCard';
import JobFormModal from './JobFormModal';

export default function JobsBoard() {
  const dispatch = useDispatch();
  const { items, filters, pagination, loading } = useSelector((state) => state.jobs);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    dispatch(fetchJobs({
      search: filters.search,
      status: filters.status,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }, [dispatch, filters.search, filters.status, pagination.page, pagination.pageSize]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: localSearch }));
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    // Optimistic update
    dispatch(optimisticReorder({ fromIndex: oldIndex, toIndex: newIndex }));

    // Try to save
    try {
      await dispatch(reorderJobs({
        fromOrder: items[oldIndex].order,
        toOrder: items[newIndex].order,
      })).unwrap();

      dispatch(showToast({
        type: 'success',
        message: 'Jobs reordered successfully',
      }));
    } catch (error) {
      // Rollback on error
      dispatch(rollbackReorder());
      dispatch(showToast({
        type: 'error',
        message: 'Failed to reorder jobs. Changes have been reverted.',
      }));
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  if (loading && items.length === 0) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage job postings and track applications
          </p>
        </div>
        <Button onClick={() => dispatch(openJobFormModal())} className="w-full sm:w-auto">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Input
            placeholder="Search jobs..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto"
          >
            <FunnelIcon className="h-5 w-5 sm:mr-2" />
            <span className="sm:inline">Filters</span>
          </Button>
        </div>

        {showFilters && (
          <div className="card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={filters.status}
                onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      {items.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Get started by creating your first job posting."
          action={
            <Button onClick={() => dispatch(openJobFormModal())}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Job
            </Button>
          }
        />
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(j => j.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 text-center sm:text-left">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total jobs)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <JobFormModal />
    </div>
  );
}

