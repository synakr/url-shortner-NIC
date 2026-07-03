import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Link2, BarChart2, Settings, LogOut,
  Shield, Zap, Moon, Sun, LogIn, Clock,
} from 'lucide-react';

export default function Sidebar({ isOpen, onNavigate }) {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [themePreference, setThemePreference] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (pref) => {
      let isDark = false;
      if (pref === 'dark') isDark = true;
      else if (pref === 'system' && mediaQuery.matches) isDark = true;

      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    };

    applyTheme(themePreference);

    const listener = () => {
      if (themePreference === 'system') applyTheme('system');
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themePreference]);

  const cycleTheme = () => {
    let nextTheme = 'system';
    if (themePreference === 'system') nextTheme = 'light';
    else if (themePreference === 'light') nextTheme = 'dark';

    setThemePreference(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/dashboard');
    onNavigate?.();
  };

  const handleNavClick = () => {
    onNavigate?.();
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          <Zap size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          LinkSnap
        </div>
        <div className="sidebar-logo-sub">URL Shortener</div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Main</span>

        <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink to="/my-urls" onClick={handleNavClick} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Link2 size={18} />
          My Links
        </NavLink>

        <NavLink to="/expired-urls" onClick={handleNavClick} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Clock size={18} />
          Expired Links
        </NavLink>

        <NavLink to="/analytics" onClick={handleNavClick} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <BarChart2 size={18} />
          Analytics
        </NavLink>

        <span className="nav-section-label" style={{ marginTop: 8 }}>Account</span>

        <NavLink to="/profile" onClick={handleNavClick} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Settings size={18} />
          Profile
        </NavLink>

        {isAdmin && (
          <>
            <span className="nav-section-label" style={{ marginTop: 8 }}>Admin</span>
            <NavLink to="/admin" onClick={handleNavClick} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Shield size={18} />
              User Management
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 16px 8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: 500 }}>Theme</span>
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px', width: 80, justifyContent: 'center' }}
            onClick={cycleTheme}
            title={`Current theme: ${themePreference}`}
          >
            {themePreference === 'system' ? <span style={{ fontSize: '0.8rem' }}>System</span> : themePreference === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        {isAuthenticated ? (
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">{user?.username}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Logout"
              style={{ padding: '6px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={handleNavClick}>
            <LogIn size={16} />
            Sign In
          </Link>
        )}
      </div>
    </aside>
  );
}
