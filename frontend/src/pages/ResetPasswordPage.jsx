import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { authApi, userApi } from '../api';
import { useAuth } from '../context/AuthContext';

function AuthShell({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />
      <div className="auth-card">{children}</div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!email || !token) {
    return (
      <AuthShell>
        <h1 className="auth-title">Invalid Link</h1>
        <p className="auth-subtitle">The password reset link is invalid or missing required parameters.</p>
        <Link
          to="/forgot-password"
          className="btn btn-primary w-full"
          style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
        >
          Request a New Link
        </Link>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
          <h1 className="auth-title">Password Reset Successful</h1>
          <p className="auth-subtitle">Your password has been successfully reset. You can now sign in with your new password.</p>
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={() => navigate('/login', { replace: true })}
          >
            Go to Login
          </button>
        </div>
      </AuthShell>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (form.newPassword.length > 14) {
      setError('Password must be at most 14 characters long.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authApi.resetForgotPassword({
        email,
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
      clearSession();
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
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

      <h1 className="auth-title">Reset Your Password</h1>
      <p className="auth-subtitle">Choose a new password for your account.</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="reset-new-password">New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="reset-new-password"
              type={showNew ? 'text' : 'password'}
              className="form-input"
              placeholder="8-14 characters"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
              autoComplete="new-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--color-text-subtle)', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reset-confirm-password">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="reset-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              className="form-input"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--color-text-subtle)', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          id="reset-password-submit-btn"
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" /> Resetting...</>
          ) : (
            <>Reset Password <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <p className="auth-footer">
        <Link to="/login" className="auth-link">Back to Login</Link>
        {' · '}
        <Link to="/forgot-password" className="auth-link">Request new link</Link>
      </p>
    </AuthShell>
  );
}
