import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../lib/api';
const AuthContext = createContext(null);
function parseUsername(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || 'Account';
  } catch { return 'Account'; }
}
export function AuthProvider({ children }) {
  const [token, updateToken] = useState(getToken);
  const [username, setUsername] = useState(() => getToken() ? parseUsername(getToken()) : '');
  const logout = useCallback(() => { clearToken(); updateToken(null); setUsername(''); }, []);
  const login = useCallback(async (credentials) => {
    const data = await api('/auth/login', { method: 'POST', token: null, body: JSON.stringify(credentials) });
    const jwt = data?.token || data?.accessToken;
    if (!jwt) throw new Error('Login succeeded but no JWT was returned. Check the backend response.');
    setToken(jwt); updateToken(jwt); setUsername(parseUsername(jwt));
  }, []);
  const register = useCallback(async (details) => {
    return api('/auth/register', { method: 'POST', token: null, body: JSON.stringify(details) });
  }, []);
  useEffect(() => {
    if (!token) return;
    try { const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp * 1000 <= Date.now()) logout();
    } catch { logout(); }
  }, [token, logout]);
  const value = useMemo(() => ({ token, username, login, register, logout }), [token, username, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);