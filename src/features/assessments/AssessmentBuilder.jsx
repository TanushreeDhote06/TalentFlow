import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from 'nanoid';
import { 
  ArrowLeftIcon, 
  PlusIcon,
  EyeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { 
  fetchAssessment, 
  saveAssessment, 
  initializeAssessment,
  addSection,
  updateSection,
  removeSection,
  addQuestion,
  updateQuestion,
  removeQuestion,
} from './assessmentsSlice';
import { showToast } from '../../app/uiSlice';
import { dbHelpers } from '../../services/db';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import LoadingSpinner from '../../components/LoadingSpinner';
import AssessmentPreviewPane from './AssessmentPreviewPane';
import QuestionEditor from './QuestionEditor';

export default function AssessmentBuilder() {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sections, loading, saving } = useSelector((state) => state.assessments);
  const [job, setJob] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    dispatch(initializeAssessment(parseInt(jobId)));
    dispatch(fetchAssessment(parseInt(jobId)));

    // Load job info
    const loadJob = async () => {
      const jobData = await dbHelpers.getJob(parseInt(jobId));
      setJob(jobData);
    };
    loadJob();
  }, [dispatch, jobId]);

  const handleAddSection = () => {
    dispatch(
      addSection({
        id: nanoid(),
        title: 'New Section',
        description: '',
        questions: [],
      })
    );
  };

  const handleUpdateSection = (sectionId, updates) => {
    dispatch(updateSection({ sectionId, updates }));
  };

  const handleRemoveSection = (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      dispatch(removeSection(sectionId));
    }
  };

  const handleAddQuestion = (sectionId) => {
    dispatch(
      addQuestion({
        sectionId,
        question: {
          id: nanoid(),
          type: 'short-text',
          label: 'New Question',
          required: false,
        },
      })
    );
  };

  const handleUpdateQuestion = (sectionId, questionId, updates) => {
    dispatch(updateQuestion({ sectionId, questionId, updates }));
  };

  const handleRemoveQuestion = (sectionId, questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      dispatch(removeQuestion({ sectionId, questionId }));
    }
  };

  const handleSave = async () => {
    try {
      await dispatch(
        saveAssessment({ jobId: parseInt(jobId), sections })
      ).unwrap();

      dispatch(
        showToast({
          type: 'success',
          message: 'Assessment saved successfully',
        })
      );
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          message: 'Failed to save assessment',
        })
      );
    }
  };

  if (loading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Job
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Assessment Builder
            </h1>
            {job && (
              <p className="text-sm text-gray-500 mt-1">
                For: {job.title}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
              className="hidden lg:flex"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Link to={`/assessments/${jobId}/preview`} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">
                Full Preview
              </Button>
            </Link>
            <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
              Save Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Builder Layout */}
      <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-4 sm:gap-6`}>
        {/* Builder Pane */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Sections ({sections.length})
            </h2>
            <Button size="sm" onClick={handleAddSection}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          {sections.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-4">No sections yet</p>
              <Button onClick={handleAddSection}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Add First Section
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, sectionIdx) => (
                <div key={section.id} className="card border-2 border-gray-200">
                  {/* Section Header */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Input
                          value={section.title}
                          onChange={(e) =>
                            handleUpdateSection(section.id, { title: e.target.value })
                          }
                          className="font-semibold"
                          placeholder="Section Title"
                        />
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveSection(section.id)}
                        className="ml-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={section.description}
                      onChange={(e) =>
                        handleUpdateSection(section.id, {
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Section description (optional)"
                    />
                  </div>

                  {/* Questions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        Questions ({section.questions?.length || 0})
                      </h4>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddQuestion(section.id)}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Question
                      </Button>
                    </div>

                    {section.questions?.map((question, questionIdx) => (
                      <QuestionEditor
                        key={question.id}
                        question={question}
                        questionIndex={questionIdx}
                        sectionId={section.id}
                        allQuestions={sections.flatMap(s => s.questions || [])}
                        onUpdate={(updates) =>
                          handleUpdateQuestion(section.id, question.id, updates)
                        }
                        onRemove={() =>
                          handleRemoveQuestion(section.id, question.id)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Pane */}
        {showPreview && (
          <div className="sticky top-4 h-fit">
            <AssessmentPreviewPane sections={sections} />
          </div>
        )}
      </div>
    </div>
  );
}

