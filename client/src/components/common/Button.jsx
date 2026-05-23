/**
 * Button — Reusable button component
 * Variants: primary, secondary, ghost, danger, outline
 * Sizes: sm, md, lg
 */
import { clsx } from 'clsx';

const variants = {
  primary:   'bg-brand-500 hover:bg-brand-600 text-white shadow-brand hover:shadow-brand-lg focus-visible:ring-brand-500',
  secondary: 'bg-surface-100 hover:bg-surface-200 text-surface-900 dark:bg-surface-800 dark:hover:bg-surface-800/80 dark:text-surface-100',
  ghost:     'bg-transparent hover:bg-surface-100 text-surface-700 dark:hover:bg-surface-800 dark:text-surface-300',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  outline:   'border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white dark:border-brand-400 dark:text-brand-400',
  success:   'bg-accent-500 hover:bg-accent-600 text-white',
};

const sizes = {
  xs: 'px-3 py-1.5 text-xs gap-1.5',
  sm: 'px-4 py-2 text-sm gap-2',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
  xl: 'px-8 py-4 text-lg gap-3',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center font-semibold rounded-xl',
        'transition-all duration-150 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'select-none cursor-pointer',
        // Variant
        variants[variant] || variants.primary,
        // Size
        sizes[size] || sizes.md,
        // State
        isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
