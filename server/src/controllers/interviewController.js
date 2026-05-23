/**
 * Interview Controller
 * Handles CRUD for interview sessions and AI message exchange.
 */
const InterviewSession = require('../models/InterviewSession');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const aiService = require('../utils/aiService');
const User = require('../models/User');
const { recordActivity } = require('../services/activityService');

/* ═══════════════════════════════════════════════════════════════════════════
   CREATE SESSION
   POST /api/v1/interviews/sessions
   ═══════════════════════════════════════════════════════════════════════════ */
const createSession = async (req, res, next) => {
  try {
    const { domain, difficulty, totalQuestions = 10, sessionName } = req.body;

    if (!domain || !difficulty) {
      return next(ApiError.badRequest('Domain and difficulty are required.'));
    }

    // Generate the opening AI question
    const firstQuestion = await aiService.generateFirstQuestion(domain, difficulty);

    const session = await InterviewSession.create({
      userId: req.user._id,
      domain,
      difficulty,
      totalQuestions: Math.min(Math.max(parseInt(totalQuestions, 10) || 10, 3), 20),
      sessionName: sessionName || `${domain} ${difficulty} Interview`,
      messages: [
        {
          role: 'ai',
          content: firstQuestion,
          questionIndex: 0,
        },
      ],
      status: 'active',
      startedAt: new Date(),
    });

    // Increment user's mock interview count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.mockInterviewsCompleted': 0 }, // stays 0 until completed
    });

    return ApiResponse.created(res, { session }, 'Interview session started');
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   LIST SESSIONS (history)
   GET /api/v1/interviews/sessions
   ═══════════════════════════════════════════════════════════════════════════ */
const listSessions = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.domain) filter.domain = req.query.domain;

    const [sessions, total] = await Promise.all([
      InterviewSession.find(filter)
        .select('-messages') // omit full messages for list view
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InterviewSession.countDocuments(filter),
    ]);

    return ApiResponse.paginated(
      res,
      sessions,
      { page, limit, total, totalPages: Math.ceil(total / limit) },
      'Sessions fetched'
    );
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   GET SESSION DETAIL
   GET /api/v1/interviews/sessions/:id
   ═══════════════════════════════════════════════════════════════════════════ */
const getSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return next(ApiError.notFound('Interview session not found.'));
    }

    return ApiResponse.ok(res, { session });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   SEND MESSAGE + GET AI RESPONSE
   POST /api/v1/interviews/sessions/:id/message
   Body: { content: string }
   ═══════════════════════════════════════════════════════════════════════════ */
const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return next(ApiError.badRequest('Message content is required.'));
    }

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) return next(ApiError.notFound('Session not found.'));
    if (session.status !== 'active') {
      return next(ApiError.badRequest('This interview session has already ended.'));
    }

    // Count how many questions have been asked so far
    const aiMessages = session.messages.filter((m) => m.role === 'ai');
    const questionIndex = aiMessages.length; // next question will be at this index

    // Append user message
    session.messages.push({
      role: 'user',
      content: content.trim(),
      questionIndex: questionIndex - 1,
    });

    let aiReply = null;
    let isComplete = false;

    // Check if we've reached total questions
    if (questionIndex >= session.totalQuestions) {
      // Interview is done — tell the user
      aiReply = `Thank you for completing the interview! I've reviewed all your answers. Click "End Interview" to see your detailed feedback and scores.`;
      isComplete = true;
    } else {
      // Generate next question
      aiReply = await aiService.generateFollowUp(
        session.messages,
        session.domain,
        session.difficulty,
        questionIndex,
        session.totalQuestions
      );
    }

    // Append AI message
    session.messages.push({
      role: 'ai',
      content: aiReply,
      questionIndex: isComplete ? null : questionIndex,
    });

    await session.save();

    return ApiResponse.ok(res, {
      userMessage: session.messages[session.messages.length - 2],
      aiMessage: session.messages[session.messages.length - 1],
      isComplete,
      questionsAnswered: questionIndex,
      totalQuestions: session.totalQuestions,
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   END SESSION + GENERATE FEEDBACK
   POST /api/v1/interviews/sessions/:id/end
   Body: { duration: number (seconds) }
   ═══════════════════════════════════════════════════════════════════════════ */
const endSession = async (req, res, next) => {
  try {
    const { duration = 0 } = req.body;

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) return next(ApiError.notFound('Session not found.'));
    if (session.status === 'completed') {
      return ApiResponse.ok(res, { session }, 'Session already completed');
    }

    // Generate AI feedback
    const feedbackData = await aiService.generateFeedback(
      session.messages,
      session.domain,
      session.difficulty
    );

    session.status = 'completed';
    session.duration = Math.round(duration);
    session.completedAt = new Date();
    session.feedback = feedbackData;

    await session.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'stats.mockInterviewsCompleted': 1,
        'stats.totalScore': feedbackData.overallScore || 0,
      },
    });

    await recordActivity(req.user._id, 'interview', {
      score: feedbackData.overallScore || 0,
      minutes: Math.round(duration / 60) || 15,
    });

    return ApiResponse.ok(res, { session, feedback: feedbackData }, 'Interview completed!');
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   DELETE SESSION
   DELETE /api/v1/interviews/sessions/:id
   ═══════════════════════════════════════════════════════════════════════════ */
const deleteSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) return next(ApiError.notFound('Session not found.'));

    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSession,
  listSessions,
  getSession,
  sendMessage,
  endSession,
  deleteSession,
};
