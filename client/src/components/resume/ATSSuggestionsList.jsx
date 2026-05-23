/**
 * ATSSuggestionsList — prioritized improvement suggestions
 */
import { clsx } from 'clsx';

const priorityStyle = {
  high: 'border-red-400/40 bg-red-500/5',
  medium: 'border-amber-400/40 bg-amber-500/5',
  low: 'border-[var(--color-border)]',
};

const priorityLabel = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-[var(--color-text-muted)]',
};

const ATSSuggestionsList = ({ improvements = [], strengths = [] }) => (
  <div className="space-y-4">
    {strengths.length > 0 && (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <h4 className="font-display font-bold text-[var(--color-text)] mb-3">Strengths</h4>
        <ul className="space-y-2">
          {strengths.map((s) => (
            <li key={s} className="flex gap-2 text-sm text-[var(--color-text-muted)]">
              <span className="text-emerald-500 shrink-0">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <h4 className="font-display font-bold text-[var(--color-text)] mb-4">
        Improvement Suggestions
      </h4>
      <ul className="space-y-3">
        {improvements.map((item, i) => (
          <li
            key={`${item.category}-${i}`}
            className={clsx(
              'rounded-xl border p-4',
              priorityStyle[item.priority] || priorityStyle.medium
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wide">
                {item.category}
              </span>
              <span
                className={clsx(
                  'text-[10px] font-bold uppercase',
                  priorityLabel[item.priority] || priorityLabel.medium
                )}
              >
                {item.priority}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text)]">{item.suggestion}</p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default ATSSuggestionsList;
