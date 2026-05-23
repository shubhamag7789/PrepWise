/**
 * DashboardLayout — Main layout wrapper for authenticated pages
 * Features: Sidebar + responsive topbar + mobile drawer overlay
 */
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';
import DashboardSearch from './DashboardSearch';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@hooks/useAuth';
import { getInitials, getAvatarGradient } from '@utils/formatters';

const DashboardLayout = ({ children, title, subtitle }) => {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDesktop, setIsDesktop]   = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const { isDark, toggleTheme }     = useTheme();
  const { user }                    = useAuth();

  // Sync mobileOpen + isDesktop on resize
  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock body scroll when mobile drawer or search is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* ── Mobile backdrop overlay ─────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop: fixed; mobile: drawer) ─────────── */}
      <div className={clsx(
        'fixed top-0 left-0 h-full z-50 transition-transform duration-300',
        'lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Main content area ──────────────────────────────── */}
      {/* Mobile: no margin (sidebar is overlay drawer). Desktop: margin = sidebarWidth */}
      <div
        className="transition-all duration-300 ease-in-out"
        style={isDesktop ? { marginLeft: sidebarWidth } : {}}
      >
        <div>
          {/* ── Dashboard Topbar ──────────────────────────────── */}
          <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[var(--color-text-muted)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                aria-label="Open sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex flex-col justify-center">
                {title && (
                  <h1 className="text-base sm:text-lg font-bold text-[var(--color-text)] font-display leading-tight truncate max-w-[200px] sm:max-w-none">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs text-[var(--color-text-muted)] hidden sm:block">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search — desktop */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:border-brand-500/30 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search pages…</span>
                <kbd className="ml-1 text-[10px] px-1 rounded bg-surface-100 dark:bg-surface-800">⌘K</kbd>
              </button>
              {/* Search — mobile icon */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 rounded-xl text-[var(--color-text-muted)] hover:bg-surface-100 dark:hover:bg-surface-800"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification dot */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-[var(--color-bg)]" />
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                aria-label={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* User avatar + name */}
              <div className="flex items-center gap-2 pl-1 cursor-pointer group">
                <div className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ring-2 ring-transparent group-hover:ring-brand-500/30 transition-all',
                  getAvatarGradient(user?.name)
                )}>
                  {getInitials(user?.name)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-[var(--color-text)] leading-tight">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-[var(--color-text-faint)] capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </header>

          {/* ── Page content ──────────────────────────────────── */}
          <main id="main-content" className="p-4 sm:p-6 animate-fade-in" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>

      <DashboardSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
