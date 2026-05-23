/**
 * DailyActivity — per-user daily prep activity for streaks & charts
 */
const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'],
    },
    interviews: { type: Number, default: 0 },
    resumeAnalyses: { type: Number, default: 0 },
    practiceSessions: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    scoreSum: { type: Number, default: 0 },
    scoreCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

dailyActivitySchema.virtual('avgScore').get(function () {
  return this.scoreCount > 0 ? Math.round(this.scoreSum / this.scoreCount) : 0;
});

const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);
module.exports = DailyActivity;
