import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { api, AuthUser, clearAuth, getToken } from '../lib/api';
import { BrandLoader } from '../components/common/BrandLoader';

const AuthContext = createContext<{ 
  user: AuthUser | null; 
  loading: boolean; 
  refresh: (force?: boolean) => Promise<void>; 
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}>(null!);
export const useAuth = () => useContext(AuthContext);
export const homeFor = (user: AuthUser) => 
  user.role === 'admin' ? '/dashboard' : 
  user.role === 'teacher' ? '/teacher/dashboard' : 
  '/student/dashboard';
export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('cfsi_auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const token = getToken();
    const raw = localStorage.getItem('cfsi_auth_user');
    return Boolean(token && !raw);
  });
  const generation = useRef(0);
  const lastRefreshRef = useRef<number>(0);
  const isRefreshingRef = useRef(false);
  const refresh = async (force = false) => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const now = Date.now();
    if (isRefreshingRef.current) return;
    // Throttle duplicate calls within 5 minutes unless forced, but never throttle if user is null
    if (!force && user && now - lastRefreshRef.current < 300000) {
      return;
    }
    isRefreshingRef.current = true;
    lastRefreshRef.current = now;
    const request = ++generation.current;
    try {
      const profile = await api.getMe();
      if (request === generation.current && token === getToken()) {
        setUser(profile);
        try {
          localStorage.setItem('cfsi_auth_user', JSON.stringify(profile));
        } catch {}
      }
    } catch {
      if (request === generation.current && token === getToken()) { clearAuth(); setUser(null); }
    } finally {
      if (request === generation.current) setLoading(false);
      isRefreshingRef.current = false;
    }
  };
  useEffect(() => {
    if (!user) return;
    try {
      const part = getToken()?.split('.')[1];
      if (!part) return;
      const parsed = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
      if (!parsed.exp) return;
      const expires = parsed.exp * 1000;
      const timer = window.setTimeout(clearAuth, Math.max(0, Math.min(expires - Date.now(), 2147483647)));
      return () => clearTimeout(timer);
    } catch { clearAuth(); }
  }, [user]);
  useEffect(() => {
    void refresh(true);
    const clear = () => { generation.current++; setUser(null); setLoading(false); };
    const onAuthSync = () => {
      try {
        const raw = localStorage.getItem('cfsi_auth_user');
        if (raw) setUser(JSON.parse(raw));
      } catch {}
      void refresh(true);
    };
    window.addEventListener('auth-cleared', clear);
    window.addEventListener('auth-changed', onAuthSync);
    window.addEventListener('storage', onAuthSync);
    const timer = window.setInterval(() => { void refresh(false); }, 300000);
    return () => {
      window.removeEventListener('auth-cleared', clear);
      window.removeEventListener('auth-changed', onAuthSync);
      window.removeEventListener('storage', onAuthSync);
      clearInterval(timer);
    };
  }, []);
  const logout = async () => {
    clearAuth();
    setUser(null);
    api.clearCache();
    void api.logout().catch(() => {});
  };
  return <AuthContext.Provider value={{user, loading, refresh, logout, setUser}}>{children}</AuthContext.Provider>;
}
export function AuthGuard({ roles }: { roles?: AuthUser['role'][] }) {
  const {user, loading} = useAuth();
  const location = useLocation();
  if (loading) {
    return <BrandLoader size="page" message="Loading..." />;
  }
  if (!user) {
    const target = location.pathname.startsWith('/student') ? '/student-login' : '/institute-login';
    return <Navigate to={target} state={{from: location.pathname}} replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}
export function GuestGuard() {
  const {user, loading} = useAuth();
  if (loading) {
    return <BrandLoader size="page" message="Loading..." />;
  }
  return user ? <Navigate to={homeFor(user)} replace /> : <Outlet />;
}
