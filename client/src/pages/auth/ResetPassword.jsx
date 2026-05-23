/**
 * Reset Password Page
 * Accepts :token from URL, validates new password, posts to /auth/reset-password/:token
 */
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authApi } from '@api/authApi';
import { storage } from '@utils/storage';
import { useAuth } from '@hooks/useAuth';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import toast from 'react-hot-toast';

// Password strength helper (mirrors Register.jsx)
const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: '', color: '' },
    { label: 'Very weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-lime-500' },
    { label: 'Strong', color: 'bg-accent-500' },
  ];
  return { strength: score, ...map[score] };
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const pwStrength = getPasswordStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.password || form.password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password))
      errs.password = 'Must contain an uppercase letter';
    else if (!/\d/.test(form.password))
      errs.password = 'Must contain a number';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    try {
      const { data } = await authApi.resetPassword(token, {
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      // Server issues a new access token on successful reset — store and hydrate
      if (data?.data?.accessToken) {
        storage.set('accessToken', data.data.accessToken);
      }
      setSuccess(true);
      toast.success('Password reset! Redirecting to dashboard…');
      setTimeout(() => navigate('/dashboard', { replace: true }), 1800);
    } catch (err) {
      const message = err.response?.data?.message || 'Reset failed. The link may have expired.';
      toast.error(message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden mesh-gradient items-center justify-center p-12">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-500/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
        </div>
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="w-16 h-16 rounded-2xl gradient-brand mx-auto mb-6 flex items-center justify-center shadow-brand-lg text-3xl">
            🛡️
          </div>
          <h2 className="font-display font-black text-4xl mb-4">
            Create a <span className="gradient-text">strong password</span>
          </h2>
          <p className="text-surface-300 text-lg leading-relaxed mb-8">
            Choose a password that's hard to guess but easy for you to remember. A good password has uppercase letters, numbers, and symbols.
          </p>
          <div className="glass-card rounded-xl p-5 text-left space-y-2">
            {[
              { ok: form.password.length >= 8, text: 'At least 8 characters' },
              { ok: /[A-Z]/.test(form.password), text: 'One uppercase letter' },
              { ok: /\d/.test(form.password), text: 'One number' },
              { ok: /[^A-Za-z0-9]/.test(form.password), text: 'One special character (recommended)' },
            ].map(({ ok, text }) => (
              <p key={text} className={`text-sm flex items-center gap-2 transition-colors ${ok ? 'text-accent-400' : 'text-surface-400'}`}>
                <span>{ok ? '✓' : '○'}</span> {text}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl gradient-text">PrepWise</span>
          </Link>

          {success ? (
            <div className="text-center animate-slide-up">
              <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 mx-auto mb-6 flex items-center justify-center text-3xl">
                ✅
              </div>
              <h1 className="font-display font-bold text-3xl text-[var(--color-text)] mb-3">
                Password updated!
              </h1>
              <p className="text-[var(--color-text-muted)]">
                Redirecting you to the dashboard…
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display font-bold text-3xl text-[var(--color-text)] mb-2">
                Set new password
              </h1>
              <p className="text-[var(--color-text-muted)] mb-8">
                Almost there! Choose a strong new password for your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* New password */}
                <div className="space-y-2">
                  <Input
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="reset-password"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                    autoComplete="new-password"
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                        {showPassword
                          ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        }
                      </button>
                    }
                  />
                  {/* Password strength bar */}
                  {form.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength.strength ? pwStrength.color : 'bg-surface-200 dark:bg-surface-700'}`} />
                        ))}
                      </div>
                      {pwStrength.label && (
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Password strength: <span className="font-medium">{pwStrength.label}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <Input
                  label="Confirm new password"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  id="reset-confirm-password"
                  placeholder="Re-enter your new password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />

                <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                  Reset password
                </Button>

                <p className="text-center text-sm text-[var(--color-text-muted)]">
                  Link expired?{' '}
                  <Link to="/forgot-password" className="text-brand-500 hover:text-brand-600 font-medium">
                    Request a new one
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
