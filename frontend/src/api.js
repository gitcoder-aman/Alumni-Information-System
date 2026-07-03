const API = '/api';

export const getToken   = () => localStorage.getItem('ais_token');
export const getUser    = () => JSON.parse(localStorage.getItem('ais_user') || 'null');
export const saveAuth   = (token, user) => {
  localStorage.setItem('ais_token', token);
  localStorage.setItem('ais_user', JSON.stringify(user));
};
export const clearAuth  = () => {
  localStorage.removeItem('ais_token');
  localStorage.removeItem('ais_user');
};
export const isLoggedIn = () => !!getToken();

export async function apiFetch(endpoint, options = {}) {
  const token   = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res  = await fetch(`${API}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}
