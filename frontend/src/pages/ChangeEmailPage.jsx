import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { authApi } from '../api';

function AuthShell({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />
      <div className="auth-card">{children}</div>
    </div>
  );
}

export default function ChangeEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <AuthShell>
        <h1 className="auth-title">Invalid Link</h1>
        <p className="auth-subtitle">The email change link is invalid or missing the token.</p>
        <Link to="/login" className="btn btn-primary w-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          Go to Login
        </Link>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
          <h1 className="auth-title">Verification Sent</h1>
          <p className="auth-subtitle">
            We've sent a verification link to <strong>{email}</strong>.
            Please check your inbox to confirm your new email address.
          </p>
          <Link to="/login" className="btn btn-primary w-full" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
            Go to Login
          </Link>
        </div>
      </AuthShell>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a new email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authApi.sendVerificationToNewEmail({
        actionToken: token,
        newEmail: email,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification email. The link may have expired.');
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

      <h1 className="auth-title">Change Email Address</h1>
      <p className="auth-subtitle">Enter your new email address below.</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="new-email">New Email Address</label>
          <input
            id="new-email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? (
            <><span className="spinner" /> Sending Link...</>
          ) : (
            <>Send Verification Link <ArrowRight size={18} /></>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
