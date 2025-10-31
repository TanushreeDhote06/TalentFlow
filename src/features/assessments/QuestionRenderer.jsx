import { useState } from 'react';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';

export default function QuestionRenderer({
  question,
  value,
  onChange,
  disabled = false,
  error = '',
}) {
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInfo({ name: file.name, size: file.size });
      onChange(file.name); // Just store the name for demo purposes
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'short-text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            error={error}
            required={question.required}
            maxLength={question.maxLength}
            placeholder="Your answer"
          />
        );

      case 'long-text':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            error={error}
            required={question.required}
            maxLength={question.maxLength}
            rows={4}
            placeholder="Your answer"
          />
        );

      case 'numeric':
        return (
          <Input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
            disabled={disabled}
            error={error}
            required={question.required}
            min={question.min}
            max={question.max}
            placeholder="Enter a number"
          />
        );

      case 'single-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  required={question.required}
                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'multi-choice':
        const selectedOptions = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedOptions.includes(option)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...selectedOptions, option]
                      : selectedOptions.filter((o) => o !== option);
                    onChange(newValue);
                  }}
                  disabled={disabled}
                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'file-upload':
        return (
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              disabled={disabled}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                disabled:opacity-50"
            />
            {fileInfo && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {fileInfo.name} ({Math.round(fileInfo.size / 1024)} KB)
              </p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      default:
        return <p className="text-sm text-gray-500">Unknown question type</p>;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
    </div>
  );
}

