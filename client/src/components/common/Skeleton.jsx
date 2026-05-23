/**
 * Skeleton — loading placeholders (accessible, animated)
 */
import { clsx } from 'clsx';

const Skeleton = ({ className = '', rounded = 'rounded-lg', ...props }) => (
  <div
    className={clsx('skeleton-shimmer', rounded, className)}
    aria-hidden="true"
    {...props}
  />
);

Skeleton.Text = ({ lines = 3, className = '' }) => (
  <div className={clsx('space-y-2', className)} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={clsx('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')}
        rounded="rounded-md"
      />
    ))}
  </div>
);

Skeleton.Card = ({ className = '' }) => (
  <div
    className={clsx(
      'rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 space-y-4',
      className
    )}
    aria-hidden="true"
  >
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
    <Skeleton className="h-24 w-full rounded-xl" />
  </div>
);

Skeleton.StatGrid = ({ count = 4 }) => (
  <div className={clsx('grid grid-cols-2 lg:grid-cols-4 gap-4')} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 space-y-3"
      >
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    ))}
  </div>
);

Skeleton.Dashboard = () => (
  <div className="space-y-6 max-w-7xl animate-fade-in" aria-busy="true" aria-label="Loading dashboard">
    <Skeleton className="h-32 w-full rounded-2xl" />
    <Skeleton.StatGrid />
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Skeleton.Card className="lg:col-span-2" />
      <Skeleton.Card className="lg:col-span-3" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton.Card />
      <Skeleton.Card />
    </div>
    <Skeleton.Card />
  </div>
);

Skeleton.Analytics = () => (
  <div className="max-w-7xl space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading analytics">
    <Skeleton.StatGrid />
    <Skeleton.Card />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton.Card />
      <Skeleton.Card />
    </div>
    <Skeleton className="h-64 w-full rounded-2xl" />
  </div>
);

export default Skeleton;
