/**
 * InterviewFeedback — AI-generated feedback report
 * Technical score, communication score, strengths, weak areas, suggestions.
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import { getSession } from '@api/interviewApi';

/* ── Helpers ─────────────────────────────────────────────────────────── */
const DOMAIN_ICONS  = { DSA: '🧩', DBMS: '🗄️', OS: '⚙️', CN: '🌐', WebDev: '💻', HR: '🤝' };
const DOMAIN_COLORS = {
  DSA:    'from-violet-500 to-purple-600',
  DBMS:   'from-blue-500 to-cyan-600',
  OS:     'from-orange-500 to-amber-600',
  CN:     'from-teal-500 to-emerald-600',
  WebDev: 'from-pink-500 to-rose-600',
  HR:     'from-yellow-500 to-orange-600',
};
const DIFF_COLORS = {
  Easy:   'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  Medium: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  Hard:   'text-red-500 bg-red-50 dark:bg-red-900/20',
};

const scoreColor = (s) => {
  if (s >= 80) return { stroke: '#10b981', text: 'text-emerald-500', label: 'Excellent' };
  if (s >= 60) return { stroke: '#6366f1', text: 'text-indigo-500',  label: 'Good' };
  if (s >= 40) return { stroke: '#f59e0b', text: 'text-amber-500',   label: 'Fair' };
  return        { stroke: '#ef4444', text: 'text-red-500',    label: 'Needs Work' };
};

const formatDuration = (s) => {
  if (!s) return '—';
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}m ${sec}s`;
};

/* ── Score Ring (SVG) ─────────────────────────────────────────────────── */
const ScoreRing = ({ score, size = 120, label }) => {
  const r      = (size / 2) - 10;
  const circ   = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const { stroke, text, label: grade } = scoreColor(score);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!ringRef.current) return;
    ringRef.current.style.strokeDasharray = `0 ${circ}`;
    const t = setTimeout(() => {
      if (ringRef.current)
        ringRef.current.style.strokeDasharray = `${filled} ${circ}`;
    }, 300);
    return () => clearTimeout(t);
  }, [filled, circ]);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={8} />
        <circle
          ref={ringRef}
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`0 ${circ}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition: 'stroke-dasharray 1.2s ease-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="font-bold" fill="currentColor" fontSize={size * 0.22} fontWeight="bold">
          {score}
        </text>
      </svg>
      <span className={clsx('text-xs font-bold', text)}>{grade}</span>
      {label && <span className="text-xs text-[var(--color-text-faint)]">{label}</span>}
    </div>
  );
};

