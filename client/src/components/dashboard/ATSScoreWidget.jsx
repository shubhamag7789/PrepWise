/**
 * ATSScoreWidget — Resume ATS score ring + grade + tips (live data)
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import ATSScoreRing, { getGradeMeta } from '@components/resume/ATSScoreRing';
import { getLatestResumeAnalysis } from '@api/resumeApi';

const ATSScoreWidget = () => {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestResumeAnalysis()
      .then((res) => setLatest(res?.analysis ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const score = latest?.analysis?.atsScore ?? null;
  const a = latest?.analysis;
  const hasData = score != null;
  const { label, color, bg } = getGradeMeta(hasData ? score : 0);

  const breakdown = hasData
    ? [
        { label: 'Keywords Match', val: a.keywordMatchScore },
        { label: 'Format & Layout', val: a.formatScore },
        { label: 'Action Verbs', val: a.actionVerbsScore },
      ]
    : [
        { label: 'Keywords Match', val: 0 },
        { label: 'Format & Layout', val: 0 },
        { label: 'Action Verbs', val: 0 },
      ];

  const tips = hasData
    ? (a.improvements || []).slice(0, 3).map((i) => i.suggestion)
    : [
        'Upload your resume for a full AI-powered ATS scan',
        'Paste a job description to match keywords',
        'Get missing skills & improvement suggestions',
      ];

  return (
    <div className="rounded-2xl border bg-[var(--color-bg-card)] border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-[var(--color-text)]">Resume ATS Score</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {hasData ? latest.originalFileName : 'Applicant Tracking System check'}
          </p>
        </div>
        {hasData && (
          <span className={clsx('text-xs font-bold px-2.5 py-1 rounded-lg', bg)}>{label}</span>
        )}
      </div>

      <div className="flex items-center gap-5 mb-5">
        <ATSScoreRing score={hasData ? score : 0} grade={a?.grade} />

        <div className="flex-1 space-y-2.5">
          {breakdown.map(({ label: lbl, val }) => (
            <div key={lbl}>
              <div className="flex justify-between mb-0.5">
                <span className="text-[11px] text-[var(--color-text-muted)]">{lbl}</span>
                <span className="text-[11px] font-bold text-[var(--color-text)]">
                  {hasData ? `${val}%` : '—'}
                </span>
              </div>
              <div className="h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: hasData ? `${val}%` : '0%', background: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
          {hasData ? 'Top Suggestions' : 'Get Started'} 💡
        </p>
        <ul className="space-y-1.5">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-[11px] text-[var(--color-text-muted)]">
              <span className="text-brand-500 mt-0.5 shrink-0">→</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <Link
        to="/dashboard/resume-analyzer"
        className="mt-4 block w-full rounded-xl py-2 text-sm font-semibold text-center border border-brand-500/30 text-brand-500 hover:bg-brand-500/10 transition-colors"
      >
        {loading ? 'Loading…' : hasData ? 'View Full Analysis' : 'Upload Resume for Full Analysis'}
      </Link>
    </div>
  );
};

export default ATSScoreWidget;
