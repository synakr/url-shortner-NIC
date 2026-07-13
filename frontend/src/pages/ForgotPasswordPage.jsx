import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Mail, Zap } from 'lucide-react';
import { authApi } from '../api';

function AuthShell({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-card auth-card-single">
        <div className="auth-form-panel">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <AuthShell>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
          <h1 className="auth-title">Check Your Email</h1>
          <p className="auth-subtitle">
            We've sent a password reset link to <strong>{email}</strong>.
            Please check your inbox and follow the link to reset your password.
          </p>
          <p className="auth-subtitle" style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)', marginTop: 8 }}>
            Didn't receive it? Check your spam folder or try again in a few minutes.
          </p>
          <Link
            to="/login"
            className="btn btn-primary w-full"
            style={{ display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: 24 }}
          >
            Back to Login
          </Link>
        </div>
      </AuthShell>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSuccess(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else if (status === 404) {
        setError('No account found with that email address.');
      } else if (status === 401) {
        setError('400');
      } else if (status === 503) {
        setError('500');
      }else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-logo">
        <div className="auth-logo-text">
          <Zap size={22} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          LinkSnap
        </div>
        <div className="auth-logo-sub">Smart URL Shortener</div>
      </div>

      <h1 className="auth-title">Forgot Password</h1>
      <p className="auth-subtitle">
        Enter the email address associated with your account and we'll send you a link to reset your password.
      </p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="forgot-email">Email Address</label>
          <div style={{ position: 'relative' }}>
            <input
              id="forgot-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ paddingLeft: 40 }}
            />
            <Mail
              size={16}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-subtle)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        <button
          id="forgot-password-submit-btn"
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" /> Sending Link...</>
          ) : (
            <>Send Reset Link <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <p className="auth-footer">
        Remember your password?{' '}
        <Link to="/login" className="auth-link">Sign in</Link>
        {' · '}
        <Link to="/register" className="auth-link">Create account</Link>
      </p>
    </AuthShell>
  );
}
