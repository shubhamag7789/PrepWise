/**
 * Frontend Validator Utilities
 * Returns error message string or null if valid
 */

export const validators = {
  required: (value, label = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${label} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return 'Email is required';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? null : 'Please enter a valid email address';
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/\d/.test(value)) return 'Password must contain at least one number';
    return null;
  },

  confirmPassword: (value, original) => {
    if (!value) return 'Please confirm your password';
    return value === original ? null : 'Passwords do not match';
  },

  minLength: (value, min, label = 'This field') => {
    if (!value || value.length < min) return `${label} must be at least ${min} characters`;
    return null;
  },

  maxLength: (value, max, label = 'This field') => {
    if (value && value.length > max) return `${label} cannot exceed ${max} characters`;
    return null;
  },

  url: (value) => {
    if (!value) return null; // optional field
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },
};

/**
 * Run multiple validators against a value
 * Returns the first error found or null
 */
export const runValidators = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};
