import clsx from 'clsx';

const variants = {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800',
  secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-100 hover:from-gray-200 hover:to-gray-300',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800',
  success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-300 ease-in-out transform hover:scale-105',
        'shadow-md hover:shadow-lg active:shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variants[variant],
        variant === 'primary' && 'focus:ring-primary-500',
        variant === 'secondary' && 'focus:ring-gray-400',
        variant === 'danger' && 'focus:ring-red-500',
        variant === 'success' && 'focus:ring-green-500',
        sizes[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed hover:scale-100',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className="relative">{children}</span>
    </button>
  );
}