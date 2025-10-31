import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  DocumentTextIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { fetchJobById } from './jobsSlice';
import { openJobFormModal } from '../../app/uiSlice';
import { dbHelpers } from '../../services/db';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function JobDetail() {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentJob, loading } = useSelector((state) => state.jobs);
  const [candidates, setCandidates] = useState([]);
  const [hasAssessment, setHasAssessment] = useState(false);

  useEffect(() => {
    dispatch(fetchJobById(parseInt(jobId)));
  }, [dispatch, jobId]);

  useEffect(() => {
    // Fetch candidates for this job
    const loadCandidates = async () => {
      const jobCandidates = await dbHelpers.getCandidatesByJob(parseInt(jobId));
      setCandidates(jobCandidates);
    };

    // Check if assessment exists
    const checkAssessment = async () => {
      const assessment = await dbHelpers.getAssessment(parseInt(jobId));
      setHasAssessment(!!assessment);
    };

    loadCandidates();
    checkAssessment();
  }, [jobId]);

  if (loading || !currentJob) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/jobs')}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {currentJob.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={currentJob.status === 'active' ? 'success' : 'default'}>
                {currentJob.status}
              </Badge>
              {currentJob.tags?.map((tag) => (
                <Badge key={tag} variant="primary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Button onClick={() => dispatch(openJobFormModal(currentJob.id))} className="w-full sm:w-auto">
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Job
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Details
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="text-sm text-gray-900 mt-1">{currentJob.slug}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {currentJob.description || 'No description provided'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {format(parseISO(currentJob.createdAt), 'MMMM d, yyyy')}
                </dd>
              </div>
              {currentJob.expirationDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expiration Date</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {format(parseISO(currentJob.expirationDate), 'MMMM d, yyyy')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Candidates */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Candidates ({candidates.length})
              </h2>
            </div>
            {candidates.length === 0 ? (
              <p className="text-sm text-gray-500">No candidates have applied yet.</p>
            ) : (
              <div className="space-y-2">
                {candidates.slice(0, 5).map((candidate) => (
                  <Link
                    key={candidate.id}
                    to={`/candidates/${candidate.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-gray-500">{candidate.email}</p>
                    </div>
                    <Badge variant="info">{candidate.stage}</Badge>
                  </Link>
                ))}
                {candidates.length > 5 && (
                  <Link
                    to="/candidates"
                    className="block text-sm text-primary-600 hover:text-primary-700 text-center py-2"
                  >
                    View all {candidates.length} candidates
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link to={`/assessments/${currentJob.id}`}>
                <Button variant="secondary" className="w-full justify-start">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  {hasAssessment ? 'Edit Assessment' : 'Create Assessment'}
                </Button>
              </Link>
              <Link to="/candidates">
                <Button variant="secondary" className="w-full justify-start">
                  <UsersIcon className="h-5 w-5 mr-2" />
                  View All Candidates
                </Button>
              </Link>
            </div>
          </div>

          <div className="card bg-primary-50 border-primary-200">
            <h3 className="text-sm font-semibold text-primary-900 mb-2">
              Statistics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-primary-700">Total Applicants</span>
                <span className="text-sm font-semibold text-primary-900">
                  {candidates.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-700">In Progress</span>
                <span className="text-sm font-semibold text-primary-900">
                  {candidates.filter(c => ['screen', 'tech', 'offer'].includes(c.stage)).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-700">Hired</span>
                <span className="text-sm font-semibold text-primary-900">
                  {candidates.filter(c => c.stage === 'hired').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

