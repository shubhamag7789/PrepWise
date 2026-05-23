/**
 * Analytics Page — real data from analytics API
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import StatCard from '@components/dashboard/StatCard';
import PlacementReadinessCard from '@components/dashboard/PlacementReadinessCard';
import WeakTopicsCard from '@components/dashboard/WeakTopicsCard';
import Skeleton from '@components/common/Skeleton';
import { ErrorState } from '@components/common/PageState';
import SkillProgressionChart from '@components/analytics/SkillProgressionChart';
import { getFullAnalytics } from '@api/analyticsApi';
import { unwrapApi } from '@utils/apiHelpers';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar,
} from 'recharts';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-[var(--color-bg-elevated)] border-[var(--color-border)] shadow-lg px-3 py-2.5 text-sm">
      <p className="font-semibold text-[var(--color-text-muted)] mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[var(--color-text-muted)]">{p.name}:</span>
          <span className="font-bold text-[var(--color-text)]">
            {p.value}{String(p.dataKey).includes('score') ? '%' : ''}
          </span>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [chartRange, setChartRange] = useState('weekly');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const res = await getFullAnalytics();
      const payload = unwrapApi(res);
      setAnalytics(payload?.analytics ?? null);
    } catch {
      setLoadError(true);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Loading your prep data…">
        <Skeleton.Analytics />
      </DashboardLayout>
    );
  }

  if (loadError) {
    return (
      <DashboardLayout title="Analytics" subtitle="Could not load data">
        <ErrorState message="Failed to load analytics." onRetry={load} />
      </DashboardLayout>
    );
  }

  const s = analytics?.summary || {};
  const charts = analytics?.charts || {};
  const progressData =
    chartRange === 'daily'
      ? charts.daily
      : chartRange === 'monthly'
        ? charts.monthly
        : charts.weekly;

  const progressXKey = chartRange === 'daily' ? 'day' : chartRange === 'monthly' ? 'month' : 'week';

  const summaryCards = [
    {
      label: 'Mock Interviews',
      value: s.mockInterviews ?? 0,
      icon: '🎙️',
      accentClass: 'bg-purple-500/10 text-purple-500',
      subText: 'Completed sessions',
    },
    {
      label: 'Avg. Interview Score',
      value: s.avgScore ? `${s.avgScore}%` : '—',
      icon: '🎯',
      accentClass: 'bg-emerald-500/10 text-emerald-500',
      subText: 'Overall performance',
    },
    {
      label: 'Resume Analyses',
      value: s.resumeAnalyses ?? 0,
      icon: '📄',
      accentClass: 'bg-cyan-500/10 text-cyan-500',
      subText: 'ATS scans done',
    },
    {
      label: 'Current Streak',
      value: `${s.streak ?? 0}d`,
      icon: '🔥',
      accentClass: 'bg-amber-500/10 text-amber-500',
      subText: `Best: ${s.longestStreak ?? 0} days`,
    },
  ];

  const weakForCard = (analytics?.topicAnalytics?.weakTopics || []).map((t) => ({
    topic: t.topic,
    mastery: t.mastery,
  }));

  const readinessSkills = (analytics?.placementReadiness?.breakdown || []).map((b) => ({
    label: b.label,
    score: b.score,
    color:
      b.score >= 70
        ? 'bg-emerald-500'
        : b.score >= 50
          ? 'bg-amber-500'
          : 'bg-brand-500',
  }));

  return (
    <DashboardLayout title="Analytics" subtitle="Track performance & get AI-powered prep insights">
      <div className="max-w-7xl space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <PlacementReadinessCard
          overallScore={analytics?.placementReadiness?.overall ?? 0}
          label={analytics?.placementReadiness?.label}
          skills={readinessSkills}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeakTopicsCard topics={weakForCard} />
          <SkillProgressionChart data={analytics?.skillProgression || []} />
        </div>

        {/* Progress charts */}
        <Card>
          <Card.Header>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-[var(--color-text)]">Progress Over Time</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Sessions & average scores
                </p>
              </div>
              <div className="flex gap-2">
                {['daily', 'weekly', 'monthly'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setChartRange(r)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                      chartRange === r
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-100 dark:bg-surface-800 text-[var(--color-text-muted)]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={progressData || []} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="sessionsGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="scoreGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey={progressXKey}
                  tick={{ fontSize: 11, fill: 'var(--color-text-faint)' }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-faint)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#6366f1" strokeWidth={2} fill="url(#sessionsGradA)" />
                <Area type="monotone" dataKey="score" name="Score" stroke="#10b981" strokeWidth={2} fill="url(#scoreGradA)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        {/* Interview performance */}
        <Card>
          <Card.Header>
            <h3 className="font-display font-bold text-[var(--color-text)]">Interview Performance</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Last completed mock interviews</p>
          </Card.Header>
          <Card.Body>
            {(analytics?.interviewPerformance || []).length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
                No completed interviews yet.{' '}
                <Link to="/dashboard/mock-interview" className="text-brand-500 font-semibold">
                  Start one →
                </Link>
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.interviewPerformance} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-faint)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-faint)' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="technical" name="Technical" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="communication" name="Communication" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="overall" name="Overall" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <h3 className="font-display font-bold text-[var(--color-text)]">Topic Strength Radar</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Mastery by interview domain</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={analytics?.topicAnalytics?.radar || []} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Mastery']} />
                </RadarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="font-display font-bold text-[var(--color-text)]">Difficulty Breakdown</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Interviews by difficulty level</p>
            </Card.Header>
            <Card.Body>
              <div className="space-y-5">
                {(analytics?.difficultyBreakdown || []).map(({ label, solved, total, color, avgScore }) => {
                  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm font-bold">
                          {solved} done · avg {avgScore}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/dashboard/mock-interview">
                <Button variant="outline" size="sm" className="w-full mt-5">
                  Practice Mock Interview
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
