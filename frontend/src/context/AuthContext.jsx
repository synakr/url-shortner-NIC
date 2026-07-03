import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userApi, authApi } from '../api';
import { broadcastLogout, clearAuthStorage, broadcastProfileUpdate } from '../authSync';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });

  useEffect(() => {
    // If we have a user but no role, fetch it
    if (user && !user.role) {
      userApi.getRole().then(res => {
        // Spring Security often returns roles like "[ROLE_ADMIN]" or "ROLE_ADMIN"
        let roleStr = res.data;
        if (roleStr.startsWith('[')) {
          roleStr = roleStr.substring(1, roleStr.length - 1);
        }
        if (roleStr.startsWith('ROLE_')) {
          roleStr = roleStr.substring(5);
        }
        
        const updatedUser = { ...user, role: roleStr };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }).catch(err => console.error("Failed to fetch role", err));
    }
  }, [user]);

  const login = async (userData, accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Attempt to fetch role immediately during login
    let roleStr = '';
    try {
      const res = await userApi.getRole();
      roleStr = res.data;
      if (roleStr.startsWith('[')) {
        roleStr = roleStr.substring(1, roleStr.length - 1);
      }
      if (roleStr.startsWith('ROLE_')) {
        roleStr = roleStr.substring(5);
      }
    } catch(err) {
      console.error("Failed to fetch role during login", err);
    }

    const fullUserData = { ...userData, role: roleStr };
    localStorage.setItem('user', JSON.stringify(fullUserData));
    setUser(fullUserData);
  };

  const updateUser = useCallback((updates, { broadcast = true } = {}) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(next));
      if (broadcast) broadcastProfileUpdate(updates);
      return next;
    });
  }, []);

  const refreshProfile = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored) setUser(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const clearSession = useCallback(({ broadcast = true } = {}) => {
    clearAuthStorage();
    setUser(null);
    if (broadcast) broadcastLogout();
  }, []);

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (err) {
        console.error("Backend logout failed:", err);
      }
    }
    clearSession();
  };

  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
    } catch (err) {
      console.error("Backend logout-all failed:", err);
    }
    // Backend bumps tokenVersion + revokes refresh tokens; clear local state for all tabs
    clearSession();
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, logout, logoutAll, clearSession, updateUser, refreshProfile, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
