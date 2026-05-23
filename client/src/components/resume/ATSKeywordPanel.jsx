/**
 * ATSKeywordPanel — matched vs missing keywords
 */
import Badge from '@components/common/Badge';

const ATSKeywordPanel = ({ matched = [], missing = [] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <h4 className="font-display font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
        <span className="text-emerald-500">✓</span> Matched Keywords
      </h4>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">Found in your resume</p>
      <div className="flex flex-wrap gap-2">
        {matched.length ? (
          matched.map((kw) => (
            <Badge key={kw} variant="success" size="sm">
              {kw}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">No keywords detected</p>
        )}
      </div>
    </div>

    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <h4 className="font-display font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
        <span className="text-amber-500">!</span> Missing Keywords
      </h4>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">Add these for better ATS ranking</p>
      <div className="flex flex-wrap gap-2">
        {missing.length ? (
          missing.map((kw) => (
            <Badge key={kw} variant="warning" size="sm">
              {kw}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">Great keyword coverage!</p>
        )}
      </div>
    </div>
  </div>
);

export default ATSKeywordPanel;
