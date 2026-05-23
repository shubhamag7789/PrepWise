/**
 * PrepRoadmap — AI personalized 4-week preparation plan
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import Skeleton from '@components/common/Skeleton';
import { ErrorState } from '@components/common/PageState';
import AIRoadmapCard from '@components/analytics/AIRoadmapCard';
import StudySuggestionsPanel from '@components/analytics/StudySuggestionsPanel';
import { getRoadmap, generateRoadmap } from '@api/analyticsApi';

const PrepRoadmap = () => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [insight, setInsight] = useState(null);

  const loadRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const res = await getRoadmap();
      setInsight(res.data?.insight || null);
    } catch {
      setLoadError(true);
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateRoadmap();
      setInsight(res.data?.insight);
      toast.success('Roadmap generated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Prep Roadmap" subtitle="Loading your personalized plan…">
        <div className="max-w-5xl space-y-6">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton.Card />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton.Card />
            <Skeleton.Card />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loadError) {
    return (
      <DashboardLayout title="Prep Roadmap" subtitle="Could not load">
        <ErrorState message="Failed to load roadmap." onRetry={loadRoadmap} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="AI Prep Roadmap"
      subtitle="Personalized 4-week study plan based on your performance"
    >
      <div className="max-w-5xl space-y-6">
        <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-r from-brand-500/10 via-purple-500/5 to-transparent p-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            Your roadmap is built from mock interviews, resume ATS scores, and weak topics.
            Complete more sessions on{' '}
            <Link to="/dashboard/analytics" className="text-brand-500 font-semibold hover:underline">
              Analytics
            </Link>{' '}
            to improve recommendations.
          </p>
        </div>

        <AIRoadmapCard
          insight={insight}
          loading={false}
          generating={generating}
          onGenerate={handleGenerate}
        />

        <StudySuggestionsPanel
          suggestions={insight?.studySuggestions || []}
          recommendations={insight?.adaptiveRecommendations || []}
        />
      </div>
    </DashboardLayout>
  );
};

export default PrepRoadmap;
