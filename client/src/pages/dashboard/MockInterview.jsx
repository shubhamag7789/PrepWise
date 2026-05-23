/**
 * MockInterview — Setup Page
 * Domain selection, difficulty, question count, and interview history.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import { createSession, listSessions, deleteSession } from '@api/interviewApi';

/* ── Domain Configuration ─────────────────────────────────────────────── */
const DOMAINS = [
  { id: 'DSA',    label: 'DSA',       desc: 'Data Structures & Algorithms',  icon: '🧩', color: 'from-violet-500 to-purple-600' },
  { id: 'DBMS',   label: 'DBMS',      desc: 'Database Management Systems',   icon: '🗄️', color: 'from-blue-500 to-cyan-600' },
  { id: 'OS',     label: 'OS',        desc: 'Operating Systems',             icon: '⚙️', color: 'from-orange-500 to-amber-600' },
  { id: 'CN',     label: 'CN',        desc: 'Computer Networks',             icon: '🌐', color: 'from-teal-500 to-emerald-600' },
  { id: 'WebDev', label: 'Web Dev',   desc: 'HTML, CSS, JS, React, Node',    icon: '💻', color: 'from-pink-500 to-rose-600' },
  { id: 'HR',     label: 'HR',        desc: 'Behavioral & Soft Skills',      icon: '🤝', color: 'from-yellow-500 to-orange-600' },
];

