/**
 * AI Service — Gemini API Integration
 * Handles question generation, follow-up generation, and interview feedback.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

/* ── Gemini client (lazily initialized so server still boots without key) ── */
let genAI = null;
const getClient = () => {
  if (!genAI) {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY is not configured. Add it to server/.env');
    }
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAI;
};

const getModel = () =>
  getClient().getGenerativeModel({ model: env.GEMINI_MODEL });

/* ── Domain labels ───────────────────────────────────────────────────────── */
const DOMAIN_LABELS = {
  DSA: 'Data Structures & Algorithms',
  DBMS: 'Database Management Systems',
  OS: 'Operating Systems',
  CN: 'Computer Networks',
  WebDev: 'Web Development (HTML, CSS, JS, React, Node.js)',
  HR: 'HR / Behavioral',
};

/* ── Helper: sleep ───────────────────────────────────────────────────────── */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ── Helper: call Gemini with auto-retry on 429 ─────────────────────────── */
const callGemini = async (prompt, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = getModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      const is429 = err?.message?.includes('429') || err?.status === 429;
      if (is429 && attempt < retries) {
        const waitMs = attempt * 8000; // 8s, 16s, 24s
        console.warn(`⚠️  Gemini rate limit hit. Retrying in ${waitMs / 1000}s... (attempt ${attempt}/${retries})`);
        await sleep(waitMs);
        continue;
      }
      throw err;
    }
  }
};

