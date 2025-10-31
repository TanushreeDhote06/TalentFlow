import { TrashIcon } from '@heroicons/react/24/outline';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';

const questionTypes = [
  { value: 'short-text', label: 'Short Text' },
  { value: 'long-text', label: 'Long Text' },
  { value: 'single-choice', label: 'Single Choice' },
  { value: 'multi-choice', label: 'Multiple Choice' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'file-upload', label: 'File Upload' },
];

export default function QuestionEditor({
  question,
  questionIndex,
  sectionId,
  allQuestions,
  onUpdate,
  onRemove,
}) {
  const handleOptionChange = (index, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...(question.options || []), ''];
    onUpdate({ options: newOptions });
  };

  const handleRemoveOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">
          Question {questionIndex + 1}
        </span>
        <Button variant="danger" size="sm" onClick={onRemove}>
          <TrashIcon className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-3">
        {/* Question Label */}
        <Input
          label="Question"
          value={question.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          required
        />

        {/* Question Type */}
        <Select
          label="Type"
          value={question.type}
          onChange={(e) => onUpdate({ type: e.target.value })}
          options={questionTypes}
        />

        {/* Required Toggle */}
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={question.required || false}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Required</span>
        </label>

        {/* Type-specific fields */}
        {(question.type === 'short-text' || question.type === 'long-text') && (
          <Input
            label="Max Length"
            type="number"
            value={question.maxLength || ''}
            onChange={(e) =>
              onUpdate({ maxLength: parseInt(e.target.value) || null })
            }
            placeholder="Optional"
          />
        )}

        {question.type === 'numeric' && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Value"
              type="number"
              value={question.min ?? ''}
              onChange={(e) =>
                onUpdate({ min: e.target.value ? parseFloat(e.target.value) : null })
              }
            />
            <Input
              label="Max Value"
              type="number"
              value={question.max ?? ''}
              onChange={(e) =>
                onUpdate({ max: e.target.value ? parseFloat(e.target.value) : null })
              }
            />
          </div>
        )}

        {(question.type === 'single-choice' || question.type === 'multi-choice') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div className="space-y-2">
              {(question.options || []).map((option, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveOption(idx)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddOption}
                className="w-full"
              >
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Conditional Logic */}
        <div className="pt-3 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conditional Logic (Optional)
          </label>
          <div className="space-y-2">
            <Select
              label="Show this question only if"
              value={question.conditional?.questionId || ''}
              onChange={(e) =>
                onUpdate({
                  conditional: e.target.value
                    ? {
                        questionId: e.target.value,
                        value: question.conditional?.value || '',
                      }
                    : null,
                })
              }
              options={[
                { value: '', label: 'Always show (no condition)' },
                ...allQuestions
                  .filter((q) => q.id !== question.id)
                  .map((q) => ({
                    value: q.id,
                    label: q.label || 'Untitled Question',
                  })),
              ]}
            />
            {question.conditional?.questionId && (
              <Input
                label="Equals value"
                value={question.conditional.value || ''}
                onChange={(e) =>
                  onUpdate({
                    conditional: {
                      ...question.conditional,
                      value: e.target.value,
                    },
                  })
                }
                placeholder="Enter the value to match"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

