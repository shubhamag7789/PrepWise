/**
 * Frontend Formatter Utilities
 */

/** Format a date to human-readable string */
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date));
};

/** Format a number with locale-appropriate separators */
export const formatNumber = (num) => {
  if (num == null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

/** Compact number (1500 → 1.5K) */
export const formatCompact = (num) => {
  if (num == null) return '0';
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
};

/** Truncate string to maxLength with ellipsis */
export const truncate = (str, maxLength = 100) => {
  if (!str) return '';
  return str.length <= maxLength ? str : `${str.slice(0, maxLength)}...`;
};

/** Convert snake_case or camelCase to Title Case */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};

/** Format duration in seconds to mm:ss */
export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/** Get initials from name */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
};

/** Generate a deterministic avatar gradient from a name */
export const getAvatarGradient = (name = '') => {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-indigo-500 to-blue-600',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};
