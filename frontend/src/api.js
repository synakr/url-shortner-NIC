import axios from 'axios';
import { broadcastLogout, clearAuthStorage } from './authSync';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Silent Refresh Logic ─────────────────────────────────────────── */

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

/**
 * Force-clear all auth data and redirect to login.
 * Called when refresh itself fails.
 */
const forceLogout = () => {
  clearAuthStorage();
  broadcastLogout();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest.url || '';

    // Skip refresh/forceLogout logic for all auth endpoints
    const isAuthEndpoint = url.includes('/auth/');

    // Only attempt refresh on 401/403 AND if this isn't an auth endpoint
    const status = error.response?.status;

    // Already retried after refresh — session is fully invalid (e.g. tokenVersion bumped)
    if (
      (status === 401 || status === 403) &&
      originalRequest._retry &&
      !isAuthEndpoint
    ) {
      forceLogout();
      return Promise.reject(error);
    }

    // Only attempt refresh on 401/403 AND if this isn't an auth endpoint
    if (
      (status === 401 || status === 403) &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      console.log(`[Auth Interceptor] ${status} detected. Attempting to refresh token...`);
      const storedRefresh = localStorage.getItem('refreshToken');

      // No refresh token stored — just log out
      if (!storedRefresh) {
        console.warn("[Auth Interceptor] No refresh token found. Forcing logout.");
        forceLogout();
        return Promise.reject(error);
      }

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        console.log("[Auth Interceptor] Refresh already in flight. Queueing request...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("[Auth Interceptor] Sending refresh request to backend...");
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken: storedRefresh,
        });
        
        console.log("[Auth Interceptor] Refresh successful. Data received:", data);

        const newAccess = data.accessToken;
        const newRefresh = data.refreshToken;

        if (!newAccess || !newRefresh) {
          console.error("[Auth Interceptor] Missing tokens in backend response!", data);
        }

        localStorage.setItem('token', newAccess);
        localStorage.setItem('refreshToken', newRefresh);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);

        console.log("[Auth Interceptor] Retrying original request:", originalRequest.url);
        return api(originalRequest);
      } catch (refreshError) {
        console.error("[Auth Interceptor] Refresh failed!", refreshError.response?.data || refreshError.message);
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ── Auth ── */
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (email, token, purpose = 'REGISTER') => api.get('/auth/verify-email', { params: { email, token, purpose } }),
  login: (data)    => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken)  => api.post('/auth/logout', { refreshToken }),
  logoutAll: ()            => api.post('/auth/logout-all'),
  requestEmailChange: (data) => api.post('/auth/change-email/request', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetForgotPassword: (data) => api.post('/auth/reset-password', data),
  sendVerificationToNewEmail: (data) => api.post('/auth/change-email/send-verification', data),
};

/* ── URLs ── */
export const urlApi = {
  shorten:    (data)         => api.post('/urls', data),
  getByCode:  (shortCode)    => api.get(`/urls/${shortCode}`),
  deactivate: (id)           => api.patch(`/urls/${id}/deactivate`),
  activate:   (id)           => api.patch(`/urls/${id}/activate`),
  edit:       (id, data)     => api.patch(`/urls/${id}`, data),
};

/* ── User ── */
export const userApi = {
  getMyUrls:        (page = 0, size = 10) => api.get('/users/me/urls', { params: { page, size } }),
  getExpiredUrls:   (page = 0, size = 10) => api.get('/users/me/urls/expired', { params: { page, size } }),
  deactivateAccount: ()                   => api.patch('/users/me/deactivate'),
  updateUsername:   (data)                => api.patch('/users/me/update/username', data),
  requestPasswordChange: (data)           => api.post('/users/me/change-password/request', data),
  confirmPasswordChange: (data)           => api.post('/users/me/change-password/confirm', data),
  getRole:          ()                    => api.get('/users/me/role'),
};

/* ── Analytics ── */
export const analyticsApi = {
  getMyAnalytics:  ()                        => api.get('/analytics/me'),
  getUrlAnalytics: (urlId, page = 0, size = 10) => api.get(`/analytics/${urlId}`, { params: { page, size } }),
  getTopUrls:      (limit = 5)               => api.get('/analytics/me/top', { params: { limit } }),
};

/* ── Admin ── */
export const adminApi = {
  getAllUsers:    () =>  api.get('/admin/users'),
  activateUser:  (id) => api.patch(`/admin/users/${id}/activate`),
  deactivateUser:(id) => api.patch(`/admin/users/${id}/deactivate`),
};

export default api;

/** Lightweight session check — triggers refresh/logout via interceptors if stale. */
export async function validateSession() {
  if (!localStorage.getItem('token')) return true;
  try {
    await api.get('/users/me/role');
    return true;
  } catch {
    return !localStorage.getItem('token');
  }
}
