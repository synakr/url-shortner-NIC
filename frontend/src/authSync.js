export const LOGOUT_BROADCAST_KEY = 'auth:logout';
export const PROFILE_UPDATE_KEY = 'auth:profile-update';

export function broadcastLogout() {
  localStorage.setItem(LOGOUT_BROADCAST_KEY, String(Date.now()));
}

export function broadcastProfileUpdate(updates) {
  localStorage.setItem(PROFILE_UPDATE_KEY, JSON.stringify({ ...updates, ts: Date.now() }));
}

export function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}
