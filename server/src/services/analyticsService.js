/**
 * Analytics Service — aggregates prep data into dashboard metrics
 */
const InterviewSession = require('../models/InterviewSession');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const DailyActivity = require('../models/DailyActivity');
const User = require('../models/User');

const DOMAINS = ['DSA', 'DBMS', 'OS', 'CN', 'WebDev', 'HR'];
const DOMAIN_LABELS = {
  DSA: 'Data Structures & Algo',
  DBMS: 'DBMS',
  OS: 'Operating Systems',
  CN: 'Computer Networks',
  WebDev: 'Web Development',
  HR: 'Behavioral / HR',
};

const BASELINE_MASTERY = 35;

const toDateKey = (d) => new Date(d).toISOString().split('T')[0];

const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

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

const getCompletedInterviews = (userId) =>
  InterviewSession.find({ userId, status: 'completed' })
    .select('domain difficulty feedback completedAt duration')
    .sort({ completedAt: -1 })
    .lean();

const buildTopicAnalytics = (sessions) => {
  const domainScores = {};

  DOMAINS.forEach((d) => {
    domainScores[d] = [];
  });

  sessions.forEach((s) => {
    if (s.feedback?.overallScore != null) {
      domainScores[s.domain]?.push(s.feedback.overallScore);
    }
  });

  const byDomain = DOMAINS.map((domain) => ({
    domain,
    label: DOMAIN_LABELS[domain],
    mastery: domainScores[domain].length
      ? avg(domainScores[domain])
      : BASELINE_MASTERY,
    sessions: domainScores[domain].length,
    technicalAvg: domainScores[domain].length
      ? avg(
          sessions
            .filter((s) => s.domain === domain && s.feedback?.technicalScore != null)
            .map((s) => s.feedback.technicalScore)
        )
      : BASELINE_MASTERY,
  }));

  // Weak topics = interview domains only (short labels, no long feedback sentences)
  const domainWeak = byDomain
    .filter((d) => d.sessions > 0)
    .map((d) => ({
      topic: d.label,
      domain: d.domain,
      mastery: d.mastery,
      sessions: d.sessions,
      detail: `${d.sessions} mock interview${d.sessions !== 1 ? 's' : ''} · avg ${d.mastery}%`,
    }))
    .sort((a, b) => a.mastery - b.mastery);

  // If no interviews yet, return empty — UI shows empty state
  const weakTopics = domainWeak.slice(0, 6);

  return { byDomain, weakTopics, radarData: byDomain };
};

const buildInterviewPerformance = (sessions) => {
  const last10 = sessions.slice(0, 10).reverse();
  return last10.map((s, i) => ({
    label: `#${i + 1}`,
    domain: s.domain,
    difficulty: s.difficulty,
    technical: s.feedback?.technicalScore ?? 0,
    communication: s.feedback?.communicationScore ?? 0,
    overall: s.feedback?.overallScore ?? 0,
    date: s.completedAt,
  }));
};

const buildDailyChart = async (userId) => {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(toDateKey(d));
  }

  const activities = await DailyActivity.find({
    userId,
    date: { $in: days },
  }).lean();

  const actMap = Object.fromEntries(activities.map((a) => [a.date, a]));

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return days.map((date) => {
    const a = actMap[date];
    const d = new Date(`${date}T12:00:00`);
    const sessions =
      (a?.interviews || 0) + (a?.resumeAnalyses || 0) + (a?.practiceSessions || 0);
    const score =
      a?.scoreCount > 0 ? Math.round(a.scoreSum / a.scoreCount) : null;

    return {
      date,
      day: dayLabels[d.getDay()],
      score: score ?? 0,
      hasActivity: sessions > 0,
      sessions,
      interviews: a?.interviews || 0,
    };
  });
};

