import { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  FunnelIcon, 
  ViewColumnsIcon,
  ListBulletIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { fetchCandidates, setFilters, setViewMode } from './candidatesSlice';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import CandidatesKanban from './CandidatesKanban';

export default function CandidatesList() {
  const dispatch = useDispatch();
  const { items, filters, viewMode, loading } = useSelector((state) => state.candidates);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);

  const parentRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCandidates({
      search: filters.search,
      stage: filters.stage,
    }));
  }, [dispatch, filters.search, filters.stage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: localSearch }));
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  // Filter candidates locally
  const filteredCandidates = useMemo(() => {
    let filtered = [...items];

    // Client-side search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower)
      );
    }

    // Follow-up filter
    if (filters.followUpOnly) {
      filtered = filtered.filter((c) => c.followUp);
    }

    return filtered;
  }, [items, filters.search, filters.followUpOnly]);

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: filteredCandidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  if (loading && items.length === 0) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  // Kanban view
  if (viewMode === 'kanban') {
    return <CandidatesKanban />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredCandidates.length} candidates found
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => dispatch(setViewMode('list'))}
            className="flex-1 sm:flex-initial"
          >
            <ListBulletIcon className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">List</span>
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => dispatch(setViewMode('kanban'))}
            className="flex-1 sm:flex-initial"
          >
            <ViewColumnsIcon className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Kanban</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Input
            placeholder="Search by name or email..."
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
                label="Stage"
                value={filters.stage}
                onChange={(e) => dispatch(setFilters({ stage: e.target.value }))}
                options={[
                  { value: '', label: 'All Stages' },
                  { value: 'applied', label: 'Applied' },
                  { value: 'screen', label: 'Screen' },
                  { value: 'tech', label: 'Tech Interview' },
                  { value: 'offer', label: 'Offer' },
                  { value: 'hired', label: 'Hired' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />
              <div className="flex items-end">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.followUpOnly}
                    onChange={(e) =>
                      dispatch(setFilters({ followUpOnly: e.target.checked }))
                    }
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Follow-up only
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Candidates List */}
      {filteredCandidates.length === 0 ? (
        <EmptyState
          title="No candidates found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="card">
          <div
            ref={parentRef}
            className="h-[600px] overflow-auto"
            style={{ contain: 'strict' }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const candidate = filteredCandidates[virtualRow.index];
                return (
                  <Link
                    key={candidate.id}
                    to={`/candidates/${candidate.id}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {candidate.name}
                        </p>
                        {candidate.followUp && (
                          <FlagIcon className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {candidate.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="info">{candidate.stage}</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