/* ── Helper: parse JSON safely from AI output ────────────────────────────── */
const parseJSON = (raw) => {
  if (!raw || typeof raw !== 'string') {
    throw new Error('AI returned an empty response. Please try again.');
  }
  // Strip markdown code fences if present
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  // Extract first JSON object if model added extra text
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) cleaned = objectMatch[0];
  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON structure from AI');
    }
    return parsed;
  } catch {
    throw new Error('AI returned invalid JSON. Please try generating again.');
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * generateFirstQuestion — returns the opening interview question.
 */
const generateFirstQuestion = async (domain, difficulty) => {
  const domainLabel = DOMAIN_LABELS[domain] || domain;
  const prompt = `You are a senior ${domainLabel} interviewer at a top tech company.
Start a ${difficulty} level technical interview.
Ask ONE clear, concise opening question appropriate for a ${difficulty} level candidate.
${domain === 'HR' ? 'This is a behavioral/HR round — ask a classic HR question like "Tell me about yourself" or "Why do you want to join us?".' : ''}
Do NOT number the question. Do NOT add any preamble like "Sure" or "Of course". 
Output ONLY the question text, nothing else.`;

  return callGemini(prompt);
};

/**
 * generateFollowUp — given conversation history, generates the next question.
 * Returns either a follow-up on the last answer or a fresh topic question.
 */
const generateFollowUp = async (messages, domain, difficulty, questionIndex, totalQuestions) => {
  const domainLabel = DOMAIN_LABELS[domain] || domain;

  // Build conversation context
  const history = messages
    .map((m) => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n\n');

  const isLastQuestion = questionIndex >= totalQuestions - 1;

  const prompt = `You are a senior ${domainLabel} interviewer conducting a ${difficulty} difficulty mock interview.

Conversation so far:
${history}

${isLastQuestion
    ? `This is the LAST question (question ${questionIndex + 1} of ${totalQuestions}). Ask a closing question that wraps up the interview well.`
    : `Ask question ${questionIndex + 1} of ${totalQuestions}. ${questionIndex <= 1
      ? 'Ask a follow-up probing deeper into the candidate\'s last answer, OR transition to a related sub-topic.'
      : 'You may ask a fresh related topic or probe the previous answer depending on the conversation flow.'
    }`
  }

Rules:
- Be a realistic interviewer — concise, professional, focused.
- Do NOT repeat questions already asked.
- Do NOT number the question.
- Do NOT add preamble. Output ONLY the question text.`;

  return callGemini(prompt);
};

/**
 * generateFeedback — analyzes the full interview and returns structured feedback JSON.
 */
const generateFeedback = async (messages, domain, difficulty) => {
  const domainLabel = DOMAIN_LABELS[domain] || domain;

  const transcript = messages
    .map((m) => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n\n');

  const prompt = `You are a senior ${domainLabel} interviewer evaluating a mock interview transcript.

Interview Details:
- Domain: ${domainLabel}
- Difficulty: ${difficulty}

Transcript:
${transcript}

Provide a thorough evaluation. Return ONLY a valid JSON object (no markdown fences) with this exact structure:
{
  "technicalScore": <integer 0-100>,
  "communicationScore": <integer 0-100>,
  "overallScore": <integer 0-100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weakAreas": ["<weak area 1>", "<weak area 2>", "<weak area 3>"],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", "<actionable suggestion 3>"],
  "topicsToReview": ["<topic 1>", "<topic 2>", "<topic 3>"],
  "summary": "<2-3 sentence overall summary of the candidate's performance>"
}

Scoring criteria:
- technicalScore: accuracy, depth, and correctness of technical answers
- communicationScore: clarity, structure, and articulation of responses
- overallScore: weighted average (60% technical, 40% communication)
- Be honest but constructive. If the candidate gave no answers, score them 0.`;

  const raw = await callGemini(prompt);
  return parseJSON(raw);
};

/**
 * analyzeResume — ATS scoring, keywords, skills, JD match, suggestions.
 */
const analyzeResume = async (resumeText, options = {}) => {
  const { jobDescription = '', targetRole = '', jobTitle = '' } = options;
  const hasJD = Boolean(jobDescription?.trim());

  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyst and career coach for tech placements in India.

TARGET ROLE: ${targetRole || 'Software Engineer / Tech role'}
${jobTitle ? `JOB TITLE: ${jobTitle}` : ''}
${hasJD ? `\nJOB DESCRIPTION TO MATCH AGAINST:\n${jobDescription.slice(0, 6000)}\n` : '\nNo job description provided — analyze for general ATS optimization and the target role.\n'}

RESUME TEXT:
${resumeText}

Analyze this resume thoroughly. Return ONLY valid JSON (no markdown fences) with this exact structure:
{
  "atsScore": <integer 0-100, overall ATS readiness>,
  "keywordMatchScore": <integer 0-100, industry/role keyword coverage>,
  "formatScore": <integer 0-100, structure, sections, readability for ATS>,
  "actionVerbsScore": <integer 0-100, use of strong action verbs and quantified impact>,
  "jobMatchScore": <integer 0-100 or null if no JD — how well resume matches the job description>,
  "grade": "<letter grade A+, A, B+, B, C, D>",
  "summary": "<2-3 sentence executive summary of resume ATS health>",
  "matchedKeywords": ["<keyword found in resume>", ...],
  "missingKeywords": ["<important keyword missing for role/JD>", ...],
  "presentSkills": ["<skill evident in resume>", ...],
  "missingSkills": ["<skill gap for role/JD>", ...],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": [
    { "category": "<e.g. Format|Keywords|Experience|Skills>", "suggestion": "<actionable fix>", "priority": "high|medium|low" }
  ],
  "sectionsDetected": ["<section name e.g. Education>", ...],
  "jobMatch": ${hasJD ? `{
    "score": <integer 0-100>,
    "matchedRequirements": ["<requirement met>", ...],
    "gaps": ["<requirement gap>", ...],
    "summary": "<1-2 sentences on JD fit>"
  }` : 'null'}
}

Scoring rules:
- Be realistic and constructive; typical student resumes score 45-75.
- missingKeywords/missingSkills: 5-12 items each, specific to role${hasJD ? ' and JD' : ''}.
- improvements: 6-10 actionable items with varied priorities.
- If resume is weak, scores should reflect that honestly.`;

  const raw = await callGemini(prompt);
  return parseJSON(raw);
};

/**
 * generatePrepRoadmap — personalized study plan from analytics snapshot
 */
const generatePrepRoadmap = async (analyticsSummary) => {
  const prompt = `You are a placement preparation coach for Indian tech campus hiring.

Student analytics snapshot:
${JSON.stringify(analyticsSummary, null, 2)}

Create a personalized 4-week preparation roadmap. Return ONLY valid JSON (no markdown fences):
{
  "summary": "<2 sentences on current readiness and priority>",
  "focusAreas": ["<area 1>", "<area 2>", "<area 3>"],
  "studySuggestions": ["<specific daily/weekly study action>", ... 6-8 items],
  "adaptiveRecommendations": ["<what to do next based on weak topics>", ... 4-6 items],
  "roadmap": [
    {
      "title": "Week 1: <theme>",
      "duration": "7 days",
      "focus": ["<focus 1>", "<focus 2>"],
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    }
  ]
}

Rules:
- Prioritize weakest topics and domains from the data.
- Be specific (e.g. "Solve 15 medium array problems" not "practice more").
- If little data exists, assume CS student targeting SDE roles.
- roadmap must have exactly 4 phases (weeks).`;

  const raw = await callGemini(prompt);
  return parseJSON(raw);
};

module.exports = {
  generateFirstQuestion,
  generateFollowUp,
  generateFeedback,
  analyzeResume,
  generatePrepRoadmap,
  parseJSON,
};
