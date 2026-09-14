import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { api, AuthUser, clearAuth, getToken } from '../lib/api';

const AuthContext = createContext<{ user: AuthUser | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> }>(null!);
export const useAuth = () => useContext(AuthContext);
export const homeFor = (user: AuthUser) => user.role === 'admin' ? '/dashboard' : user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);
  const refresh = async () => {
    const request = ++generation.current;
    const token = getToken();
    try {
      const profile = token ? await api.getMe() : null;
      if (request === generation.current && token === getToken()) setUser(profile);
    } catch {
      if (request === generation.current && token === getToken()) { clearAuth(); setUser(null); }
    } finally { if (request === generation.current) setLoading(false); }
  };
  useEffect(() => {
    if (!user) return;
    try {
      const part = getToken()?.split('.')[1];
      if (!part) return;
      const expires = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000;
      const timer = window.setTimeout(clearAuth, Math.max(0, Math.min(expires - Date.now(), 2147483647)));
      return () => clearTimeout(timer);
    } catch { clearAuth(); }
  }, [user]);
  useEffect(() => {
    void refresh();
    const clear = () => { generation.current++; setUser(null); setLoading(false); };
    const sync = () => { void refresh(); };
    window.addEventListener('auth-cleared', clear);
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    const timer = window.setInterval(sync, 60000);
    return () => { window.removeEventListener('auth-cleared', clear); window.removeEventListener('storage', sync); window.removeEventListener('focus', sync); clearInterval(timer); };
  }, []);
  const logout = async () => { try { await api.logout(); } finally { clearAuth(); setUser(null); } };
  return <AuthContext.Provider value={{user, loading, refresh, logout}}>{children}</AuthContext.Provider>;
}
export function AuthGuard({ roles }: { roles?: AuthUser['role'][] }) {
  const {user, loading} = useAuth();
  const location = useLocation();
  if (loading) return <p className="p-12 text-center" role="status">Checking your session…</p>;
  if (!user) {
    const target = location.pathname.startsWith('/student') ? '/student-login' : '/institute-login';
    return <Navigate to={target} state={{from: location.pathname}} replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}
export function GuestGuard() {
  const {user, loading} = useAuth();
  if (loading) return <p className="p-12 text-center">Checking your session…</p>;
  return user ? <Navigate to={homeFor(user)} replace /> : <Outlet />;
}
