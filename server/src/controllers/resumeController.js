/**
 * Resume Controller — ATS analysis upload, history, and retrieval.
 */
const ResumeAnalysis = require('../models/ResumeAnalysis');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { parsePdfBuffer } = require('../utils/pdfParser');
const { analyzeResume } = require('../utils/aiService');
const { recordActivity } = require('../services/activityService');

const normalizeAnalysis = (raw) => ({
  atsScore: Math.min(100, Math.max(0, Number(raw.atsScore) || 0)),
  keywordMatchScore: Math.min(100, Math.max(0, Number(raw.keywordMatchScore) || 0)),
  formatScore: Math.min(100, Math.max(0, Number(raw.formatScore) || 0)),
  actionVerbsScore: Math.min(100, Math.max(0, Number(raw.actionVerbsScore) || 0)),
  jobMatchScore:
    raw.jobMatchScore != null ? Math.min(100, Math.max(0, Number(raw.jobMatchScore))) : null,
  grade: raw.grade || 'N/A',
  summary: raw.summary || '',
  matchedKeywords: Array.isArray(raw.matchedKeywords) ? raw.matchedKeywords.slice(0, 30) : [],
  missingKeywords: Array.isArray(raw.missingKeywords) ? raw.missingKeywords.slice(0, 30) : [],
  presentSkills: Array.isArray(raw.presentSkills) ? raw.presentSkills.slice(0, 40) : [],
  missingSkills: Array.isArray(raw.missingSkills) ? raw.missingSkills.slice(0, 30) : [],
  strengths: Array.isArray(raw.strengths) ? raw.strengths.slice(0, 10) : [],
  improvements: Array.isArray(raw.improvements)
    ? raw.improvements.slice(0, 15).map((item) => ({
        category: item.category || 'General',
        suggestion: item.suggestion || '',
        priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
      }))
    : [],
  sectionsDetected: Array.isArray(raw.sectionsDetected) ? raw.sectionsDetected : [],
  jobMatch: raw.jobMatch
    ? {
        score: Math.min(100, Math.max(0, Number(raw.jobMatch.score) || 0)),
        matchedRequirements: raw.jobMatch.matchedRequirements || [],
        gaps: raw.jobMatch.gaps || [],
        summary: raw.jobMatch.summary || '',
      }
    : null,
});

/**
 * POST /api/v1/resumes/analyze
 * multipart: resume (PDF), optional jobDescription, jobTitle, targetRole
 */
const analyzeResumeUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(ApiError.badRequest('Resume PDF is required (field name: resume).'));
    }

    const jobDescription = (req.body.jobDescription || '').trim();
    const jobTitle = (req.body.jobTitle || '').trim();
    const targetRole = (req.body.targetRole || 'Software Engineer').trim();

    const { text, wordCount } = await parsePdfBuffer(req.file.buffer);

    const record = await ResumeAnalysis.create({
      userId: req.user._id,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      targetRole,
      jobTitle,
      jobDescription,
      parsedTextPreview: text.slice(0, 2000),
      wordCount,
      status: 'processing',
    });

    try {
      const rawAnalysis = await analyzeResume(text, {
        jobDescription,
        targetRole,
        jobTitle,
      });

      record.analysis = normalizeAnalysis(rawAnalysis);
      record.status = 'completed';

      if (jobDescription && record.analysis.jobMatch) {
        record.analysis.jobMatchScore = record.analysis.jobMatch.score;
      }

      await record.save();

      await recordActivity(req.user._id, 'resume', {
        score: record.analysis.atsScore || 0,
        minutes: 5,
      });

      return ApiResponse.created(
        res,
        { analysis: record },
        'Resume analyzed successfully'
      );
    } catch (aiErr) {
      record.status = 'failed';
      record.errorMessage = aiErr.message || 'AI analysis failed';
      await record.save();
      return next(
        ApiError.internal(
          aiErr.message?.includes('GEMINI')
            ? 'AI service unavailable. Check GEMINI_API_KEY in server/.env'
            : 'Resume analysis failed. Please try again.'
        )
      );
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/resumes
 */
const listAnalyses = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id, status: 'completed' };

    const [analyses, total] = await Promise.all([
      ResumeAnalysis.find(filter)
        .select('-parsedTextPreview')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ResumeAnalysis.countDocuments(filter),
    ]);

    return ApiResponse.paginated(
      res,
      analyses,
      { page, limit, total, totalPages: Math.ceil(total / limit) },
      'Resume analyses fetched'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/resumes/latest
 */
const getLatestAnalysis = async (req, res, next) => {
  try {
    const latest = await ResumeAnalysis.findOne({
      userId: req.user._id,
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .lean();

    return ApiResponse.ok(res, { analysis: latest }, latest ? 'Latest analysis' : 'No analyses yet');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/resumes/:id
 */
const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!analysis) {
      return next(ApiError.notFound('Resume analysis not found.'));
    }

    return ApiResponse.ok(res, { analysis });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/resumes/:id
 */
const deleteAnalysis = async (req, res, next) => {
  try {
    const deleted = await ResumeAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return next(ApiError.notFound('Resume analysis not found.'));
    }

    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeResumeUpload,
  listAnalyses,
  getLatestAnalysis,
  getAnalysis,
  deleteAnalysis,
};
