/**
 * StudySuggestionsPanel — AI study tips & adaptive recommendations
 */
const StudySuggestionsPanel = ({ suggestions = [], recommendations = [] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <h4 className="font-display font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
        <span>📚</span> Study Suggestions
      </h4>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">Daily & weekly actions</p>
      <ul className="space-y-2.5">
        {suggestions.length ? (
          suggestions.map((s) => (
            <li key={s} className="text-sm text-[var(--color-text-muted)] flex gap-2">
              <span className="text-emerald-500 shrink-0">✓</span>
              {s}
            </li>
          ))
        ) : (
          <li className="text-sm text-[var(--color-text-faint)]">
            Generate your AI roadmap to unlock suggestions.
          </li>
        )}
      </ul>
    </div>

    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <h4 className="font-display font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
        <span>🎯</span> Adaptive Recommendations
      </h4>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">What to focus on next</p>
      <ul className="space-y-2.5">
        {recommendations.length ? (
          recommendations.map((r) => (
            <li key={r} className="text-sm text-[var(--color-text-muted)] flex gap-2">
              <span className="text-brand-500 shrink-0">→</span>
              {r}
            </li>
          ))
        ) : (
          <li className="text-sm text-[var(--color-text-faint)]">
            Complete interviews to get tailored recommendations.
          </li>
        )}
      </ul>
    </div>
  </div>
);

export default StudySuggestionsPanel;
