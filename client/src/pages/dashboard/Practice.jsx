/**
 * Practice Page — No hardcoded data, real empty state
 */
import DashboardLayout from '@components/layout/DashboardLayout';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import { useAuth } from '@hooks/useAuth';

const difficulties = [
  { label: 'Easy',   color: 'success', solved: 0, total: 0 },
  { label: 'Medium', color: 'warning', solved: 0, total: 0 },
  { label: 'Hard',   color: 'danger',  solved: 0, total: 0 },
];

const Practice = () => {
  const { user } = useAuth();
  const totalSolved = user?.stats?.practiceSessionsCompleted ?? 0;

  return (
    <DashboardLayout title="Practice Problems" subtitle="Sharpen your coding skills">
      <div className="max-w-5xl space-y-6">

        {/* Difficulty cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {difficulties.map(({ label, color, solved, total }) => (
            <Card key={label} className="text-center">
              <Badge variant={color} size="lg" className="mb-3">{label}</Badge>
              <p className="font-display font-black text-4xl text-[var(--color-text)] mb-1">
                {solved}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mb-3">
                {total === 0 ? 'problems coming soon' : `of ${total} solved`}
              </p>
              <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
                  style={{ width: total > 0 ? `${(solved / total) * 100}%` : '0%' }}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4 animate-float">💻</div>
            <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-2">
              Problem Set Coming Soon
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-sm mb-6">
              Our team is curating 500+ problems from top companies. You'll be notified as soon as they're live.
            </p>
            <Button variant="primary">Get notified</Button>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default Practice;
