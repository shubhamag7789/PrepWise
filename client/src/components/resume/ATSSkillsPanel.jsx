/**
 * ATSSkillsPanel — present vs missing skills
 */
import Badge from '@components/common/Badge';

const ATSSkillsPanel = ({ present = [], missing = [] }) => (
  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
    <h4 className="font-display font-bold text-[var(--color-text)] mb-4">Skills Analysis</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">
          Present Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {present.map((s) => (
            <Badge key={s} variant="success" size="sm">
              {s}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
          Missing Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {missing.map((s) => (
            <Badge key={s} variant="danger" size="sm">
              {s}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ATSSkillsPanel;
