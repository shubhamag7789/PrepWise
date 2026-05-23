/**
 * PlacementReadinessCard — score ring + skill breakdown bars
 */
import { clsx } from 'clsx';

const getReadinessStyle = (score) => {
  if (score >= 80) return { label: 'Interview Ready', color: 'text-emerald-500 bg-emerald-500/10' };
  if (score >= 60) return { label: 'Almost There', color: 'text-amber-500 bg-amber-500/10' };
  return { label: 'Keep Grinding', color: 'text-red-500 bg-red-500/10' };
};

const DEFAULT_SKILLS = [
  { label: 'Technical (DSA & Core)', score: 0, color: 'bg-brand-500' },
  { label: 'System Design & Web', score: 0, color: 'bg-purple-500' },
  { label: 'Behavioral / HR', score: 0, color: 'bg-emerald-500' },
  { label: 'Resume Strength', score: 0, color: 'bg-amber-500' },
];

const PlacementReadinessCard = ({ overallScore = 0, label: labelProp, skills }) => {
  const { label, color } = labelProp
    ? { label: labelProp, color: getReadinessStyle(overallScore).color }
    : getReadinessStyle(overallScore);

  const skillBars = Array.isArray(skills) && skills.length ? skills : DEFAULT_SKILLS;
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * (Math.min(100, Math.max(0, overallScore)) / 100);

  return (
    <div className="rounded-2xl border bg-[var(--color-bg-card)] border-[var(--color-border)] p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-[var(--color-text)] text-base">
            Placement Readiness
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Based on interviews, resume & consistency
          </p>
        </div>
        <span className={clsx('text-xs font-bold px-3 py-1.5 rounded-full', color)}>{label}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="9"
            />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="url(#readinessGrad)"
              strokeWidth="9"
              strokeDasharray={`${filled} ${circumference}`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="readinessGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-black text-2xl text-[var(--color-text)] leading-none">
              {overallScore}
            </span>
            <span className="text-[10px] text-[var(--color-text-faint)]">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {skillBars.map(({ label: lbl, score, color: barColor }) => (
            <div key={lbl}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[160px]">{lbl}</p>
                <span className="text-xs font-bold text-[var(--color-text)] ml-2">{score}%</span>
              </div>
              <div className="h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-700', barColor || 'bg-brand-500')}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlacementReadinessCard;
