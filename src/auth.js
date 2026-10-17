import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, getSession, saveSession, setUnauthorizedHandler } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 'checking' until the stored session has been confirmed by the server.
  const [status, setStatus] = useState(() => (getSession() ? 'checking' : 'out'));

  const logout = useCallback(() => {
    saveSession(null);
    setStatus('out');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (getSession()) {
      api.me().then(() => setStatus('in'), logout);
    }
  }, [logout]);

  const login = useCallback(async (username, password) => {
    const session = await api.login(username, password);
    saveSession(session);
    setStatus('in');
  }, []);

  const value = useMemo(() => ({ status, login, logout }), [status, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <p className="state-message">Checking your session…</p>;
  if (status !== 'in') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
