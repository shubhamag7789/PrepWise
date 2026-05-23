/**
 * StudyProgressChart — Area chart showing weekly study sessions
 * Uses Recharts AreaChart with gradient fill
 */
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const EMPTY_DATA = [{ week: '—', sessions: 0, score: 0 }];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-[var(--color-bg-elevated)] border-[var(--color-border)] shadow-lg px-3 py-2.5">
      <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[var(--color-text-muted)] capitalize">{p.name}:</span>
          <span className="font-bold text-[var(--color-text)]">{p.value}{p.dataKey === 'score' ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
};

const StudyProgressChart = ({ data }) => {
  const chartData = data?.length ? data : EMPTY_DATA;
  return (
    <div className="rounded-2xl border bg-[var(--color-bg-card)] border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-[var(--color-text)]">Study Progress</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Sessions & score over 8 weeks</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-brand-500" />
            <span className="text-[var(--color-text-muted)]">Sessions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[var(--color-text-muted)]">Avg Score</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: 'var(--color-text-faint)', fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--color-text-faint)', fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="sessions"
            name="Sessions"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#sessionsGrad)"
            dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            name="Score"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#scoreGrad)"
            dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudyProgressChart;
