'use client';

import { useRouter } from 'next/navigation';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, tokenStore } from './api';
import { Role, User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  propertyType?: 'residential' | 'commercial';
  companyName?: string;
  address?: { line1: string; line2?: string; city: string; state: string; zip: string };
}

const AuthContext = createContext<AuthState | null>(null);

/** Where each role lands after signing in. */
export const HOME_FOR: Record<Role, string> = {
  customer: '/dashboard/customer',
  technician: '/dashboard/technician',
  dispatcher: '/dashboard/dispatcher',
  admin: '/dashboard/admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await api.get<User>('/auth/me'));
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await api.post<{ token: string; user: User }>('/auth/register', input);
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, setUser }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/**
 * Client-side route guard for dashboards. Redirects anonymous visitors to the
 * login screen and sends signed-in users to their own dashboard if they land on
 * someone else's.
 */
export function useRequireRole(...roles: Role[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (roles.length && !roles.includes(user.role)) {
      router.replace(HOME_FOR[user.role]);
    }
  }, [user, loading, roles, router]);

  return { user, loading: loading || !user };
}
