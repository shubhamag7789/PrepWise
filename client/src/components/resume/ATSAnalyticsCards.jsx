/**
 * ATSAnalyticsCards — score breakdown metric cards
 */
import { clsx } from 'clsx';

const METRICS = [
  { key: 'keywordMatchScore', label: 'Keywords Match', icon: '🔑', color: 'from-violet-500 to-purple-600' },
  { key: 'formatScore', label: 'Format & Layout', icon: '📐', color: 'from-blue-500 to-cyan-600' },
  { key: 'actionVerbsScore', label: 'Action Verbs', icon: '⚡', color: 'from-amber-500 to-orange-600' },
  { key: 'jobMatchScore', label: 'Job Match', icon: '🎯', color: 'from-emerald-500 to-teal-600' },
];

const ATSAnalyticsCards = ({ analysis, hasJobMatch }) => {
  if (!analysis) return null;

  const items = METRICS.filter((m) => m.key !== 'jobMatchScore' || hasJobMatch);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map(({ key, label, icon, color }) => {
        const val = analysis[key];
        if (val == null && key === 'jobMatchScore') return null;
        const score = val ?? 0;

        return (
          <div
            key={key}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{icon}</span>
              <span className="text-2xl font-display font-black text-[var(--color-text)]">
                {score}%
              </span>
            </div>
            <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{label}</p>
            <div className="h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-700', color)}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ATSAnalyticsCards;
