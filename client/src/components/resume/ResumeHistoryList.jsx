/**
 * ResumeHistoryList — past ATS analyses
 */
import { clsx } from 'clsx';
import Spinner from '@components/common/Spinner';
import { getGradeMeta } from './ATSScoreRing';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const ResumeHistoryList = ({
  items = [],
  loading,
  activeId,
  onSelect,
  onDelete,
  deletingId,
}) => (
  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
    <h4 className="font-display font-bold text-[var(--color-text)] mb-4">Analysis History</h4>

    {loading ? (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    ) : items.length === 0 ? (
      <p className="text-sm text-[var(--color-text-muted)] text-center py-6">
        No analyses yet. Upload a resume to get started.
      </p>
    ) : (
      <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {items.map((item) => {
          const score = item.analysis?.atsScore ?? 0;
          const { grade, color } = getGradeMeta(score);
          const isActive = activeId === item._id;

          return (
            <li key={item._id}>
              <button
                type="button"
                onClick={() => onSelect(item._id)}
                className={clsx(
                  'w-full text-left rounded-xl border p-3 transition-all',
                  isActive
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-[var(--color-border)] hover:border-brand-400/40'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                      {item.originalFileName}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {formatDate(item.createdAt)}
                      {item.targetRole ? ` · ${item.targetRole}` : ''}
                    </p>
                  </div>
                  <span
                    className="font-display font-black text-lg shrink-0"
                    style={{ color }}
                  >
                    {grade}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[var(--color-text-muted)]">{score}/100 ATS</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item._id);
                    }}
                    disabled={deletingId === item._id}
                    className="text-[11px] text-red-500 hover:text-red-600 font-medium"
                  >
                    {deletingId === item._id ? '…' : 'Delete'}
                  </button>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

export default ResumeHistoryList;
