import type { UserProfile, Qualification } from './auth.service';
import { resolveApiBase } from './api';

const API_BASE = resolveApiBase();

// Every field optional — PATCH semantics, only send what changed.
export interface ProfileUpdatePayload {
  username?: string;
  display_name?: string;
  bio?: string;
  country_code?: string;
  locale?: string;
  timezone?: string;
  gender?: 'male' | 'female' | 'unspecified';
  birth_date?: string; // "YYYY-MM-DD"
  is_profile_public?: boolean;
  // Editable "basic info" extras.
  account_type?: string;
  specialization?: string;
  languages?: string[];
  // Sending an array (even empty) replaces all qualifications; omitting
  // the key leaves them unchanged.
  qualifications?: Qualification[];
}

async function uploadImage(token: string, endpoint: 'avatar' | 'cover', file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/users/me/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // No Content-Type here on purpose: the browser sets the multipart
      // boundary itself when the body is a FormData instance. Setting
      // it manually breaks the upload.
    },
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || response.statusText || 'Upload failed');
  }

  return payload as UserProfile;
}

// Uploads a new profile picture and returns the updated profile
// (including the freshly-resolved avatar_url) so the caller can just
// setUser(result) without a second round trip to GET /users/me.
export async function uploadAvatar(token: string, file: File): Promise<UserProfile> {
  return uploadImage(token, 'avatar', file);
}

// Same idea as uploadAvatar, but for the cover/banner photo.
export async function uploadCover(token: string, file: File): Promise<UserProfile> {
  return uploadImage(token, 'cover', file);
}

// Sends a partial update to the profile (PATCH semantics) and returns
// the updated profile.
export async function updateProfile(token: string, data: ProfileUpdatePayload): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || response.statusText || 'Update failed');
  }

  return payload as UserProfile;
}
