'use client';
import React, { useState, useMemo } from 'react';
import { likePost, unlikePost, deletePost, type Post } from '../../../services/posts.service';
import { sanitize } from 'isomorphic-dompurify';
import CommentList from '../CommentList';
import PostForm from '../PostForm';

interface PostItemProps {
  post: Post;
  currentAccountId?: string;
  onUpdated?: (post: Post) => void;
  onDeleted?: (id: string) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('ar', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
}

// Post body is now rich HTML from the TipTap editor. Render it sanitized so a
// malicious user can't smuggle in <script>/<iframe> via the body field.
// isomorphic-dompurify works on both server and client renders.
function PostBody({ html }: { html: string }) {
  const safe = useMemo(() => sanitize(html, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'span', 'mark'], ALLOWED_ATTR: ['href', 'target', 'style', 'class'] }), [html]);
  return <div className="prose prose-sm max-w-none text-[#4A4436] [&_blockquote]:border-r-2 [&_blockquote]:border-[#C69A3E] [&_blockquote]:bg-[#FBF7EC] [&_blockquote]:pr-3 [&_blockquote]:py-1 [&_blockquote]:rounded-l-lg [&_blockquote]:not-italic [&_blockquote]:text-[#4A4436] [&_blockquote]:my-2 [&_a]:text-[#C69A3E] [&_a]:underline [&_a]:font-medium [&_p]:my-1 [&_p]:leading-relaxed" dangerouslySetInnerHTML={{ __html: safe }} />;
}

export default function PostItem({ post, currentAccountId, onUpdated, onDeleted }: PostItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isOwner = post.author?.account_id === currentAccountId;

  const toggleLike = async () => {
    const token = localStorage.getItem('niblan_token');
    if (!token || likeBusy) return;
    setLikeBusy(true);
    try {
      const updated = post.liked_by_viewer ? await unlikePost(token, post.id) : await likePost(token, post.id);
      onUpdated?.(updated);
    } catch {
      // silent — like state just doesn't change
    } finally {
      setLikeBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    const token = localStorage.getItem('niblan_token');
    if (!token) return;
    try {
      await deletePost(token, post.id);
      onDeleted?.(post.id);
    } catch {
      // silent
    }
  };

  if (isEditing) {
    return (
      <PostForm
        editingPost={post}
        onUpdated={(updated) => {
          onUpdated?.(updated);
          setIsEditing(false);
        }}
        onCancelEdit={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white border border-[#E8DFCB] rounded-2xl p-5">
      {/* Author row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#F8F3E7] border border-[#E8DFCB] flex items-center justify-center text-sm font-semibold text-[#15130D] overflow-hidden">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt={post.author.display_name} className="w-full h-full object-cover" />
            ) : (
              (post.author?.display_name ?? '؟')[0]
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#15130D]">{post.author?.display_name}</p>
            <p className="text-xs text-[#8A8172]">{formatDate(post.published_at ?? post.created_at)}</p>
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-1">
            <button onClick={() => setIsEditing(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#4A4436] hover:text-[#C69A3E] hover:bg-[#FBF7EC] transition-colors" title="تعديل المنشور">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
            </button>
            <button onClick={handleDelete} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#4A4436] hover:text-[#C0392B] hover:bg-[#C0392B]/5 transition-colors" title="حذف المنشور">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Title / body (rich HTML) */}
      {post.title && <h3 className="text-base font-semibold text-[#15130D] mb-1.5">{post.title}</h3>}
      {post.body && <PostBody html={post.body} />}

      {/* Media */}
      {post.media.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {post.media.filter((m) => m.type === 'image' || m.type === 'gif').map((m) => (
              <img key={m.id} src={m.url} alt={m.caption ?? ''} className="w-full h-40 object-cover rounded-xl border border-[#E8DFCB]" />
            ))}
          </div>
          {post.media.filter((m) => m.type === 'audio').map((m) => (
            <audio key={m.id} controls src={m.url} className="w-full" />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-[#E8DFCB]">
        <button onClick={toggleLike} disabled={likeBusy} className="flex items-center gap-1.5 text-sm transition-colors disabled:opacity-60" style={{ color: post.liked_by_viewer ? '#C69A3E' : '#8A8172' }}>
          <svg className="w-4 h-4" fill={post.liked_by_viewer ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span>{post.like_count}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-[#8A8172] hover:text-[#4A4436] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
          <span>{post.comment_count}</span>
        </button>
        <span className="text-xs text-[#B3AB98] mr-auto">
          {post.visibility === 'public' ? 'عام' : post.visibility === 'followers' ? 'المتابعين فقط' : 'خاص'}
        </span>
      </div>

      {showComments && <CommentList postId={post.id} currentAccountId={currentAccountId} />}
    </div>
  );
}
