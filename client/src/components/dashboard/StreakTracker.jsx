/**
 * StreakTracker — 7-day calendar from real activity data
 */
import { clsx } from 'clsx';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const buildWeekDays = (activeDays) => {
  const days = Array.isArray(activeDays) ? activeDays : [];
  const activeSet = new Set(days);
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    return {
      label: DAY_LABELS[d.getDay()],
      date: iso,
      active: activeSet.has(iso),
      isToday: i === 6,
    };
  });
};

const StreakTracker = ({ streak = 0, longestStreak = 0, activeDays = [] }) => {
  const days = buildWeekDays(activeDays);

  return (
    <div className="rounded-2xl border bg-[var(--color-bg-card)] border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-[var(--color-text)]">Daily Streak</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Keep showing up every day!</p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          <span className="text-xl leading-none">🔥</span>
          <div>
            <p className="font-display font-black text-xl text-amber-500 leading-none">{streak}</p>
            <p className="text-[10px] text-amber-400/70">days</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(({ label, date, active, isToday }) => (
          <div key={date} className="flex flex-col items-center gap-1.5">
            <p className="text-[10px] font-medium text-[var(--color-text-faint)] uppercase">{label}</p>
            <div
              title={date}
              className={clsx(
                'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all',
                active
                  ? 'bg-gradient-to-br from-brand-500 to-purple-500 text-white shadow-brand-sm'
                  : 'bg-surface-100 dark:bg-surface-800 text-[var(--color-text-faint)]',
                isToday && !active && 'ring-2 ring-brand-500/40',
                isToday && active && 'ring-2 ring-brand-300'
              )}
            >
              {active ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--color-text-faint)] text-center mt-4">
        {streak === 0
          ? 'Complete an interview or resume scan to start your streak!'
          : streak >= 7
            ? `🎉 Amazing! ${streak}-day streak — best: ${longestStreak}d`
            : `Best streak: ${longestStreak} days · ${Math.max(0, 7 - streak)} to 7-day milestone`}
      </p>
    </div>
  );
};

export default StreakTracker;
