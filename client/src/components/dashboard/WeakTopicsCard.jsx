/**
 * WeakTopicsCard — clean list of weak domains/topics from real analytics
 */
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

const getMasteryColor = (val) => {
  if (val >= 70) return 'bg-emerald-500';
  if (val >= 50) return 'bg-amber-500';
  if (val >= 35) return 'bg-orange-500';
  return 'bg-red-500';
};

const getMasteryTextColor = (val) => {
  if (val >= 70) return 'text-emerald-500';
  if (val >= 50) return 'text-amber-500';
  return 'text-red-500';
};

const WeakTopicsCard = ({ topics = [] }) => {
  const list = Array.isArray(topics) ? topics : [];
  const sorted = [...list]
    .filter((t) => t.topic && t.mastery != null)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 6);

  const hasRealData = sorted.some((t) => t.sessions > 0);

  return (
    <div className="rounded-2xl border bg-[var(--color-bg-card)] border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-[var(--color-text)]">Weak Topics</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Domains with lowest interview scores
          </p>
        </div>
        {hasRealData && (
          <span className="text-xs bg-red-500/10 text-red-500 font-bold px-2.5 py-1 rounded-lg shrink-0">
            Needs Attention
          </span>
        )}
      </div>

      {!hasRealData ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)] mb-3">
            Complete mock interviews to detect weak areas.
          </p>
          <Link
            to="/dashboard/mock-interview"
            className="text-sm font-semibold text-brand-500 hover:text-brand-400"
          >
            Start Mock Interview →
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {sorted.map(({ topic, mastery, sessions, detail }) => (
            <li key={topic}>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <p
                  className="text-sm font-medium text-[var(--color-text)] truncate"
                  title={detail || topic}
                >
                  {topic}
                </p>
                <span className={clsx('text-xs font-bold shrink-0', getMasteryTextColor(mastery))}>
                  {mastery}%
                </span>
              </div>
              <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-700', getMasteryColor(mastery))}
                  style={{ width: `${Math.min(100, Math.max(0, mastery))}%` }}
                />
              </div>
              {sessions > 0 && (
                <p className="text-[10px] text-[var(--color-text-faint)] mt-1">
                  {sessions} session{sessions !== 1 ? 's' : ''}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-3 mt-5 pt-4 border-t border-[var(--color-border)] flex-wrap">
        {[
          { label: '< 50% Critical', color: 'bg-red-500' },
          { label: '50–70% Improving', color: 'bg-amber-500' },
          { label: '> 70% Strong', color: 'bg-emerald-500' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-faint)]">
            <div className={clsx('w-2 h-2 rounded-full', color)} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeakTopicsCard;
