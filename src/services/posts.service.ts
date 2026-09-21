const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api/v1';

export interface Author {
  account_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Media {
  id: string;
  type: 'image' | 'gif' | 'audio' | 'video';
  url: string;
  position: number;
  caption: string | null;
  mime_type: string;
}

export interface Quote {
  id: string;
  quote_text: string;
  attribution: string | null;
  position: number;
}

export interface Post {
  id: string;
  title: string | null;
  body: string | null;
  visibility: 'public' | 'followers' | 'private';
  status: 'draft' | 'published' | 'archived';
  like_count: number;
  comment_count: number;
  liked_by_viewer: boolean;
  published_at: string | null;
  created_at: string;
  author: Author | null;
  media: Media[];
  quotes: Quote[];
}

export interface Comment {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
  author: Author | null;
}

export interface MediaAttachmentInput {
  file_id: string;
  type: 'image' | 'gif' | 'audio' | 'video';
  position: number;
  caption?: string;
}

export interface QuoteInput {
  quote_text: string;
  attribution?: string;
  position: number;
}

export interface CreatePostInput {
  title?: string;
  body?: string;
  visibility?: 'public' | 'followers' | 'private';
  media?: MediaAttachmentInput[];
  quotes?: QuoteInput[];
}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || response.statusText || 'Request failed');
  }
  return payload as T;
}

// ---- media upload (call this first for each file, then pass the
// returned file_id into createPost's media[]) ----
export async function uploadPostMedia(token: string, file: File): Promise<{ file_id: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/posts/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || response.statusText || 'Upload failed');
  }
  return payload as { file_id: string; url: string };
}

export async function createPost(token: string, input: CreatePostInput): Promise<Post> {
  return request<Post>('/posts', token, { method: 'POST', body: JSON.stringify(input) });
}

export interface UpdatePostInput {
  title?: string;
  body?: string;
  visibility?: 'public' | 'followers' | 'private';
  media?: MediaAttachmentInput[];
}

// Edits an existing post via PATCH /posts/:id. Omitted fields are left
// unchanged server-side; a provided media array fully replaces the old one.
export async function updatePost(token: string, id: string, input: UpdatePostInput): Promise<Post> {
  return request<Post>(`/posts/${id}`, token, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function getMyPosts(token: string): Promise<Post[]> {
  const data = await request<{ posts: Post[] }>('/posts/mine', token, { method: 'GET' });
  return data.posts;
}

export async function getFeed(token: string, limit = 20, offset = 0): Promise<Post[]> {
  const data = await request<{ posts: Post[] }>(`/posts/feed?limit=${limit}&offset=${offset}`, token, { method: 'GET' });
  return data.posts;
}

export async function getPost(token: string, id: string): Promise<Post> {
  return request<Post>(`/posts/${id}`, token, { method: 'GET' });
}

export async function deletePost(token: string, id: string): Promise<void> {
  await request<void>(`/posts/${id}`, token, { method: 'DELETE' });
}

export async function likePost(token: string, id: string): Promise<Post> {
  return request<Post>(`/posts/${id}/like`, token, { method: 'POST' });
}

export async function unlikePost(token: string, id: string): Promise<Post> {
  return request<Post>(`/posts/${id}/like`, token, { method: 'DELETE' });
}

export async function addComment(token: string, postId: string, body: string, parentCommentId?: string): Promise<Comment> {
  return request<Comment>(`/posts/${postId}/comments`, token, {
    method: 'POST',
    body: JSON.stringify({ body, parent_comment_id: parentCommentId }),
  });
}

export async function getComments(token: string, postId: string): Promise<Comment[]> {
  const data = await request<{ comments: Comment[] }>(`/posts/${postId}/comments`, token, { method: 'GET' });
  return data.comments;
}

export async function deleteComment(token: string, postId: string, commentId: string): Promise<void> {
  await request<void>(`/posts/${postId}/comments/${commentId}`, token, { method: 'DELETE' });
}
