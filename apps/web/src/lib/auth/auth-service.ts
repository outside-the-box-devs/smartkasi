// Supabase Auth (GoTrue) session management.
// The web app talks to GoTrue for identity only — all data flows through the
// SmartKasi API with the resulting access token.

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const TOKEN_KEY = 'smartkasi_token';
const REFRESH_KEY = 'smartkasi_refresh_token';
const USER_KEY = 'smartkasi_user';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

interface GoTrueTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user: { id: string; email: string; app_metadata?: { role?: string } };
}

function saveSession(t: GoTrueTokenResponse): SessionUser {
  const user: SessionUser = {
    id: t.user.id,
    email: t.user.email,
    role: t.user.app_metadata?.role ?? 'customer',
  };
  localStorage.setItem(TOKEN_KEY, t.access_token);
  if (t.refresh_token) localStorage.setItem(REFRESH_KEY, t.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as SessionUser | null;
  } catch {
    return null;
  }
}

export function hasSession(): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem(TOKEN_KEY);
}

async function gotune(path: string, body: unknown): Promise<GoTrueTokenResponse> {
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError('NETWORK', "Can't reach the sign-in service.");
  }

  const json = await res.json().catch(() => ({}) as any);
  if (!res.ok) {
    const msg = String(json.msg ?? json.error_description ?? json.error ?? '');
    // Map common cases to friendly copy
    if (/invalid login credentials/i.test(msg)) throw new AuthError('BAD_CREDENTIALS', 'WRONG_PASSWORD');
    if (/already registered/i.test(msg)) throw new AuthError('EMAIL_TAKEN', 'EMAIL_TAKEN');
    if (/password.*short|at least/i.test(msg)) throw new AuthError('WEAK_PASSWORD', 'WEAK_PASSWORD');
    throw new AuthError('UNKNOWN', 'GENERIC');
  }
  return json as GoTrueTokenResponse;
}

export class AuthError extends Error {
  constructor(public code: string, public uiCode: string) {
    super(code);
    this.name = 'AuthError';
  }
}

export const authService = {
  async signIn(email: string, password: string): Promise<SessionUser> {
    const t = await gotune('/token?grant_type=password', { email, password });
    return saveSession(t);
  },

  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: string,
  ): Promise<SessionUser> {
    const t = await gotune('/signup', {
      email,
      password,
      data: { full_name: fullName, role },
    });
    return saveSession(t);
  },

  async signOut(): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (token) {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout?scope=global`, {
          method: 'POST',
          headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    clearSession();
  },
};
