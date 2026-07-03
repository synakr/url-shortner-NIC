import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LOGOUT_BROADCAST_KEY, PROFILE_UPDATE_KEY } from '../authSync';
import { validateSession } from '../api';

export default function AuthSessionSync() {
  const { user, clearSession, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LOGOUT_BROADCAST_KEY && e.newValue) {
        clearSession({ broadcast: false });
        if (!window.location.pathname.startsWith('/login')) {
          navigate('/login', { replace: true });
        }
        return;
      }

      if (e.key === PROFILE_UPDATE_KEY && e.newValue) {
        try {
          const { ts, ...updates } = JSON.parse(e.newValue);
          updateUser(updates, { broadcast: false });
        } catch {
          /* ignore malformed payload */
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [clearSession, updateUser, navigate]);

  // Re-validate when tab regains focus — catches tokenVersion bumps on idle tabs
  useEffect(() => {
    if (!user) return;

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      validateSession().then((valid) => {
        if (!valid && !window.location.pathname.startsWith('/login')) {
          navigate('/login', { replace: true });
        }
      });
    };

    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user, navigate]);

  return null;
}
