import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeftIcon, 
  EnvelopeIcon,
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { fetchCandidateById, fetchCandidateTimeline, updateCandidate } from './candidatesSlice';
import { showToast } from '../../app/uiSlice';
import { dbHelpers } from '../../services/db';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Select from '../../components/Select';

const stageOptions = [
  { value: 'applied', label: 'Applied' },
  { value: 'screen', label: 'Screen' },
  { value: 'tech', label: 'Tech Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export default function CandidateProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCandidate, currentTimeline, loading } = useSelector(
    (state) => state.candidates
  );
  const [job, setJob] = useState(null);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [assessmentDate, setAssessmentDate] = useState(null);

  useEffect(() => {
    dispatch(fetchCandidateById(parseInt(id)));
    dispatch(fetchCandidateTimeline(parseInt(id)));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentCandidate) {
      // Load job info
      const loadJob = async () => {
        const jobData = await dbHelpers.getJob(currentCandidate.jobId);
        setJob(jobData);
      };
      loadJob();

      // Check assessment completion
      const checkAssessment = async () => {
        const response = await dbHelpers.getAssessmentResponse(
          currentCandidate.id,
          currentCandidate.jobId
        );
        setAssessmentCompleted(!!response);
        setAssessmentDate(response?.submittedAt || null);
      };
      checkAssessment();
    }
  }, [currentCandidate]);

  const handleFollowUpToggle = async () => {
    try {
      await dispatch(
        updateCandidate({
          id: currentCandidate.id,
          updates: { followUp: !currentCandidate.followUp },
        })
      ).unwrap();

      dispatch(
        showToast({
          type: 'success',
          message: `Follow-up ${!currentCandidate.followUp ? 'enabled' : 'disabled'}`,
        })
      );
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          message: 'Failed to update follow-up status',
        })
      );
    }
  };

  const handleStageChange = async (newStage) => {
    try {
      await dispatch(
        updateCandidate({
          id: currentCandidate.id,
          updates: { stage: newStage },
        })
      ).unwrap();

      // Refresh timeline
      dispatch(fetchCandidateTimeline(parseInt(id)));

      dispatch(
        showToast({
          type: 'success',
          message: 'Stage updated successfully',
        })
      );
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          message: 'Failed to update stage',
        })
      );
    }
  };

  if (loading || !currentCandidate) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/candidates')}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {currentCandidate.name}
              </h1>
              {currentCandidate.followUp && (
                <FlagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                <span className="truncate">{currentCandidate.email}</span>
              </div>
              <Badge variant="info">{currentCandidate.stage}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Candidate Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Applied For</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {job ? (
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {job.title}
                    </Link>
                  ) : (
                    'Loading...'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Stage</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  <Select
                    value={currentCandidate.stage}
                    onChange={(e) => handleStageChange(e.target.value)}
                    options={stageOptions}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Application Date</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {format(parseISO(currentCandidate.createdAt), 'MMMM d, yyyy')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Assessment Status</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {assessmentCompleted ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Completed
                      {assessmentDate && (
                        <span className="ml-2 text-gray-500">
                          on {format(parseISO(assessmentDate), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500">
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Not Started
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Timeline
            </h2>
            <div className="flow-root">
              <ul className="-mb-8">
                {currentTimeline.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== currentTimeline.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
                            <ClockIcon className="h-4 w-4 text-primary-600" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">
                              {event.fromStage ? (
                                <>
                                  Moved from <Badge variant="default">{event.fromStage}</Badge> to{' '}
                                  <Badge variant="info">{event.toStage}</Badge>
                                </>
                              ) : (
                                <>
                                  Started at <Badge variant="info">{event.toStage}</Badge>
                                </>
                              )}
                            </p>
                            {event.notes && (
                              <p className="mt-1 text-sm text-gray-500">{event.notes}</p>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {format(parseISO(event.timestamp), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant={currentCandidate.followUp ? 'primary' : 'secondary'}
                className="w-full justify-start"
                onClick={handleFollowUpToggle}
              >
                <FlagIcon className="h-5 w-5 mr-2" />
                {currentCandidate.followUp ? 'Remove Follow-up' : 'Mark for Follow-up'}
              </Button>
            </div>
          </div>

          <div className="card bg-gray-50 border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Stage History
            </h3>
            <div className="space-y-1">
              <div className="text-xs text-gray-600">
                Total transitions: {currentTimeline.length}
              </div>
              <div className="text-xs text-gray-600">
                Days since application:{' '}
                {Math.floor(
                  (new Date() - parseISO(currentCandidate.createdAt)) /
                    (1000 * 60 * 60 * 24)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