const buildWeeklyChart = async (userId) => {
  const weeks = [];
  const today = new Date();

  for (let w = 7; w >= 0; w--) {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - w * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const startKey = toDateKey(weekStart);
    const endKey = toDateKey(weekEnd);

    const activities = await DailyActivity.find({
      userId,
      date: { $gte: startKey, $lte: endKey },
    }).lean();

    let sessions = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    activities.forEach((a) => {
      sessions += (a.interviews || 0) + (a.resumeAnalyses || 0) + (a.practiceSessions || 0);
      scoreSum += a.scoreSum || 0;
      scoreCount += a.scoreCount || 0;
    });

    const month = weekStart.toLocaleString('en', { month: 'short' });
    const weekNum = Math.ceil(weekStart.getDate() / 7);

    weeks.push({
      week: `${month} W${weekNum}`,
      sessions,
      score: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0,
      start: startKey,
      end: endKey,
    });
  }

  return weeks;
};

const buildMonthlyChart = async (userId) => {
  const months = [];
  const today = new Date();

  for (let m = 5; m >= 0; m--) {
    const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const startKey = toDateKey(d);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const endKey = toDateKey(end);

    const activities = await DailyActivity.find({
      userId,
      date: { $gte: startKey, $lte: endKey },
    }).lean();

    let sessions = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    activities.forEach((a) => {
      sessions += (a.interviews || 0) + (a.resumeAnalyses || 0) + (a.practiceSessions || 0);
      scoreSum += a.scoreSum || 0;
      scoreCount += a.scoreCount || 0;
    });

    months.push({
      month: d.toLocaleString('en', { month: 'short', year: '2-digit' }),
      sessions,
      score: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0,
    });
  }

  return months;
};

const buildSkillProgression = (sessions) => {
  const byMonth = {};

  sessions.forEach((s) => {
    if (!s.completedAt || !s.feedback?.overallScore) return;
    const d = new Date(s.completedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = {};
    if (!byMonth[key][s.domain]) byMonth[key][s.domain] = [];
    byMonth[key][s.domain].push(s.feedback.overallScore);
  });

  return Object.keys(byMonth)
    .sort()
    .slice(-6)
    .map((key) => {
      const [y, m] = key.split('-');
      const label = new Date(Number(y), Number(m) - 1).toLocaleString('en', {
        month: 'short',
      });
      const entry = { month: label };
      DOMAINS.forEach((domain) => {
        entry[domain] = byMonth[key][domain] ? avg(byMonth[key][domain]) : null;
      });
      return entry;
    });
};

const computePlacementReadiness = (user, sessions, latestResume, topicAnalytics, streak) => {
  const profilePct = calcProfileCompletion(user);
  const techDomains = ['DSA', 'DBMS', 'OS', 'CN', 'WebDev'];
  const techScores = topicAnalytics.byDomain
    .filter((d) => techDomains.includes(d.domain) && d.sessions > 0)
    .map((d) => d.mastery);
  const dsaScore = techScores.length ? avg(techScores) : BASELINE_MASTERY;

  const sysDesignDomains = topicAnalytics.byDomain.filter((d) =>
    ['OS', 'CN', 'WebDev'].includes(d.domain)
  );
  const sysDesignScore = sysDesignDomains.some((d) => d.sessions > 0)
    ? avg(sysDesignDomains.filter((d) => d.sessions > 0).map((d) => d.mastery))
    : BASELINE_MASTERY;

  const hrEntry = topicAnalytics.byDomain.find((d) => d.domain === 'HR');
  const hrScore = hrEntry?.sessions > 0 ? hrEntry.mastery : BASELINE_MASTERY;

  const resumeScore = latestResume?.analysis?.atsScore ?? BASELINE_MASTERY;
  const consistencyScore = Math.min(100, streak * 12);
  const profileScore = profilePct;

  const overall = Math.round(
    dsaScore * 0.35 +
      sysDesignScore * 0.15 +
      hrScore * 0.15 +
      resumeScore * 0.15 +
      consistencyScore * 0.1 +
      profileScore * 0.1
  );

  const clamp = (n) => Math.min(100, Math.max(0, n));

  return {
    overall: clamp(overall),
    label:
      overall >= 80 ? 'Interview Ready' : overall >= 60 ? 'Almost There' : 'Keep Grinding',
    breakdown: [
      { label: 'Technical (DSA & Core)', score: clamp(dsaScore) },
      { label: 'System Design & Web', score: clamp(sysDesignScore) },
      { label: 'Behavioral / HR', score: clamp(hrScore) },
      { label: 'Resume Strength', score: clamp(resumeScore) },
      { label: 'Consistency', score: clamp(consistencyScore) },
    ],
  };
};

const buildDifficultyBreakdown = (sessions) => {
  const levels = { Easy: [], Medium: [], Hard: [] };
  sessions.forEach((s) => {
    if (s.feedback?.overallScore != null && levels[s.difficulty]) {
      levels[s.difficulty].push(s.feedback.overallScore);
    }
  });

  return ['Easy', 'Medium', 'Hard'].map((label) => {
    const scores = levels[label];
    const solved = scores.length;
    const avgScore = solved ? avg(scores) : 0;
    return {
      label,
      solved,
      total: Math.max(solved, solved + 3),
      avgScore,
      color: label === 'Easy' ? '#10b981' : label === 'Medium' ? '#f59e0b' : '#ef4444',
    };
  });
};

const getActiveDaySet = async (userId, days = 60) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const activities = await DailyActivity.find({
    userId,
    date: { $gte: toDateKey(since) },
    $or: [
      { interviews: { $gt: 0 } },
      { resumeAnalyses: { $gt: 0 } },
      { practiceSessions: { $gt: 0 } },
    ],
  })
    .select('date')
    .lean();

  return new Set(activities.map((a) => a.date));
};

