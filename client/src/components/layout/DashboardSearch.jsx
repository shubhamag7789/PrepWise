/**
 * DashboardSearch — global command palette (⌘K / Ctrl+K)
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const PAGES = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠', keywords: 'home overview' },
  { label: 'Practice Problems', path: '/dashboard/practice', icon: '💻', keywords: 'coding problems' },
  { label: 'Mock Interview', path: '/dashboard/mock-interview', icon: '🎙️', keywords: 'interview ai' },
  { label: 'Resume ATS Analyzer', path: '/dashboard/resume-analyzer', icon: '📄', keywords: 'resume pdf ats' },
  { label: 'Analytics', path: '/dashboard/analytics', icon: '📊', keywords: 'stats charts performance' },
  { label: 'Prep Roadmap', path: '/dashboard/roadmap', icon: '🗺️', keywords: 'roadmap plan study ai' },
  { label: 'Profile', path: '/dashboard/profile', icon: '👤', keywords: 'account settings skills' },
];

const DashboardSearch = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAGES;
    return PAGES.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q) ||
        p.keywords.toLowerCase().includes(q)
    );
  }, [query]);

  const go = useCallback(
    (path) => {
      navigate(path);
      onClose();
      setQuery('');
    },
    [navigate, onClose]
  );

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[activeIndex]) {
        e.preventDefault();
        go(results[activeIndex].path);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, activeIndex, go, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
          <svg className="w-5 h-5 text-[var(--color-text-faint)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages…"
            className="flex-1 py-4 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[var(--color-text-faint)]">
            esc
          </kbd>
        </div>

        <ul className="max-h-[320px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
              No results for &ldquo;{query}&rdquo;
            </li>
          ) : (
            results.map((item, i) => (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => go(item.path)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                    i === activeIndex
                      ? 'bg-brand-500/10 text-brand-500'
                      : 'text-[var(--color-text)] hover:bg-surface-50 dark:hover:bg-surface-800/50'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardSearch;
