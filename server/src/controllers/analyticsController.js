/**
 * Analytics Controller — prep analytics & AI roadmap
 */
const PrepInsight = require('../models/PrepInsight');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const {
  computeUserAnalytics,
  computeDashboardSnapshot,
} = require('../services/analyticsService');
const { generatePrepRoadmap } = require('../utils/aiService');

/**
 * GET /api/v1/analytics/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const data = await computeDashboardSnapshot(req.user._id);
    return ApiResponse.ok(res, data, 'Dashboard analytics fetched');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await computeUserAnalytics(req.user._id);

    const insight = await PrepInsight.findOne({ userId: req.user._id }).lean();

    return ApiResponse.ok(
      res,
      {
        analytics,
        insight: insight
          ? {
              roadmap: insight.roadmap,
              studySuggestions: insight.studySuggestions,
              adaptiveRecommendations: insight.adaptiveRecommendations,
              focusAreas: insight.focusAreas,
              summary: insight.summary,
              generatedAt: insight.generatedAt,
            }
          : null,
      },
      'Analytics fetched'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/analytics/roadmap/generate
 */
const generateRoadmap = async (req, res, next) => {
  try {
    const analytics = await computeUserAnalytics(req.user._id);

    const summaryForAI = {
      placementScore: analytics.placementReadiness.overall,
      weakTopics: analytics.topicAnalytics.weakTopics,
      domainScores: analytics.topicAnalytics.byDomain,
      streak: analytics.summary.streak,
      interviews: analytics.summary.mockInterviews,
      avgScore: analytics.summary.avgScore,
      skills: req.user.skills,
      targetCompanies: req.user.targetCompanies,
      college: req.user.college,
    };

    const raw = await generatePrepRoadmap(summaryForAI);

    const insight = await PrepInsight.findOneAndUpdate(
      { userId: req.user._id },
      {
        roadmap: raw.roadmap || [],
        studySuggestions: raw.studySuggestions || [],
        adaptiveRecommendations: raw.adaptiveRecommendations || [],
        focusAreas: raw.focusAreas || [],
        summary: raw.summary || '',
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return ApiResponse.ok(
      res,
      {
        insight: {
          roadmap: insight.roadmap,
          studySuggestions: insight.studySuggestions,
          adaptiveRecommendations: insight.adaptiveRecommendations,
          focusAreas: insight.focusAreas,
          summary: insight.summary,
          generatedAt: insight.generatedAt,
        },
      },
      'Personalized roadmap generated'
    );
  } catch (err) {
    if (err.message?.includes('GEMINI')) {
      return next(ApiError.internal('AI service unavailable. Check GEMINI_API_KEY.'));
    }
    if (err.message?.includes('JSON') || err.message?.includes('AI returned')) {
      return next(ApiError.internal(err.message));
    }
    next(err);
  }
};

/**
 * GET /api/v1/analytics/roadmap
 */
const getRoadmap = async (req, res, next) => {
  try {
    const insight = await PrepInsight.findOne({ userId: req.user._id }).lean();
    return ApiResponse.ok(res, { insight: insight || null });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getAnalytics,
  generateRoadmap,
  getRoadmap,
};
