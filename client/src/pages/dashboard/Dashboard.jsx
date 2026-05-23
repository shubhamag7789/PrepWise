/**
 * Dashboard Home Page — Comprehensive prep overview
 * Features: Welcome hero, stat cards with trends, placement readiness,
 * study progress chart, streak tracker, weak topics, interview history,
 * ATS score widget, quick actions.
 */
import DashboardLayout from '@components/layout/DashboardLayout';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import StatCard from '@components/dashboard/StatCard';
import PlacementReadinessCard from '@components/dashboard/PlacementReadinessCard';
import StreakTracker from '@components/dashboard/StreakTracker';
import WeakTopicsCard from '@components/dashboard/WeakTopicsCard';
import InterviewHistory from '@components/dashboard/InterviewHistory';
import Skeleton from '@components/common/Skeleton';
import WidgetErrorBoundary from '@components/common/WidgetErrorBoundary';
import ATSScoreWidget from '@components/dashboard/ATSScoreWidget';
import StudyProgressChart from '@components/dashboard/StudyProgressChart';
import { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import useDashboardAnalytics from '@hooks/useDashboardAnalytics';
import { listSessions } from '@api/interviewApi';
import { Link } from 'react-router-dom';
import { formatCompact } from '@utils/formatters';

const quickActions = [
  {
    label: 'Start Practice',
    desc: 'Solve a new coding problem',
    icon: '💻',
    to: '/dashboard/practice',
    color: 'from-brand-500 to-indigo-600',
  },
  {
    label: 'Mock Interview',
    desc: 'AI-powered session',
    icon: '🎙️',
    to: '/dashboard/mock-interview',
    color: 'from-purple-500 to-pink-600',
  },
  {
    label: 'Resume ATS',
    desc: 'Analyze your PDF resume',
    icon: '📄',
    to: '/dashboard/resume-analyzer',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    label: 'View Analytics',
    desc: 'Track your progress',
    icon: '📊',
    to: '/dashboard/analytics',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    label: 'Prep Roadmap',
    desc: 'AI study plan',
    icon: '🗺️',
    to: '/dashboard/roadmap',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    label: 'My Profile',
    desc: 'Update skills & targets',
    icon: '👤',
    to: '/dashboard/profile',
    color: 'from-amber-500 to-orange-600',
  },
];

const calcProfileCompletion = (user) => {
  if (!user) return 0;
  const fields = [
    !!user.name,
    !!user.email,
    !!user.bio,
    !!user.college,
    user.skills?.length > 0,
    user.targetCompanies?.length > 0,
    !!user.avatar,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data: analytics, loading: analyticsLoading } = useDashboardAnalytics();
  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(true);

  useEffect(() => {
    listSessions({ limit: 5 })
      .then((res) => {
        const rows = res?.data;
        setInterviews(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setInterviews([]))
      .finally(() => setInterviewsLoading(false));
  }, []);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const stats = user?.stats;
  const summary = analytics?.summary;
  const profilePct = summary?.profileCompletion ?? calcProfileCompletion(user);
  const readinessScore = analytics?.placementReadiness?.overall ?? 0;
  const circumference = 2 * Math.PI * 40;
  const streakVal = summary?.streak ?? stats?.streak ?? 0;

  const statCards = [
    {
      label: 'Practice Sessions',
      value: formatCompact(summary?.practiceSessions ?? stats?.practiceSessionsCompleted ?? 0),
      icon: '💻',
      accentClass: 'bg-brand-500/10 text-brand-500',
      subText: 'Coming soon',
    },
    {
      label: 'Mock Interviews',
      value: formatCompact(summary?.mockInterviews ?? stats?.mockInterviewsCompleted ?? 0),
      icon: '🎙️',
      accentClass: 'bg-purple-500/10 text-purple-500',
      subText: summary?.avgScore ? `Avg ${summary.avgScore}%` : 'No interviews yet',
    },
    {
      label: 'Resume Scans',
      value: formatCompact(summary?.resumeAnalyses ?? 0),
      icon: '📄',
      accentClass: 'bg-cyan-500/10 text-cyan-500',
      subText: 'ATS analyses',
    },
    {
      label: 'Day Streak',
      value: `${streakVal}d`,
      icon: '🔥',
      accentClass: 'bg-accent-500/10 text-accent-500',
      subText: streakVal > 0 ? 'Keep it up! 🔥' : 'Start today!',
    },
  ];

  const readinessSkills = (analytics?.placementReadiness?.breakdown || []).map((b) => ({
    label: b.label,
    score: b.score,
    color:
      b.score >= 70 ? 'bg-emerald-500' : b.score >= 50 ? 'bg-amber-500' : 'bg-brand-500',
  }));

  return (
    <DashboardLayout
      title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
      subtitle={today}
    >
      <div className="space-y-6 max-w-7xl">
        {analyticsLoading && !analytics ? (
          <Skeleton.Dashboard />
        ) : (
        <>
        {/* ── Welcome Hero Banner ─────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-purple-600 to-indigo-700 p-6 text-white shadow-brand-lg">
          {/* Decorative blobs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-6 left-20 w-32 h-32 rounded-full bg-purple-400/10 blur-xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🎯</span>
                <h2 className="font-display font-black text-xl">
                  {profilePct >= 80
                    ? "You're on fire! Keep it up!"
                    : "Your placement journey starts here"}
                </h2>
              </div>
              <p className="text-white/70 text-sm max-w-md">
                {profilePct < 100
                  ? `Complete your profile (${profilePct}% done) to unlock personalized AI recommendations and company-specific prep paths.`
                  : "You've got a complete profile! AI recommendations are now tailored just for you."}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 text-sm font-medium">
                  <span>🏆</span>
                  <span>Placement Readiness: {readinessScore}%</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 text-sm font-medium">
                  <span>📅</span>
                  <span>{streakVal} day streak</span>
                </div>
              </div>
            </div>
            {profilePct < 100 && (
              <Link to="/dashboard/profile" className="shrink-0">
                <button className="bg-white text-brand-600 font-bold text-sm rounded-xl px-5 py-2.5 hover:bg-white/90 transition-colors shadow-lg whitespace-nowrap">
                  Complete Profile →
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon, accentClass, subText }) => (
            <StatCard
              key={label}
              label={label}
              value={value}
              icon={icon}
              accentClass={accentClass}
              subText={subText}
            />
          ))}
        </div>

        {/* ── Placement Readiness + Study Progress ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <WidgetErrorBoundary name="placement-readiness" fallbackTitle="Placement readiness unavailable">
              <PlacementReadinessCard
                overallScore={readinessScore}
                label={analytics?.placementReadiness?.label}
                skills={readinessSkills}
              />
            </WidgetErrorBoundary>
          </div>
          <div className="lg:col-span-3">
            <WidgetErrorBoundary name="study-progress" fallbackTitle="Study progress chart unavailable">
              <StudyProgressChart data={analytics?.weeklyChart} />
            </WidgetErrorBoundary>
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────── */}
        <div>
          <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map(({ label, desc, icon, to, color }) => (
              <Link key={label} to={to}>
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-5 text-white hover:-translate-y-1 hover:shadow-brand transition-all duration-200 cursor-pointer group`}>
                  <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-2xl mb-3">{icon}</div>
                  <p className="font-semibold text-sm leading-tight">{label}</p>
                  <p className="text-white/70 text-xs mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Streak + ATS Score ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StreakTracker
            streak={streakVal}
            longestStreak={summary?.longestStreak ?? stats?.longestStreak ?? 0}
            activeDays={analytics?.activeDays ?? []}
          />
          <WidgetErrorBoundary name="ats-widget" fallbackTitle="Resume ATS widget unavailable">
            <ATSScoreWidget />
          </WidgetErrorBoundary>
        </div>

        {/* ── Weak Topics + Profile Completion ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeakTopicsCard topics={analytics?.weakTopics} />
          </div>

          {/* Profile Completion Ring */}
          <Card>
            <Card.Header>
              <h3 className="font-display font-bold text-[var(--color-text)]">
                Profile Completion
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 mb-4">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none" stroke="currentColor" strokeWidth="8"
                      className="text-surface-200 dark:text-surface-700"
                    />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none" stroke="url(#profileGrad)" strokeWidth="8"
                      strokeDasharray={`${circumference * (profilePct / 100)} ${circumference}`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display font-black text-2xl text-[var(--color-text)]">
                      {profilePct}%
                    </span>
                  </div>
                </div>

                {/* Checklist items */}
                <div className="w-full space-y-2 mb-4 text-left">
                  {[
                    { label: 'Name & Email', done: !!user?.name && !!user?.email },
                    { label: 'Bio added', done: !!user?.bio },
                    { label: 'College filled', done: !!user?.college },
                    { label: 'Skills listed', done: (user?.skills?.length ?? 0) > 0 },
                    { label: 'Target companies', done: (user?.targetCompanies?.length ?? 0) > 0 },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 ${done ? 'bg-emerald-500 text-white' : 'bg-surface-200 dark:bg-surface-700'}`}>
                        {done ? '✓' : ''}
                      </div>
                      <span className={`text-xs ${done ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text)]'}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {profilePct < 100 && (
                  <Link to="/dashboard/profile">
                    <Button variant="outline" size="sm">Complete profile</Button>
                  </Link>
                )}
                {profilePct === 100 && (
                  <p className="text-xs text-emerald-500 font-semibold">🎉 Profile complete!</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* ── Interview History ──────────────────────────────── */}
        <InterviewHistory sessions={interviews} loading={interviewsLoading} />
        </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
