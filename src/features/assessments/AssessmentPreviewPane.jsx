import { useState, useMemo } from 'react';
import QuestionRenderer from './QuestionRenderer';

export default function AssessmentPreviewPane({ sections }) {
  const [responses, setResponses] = useState({});

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
  };

  return (
    <div className="card max-h-[800px] overflow-y-auto">
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
        <p className="text-sm text-gray-500">
          This is how candidates will see the assessment
        </p>
      </div>

      {sections.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Add sections and questions to see the preview
        </p>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="pb-6 border-b border-gray-200 last:border-0">
              <h4 className="text-base font-semibold text-gray-900 mb-2">
                {section.title || 'Untitled Section'}
              </h4>
              {section.description && (
                <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              )}

              <div className="space-y-4">
                {section.questions
                  ?.filter(shouldShowQuestion)
                  .map((question) => (
                    <QuestionRenderer
                      key={question.id}
                      question={question}
                      value={responses[question.id]}
                      onChange={(value) => handleResponseChange(question.id, value)}
                      disabled={false}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

