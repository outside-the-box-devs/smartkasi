'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService, getSessionUser, hasSession, clearSession, type SessionUser } from './auth-service';

interface AuthContextValue {
  /** null while the session is being restored from storage on first paint */
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session once on mount (client only).
  useEffect(() => {
    setUser(hasSession() ? getSessionUser() : null);
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = await authService.signIn(email, password);
    setUser(u);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, role: string) => {
    const u = await authService.signUp(email, password, fullName, role);
    setUser(u);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