/**
 * Full analytics payload for dashboard + analytics page
 */
const computeUserAnalytics = async (userId) => {
  const user = await User.findById(userId).lean();
  const sessions = await getCompletedInterviews(userId);
  const latestResume = await ResumeAnalysis.findOne({
    userId,
    status: 'completed',
  })
    .sort({ createdAt: -1 })
    .lean();

  const topicAnalytics = buildTopicAnalytics(sessions);
  const streak = user?.stats?.streak ?? 0;
  const longestStreak = user?.stats?.longestStreak ?? streak;
  const placementReadiness = computePlacementReadiness(
    user,
    sessions,
    latestResume,
    topicAnalytics,
    streak
  );

  const [dailyChart, weeklyChart, monthlyChart, activeDays] = await Promise.all([
    buildDailyChart(userId),
    buildWeeklyChart(userId),
    buildMonthlyChart(userId),
    getActiveDaySet(userId),
  ]);

  const interviewCount = sessions.length;
  const practiceCount = user?.stats?.practiceSessionsCompleted ?? 0;
  const totalScore = user?.stats?.totalScore ?? 0;
  const avgInterviewScore =
    interviewCount > 0
      ? Math.round(
          sessions.reduce((s, x) => s + (x.feedback?.overallScore || 0), 0) / interviewCount
        )
      : 0;

  return {
    summary: {
      practiceSessions: practiceCount,
      mockInterviews: interviewCount,
      resumeAnalyses: await ResumeAnalysis.countDocuments({ userId, status: 'completed' }),
      avgScore: avgInterviewScore,
      streak,
      longestStreak,
      totalScore,
      profileCompletion: calcProfileCompletion(user),
    },
    placementReadiness,
    topicAnalytics: {
      byDomain: topicAnalytics.byDomain,
      weakTopics: topicAnalytics.weakTopics,
      radar: topicAnalytics.radarData.map((d) => ({
        topic: d.label,
        score: d.mastery,
      })),
    },
    interviewPerformance: buildInterviewPerformance(sessions),
    difficultyBreakdown: buildDifficultyBreakdown(sessions),
    charts: {
      daily: dailyChart,
      weekly: weeklyChart,
      monthly: monthlyChart,
    },
    skillProgression: buildSkillProgression(sessions),
    activeDays: [...activeDays],
  };
};

/**
 * Compact payload for dashboard widgets
 */
const computeDashboardSnapshot = async (userId) => {
  const full = await computeUserAnalytics(userId);
  return {
    summary: full.summary,
    placementReadiness: full.placementReadiness,
    weakTopics: full.topicAnalytics.weakTopics,
    weeklyChart: full.charts.weekly,
    dailyChart: full.charts.daily,
    activeDays: full.activeDays,
    streak: full.summary.streak,
    longestStreak: full.summary.longestStreak,
  };
};

module.exports = {
  computeUserAnalytics,
  computeDashboardSnapshot,
  calcProfileCompletion,
};
