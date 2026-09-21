'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, UserProfile } from '../services/auth.service';

// Module-level cache shared by every consumer mounted on the page (Header,
// Sidebar, ...) so GET /users/me fires once per session instead of once per
// component. ProfileHeader keeps its own copy because it needs refresh
// semantics after edits.
let cached: Promise<UserProfile> | null = null;

function fetchCurrentUser(): Promise<UserProfile> {
  const token = localStorage.getItem('niblan_token');
  if (!token) return Promise.reject(new Error('no token'));
  return getCurrentUser(token);
}

/** Invalidates the shared cache so the next mount refetches. */
export function refreshCurrentUser(): void {
  cached = null;
}

export function useCurrentUser(): {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
} {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!cached) {
      cached = fetchCurrentUser();
    }
    cached
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'failed to load user');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading, error };
}

export const formatCount = (n: number | undefined): string =>
  (n ?? 0).toLocaleString('en-US');
