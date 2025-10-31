import clsx from 'clsx';

export default function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          className={clsx(
            'block w-full rounded-lg border-gray-300 shadow-sm',
            'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-all duration-200 ease-in-out',
            'placeholder-gray-400',
            error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            'disabled:bg-gray-50 disabled:text-gray-500'
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span> {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}