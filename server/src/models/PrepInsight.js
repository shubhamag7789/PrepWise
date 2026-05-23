/**
 * PrepInsight — cached AI roadmap & study suggestions per user
 */
const mongoose = require('mongoose');

const roadmapPhaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: String, default: '' },
    focus: [{ type: String }],
    tasks: [{ type: String }],
  },
  { _id: false }
);

const prepInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    roadmap: [roadmapPhaseSchema],
    studySuggestions: [{ type: String }],
    adaptiveRecommendations: [{ type: String }],
    focusAreas: [{ type: String }],
    summary: { type: String, default: '' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PrepInsight = mongoose.model('PrepInsight', prepInsightSchema);
module.exports = PrepInsight;
