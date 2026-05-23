/**
 * Spinner — Loading indicator component
 */
import { clsx } from 'clsx';

const sizes = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
};

const Spinner = ({
  size = 'md',
  className = '',
  label = 'Loading...',
  color = 'brand',
}) => {
  const colorClass = color === 'white'
    ? 'border-white/30 border-t-white'
    : 'border-brand-200 border-t-brand-500 dark:border-brand-800 dark:border-t-brand-400';

  return (
    <div role="status" className={clsx('inline-flex items-center justify-center', className)}>
      <div
        className={clsx(
          'rounded-full animate-spin',
          sizes[size] || sizes.md,
          colorClass
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

/** Full-page loading overlay */
Spinner.Page = ({ label = 'Loading PrepWise...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] gap-4">
    <div className="relative">
      <div className="w-16 h-16 rounded-full gradient-brand animate-pulse-slow" />
      <Spinner size="xl" className="absolute inset-0 m-auto" />
    </div>
    <p className="text-[var(--color-text-muted)] text-sm font-medium animate-pulse">{label}</p>
  </div>
);

export default Spinner;
