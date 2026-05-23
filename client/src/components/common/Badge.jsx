/**
 * Badge — Status/label badge component
 */
import { clsx } from 'clsx';

const variants = {
  default:  'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
  primary:  'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  success:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  danger:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  info:     'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  purple:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            {
              'bg-current': true,
            }
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
