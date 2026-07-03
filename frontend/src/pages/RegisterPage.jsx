import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useToast } from '../context/ToastContext';
import { UserPlus, Eye, EyeOff, Zap } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Only letters, numbers and underscore allowed';
    else if(form.username.length < 4) e.username='Username must be 4 letters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8 || form.password.length > 14) e.password = 'Password must be 8–14 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await authApi.register(form);
      addToast('Verification link sent! Check your email to complete registration.', 'success');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text"><Zap size={22} style={{display:'inline',marginRight:6,verticalAlign:'middle'}} />LinkSnap</div>
          <div className="auth-logo-sub">Smart URL Shortener</div>
        </div>


        <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join thousands of people shortening links smarter.</p>

            <form id="register-form" className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-username">Username</label>
                <input
                  id="reg-username"
                  className={`form-input${errors.username ? ' error' : ''}`}
                  type="text" placeholder="cool_username"
                  autoComplete="username"
                  value={form.username} onChange={set('username')}
                />
                {errors.username && <span className="form-error">⚠ {errors.username}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  className={`form-input${errors.email ? ' error' : ''}`}
                  type="email" placeholder="you@example.com"
                  autoComplete="email"
                  value={form.email} onChange={set('email')}
                />
                {errors.email && <span className="form-error">⚠ {errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
                    className={`form-input${errors.password ? ' error' : ''}`}
                    type={showPw ? 'text' : 'password'}
                    placeholder="8–14 characters"
                    autoComplete="new-password"
                    value={form.password} onChange={set('password')}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    id="reg-toggle-pw"
                    onClick={() => setShowPw(!showPw)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', color:'var(--color-text-subtle)', padding:0 }}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="form-error">⚠ {errors.password}</span>}
                <span className="form-hint">Must be 8–14 characters long</span>
              </div>

              <button id="register-submit-btn" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                {loading ? <><span className="spinner" />&nbsp;Creating…</> : <><UserPlus size={18} />Create Account</>}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
              {' · '}
              <Link to="/dashboard" className="auth-link">Back to home</Link>
            </p>
      </div>
    </div>
  );
}
