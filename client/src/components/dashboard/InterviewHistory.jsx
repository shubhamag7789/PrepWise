/**
 * InterviewHistory — recent mock interviews from API
 */
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import Badge from '@components/common/Badge';
import Spinner from '@components/common/Spinner';

const DOMAIN_ICONS = {
  DSA: '🧩',
  DBMS: '🗄️',
  OS: '⚙️',
  CN: '🌐',
  WebDev: '💻',
  HR: '🤝',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
};

const getStatus = (score, status) => {
  if (status === 'active') return { label: 'In Progress', variant: 'info' };
  if (status === 'abandoned') return { label: 'Abandoned', variant: 'default' };
  if (score >= 75) return { label: 'Strong', variant: 'success' };
  if (score >= 55) return { label: 'Review', variant: 'warning' };
  return { label: 'Needs Work', variant: 'danger' };
};

const ScoreBar = ({ score }) => {
  if (score == null) return <span className="text-xs text-[var(--color-text-faint)]">—</span>;
  const color = score >= 75 ? 'bg-emerald-500' : score >= 55 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-[var(--color-text)]">{score}%</span>
    </div>
  );
};

const InterviewHistory = ({ sessions = [], loading = false }) => {
  const rows = sessions.slice(0, 5);

  return (
    <div className="rounded-2xl border bg-[var(--color-bg-card)] border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-[var(--color-text)]">Recent Interviews</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {rows.length ? `Your last ${rows.length} sessions` : 'No interviews yet'}
          </p>
        </div>
        <Link
          to="/dashboard/mock-interview"
          className="text-xs font-semibold text-brand-500 hover:text-brand-400 transition-colors"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)] mb-3">Start your first mock interview.</p>
          <Link to="/dashboard/mock-interview" className="text-sm font-semibold text-brand-500">
            Go to Mock Interview →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                {['Session', 'Domain', 'Date', 'Score', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold text-[var(--color-text-faint)] uppercase tracking-wider pb-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {rows.map((s) => {
                const score = s.feedback?.overallScore;
                const { label, variant } = getStatus(score, s.status);
                const href =
                  s.status === 'completed'
                    ? `/dashboard/interview/${s._id}/feedback`
                    : `/dashboard/interview/${s._id}`;

                return (
                  <tr key={s._id} className="group hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="py-3 pr-4">
                      <Link to={href} className="flex items-center gap-2.5">
                        <span className="text-lg">{DOMAIN_ICONS[s.domain] || '🎙️'}</span>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)] leading-tight group-hover:text-brand-500">
                            {s.sessionName || `${s.domain} Interview`}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-faint)]">{s.difficulty}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-[var(--color-text-muted)] bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-md">
                        {s.domain}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[var(--color-text-muted)]">
                      {formatDate(s.completedAt || s.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <ScoreBar score={score} />
                    </td>
                    <td className="py-3">
                      <Badge variant={variant} size="sm">{label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;
