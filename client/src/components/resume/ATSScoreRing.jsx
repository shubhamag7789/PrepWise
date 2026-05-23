/**
 * ATSScoreRing — circular ATS grade display
 */
import { clsx } from 'clsx';

export const getGradeMeta = (score) => {
  if (score >= 85) return { grade: 'A',  label: 'ATS Optimized', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-500' };
  if (score >= 70) return { grade: 'B+', label: 'Good',          color: '#6366f1', bg: 'bg-brand-500/10 text-brand-500' };
  if (score >= 55) return { grade: 'C',  label: 'Needs Work',    color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-500' };
  return                  { grade: 'D',  label: 'Below Average', color: '#ef4444', bg: 'bg-red-500/10 text-red-500' };
};

const ATSScoreRing = ({ score = 0, grade, size = 'md', className = '' }) => {
  const meta = getGradeMeta(score);
  const displayGrade = grade || meta.grade;
  const color = meta.color;
  const r = size === 'lg' ? 44 : 38;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * (Math.min(100, Math.max(0, score)) / 100);
  const dim = size === 'lg' ? 'w-32 h-32' : 'w-24 h-24';
  const textSize = size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <div className={clsx('relative shrink-0', dim, className)}>
      <svg className={clsx(dim, '-rotate-90')} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-border)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={clsx('font-display font-black leading-none', textSize)} style={{ color }}>
          {displayGrade}
        </span>
        <span className="text-[10px] text-[var(--color-text-faint)]">{score}/100</span>
      </div>
    </div>
  );
};

export default ATSScoreRing;
