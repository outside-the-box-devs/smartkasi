'use client';

// Auth via Supabase Auth (GoTrue) — web calls Supabase directly for JWT, then uses JWT for API calls
// No Supabase DB client in Next.js, only Auth. Data is via backend API (api.ts) with Bearer token.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const STORAGE_KEY = 'smartkasi_token';
const REFRESH_KEY = 'smartkasi_refresh_token';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  access_token: string;
}

async function supabaseAuth(path: string, body: any) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.msg ?? json.error_description ?? json.error ?? `${res.status} ${res.statusText}`);
  return json;
}

export const auth = {
  async login(email: string, password: string): Promise<AuthUser> {
    const data = await supabaseAuth('/token?grant_type=password', { email, password });
    const user: AuthUser = { id: data.user.id, email: data.user.email, role: data.user.app_metadata?.role, access_token: data.access_token };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data.access_token);
      if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
      localStorage.setItem('smartkasi_user', JSON.stringify(user));
    }
    return user;
  },
  async register(email: string, password: string, full_name: string, role: string = 'customer'): Promise<any> {
    // Use GoTrue sign-up, then auto login
    const data = await supabaseAuth('/signup', { email, password, data: { full_name }, gotrue_meta_security: {} });
    // For local, email_confirm is true, so user is confirmed; login
    if (data.access_token) {
      const user: AuthUser = { id: data.user.id, email: data.user.email, role, access_token: data.access_token };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, data.access_token);
        localStorage.setItem('smartkasi_user', JSON.stringify(user));
      }
      return user;
    }
    return data;
  },
  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem('smartkasi_user');
    }
  },
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  },
  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('smartkasi_user') ?? 'null'); } catch { return null; }
  },
  isAuthed(): boolean {
    return !!this.getToken();
  },
};
