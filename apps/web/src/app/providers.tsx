'use client';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { smartkasiTheme } from '../../../../packages/theme/src/smartkasi';
import { AuthProvider } from '@/lib/auth/auth-context';

export type ThemeMode = 'light' | 'dark' | 'system';
const THEME_MODE_KEY = 'smartkasi_theme_mode';

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/** Read/write the app colour mode persisted in localStorage. */
export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used inside <Providers>');
  return ctx;
}

function initialMode(): ThemeMode {
  // Server render and first-time visitors start in LIGHT — the OS preference
  // is only followed when the user explicitly picks "Auto" in the toggle.
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = window.localStorage.getItem(THEME_MODE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {}
  return 'light';
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: (failureCount: number, error: unknown) => {
              // Never retry auth failures
              const status = (error as { status?: number } | null)?.status;
              if (status === 401 || status === 403) return false;
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(THEME_MODE_KEY, next);
    } catch {}
  };

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <Theme theme={smartkasiTheme} mode={mode}>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </AuthProvider>
      </Theme>
    </ThemeModeContext.Provider>
  );
}
