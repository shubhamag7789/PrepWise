/**
 * Sidebar — Collapsible dashboard navigation with mobile close support
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '@hooks/useAuth';
import { getInitials, getAvatarGradient } from '@utils/formatters';

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 15a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4zM15 15a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    label: 'Practice',
    to: '/dashboard/practice',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    badge: 'Hot',
  },
  {
    label: 'Mock Interview',
    to: '/dashboard/mock-interview',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Resume ATS',
    to: '/dashboard/resume-analyzer',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    badge: 'AI',
  },
  {
    label: 'Analytics',
    to: '/dashboard/analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Prep Roadmap',
    to: '/dashboard/roadmap',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    badge: 'AI',
  },
  {
    label: 'Profile',
    to: '/dashboard/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

const Sidebar = ({ collapsed, onToggle, onClose }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside
      className={clsx(
        'flex flex-col h-full',
        'bg-[var(--color-bg-card)] border-r border-[var(--color-border)]',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* ── Logo / Brand ─────────────────────────────────────── */}
      <div className={clsx(
        'h-16 flex items-center border-b border-[var(--color-border)] shrink-0',
        collapsed ? 'justify-center px-4' : 'px-5 gap-3'
      )}>
        {/* App icon */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0">
          P
        </div>
        {!collapsed && (
          <span className="font-display font-black text-lg text-[var(--color-text)] tracking-tight">
            Prep<span className="text-brand-500">Wise</span>
          </span>
        )}

        {/* Mobile close button */}
        {!collapsed && onClose && (
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            aria-label="Close sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Collapse toggle (desktop) ─────────────────────────── */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3.5 top-[4.5rem] w-7 h-7 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] shadow-sm transition-all hover:shadow-md z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          className={clsx('w-3.5 h-3.5 transition-transform duration-300', collapsed && 'rotate-180')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ── Nav links ─────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Section label */}
        {!collapsed && (
          <p className="text-[10px] font-semibold text-[var(--color-text-faint)] uppercase tracking-widest px-2 mb-2">
            Navigation
          </p>
        )}

        {navItems.map(({ label, to, icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active', collapsed && 'justify-center px-2')
            }
            title={collapsed ? label : undefined}
          >
            <span className="shrink-0">{icon}</span>
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{label}</span>
                {badge && (
                  <span className="ml-auto px-1.5 py-0.5 text-xs font-bold rounded-md bg-brand-500/20 text-brand-500">
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        {!collapsed && (
          <div className="pt-4">
            <p className="text-[10px] font-semibold text-[var(--color-text-faint)] uppercase tracking-widest px-2 mb-2">
              Resources
            </p>
            <button className="sidebar-link w-full text-left">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="flex-1 truncate">Resume Builder</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-500 font-bold">Soon</span>
            </button>
          </div>
        )}
      </nav>

      {/* ── User section at bottom ─────────────────────────── */}
      <div className={clsx('border-t border-[var(--color-border)] p-3 shrink-0', collapsed ? 'px-2' : 'px-3')}>
        {/* Streak quick view */}
        {!collapsed && user?.stats && (
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-500">Your streak 🔥</p>
                <p className="text-xl font-black text-[var(--color-text)]">
                  {user.stats.streak}
                  <span className="text-sm font-normal text-[var(--color-text-muted)] ml-1">days</span>
                </p>
              </div>
              <div className="text-2xl">🔥</div>
            </div>
          </div>
        )}

        {/* Avatar + name */}
        <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className={clsx(
            'shrink-0 rounded-xl flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br',
            getAvatarGradient(user?.name),
            'w-9 h-9'
          )}>
            {getInitials(user?.name)}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        {!collapsed && (
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
