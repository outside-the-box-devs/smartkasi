// Typed fetch wrapper for the SmartKasi API.
// - Injects the Bearer token from the auth session
// - Normalizes errors into ApiError
// - On 401, clears the session and redirects to /auth/login (once)

import { clearSession } from '../auth/auth-service';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string | null,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('smartkasi_token');
}

let redirecting = false;

function handleUnauthorized() {
  clearSession();
  if (typeof window !== 'undefined' && !redirecting) {
    redirecting = true;
    // Deliberate hard reload: session expiry must reset all in-memory app
    // state (React Query caches, stores). This runs outside React, so
    // next/navigation's router is not available here.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign('/auth/login?reason=expired');
  }
}

type Opts = RequestInit & { token?: string };

export async function apiFetch<T>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opts.headers as Record<string, string>) ?? {}),
  };
  const token = opts.token ?? getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Network error — check your connection.');
  }

  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    let code: string | null = null;
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      code = body?.error?.code ?? body?.code ?? null;
      message = body?.error?.message ?? body?.message ?? message;
    } catch {}
    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Unwrap `{ data, meta }` envelopes; pass through bare payloads. */
export function unwrap<T>(body: any): T {
  return (body && typeof body === 'object' && 'data' in body ? body.data : body) as T;
}

/** Read a value in either snake_case or camelCase (API mixes both). */
export function pick<T = any>(obj: Record<string, any>, snakeKey: string): T {
  const camel = snakeKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  return (obj[snakeKey] ?? obj[camel]) as T;
}
