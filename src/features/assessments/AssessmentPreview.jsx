import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { fetchAssessment, submitAssessmentResponse } from './assessmentsSlice';
import { showToast } from '../../app/uiSlice';
import { dbHelpers } from '../../services/db';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import QuestionRenderer from './QuestionRenderer';

export default function AssessmentPreview() {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentAssessment, loading, saving } = useSelector(
    (state) => state.assessments
  );
  const [job, setJob] = useState(null);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [candidateId] = useState(1); // Demo: using first candidate

  useEffect(() => {
    dispatch(fetchAssessment(parseInt(jobId)));

    // Load job info
    const loadJob = async () => {
      const jobData = await dbHelpers.getJob(parseInt(jobId));
      setJob(jobData);
    };
    loadJob();
  }, [dispatch, jobId]);

  // Check if a question should be shown based on conditional logic
  const shouldShowQuestion = (question) => {
    if (!question.conditional || !question.conditional.questionId) {
      return true;
    }

    const conditionResponse = responses[question.conditional.questionId];
    return conditionResponse === question.conditional.value;
  };

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateResponses = () => {
    const newErrors = {};
    let isValid = true;

    currentAssessment.sections?.forEach((section) => {
      section.questions?.forEach((question) => {
        if (!shouldShowQuestion(question)) return;

        if (question.required) {
          const response = responses[question.id];
          if (
            response === undefined ||
            response === null ||
            response === '' ||
            (Array.isArray(response) && response.length === 0)
          ) {
            newErrors[question.id] = 'This field is required';
            isValid = false;
          }
        }

        // Validate numeric range
        if (question.type === 'numeric' && responses[question.id] !== undefined) {
          const value = parseFloat(responses[question.id]);
          if (question.min !== undefined && value < question.min) {
            newErrors[question.id] = `Value must be at least ${question.min}`;
            isValid = false;
          }
          if (question.max !== undefined && value > question.max) {
            newErrors[question.id] = `Value must be at most ${question.max}`;
            isValid = false;
          }
        }

        // Validate max length
        if (
          (question.type === 'short-text' || question.type === 'long-text') &&
          question.maxLength &&
          responses[question.id]
        ) {
          if (responses[question.id].length > question.maxLength) {
            newErrors[question.id] = `Maximum length is ${question.maxLength} characters`;
            isValid = false;
          }
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateResponses()) {
      dispatch(
        showToast({
          type: 'error',
          message: 'Please fix the errors before submitting',
        })
      );
      return;
    }

    try {
      await dispatch(
        submitAssessmentResponse({
          jobId: parseInt(jobId),
          candidateId,
          responses,
        })
      ).unwrap();

      dispatch(
        showToast({
          type: 'success',
          message: 'Assessment submitted successfully',
        })
      );

      // Navigate back to assessment builder
      navigate(`/assessments/${jobId}`);
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          message: 'Failed to submit assessment',
        })
      );
    }
  };

  if (loading || !currentAssessment) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/assessments/${jobId}`)}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Builder
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assessment Preview
        </h1>
        {job && (
          <p className="text-sm text-gray-500">
            For: {job.title}
          </p>
        )}
      </div>

      {/* Assessment Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {currentAssessment.sections?.map((section) => {
          const visibleQuestions = section.questions?.filter(shouldShowQuestion) || [];
          
          if (visibleQuestions.length === 0) return null;

          return (
            <div key={section.id} className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {section.title}
              </h2>
              {section.description && (
                <p className="text-sm text-gray-600 mb-6">{section.description}</p>
              )}

              <div className="space-y-6">
                {visibleQuestions.map((question) => (
                  <QuestionRenderer
                    key={question.id}
                    question={question}
                    value={responses[question.id]}
                    onChange={(value) => handleResponseChange(question.id, value)}
                    error={errors[question.id]}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/assessments/${jobId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Submit Assessment
          </Button>
        </div>
      </form>
    </div>
  );
}

