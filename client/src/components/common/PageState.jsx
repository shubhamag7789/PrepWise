/**
 * PageState — empty / error states for data views
 */
import { Link } from 'react-router-dom';
import Button from '@components/common/Button';

export const EmptyState = ({ icon = '📭', title, message, actionLabel, onAction, to }) => (
  <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[var(--color-border)]">
    <p className="text-4xl mb-3" aria-hidden="true">{icon}</p>
    <h3 className="font-display font-bold text-[var(--color-text)] mb-2">{title}</h3>
    <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto mb-4">{message}</p>
    {actionLabel && (onAction ? (
      <Button size="sm" onClick={onAction}>{actionLabel}</Button>
    ) : to ? (
      <Link to={to}><Button size="sm">{actionLabel}</Button></Link>
    ) : null)}
  </div>
);

export const ErrorState = ({ message = 'Failed to load data.', onRetry }) => (
  <div className="text-center py-12 px-4 rounded-2xl border border-red-500/20 bg-red-500/5" role="alert">
    <p className="text-2xl mb-2" aria-hidden="true">⚠️</p>
    <p className="text-sm text-[var(--color-text-muted)] mb-4">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
    )}
  </div>
);
