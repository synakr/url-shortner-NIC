import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User, Mail, Lock, AlertTriangle, Eye, EyeOff, Shield, ChevronDown, ChevronRight,
  LogOut, MonitorSmartphone,
} from 'lucide-react';

function CollapsibleSection({ title, description, icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="settings-section">
      <button
        type="button"
        className="settings-collapsible-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="settings-collapsible-header-text">
          <div className="settings-collapsible-title-row">
            {icon}
            <h2 className="settings-section-title">{title}</h2>
          </div>
          <p className="settings-section-desc">{description}</p>
        </div>
        {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>

      {open && children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, logoutAll, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Sync profile when tab is opened or regains focus (e.g. after email verify in another tab)
  useEffect(() => {
    refreshProfile();

    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshProfile();
    };

    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshProfile]);

  // Username Update
  const [usernameForm, setUsernameForm] = useState({ username: user?.username ?? '', password: '' });
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [showUsernamePw, setShowUsernamePw] = useState(false);

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    if (!usernameForm.password) {
      addToast('Current password is required to change username.', 'error');
      return;
    }
    setUsernameLoading(true);
    try {
      await userApi.updateUsername(usernameForm);
      addToast('Username updated! Please log in again.', 'success');
      await logout();
      navigate('/login');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update username', 'error');
    } finally {
      setUsernameLoading(false);
    }
  };

  // Email Change
  const [emailForm, setEmailForm] = useState({ currentPassword: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [showEmailPw, setShowEmailPw] = useState(false);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!emailForm.currentPassword) {
      addToast('Current password is required.', 'error');
      return;
    }
    setEmailLoading(true);
    try {
      await authApi.requestEmailChange(emailForm);
      addToast('A verification link has been sent to your current email address.', 'success');
      setEmailForm({ currentPassword: '' });
      setEmailLinkSent(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to request email change', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  // Password Change Request
  const [pwForm, setPwForm] = useState({ currentPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [passwordLinkSent, setPasswordLinkSent] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) {
      addToast('Current password is required.', 'error');
      return;
    }
    setPwLoading(true);
    try {
      await userApi.requestPasswordChange(pwForm);
      addToast('A password change link has been sent to your registered email.', 'success');
      setPwForm({ currentPassword: '' });
      setPasswordLinkSent(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to request password change', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      addToast('Logged out successfully.', 'success');
      navigate('/login');
    } catch (err) {
      addToast('Failed to log out.', 'error');
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      await logoutAll();
      addToast('All sessions have been terminated.', 'success');
      navigate('/login');
    } catch (err) {
      addToast('Failed to log out all sessions.', 'error');
    } finally {
      setLogoutAllLoading(false);
      setShowLogoutAllModal(false);
    }
  };

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await userApi.deactivateAccount();
      addToast('Account deactivated. Logging out…', 'info');
      await logout();
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to deactivate account', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  const roleLabel = user?.role === 'ADMIN' ? 'Administrator' : 'Member';

  return (
    <div className="page-content" style={{ maxWidth: 800 }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">View your account details and manage settings.</p>
      </div>

      {/* Profile overview */}
      <div className="profile-overview card">
        <div className="profile-overview-avatar">{initials}</div>
        <div className="profile-overview-details">
          <h2 className="profile-overview-name">{user?.username}</h2>
          <p className="profile-overview-email">
            <Mail size={14} />
            {user?.email}
          </p>
          <div className="profile-overview-meta">
            <span className={`badge ${user?.role === 'ADMIN' ? 'badge-primary' : 'badge-success'}`}>
              <Shield size={12} />
              {roleLabel}
            </span>
            <span className="badge badge-success">Active</span>
          </div>
        </div>
      </div>

      <div className="profile-info-grid">
        <div className="profile-info-item">
          <span className="profile-info-label">Username</span>
          <span className="profile-info-value">{user?.username}</span>
        </div>
        <div className="profile-info-item">
          <span className="profile-info-label">Email</span>
          <span className="profile-info-value">{user?.email}</span>
        </div>
        <div className="profile-info-item">
          <span className="profile-info-label">Role</span>
          <span className="profile-info-value">{roleLabel}</span>
        </div>
        <div className="profile-info-item">
          <span className="profile-info-label">Account Status</span>
          <span className="profile-info-value text-success">Active</span>
        </div>
      </div>

      <CollapsibleSection
        title="Update Username"
        description="Change your account username."
        icon={<User size={18} style={{ color: 'var(--color-primary)' }} />}
      >
        <div className="settings-box">
          <form id="update-username-form" onSubmit={handleUsernameUpdate}>
            <div className="settings-box-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ maxWidth: 400 }}>
                <label className="form-label" htmlFor="profile-username">New Username</label>
                <input
                  id="profile-username"
                  className="form-input"
                  type="text"
                  value={usernameForm.username}
                  onChange={(e) => setUsernameForm({ ...usernameForm, username: e.target.value })}
                  placeholder="your_username"
                />
              </div>
              <div className="form-group" style={{ maxWidth: 400 }}>
                <label className="form-label" htmlFor="username-password">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="username-password"
                    className="form-input"
                    type={showUsernamePw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={usernameForm.password}
                    onChange={(e) => setUsernameForm({ ...usernameForm, password: e.target.value })}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowUsernamePw(!showUsernamePw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--color-text-subtle)', padding: 0, border: 'none', cursor: 'pointer' }}>
                    {showUsernamePw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="settings-box-footer">
              <p>You will be logged out after updating to apply changes securely.</p>
              <button
                id="update-username-btn"
                type="submit"
                className="btn btn-primary"
                disabled={usernameLoading}
              >
                {usernameLoading ? <><span className="spinner" />&nbsp;Saving…</> : 'Update Username'}
              </button>
            </div>
          </form>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Change Email Address"
        description="Request a secure email change link."
        icon={<Mail size={18} style={{ color: 'var(--color-primary)' }} />}
      >
        <div className="settings-box">
          <form id="change-email-form" onSubmit={handleEmailChange}>
            <div className="settings-box-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ maxWidth: 400 }}>
                <label className="form-label" htmlFor="email-current-password">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email-current-password"
                    className="form-input"
                    type={showEmailPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={emailForm.currentPassword}
                    onChange={(e) => setEmailForm({ currentPassword: e.target.value })}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowEmailPw(!showEmailPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--color-text-subtle)', padding: 0, border: 'none', cursor: 'pointer' }}>
                    {showEmailPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="settings-box-footer">
              <p>For security, we will send a verification link to your <strong>current</strong> email address first.</p>
              <button id="change-email-btn" type="submit" className="btn btn-secondary" disabled={emailLoading || emailLinkSent}>
                {emailLoading ? <><span className="spinner" />&nbsp;Sending…</> : emailLinkSent ? 'Link Sent ✓' : 'Send Link'}
              </button>
            </div>
          </form>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Change Password"
        description="Request a secure password change link."
        icon={<Lock size={18} style={{ color: 'var(--color-primary)' }} />}
      >
        <div className="settings-box">
          <form id="change-password-form" onSubmit={handlePasswordChange}>
            <div className="settings-box-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ maxWidth: 400 }}>
                <label className="form-label" htmlFor="current-password">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="current-password"
                    className="form-input"
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ currentPassword: e.target.value })}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--color-text-subtle)', padding: 0, border: 'none', cursor: 'pointer' }}>
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-box-footer">
              <p>We will send a secure link to your email to set a new password.</p>
              <button id="change-password-btn" type="submit" className="btn btn-secondary" disabled={pwLoading || passwordLinkSent}>
                {pwLoading ? <><span className="spinner" />&nbsp;Sending…</> : passwordLinkSent ? 'Link Sent ✓' : 'Send Password Link'}
              </button>
            </div>
          </form>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Session Management"
        description="Log out of the current session or terminate all active sessions across devices."
        icon={<MonitorSmartphone size={18} style={{ color: 'var(--color-primary)' }} />}
      >
        <div className="settings-box">
          <div className="settings-box-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Logout current session */}
            <div className="danger-zone-row">
              <div className="danger-zone-text">
                <h3 className="danger-zone-title" style={{ color: 'var(--color-text)' }}>Log Out</h3>
                <p className="danger-zone-desc">
                  End your current session on this device. You'll need to sign in again.
                </p>
              </div>
              <button
                id="logout-current-btn"
                className="btn btn-secondary danger-zone-action"
                onClick={handleLogout}
                disabled={logoutLoading}
                style={{ gap: 6 }}
              >
                {logoutLoading
                  ? <><span className="spinner" />&nbsp;Logging out…</>
                  : <><LogOut size={16} />Log Out</>}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', margin: 0 }} />

            {/* Logout all sessions */}
            <div className="danger-zone-row">
              <div className="danger-zone-text">
                <h3 className="danger-zone-title" style={{ color: 'var(--color-error)' }}>Log Out All Devices</h3>
                <p className="danger-zone-desc">
                  Terminate every active session including this one. Use this if you suspect unauthorized access.
                </p>
              </div>
              <button
                id="logout-all-btn"
                className="btn btn-danger danger-zone-action"
                onClick={() => setShowLogoutAllModal(true)}
                style={{ gap: 6 }}
              >
                <LogOut size={16} />Log Out All
              </button>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <div className="settings-section">
        <div className="settings-box danger-zone-box">
          <div className="settings-box-content danger-zone-row">
            <div className="danger-zone-text">
              <h3 className="danger-zone-title">Deactivate Account</h3>
              <p className="danger-zone-desc">
                This will immediately log you out and disable your links. You can reactivate by logging in.
              </p>
            </div>
            <button
              id="deactivate-account-btn"
              className="btn btn-danger danger-zone-action"
              onClick={() => setShowDeactivateModal(true)}
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>

      {showDeactivateModal && (
        <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <AlertTriangle size={40} style={{ color: 'var(--color-error)', margin: '0 auto 12px' }} />
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Deactivate Account?</h2>
              <p className="text-muted" style={{ marginTop: 8, fontSize: '0.9rem' }}>
                Your account will be deactivated. You can reactivate it by logging in again.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button id="cancel-deactivate-btn" className="btn btn-secondary" onClick={() => setShowDeactivateModal(false)}>
                Cancel
              </button>
              <button
                id="confirm-deactivate-btn"
                className="btn btn-danger"
                onClick={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating ? <><span className="spinner" />&nbsp;Deactivating…</> : 'Yes, Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutAllModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutAllModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <AlertTriangle size={40} style={{ color: 'var(--color-error)', margin: '0 auto 12px' }} />
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Log Out All Devices?</h2>
              <p className="text-muted" style={{ marginTop: 8, fontSize: '0.9rem' }}>
                This will terminate all active sessions across every device, including this one. You'll need to sign in again everywhere.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button id="cancel-logout-all-btn" className="btn btn-secondary" onClick={() => setShowLogoutAllModal(false)}>
                Cancel
              </button>
              <button
                id="confirm-logout-all-btn"
                className="btn btn-danger"
                onClick={handleLogoutAll}
                disabled={logoutAllLoading}
                style={{ gap: 6 }}
              >
                {logoutAllLoading ? <><span className="spinner" />&nbsp;Logging out…</> : <><LogOut size={16} />Yes, Log Out All</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
