/**
 * InterviewSession — Live Chat Interface
 * Real-time AI interview with timer, progress, and chat bubbles.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import { getSession, sendMessage, endSession } from '@api/interviewApi';

/* ── Domain display helpers ───────────────────────────────────────────── */
const DOMAIN_ICONS = { DSA: '🧩', DBMS: '🗄️', OS: '⚙️', CN: '🌐', WebDev: '💻', HR: '🤝' };
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

/* ── Timer hook ────────────────────────────────────────────────────────── */
const useTimer = (running) => {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (running) ref.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  const format = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };
  return { seconds, display: format(seconds) };
};

/* ── Typing indicator ─────────────────────────────────────────────────── */
const TypingIndicator = () => (
  <div className="flex items-start gap-3 animate-fade-in">
    <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-lg shrink-0 shadow-md">
      🤖
    </div>
    <div className="chat-bubble-ai flex items-center gap-1.5 py-3">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════ */

const InterviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [ending, setEnding]         = useState(false);
  const [isTyping, setIsTyping]     = useState(false);
  const [input, setInput]           = useState('');
  const [showEndModal, setShowEnd]  = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const { seconds, display: timerDisplay } = useTimer(!!session && session.status === 'active');

  /* Scroll to bottom */
  const scrollBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /* Load session */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(sessionId);
        const s = res.data.session;
        setSession(s);
        if (s.status === 'completed') {
          navigate(`/dashboard/interview/${sessionId}/feedback`, { replace: true });
        }
      } catch {
        toast.error('Session not found');
        navigate('/dashboard/mock-interview');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId, navigate]);

  useEffect(() => { scrollBottom(); }, [session?.messages, isTyping, scrollBottom]);

  /* Send message */
  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending || isComplete) return;

    setInput('');
    setSending(true);
    setIsTyping(true);

    // Optimistically add user message to UI
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, {
        _id: 'temp-user-' + Date.now(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      }],
    }));

    try {
      const res = await sendMessage(sessionId, content);
      const { aiMessage, isComplete: done } = res.data;

      setSession((prev) => ({
        ...prev,
        messages: [
          ...prev.messages.filter((m) => !m._id?.startsWith('temp-')),
          { _id: 'temp-user-final-' + Date.now(), role: 'user', content, createdAt: new Date().toISOString() },
          aiMessage,
        ],
      }));

      if (done) setIsComplete(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
      setSession((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => !m._id?.startsWith('temp-')),
      }));
      setInput(content);
    } finally {
      setSending(false);
      setIsTyping(false);
    }
  };

  /* End session */
  const handleEnd = async () => {
    setEnding(true);
    try {
      await endSession(sessionId, seconds);
      navigate(`/dashboard/interview/${sessionId}/feedback`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to end session. Try again.');
      setEnding(false);
    }
  };

  /* Keyboard send */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Compute question progress */
  const questionsAnswered = session?.messages.filter((m) => m.role === 'user').length || 0;
  const totalQ = session?.totalQuestions || 10;
  const progress = Math.min((questionsAnswered / totalQ) * 100, 100);
  const isWarning = seconds >= 25 * 60; // warn after 25 min

  if (loading) {
    return (
      <DashboardLayout title="Loading Interview...">
        <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  if (!session) return null;

  const domainColor = DOMAIN_COLORS[session.domain] || 'from-gray-400 to-gray-600';
  const domainIcon  = DOMAIN_ICONS[session.domain]  || '🎙️';

  return (
    <DashboardLayout
      title={session.sessionName || `${session.domain} Interview`}
      subtitle={`${session.difficulty} difficulty · ${totalQ} questions`}
    >
      <div className="max-w-4xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>

        {/* ── Interview Header Bar ────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          {/* Domain badge */}
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br shrink-0', domainColor)}>
              {domainIcon}
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--color-text)]">{session.domain}</p>
              <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', DIFF_COLORS[session.difficulty])}>
                {session.difficulty}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs text-[var(--color-text-faint)] mb-1">
              <span>Progress</span>
              <span>{questionsAnswered}/{totalQ}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
              <div
                className="h-full rounded-full gradient-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Timer + End */}
          <div className="flex items-center gap-3">
            <div className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-mono font-bold',
              isWarning
                ? 'border-red-400 text-red-500 bg-red-50 dark:bg-red-900/20 timer-warning'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
            )}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timerDisplay}
            </div>
            <Button
              id="end-interview-btn"
              variant="outline"
              size="sm"
              onClick={() => setShowEnd(true)}
              className="!border-red-400 !text-red-500 hover:!bg-red-500 hover:!text-white"
            >
              End Interview
            </Button>
          </div>
        </div>

        {/* ── Chat Window ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-6 space-y-5">
          {session.messages.map((msg, i) => (
            <div key={msg._id || i} className={clsx('flex items-start gap-3', msg.role === 'user' && 'flex-row-reverse')}>
              {/* Avatar */}
              <div className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-md',
                msg.role === 'ai' ? 'gradient-brand' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              )}>
                {msg.role === 'ai' ? '🤖' : '🧑‍💻'}
              </div>

              {/* Bubble */}
              <div className={msg.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}>
                {msg.role === 'ai' && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand)] mb-1 opacity-75">
                    AI Interviewer {msg.questionIndex != null ? `· Q${msg.questionIndex + 1}` : ''}
                  </p>
                )}
                <p className={clsx(
                  'text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'ai' ? 'text-[var(--color-text)]' : 'text-white'
                )}>
                  {msg.content}
                </p>
                <p className={clsx(
                  'text-[10px] mt-1.5',
                  msg.role === 'ai' ? 'text-[var(--color-text-faint)]' : 'text-white/60'
                )}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Complete banner */}
          {isComplete && (
            <div className="flex justify-center animate-fade-in">
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl px-6 py-4 text-center max-w-md">
                <p className="text-2xl mb-2">🎉</p>
                <p className="font-bold text-[var(--color-text)]">Interview Complete!</p>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">Click below to see your detailed AI feedback.</p>
                <Button
                  id="view-feedback-btn"
                  variant="success"
                  size="sm"
                  onClick={() => setShowEnd(true)}
                >
                  View Feedback Report
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ───────────────────────────────────────────────── */}
        <div className="mt-4 flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              id="answer-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isComplete ? 'Interview completed — click End Interview for feedback' : 'Type your answer… (Enter to send, Shift+Enter for new line)'}
              disabled={sending || isComplete}
              rows={3}
              className={clsx(
                'input-base resize-none w-full pr-4',
                (sending || isComplete) && 'opacity-50 cursor-not-allowed'
              )}
            />
          </div>
          <Button
            id="send-answer-btn"
            variant="primary"
            size="lg"
            onClick={handleSend}
            disabled={!input.trim() || sending || isComplete}
            isLoading={sending}
            className="shrink-0 h-[72px]"
          >
            {sending ? '' : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </Button>
        </div>

        {/* ── End Interview Confirmation Modal ─────────────────────────── */}
        {showEndModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[var(--color-border)]">
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">🏁</div>
                <h3 className="font-bold text-xl text-[var(--color-text)] mb-2">End Interview?</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  The AI will analyze your answers and generate a detailed feedback report with scores and suggestions.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  id="cancel-end-btn"
                  variant="ghost"
                  onClick={() => setShowEnd(false)}
                  disabled={ending}
                >
                  Keep Going
                </Button>
                <Button
                  id="confirm-end-btn"
                  variant="primary"
                  onClick={handleEnd}
                  isLoading={ending}
                >
                  {ending ? 'Generating...' : 'End & Feedback'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default InterviewSession;
