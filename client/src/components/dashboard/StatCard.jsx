/**
 * StatCard — Enhanced analytics stat card with trend indicator
 */
import { clsx } from 'clsx';

const StatCard = ({
  label,
  value,
  icon,
  trend,       // e.g. "+12%" or "-3%"
  trendUp,     // boolean
  subText,
  accentClass = 'bg-brand-500/10 text-brand-500',
  className = '',
}) => {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl border p-5',
        'bg-[var(--color-bg-card)] border-[var(--color-border)]',
        'transition-all duration-200 hover:-translate-y-1 hover:shadow-card dark:hover:shadow-card-dark',
        className
      )}
    >
      {/* Background accent blob */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-current blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0', accentClass)}>
          {icon}
        </div>
        {trend && (
          <span
            className={clsx(
              'text-xs font-bold px-2 py-1 rounded-lg',
              trendUp
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-red-500/10 text-red-500'
            )}
          >
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>

      <p className="text-sm text-[var(--color-text-muted)] mb-0.5">{label}</p>
      <p className="font-display font-black text-3xl text-[var(--color-text)] leading-none">
        {value}
      </p>
      {subText && (
        <p className="text-xs text-[var(--color-text-faint)] mt-1.5">{subText}</p>
      )}
    </div>
  );
};

export default StatCard;
