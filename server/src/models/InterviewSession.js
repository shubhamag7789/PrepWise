/**
 * InterviewSession Mongoose Model
 * Stores AI mock interview sessions: setup config, chat messages, and AI feedback.
 */
const mongoose = require('mongoose');

/* ── Sub-schemas ─────────────────────────────────────────────────────────── */

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['ai', 'user'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [8000, 'Message too long'],
    },
    questionIndex: {
      type: Number,
      default: null,
    },
  },
  { _id: true, timestamps: true }
);

const feedbackSchema = new mongoose.Schema(
  {
    technicalScore: { type: Number, min: 0, max: 100, default: 0 },
    communicationScore: { type: Number, min: 0, max: 100, default: 0 },
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    strengths: [{ type: String }],
    weakAreas: [{ type: String }],
    suggestions: [{ type: String }],
    summary: { type: String, default: '' },
    topicsToReview: [{ type: String }],
  },
  { _id: false }
);

/* ── Main Schema ─────────────────────────────────────────────────────────── */

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionName: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Session name too long'],
    },
    domain: {
      type: String,
      enum: ['DSA', 'DBMS', 'OS', 'CN', 'WebDev', 'HR'],
      required: [true, 'Domain is required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty is required'],
    },
    totalQuestions: {
      type: Number,
      min: 3,
      max: 20,
      default: 10,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    messages: [messageSchema],
    feedback: {
      type: feedbackSchema,
      default: null,
    },
    duration: {
      type: Number, // seconds
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── Indexes ─────────────────────────────────────────────────────────────── */
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ userId: 1, status: 1 });

/* ── Virtuals ────────────────────────────────────────────────────────────── */
interviewSessionSchema.virtual('questionCount').get(function () {
  return this.messages.filter((m) => m.role === 'ai').length;
});

interviewSessionSchema.virtual('answerCount').get(function () {
  return this.messages.filter((m) => m.role === 'user').length;
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
module.exports = InterviewSession;
