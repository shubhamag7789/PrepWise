/**
 * ResumeAnalyzer — AI-powered ATS resume analysis dashboard
 */
import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import ResumeUploadZone from '@components/resume/ResumeUploadZone';
import ATSScoreRing, { getGradeMeta } from '@components/resume/ATSScoreRing';
import ATSAnalyticsCards from '@components/resume/ATSAnalyticsCards';
import ATSKeywordPanel from '@components/resume/ATSKeywordPanel';
import ATSSkillsPanel from '@components/resume/ATSSkillsPanel';
import ATSSuggestionsList from '@components/resume/ATSSuggestionsList';
import JobMatchPanel from '@components/resume/JobMatchPanel';
import ResumeHistoryList from '@components/resume/ResumeHistoryList';
import {
  analyzeResume,
  listResumeAnalyses,
  getResumeAnalysis,
  deleteResumeAnalysis,
} from '@api/resumeApi';

const ResumeAnalyzer = () => {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      setHistLoading(true);
      const rows = await listResumeAnalyses({ limit: 20 });
      setHistory(rows);
    } catch {
      toast.error('Could not load analysis history');
    } finally {
      setHistLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const loadAnalysis = async (id) => {
    try {
      const res = await getResumeAnalysis(id);
      setCurrent(res?.analysis || null);
    } catch {
      toast.error('Could not load analysis');
    }
  };

  const handleAnalyze = async (formData) => {
    setAnalyzing(true);
    try {
      const res = await analyzeResume(formData);
      const analysis = res.data?.analysis;
      setCurrent(analysis);
      toast.success('Resume analyzed successfully!');
      await loadHistory();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? 'Analysis timed out. Try again or use a shorter job description.'
          : 'Analysis failed. Check your Gemini API key and try again.');
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteResumeAnalysis(id);
      setHistory((prev) => prev.filter((h) => h._id !== id));
      if (current?._id === id) setCurrent(null);
      toast.success('Analysis deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const a = current?.analysis;
  const score = a?.atsScore ?? 0;
  const { label, bg } = getGradeMeta(score);
  const hasJobMatch = Boolean(current?.jobDescription?.trim() && a?.jobMatch);

  return (
    <DashboardLayout
      title="ATS Resume Analyzer"
      subtitle="AI-powered resume scoring, keyword analysis & job matching"
    >
      <div className="max-w-7xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload + History */}
          <div className="lg:col-span-4 space-y-6">
            <ResumeUploadZone onAnalyze={handleAnalyze} isLoading={analyzing} />
            <ResumeHistoryList
              items={history}
              loading={histLoading}
              activeId={current?._id}
              onSelect={loadAnalysis}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-8 space-y-6">
            {!current || !a ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] p-12 text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
                  No analysis yet
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto">
                  Upload a PDF resume to get your ATS score, keyword gaps, missing skills, and
                  AI improvement suggestions. Optionally paste a job description for matching.
                </p>
              </div>
            ) : (
              <>
                {/* Hero score card */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <ATSScoreRing
                      score={score}
                      grade={a.grade}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-display font-bold text-xl text-[var(--color-text)] truncate">
                          {current.originalFileName}
                        </h3>
                        <span className={clsx('text-xs font-bold px-2.5 py-1 rounded-lg', bg)}>
                          {label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {a.summary}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-[var(--color-text-faint)]">
                        {current.targetRole && <span>Role: {current.targetRole}</span>}
                        {current.wordCount > 0 && <span>{current.wordCount} words</span>}
                        {a.sectionsDetected?.length > 0 && (
                          <span>Sections: {a.sectionsDetected.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <ATSAnalyticsCards analysis={a} hasJobMatch={hasJobMatch} />

                {hasJobMatch && <JobMatchPanel jobMatch={a.jobMatch} />}

                <ATSKeywordPanel
                  matched={a.matchedKeywords}
                  missing={a.missingKeywords}
                />

                <ATSSkillsPanel
                  present={a.presentSkills}
                  missing={a.missingSkills}
                />

                <ATSSuggestionsList
                  improvements={a.improvements}
                  strengths={a.strengths}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeAnalyzer;