/* ── Badge list ────────────────────────────────────────────────────────── */
const BadgeList = ({ items, variant }) => {
  const styles = {
    green:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    red:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <div className="flex flex-wrap gap-2">
      {(items || []).map((item, i) => (
        <span key={i} className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold', styles[variant])}>
          {item}
        </span>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════ */

const InterviewFeedback = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(sessionId);
        const s = res.data.session;
        if (s.status !== 'completed') {
          navigate(`/dashboard/interview/${sessionId}`, { replace: true });
          return;
        }
        setSession(s);
      } catch {
        toast.error('Could not load feedback');
        navigate('/dashboard/mock-interview');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <DashboardLayout title="Loading Feedback...">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Spinner size="lg" />
          <p className="text-[var(--color-text-muted)] text-sm animate-pulse">Analyzing your performance…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) return null;

  const fb = session.feedback || {};
  const overallScore = fb.overallScore ?? 0;
  const techScore    = fb.technicalScore ?? 0;
  const commScore    = fb.communicationScore ?? 0;
  const { text: overallColor, label: overallGrade } = scoreColor(overallScore);

  const domainColor  = DOMAIN_COLORS[session.domain] || 'from-gray-400 to-gray-600';
  const domainIcon   = DOMAIN_ICONS[session.domain]  || '🎙️';
  const questionsAnswered = session.messages.filter((m) => m.role === 'user').length;

  return (
    <DashboardLayout title="Interview Feedback" subtitle="AI-generated performance report">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

        {/* ── Result Hero ──────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden mesh-gradient p-6 sm:p-8 text-white">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {/* Domain + meta */}
            <div className="flex items-center gap-4 flex-1">
              <div className={clsx('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shadow-lg', domainColor)}>
                {domainIcon}
              </div>
              <div>
                <h2 className="font-bold text-xl">{session.sessionName || `${session.domain} Interview`}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20', '')}>
                    {session.difficulty}
                  </span>
                  <span className="text-white/60 text-xs">·</span>
                  <span className="text-white/75 text-xs">{questionsAnswered} answers given</span>
                  <span className="text-white/60 text-xs">·</span>
                  <span className="text-white/75 text-xs">{formatDuration(session.duration)}</span>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-xs text-white/70 font-semibold uppercase tracking-wide mb-2">Overall Score</p>
              <p className={clsx('text-5xl font-black', overallScore >= 60 ? 'text-white' : 'text-red-300')}>
                {overallScore}
              </p>
              <p className="text-white/70 text-xs mt-1 font-medium">/ 100 · {overallGrade}</p>
            </div>
          </div>
        </div>

        {/* ── Score Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Overall */}
          <div className="surface-card p-5 flex flex-col items-center gap-2">
            <ScoreRing score={overallScore} size={110} label="Overall" />
          </div>
          {/* Technical */}
          <div className="surface-card p-5 flex flex-col items-center gap-2">
            <ScoreRing score={techScore} size={110} label="Technical" />
          </div>
          {/* Communication */}
          <div className="surface-card p-5 flex flex-col items-center gap-2">
            <ScoreRing score={commScore} size={110} label="Communication" />
          </div>
        </div>

        {/* ── Summary ──────────────────────────────────────────────────── */}
        {fb.summary && (
          <div className="surface-card p-6">
            <h3 className="font-bold text-base text-[var(--color-text)] mb-3 flex items-center gap-2">
              <span>💬</span> AI Summary
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{fb.summary}</p>
          </div>
        )}

        {/* ── Strengths + Weak Areas ────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="surface-card p-6">
            <h3 className="font-bold text-base text-[var(--color-text)] mb-4 flex items-center gap-2">
              <span>✅</span> Strengths
            </h3>
            {fb.strengths?.length ? (
              <BadgeList items={fb.strengths} variant="green" />
            ) : (
              <p className="text-sm text-[var(--color-text-faint)]">No specific strengths noted.</p>
            )}
          </div>
          <div className="surface-card p-6">
            <h3 className="font-bold text-base text-[var(--color-text)] mb-4 flex items-center gap-2">
              <span>⚠️</span> Weak Areas
            </h3>
            {fb.weakAreas?.length ? (
              <BadgeList items={fb.weakAreas} variant="amber" />
            ) : (
              <p className="text-sm text-[var(--color-text-faint)]">No specific weak areas noted.</p>
            )}
          </div>
        </div>

        {/* ── Topics to Review ─────────────────────────────────────────── */}
        {fb.topicsToReview?.length > 0 && (
          <div className="surface-card p-6">
            <h3 className="font-bold text-base text-[var(--color-text)] mb-4 flex items-center gap-2">
              <span>📚</span> Topics to Review
            </h3>
            <BadgeList items={fb.topicsToReview} variant="indigo" />
          </div>
        )}

        {/* ── Improvement Suggestions ───────────────────────────────────── */}
        {fb.suggestions?.length > 0 && (
          <div className="surface-card p-6">
            <h3 className="font-bold text-base text-[var(--color-text)] mb-4 flex items-center gap-2">
              <span>🎯</span> Improvement Suggestions
            </h3>
            <ul className="space-y-3">
              {fb.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{s}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Interview Transcript ─────────────────────────────────────── */}
        <div className="surface-card overflow-hidden">
          <button
            id="toggle-transcript-btn"
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <span>📝</span> Full Interview Transcript
            </h3>
            <svg
              className={clsx('w-5 h-5 text-[var(--color-text-muted)] transition-transform', showTranscript && 'rotate-180')}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTranscript && (
            <div className="px-6 pb-6 space-y-4 border-t border-[var(--color-border)] pt-4 max-h-96 overflow-y-auto">
              {session.messages.map((msg, i) => (
                <div key={i} className={clsx('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                  <div className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0',
                    msg.role === 'ai' ? 'gradient-brand text-white' : 'bg-indigo-500 text-white'
                  )}>
                    {msg.role === 'ai' ? '🤖' : '🧑'}
                  </div>
                  <div className={clsx(
                    'rounded-xl px-3 py-2 max-w-[75%] text-sm',
                    msg.role === 'ai'
                      ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text)]'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  )}>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CTAs ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <Button
            id="new-interview-btn"
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard/mock-interview')}
            leftIcon={<span>🚀</span>}
          >
            Start New Interview
          </Button>
          <Button
            id="back-to-dashboard-btn"
            variant="outline"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default InterviewFeedback;
