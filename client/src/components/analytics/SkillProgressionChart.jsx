/**
 * SkillProgressionChart — domain scores over months
 */
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = {
  DSA: '#6366f1',
  DBMS: '#8b5cf6',
  OS: '#f59e0b',
  CN: '#10b981',
  WebDev: '#ec4899',
  HR: '#06b6d4',
};

const SkillProgressionChart = ({ data = [] }) => {
  const domains = Object.keys(COLORS).filter((d) =>
    data.some((row) => row[d] != null)
  );

  if (!data.length || !domains.length) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center py-12">
        <p className="text-sm text-[var(--color-text-muted)]">
          Complete more interviews to track skill progression over time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      <h3 className="font-display font-bold text-[var(--color-text)] mb-1">Skill Progression</h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">Domain scores by month</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'var(--color-text-faint)' }}
            tickLine={false}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-faint)' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.75rem',
              fontSize: '0.75rem',
            }}
            formatter={(v) => [`${v}%`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          {domains.map((d) => (
            <Line
              key={d}
              type="monotone"
              dataKey={d}
              name={d}
              stroke={COLORS[d]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillProgressionChart;
