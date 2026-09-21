const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api/v1';

const TOKEN_STORAGE_KEY = 'niblan_token';

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterPayload {
  username: string;
  displayName: string;
  email: string;
  password: string;
  agreeTerms: boolean;
}

export interface AuthResponse {
  token: string;
  id: string;
}

// Mirrors dto.ProfileResponse from GET /api/v1/users/me exactly.
// login_count / last_active from the old public.users table don't exist
// anymore — there's no equivalent column in the real schema.
export interface Qualification {
  id?: string;
  title: string;
  institution?: string | null;
  year?: string | null;
  position: number;
}

// Mirrors dto.ProfileResponse from GET /api/v1/users/me exactly.
// login_count / last_active from the old public.users table don't exist
// anymore — there's no equivalent column in the real schema.
export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  country_code?: string | null;
  locale: string;
  timezone: string;
  gender: 'male' | 'female' | 'unspecified';
  birth_date?: string | null;
  is_profile_public: boolean;
  created_at: string;
  last_login_at?: string | null;
  // Editable "basic info" extras (0002_profile_extras.sql).
  account_type?: string | null;
  specialization?: string | null;
  languages?: string[] | null;
  qualifications?: Qualification[] | null;

  // Read-only counters sourced from users.follows and
  // achievements.account_achievements (not columns on users.profiles).
  follower_count?: number;
  following_count?: number;
  achievement_count?: number;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    const error = payload?.error || response.statusText || 'Request failed';
    throw new Error(error);
  }

  return payload as T;
}

export async function login(data: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });
}

export async function register(data: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: data.username,
      display_name: data.displayName,
      email: data.email,
      password: data.password,
    }),
  });
}

export async function getCurrentUser(token: string): Promise<UserProfile> {
  return request<UserProfile>('/users/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function requestPasswordReset(email: string): Promise<{ token?: string; message?: string }> {
  return request<{ token?: string; message?: string }>(
    '/auth/reset/request',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    }
  );
}

export async function confirmPasswordReset(token: string, password: string): Promise<{ message?: string }> {
  return request<{ message?: string }>(
    '/auth/reset/confirm',
    {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }
  );
}

// ---- Token storage helpers ----
// AuthGuard reads 'niblan_token' directly via localStorage.getItem — these
// helpers just centralize the same key so LoginForm/RegisterForm don't each
// hardcode the string separately.
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}
