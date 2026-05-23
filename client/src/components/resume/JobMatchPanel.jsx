/**
 * JobMatchPanel — JD matching breakdown
 */
const JobMatchPanel = ({ jobMatch }) => {
  if (!jobMatch) return null;

  return (
    <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display font-bold text-[var(--color-text)]">Job Description Match</h4>
        <span className="text-2xl font-display font-black text-brand-500">{jobMatch.score}%</span>
      </div>
      {jobMatch.summary && (
        <p className="text-sm text-[var(--color-text-muted)] mb-4">{jobMatch.summary}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-emerald-600 uppercase mb-2">Requirements Met</p>
          <ul className="space-y-1.5">
            {(jobMatch.matchedRequirements || []).map((r) => (
              <li key={r} className="text-sm text-[var(--color-text-muted)] flex gap-2">
                <span className="text-emerald-500">✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase mb-2">Gaps to Address</p>
          <ul className="space-y-1.5">
            {(jobMatch.gaps || []).map((g) => (
              <li key={g} className="text-sm text-[var(--color-text-muted)] flex gap-2">
                <span className="text-red-500">○</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JobMatchPanel;
