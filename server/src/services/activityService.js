/**
 * Activity Service — log daily prep & maintain streak
 */
const User = require('../models/User');
const DailyActivity = require('../models/DailyActivity');

const toDateKey = (d = new Date()) => d.toISOString().split('T')[0];

const getYesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
};

/**
 * Record activity for today and update user streak.
 * @param {ObjectId} userId
 * @param {'interview'|'resume'|'practice'} type
 * @param {{ score?: number, minutes?: number }} meta
 */
const recordActivity = async (userId, type, meta = {}) => {
  const today = toDateKey();
  const inc = {
    interviews: type === 'interview' ? 1 : 0,
    resumeAnalyses: type === 'resume' ? 1 : 0,
    practiceSessions: type === 'practice' ? 1 : 0,
    totalMinutes: meta.minutes || 0,
    scoreSum: meta.score != null ? meta.score : 0,
    scoreCount: meta.score != null ? 1 : 0,
  };

  await DailyActivity.findOneAndUpdate(
    { userId, date: today },
    {
      $inc: {
        interviews: inc.interviews,
        resumeAnalyses: inc.resumeAnalyses,
        practiceSessions: inc.practiceSessions,
        totalMinutes: inc.totalMinutes,
        scoreSum: inc.scoreSum,
        scoreCount: inc.scoreCount,
      },
      $setOnInsert: { userId, date: today },
    },
    { upsert: true, new: true }
  );

  await updateStreak(userId, today);
};

const updateStreak = async (userId, today = toDateKey()) => {
  const user = await User.findById(userId);
  if (!user) return;

  const lastActive = user.stats?.lastActiveDate || '';
  let streak = user.stats?.streak || 0;
  const yesterday = getYesterdayKey();

  if (lastActive === today) {
    return;
  }

  if (lastActive === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  const longestStreak = Math.max(user.stats?.longestStreak || 0, streak);

  user.stats.streak = streak;
  user.stats.longestStreak = longestStreak;
  user.stats.lastActiveDate = today;
  await user.save({ validateBeforeSave: false });
};

module.exports = { recordActivity, updateStreak, toDateKey };
