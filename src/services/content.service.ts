import { resolveApiBase } from './api';

const API_BASE = resolveApiBase();

export interface Creation {
  id: string;
  type_code: string;
  type_name: string;
  title: string;
  description: string | null;
  status: 'draft' | 'processing' | 'moderation' | 'published' | 'updated' | 'archived';
  published_at: string | null;
  created_at: string;
}

export async function getMyCreations(token: string): Promise<Creation[]> {
  const response = await fetch(`${API_BASE}/creations/mine`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || response.statusText || 'Request failed');
  }

  return (payload?.creations ?? []) as Creation[];
}

export async function createPost(token: string, title: string, description?: string): Promise<Creation> {
  const response = await fetch(`${API_BASE}/creations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description: description || undefined }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || response.statusText || 'Request failed');
  }

  return payload as Creation;
}
