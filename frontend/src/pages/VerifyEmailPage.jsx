import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { addToast } = useToast();

  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const purpose = searchParams.get('purpose') || 'REGISTER';
  const isEmailChange = purpose === 'EMAIL_CHANGE';

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setMessage('Invalid verification link. Missing email or token.');
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    const verify = async () => {
      try {
        const res = await authApi.verifyEmail(email, token, purpose);
        setStatus('success');
        setMessage(res.data || 'Your email has been successfully verified!');
        addToast('Email verified successfully! 🎉', 'success');

        if (isEmailChange) {
          updateUser({ email });
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link might be expired or invalid.');
      }
    };

    verify();
  }, [email, token, purpose, isEmailChange, addToast, updateUser]);

  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo" style={{ justifyContent: 'center' }}>
          <div className="auth-logo-text">
            <Zap size={22} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            LinkSnap
          </div>
          <div className="auth-logo-sub">Smart URL Shortener</div>
        </div>

        <h1 className="auth-title">Email Verification</h1>

        <div style={{ padding: '30px 0' }}>
          {status === 'verifying' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Loader2 className="spinner" size={48} style={{ color: 'var(--color-primary)' }} />
              <p className="auth-subtitle">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <CheckCircle size={56} style={{ color: 'var(--color-success)' }} />
              <p className="auth-subtitle" style={{ color: 'var(--color-text)' }}>{message}</p>
              <button
                type="button"
                className="btn btn-primary btn-lg w-full"
                style={{ marginTop: 20 }}
                onClick={() => navigate(isEmailChange ? '/profile' : '/login', { replace: true })}
              >
                {isEmailChange ? 'Go to Profile' : 'Go to Login'}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <XCircle size={56} style={{ color: 'var(--color-error)' }} />
              <p className="auth-subtitle" style={{ color: 'var(--color-error)' }}>{message}</p>
              <button
                type="button"
                className="btn btn-secondary btn-lg w-full"
                style={{ marginTop: 20 }}
                onClick={() => navigate('/login', { replace: true })}
              >
                Return to Login
              </button>
            </div>
          )}
        </div>

        <p className="auth-footer" style={{ marginTop: '10px' }}>
          Need help? <Link to="/dashboard" className="auth-link">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
