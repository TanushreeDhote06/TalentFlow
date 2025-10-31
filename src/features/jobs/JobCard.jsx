import { useDispatch } from 'react-redux';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { 
  ArchiveBoxIcon, 
  ArchiveBoxXMarkIcon,
  PencilIcon,
  Bars3Icon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format, differenceInDays, isPast, parseISO } from 'date-fns';
import { updateJob } from './jobsSlice';
import { openJobFormModal, showToast } from '../../app/uiSlice';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export default function JobCard({ job }) {
  const dispatch = useDispatch();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleArchiveToggle = async () => {
    const newStatus = job.status === 'active' ? 'archived' : 'active';
    try {
      await dispatch(updateJob({ 
        id: job.id, 
        updates: { status: newStatus } 
      })).unwrap();
      
      dispatch(showToast({
        type: 'success',
        message: `Job ${newStatus === 'archived' ? 'archived' : 'activated'} successfully`,
      }));
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: 'Failed to update job status',
      }));
    }
  };

  // Check expiration
  const expirationDate = job.expirationDate ? parseISO(job.expirationDate) : null;
  const isExpired = expirationDate && isPast(expirationDate);
  const daysUntilExpiry = expirationDate ? differenceInDays(expirationDate, new Date()) : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 7;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card hover:shadow-md transition-shadow"
    >
      {/* Drag handle */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <Link 
              to={`/jobs/${job.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600"
            >
              {job.title}
            </Link>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant={job.status === 'active' ? 'success' : 'default'}>
          {job.status}
        </Badge>
        {job.tags?.map((tag) => (
          <Badge key={tag} variant="primary">
            {tag}
          </Badge>
        ))}
        {isExpired && (
          <Badge variant="danger">
            <ExclamationTriangleIcon className="h-3 w-3 inline mr-1" />
            Expired
          </Badge>
        )}
        {isExpiringSoon && (
          <Badge variant="warning">
            <ClockIcon className="h-3 w-3 inline mr-1" />
            Expires in {daysUntilExpiry} days
          </Badge>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Meta */}
      <div className="text-xs text-gray-500 mb-4 space-y-1">
        <div>Created: {format(parseISO(job.createdAt), 'MMM d, yyyy')}</div>
        {expirationDate && (
          <div>Expires: {format(expirationDate, 'MMM d, yyyy')}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => dispatch(openJobFormModal(job.id))}
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleArchiveToggle}
        >
          {job.status === 'active' ? (
            <>
              <ArchiveBoxIcon className="h-4 w-4 mr-1" />
              Archive
            </>
          ) : (
            <>
              <ArchiveBoxXMarkIcon className="h-4 w-4 mr-1" />
              Activate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

