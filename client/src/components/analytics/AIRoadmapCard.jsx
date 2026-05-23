/**
 * AIRoadmapCard — personalized 4-week AI study roadmap
 */
import { clsx } from 'clsx';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';

const AIRoadmapCard = ({ insight, loading, generating, onGenerate }) => {
  const hasRoadmap = insight?.roadmap?.length > 0;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
            AI Preparation Roadmap
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Personalized 4-week plan based on your performance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          isLoading={generating}
          disabled={generating}
          onClick={onGenerate}
        >
          {hasRoadmap ? 'Regenerate' : 'Generate Roadmap'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !hasRoadmap ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-[var(--color-border)]">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto">
            Complete a few mock interviews or analyze your resume, then generate your AI roadmap.
          </p>
        </div>
      ) : (
        <>
          {insight.summary && (
            <p className="text-sm text-[var(--color-text-muted)] mb-5 p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
              {insight.summary}
            </p>
          )}
          {insight.focusAreas?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {insight.focusAreas.map((area) => (
                <span
                  key={area}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-500"
                >
                  {area}
                </span>
              ))}
            </div>
          )}
          <div className="space-y-4">
            {insight.roadmap.map((phase, i) => (
              <div
                key={phase.title}
                className={clsx(
                  'rounded-xl border p-4',
                  i === 0 ? 'border-brand-500/40 bg-brand-500/5' : 'border-[var(--color-border)]'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-text)]">{phase.title}</p>
                    {phase.duration && (
                      <p className="text-[10px] text-[var(--color-text-faint)]">{phase.duration}</p>
                    )}
                  </div>
                </div>
                {phase.focus?.length > 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">
                    Focus: {phase.focus.join(' · ')}
                  </p>
                )}
                <ul className="space-y-1">
                  {(phase.tasks || []).map((task) => (
                    <li key={task} className="text-xs text-[var(--color-text-muted)] flex gap-2">
                      <span className="text-brand-500">→</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AIRoadmapCard;
