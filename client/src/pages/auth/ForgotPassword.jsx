/**
 * Forgot Password Page
 * Sends a password reset request and shows a confirmation / dev token
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@api/authApi';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState('');

  const validate = () => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setEmailError(err); return; }
    setEmailError('');
    setIsLoading(true);
    try {
      const { data } = await authApi.forgotPassword({ email });
      // In dev mode, server returns the raw token; display it for testing
      if (data?.data?.resetToken) setDevToken(data.data.resetToken);
      setSubmitted(true);
      toast.success('Reset instructions sent!');
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong';
      toast.error(message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden mesh-gradient items-center justify-center p-12">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-brand-500/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        </div>
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="w-16 h-16 rounded-2xl gradient-brand mx-auto mb-6 flex items-center justify-center shadow-brand-lg text-3xl">
            🔐
          </div>
          <h2 className="font-display font-black text-4xl mb-4">
            Forgot your <span className="gradient-text">password?</span>
          </h2>
          <p className="text-surface-300 text-lg leading-relaxed">
            No worries! Enter your registered email and we'll send you a secure link to reset your password within minutes.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 text-left">
            {[
              '🔒 Secure 256-bit encrypted reset link',
              '⏱️ Link expires in 10 minutes for safety',
              '📧 Check your spam folder if not received',
            ].map((item) => (
              <p key={item} className="text-surface-300 text-sm">{item}</p>
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

          {!submitted ? (
            <>
              <h1 className="font-display font-bold text-3xl text-[var(--color-text)] mb-2">
                Reset your password
              </h1>
              <p className="text-[var(--color-text-muted)] mb-8">
                Enter your account email and we'll generate a reset link for you.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  id="forgot-email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  error={emailError}
                  required
                  autoComplete="email"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                  Send reset instructions
                </Button>

                <p className="text-center text-sm text-[var(--color-text-muted)]">
                  Remember your password?{' '}
                  <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">
                    Back to sign in
                  </Link>
                </p>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center animate-slide-up">
              <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 mx-auto mb-6 flex items-center justify-center text-3xl">
                ✉️
              </div>
              <h1 className="font-display font-bold text-3xl text-[var(--color-text)] mb-3">
                Check your inbox
              </h1>
              <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                We've sent reset instructions to{' '}
                <span className="font-semibold text-[var(--color-text)]">{email}</span>.
                The link expires in 10 minutes.
              </p>

              {/* Dev-mode token display */}
              {devToken && (
                <div className="glass-card rounded-xl p-4 mb-6 text-left border border-amber-500/30 bg-amber-500/5">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
                    🛠️ Dev Mode — Reset Token
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">
                    In production this would be emailed. Copy the token below to test the reset flow:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-surface-900 text-accent-400 px-3 py-2 rounded-lg font-mono break-all">
                      {devToken}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(devToken);
                        toast.success('Token copied!');
                      }}
                      className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-[var(--color-text-muted)] transition-colors shrink-0"
                      title="Copy token"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <Link
                    to={`/reset-password/${devToken}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium"
                  >
                    Go to reset password page →
                  </Link>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => { setSubmitted(false); setDevToken(''); }}
                >
                  Try a different email
                </Button>
                <Link
                  to="/login"
                  className="text-sm text-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