const DIFFICULTIES = [
  { id: 'Easy',   label: 'Easy',   color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-400' },
  { id: 'Medium', label: 'Medium', color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20',     border: 'border-amber-400' },
  { id: 'Hard',   label: 'Hard',   color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20',         border: 'border-red-400' },
];

const difficultyClass = { Easy: 'selected-easy', Medium: 'selected-medium', Hard: 'selected-hard' };

const domainLabel = { DSA: 'DSA', DBMS: 'DBMS', OS: 'OS', CN: 'CN', WebDev: 'Web Dev', HR: 'HR' };
const statusBadge = {
  active:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  abandoned: 'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400',
};

const formatDuration = (s) => {
  if (!s) return '—';
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}m ${sec}s`;
};
const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/* ═══════════════════════════════════════════════════════════════════════════ */

const MockInterview = () => {
  const navigate = useNavigate();

  // Setup form state
  const [domain, setDomain]         = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQ]       = useState(10);
  const [sessionName, setName]      = useState('');
  const [isStarting, setIsStarting] = useState(false);

  // History state
  const [sessions, setSessions]     = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  /* Fetch history */
  const loadHistory = useCallback(async () => {
    try {
      setHistLoading(true);
      const res = await listSessions({ limit: 10 });
      setSessions(res.data || []);
    } catch {
      // silently fail — history is non-critical
    } finally {
      setHistLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  /* Start new interview */
  const handleStart = async () => {
    if (!domain) { toast.error('Please select a domain first.'); return; }
    setIsStarting(true);
    try {
      const res = await createSession({
        domain,
        difficulty,
        totalQuestions: questionCount,
        sessionName: sessionName.trim() || `${domainLabel[domain]} ${difficulty} Interview`,
      });
      const sessionId = res.data.session._id;
      navigate(`/dashboard/interview/${sessionId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to start interview. Check your Gemini API key.');
    } finally {
      setIsStarting(false);
    }
  };

  /* Delete session */
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      toast.success('Session deleted');
    } catch {
      toast.error('Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };

  /* Navigate to session */
  const openSession = (s) => {
    if (s.status === 'completed') navigate(`/dashboard/interview/${s._id}/feedback`);
    else navigate(`/dashboard/interview/${s._id}`);
  };

  return (
    <DashboardLayout title="Mock Interviews" subtitle="Practice with your AI interviewer">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

        {/* ── Hero Banner ──────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden mesh-gradient p-8 text-white">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg animate-float">
              🎙️
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">AI-Powered Mock Interviews</h2>
              <p className="text-white/75 text-sm max-w-lg">
                Simulate real interview conditions with Gemini AI. Get instant feedback on your technical depth,
                communication clarity, and improvement areas.
              </p>
            </div>
          </div>
        </div>

        {/* ── Setup Card ───────────────────────────────────────────────── */}
        <div className="surface-card p-6 space-y-6">
          <h3 className="font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold">1</span>
            Configure Your Interview
          </h3>

          {/* Domain Selection */}
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-3 uppercase tracking-wide">Select Domain</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DOMAINS.map((d) => (
                <button
                  key={d.id}
                  id={`domain-${d.id}`}
                  onClick={() => setDomain(d.id)}
                  className={clsx('domain-card', domain === d.id && 'selected')}
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl bg-gradient-to-br',
                    d.color
                  )}>
                    {d.icon}
                  </div>
                  <p className="font-bold text-sm text-[var(--color-text)]">{d.label}</p>
                  <p className="text-xs text-[var(--color-text-faint)] mt-0.5 leading-tight">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty + Questions */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-3 uppercase tracking-wide">Difficulty</p>
              <div className="flex gap-2 flex-wrap">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    id={`difficulty-${d.id}`}
                    onClick={() => setDifficulty(d.id)}
                    className={clsx('diff-btn', difficulty === d.id && difficultyClass[d.id])}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-3 uppercase tracking-wide">
                Questions: <span className="text-[var(--color-brand)] font-bold">{questionCount}</span>
              </p>
              <input
                id="question-count-slider"
                type="range"
                min={3}
                max={20}
                value={questionCount}
                onChange={(e) => setQ(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-[var(--color-text-faint)] mt-1">
                <span>3 (quick)</span><span>10 (standard)</span><span>20 (thorough)</span>
              </div>
            </div>
          </div>

          {/* Session Name (optional) */}
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">
              Session Name <span className="normal-case font-normal">(optional)</span>
            </p>
            <input
              id="session-name-input"
              type="text"
              placeholder={`e.g., ${domain ? domainLabel[domain] : 'DSA'} ${difficulty} Practice`}
              value={sessionName}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="input-base"
            />
          </div>

          {/* Start Button */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              id="start-interview-btn"
              variant="primary"
              size="lg"
              onClick={handleStart}
              isLoading={isStarting}
              disabled={!domain}
              leftIcon={<span>🚀</span>}
            >
              {isStarting ? 'Preparing Interview...' : 'Start Interview'}
            </Button>
            {!domain && (
              <p className="text-sm text-[var(--color-text-faint)]">← Select a domain to begin</p>
            )}
          </div>
        </div>

        {/* ── History ──────────────────────────────────────────────────── */}
        <div className="surface-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold">2</span>
              Interview History
            </h3>
            <button
              onClick={loadHistory}
              className="text-xs text-[var(--color-brand)] hover:underline font-medium"
            >
              Refresh
            </button>
          </div>

          {histLoading ? (
            <div className="flex justify-center py-12"><Spinner size="md" /></div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-[var(--color-text-muted)] font-medium">No interviews yet</p>
              <p className="text-sm text-[var(--color-text-faint)] mt-1">Start your first session above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s._id}
                  id={`session-${s._id}`}
                  onClick={() => openSession(s)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-bg-elevated)] cursor-pointer transition-all group"
                >
                  {/* Domain icon */}
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br',
                    DOMAINS.find((d) => d.id === s.domain)?.color || 'from-gray-400 to-gray-600'
                  )}>
                    {DOMAINS.find((d) => d.id === s.domain)?.icon || '🎙️'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--color-text)] truncate">
                      {s.sessionName || `${s.domain} ${s.difficulty} Interview`}
                    </p>
                    <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
                      {formatDate(s.createdAt)} · {formatDuration(s.duration)}
                      {s.feedback?.overallScore != null && ` · Score: ${s.feedback.overallScore}/100`}
                    </p>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', statusBadge[s.status])}>
                      {s.status}
                    </span>
                    <button
                      id={`delete-session-${s._id}`}
                      onClick={(e) => handleDelete(s._id, e)}
                      disabled={deletingId === s._id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--color-text-faint)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      title="Delete session"
                    >
                      {deletingId === s._id
                        ? <span className="text-xs">...</span>
                        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                      }
                    </button>
                    <svg
                      className="w-4 h-4 text-[var(--color-text-faint)] group-hover:text-[var(--color-brand)] transition-colors"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MockInterview;
