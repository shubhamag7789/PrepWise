/**
 * Navbar — Responsive top navigation bar
 * Features: logo, nav links, dark mode toggle, user menu, mobile hamburger
 */
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@hooks/useTheme';
import { getInitials, getAvatarGradient } from '@utils/formatters';
import Button from '@components/common/Button';

const NavLinks = [
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#pricing', label: 'Pricing' },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16">
      <nav className="h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="PrepWise Home">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand group-hover:shadow-brand-lg transition-shadow">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl gradient-text">PrepWise</span>
        </Link>

        {/* Desktop Nav Links (public pages only) */}
        {!isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {NavLinks.map(({ to, label }) => (
              <a
                key={label}
                href={to}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-all"
              >
                {label}
              </a>
            ))}
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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

          {isAuthenticated ? (
            /* User Avatar Dropdown */
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className={clsx(
                  'w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br',
                  getAvatarGradient(user?.name)
                )}>
                  {getInitials(user?.name)}
                </div>
                <span className="hidden sm:block text-sm font-medium text-[var(--color-text)] max-w-[120px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
                <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-xl py-1.5 animate-slide-up z-50">
                  <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                    <p className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 15a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4zM15 15a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
                    Dashboard
                  </Link>
                  <Link to="/dashboard/profile" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Profile
                  </Link>
                  <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Auth Buttons */
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          {!isAuthenticated && (
            <button
              className="sm:hidden p-2 rounded-xl text-[var(--color-text-muted)] hover:bg-surface-100 dark:hover:bg-surface-800"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && !isAuthenticated && (
        <div className="sm:hidden bg-[var(--color-bg-card)] border-b border-[var(--color-border)] px-4 py-4 flex flex-col gap-2 animate-slide-up">
          {NavLinks.map(({ to, label }) => (
            <a key={label} href={to} onClick={() => setMenuOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all">
              {label}
            </a>
          ))}
          <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
            <Link to="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm" fullWidth>Sign in</Button>
            </Link>
            <Link to="/register" className="flex-1" onClick={() => setMenuOpen(false)}>
              <Button variant="primary" size="sm" fullWidth>Get started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
