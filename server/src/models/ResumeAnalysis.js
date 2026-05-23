/**
 * ResumeAnalysis Mongoose Model
 * Stores ATS analysis results and parsed resume metadata per user.
 */
const mongoose = require('mongoose');

const improvementSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    suggestion: { type: String, required: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  },
  { _id: false }
);

const jobMatchSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0, max: 100, default: 0 },
    matchedRequirements: [{ type: String }],
    gaps: [{ type: String }],
    summary: { type: String, default: '' },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    atsScore: { type: Number, min: 0, max: 100, default: 0 },
    keywordMatchScore: { type: Number, min: 0, max: 100, default: 0 },
    formatScore: { type: Number, min: 0, max: 100, default: 0 },
    actionVerbsScore: { type: Number, min: 0, max: 100, default: 0 },
    jobMatchScore: { type: Number, min: 0, max: 100, default: null },
    grade: { type: String, default: 'N/A' },
    summary: { type: String, default: '' },
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    presentSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    strengths: [{ type: String }],
    improvements: [improvementSchema],
    sectionsDetected: [{ type: String }],
    jobMatch: { type: jobMatchSchema, default: null },
  },
  { _id: false }
);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFileName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    targetRole: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    parsedTextPreview: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    wordCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    errorMessage: { type: String, default: '' },
    analysis: { type: analysisSchema, default: null },
  },
  { timestamps: true }
);

resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

resumeAnalysisSchema.virtual('hasJobMatch').get(function () {
  return Boolean(this.jobDescription?.trim());
});

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
module.exports = ResumeAnalysis;
