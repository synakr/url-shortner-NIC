import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = location.state?.from || '/dashboard';
  const { addToast } = useToast();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.identifier.trim()) e.identifier = 'Username or Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { accesstoken, refreshtoken, username, email } = res.data;
      await login({ username, email }, accesstoken, refreshtoken);
      addToast(`Welcome back, ${username}! 🎉`, 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text"><Zap size={22} style={{display:'inline',marginRight:6,verticalAlign:'middle'}} />LinkSnap</div>
          <div className="auth-logo-sub">Smart URL Shortener</div>
        </div>

        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Welcome back! Enter your credentials to continue.</p>

        <form id="login-form" className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-identifier">Username or Email</label>
            <input
              id="login-identifier"
              className={`form-input${errors.identifier ? ' error' : ''}`}
              type="text"
              placeholder="Username or Email"
              autoComplete="username"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            />
            {errors.identifier && <span className="form-error">⚠ {errors.identifier}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className={`form-input${errors.password ? ' error' : ''}`}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPw(!showPw)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', color:'var(--color-text-subtle)', padding:0 }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="form-error">⚠ {errors.password}</span>}
          </div>

          <button id="login-submit-btn" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <><span className="spinner" />&nbsp;Signing in…</> : <><LogIn size={18} />Sign In</>}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </p>
        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
          {' · '}
          <Link to="/dashboard" className="auth-link">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
