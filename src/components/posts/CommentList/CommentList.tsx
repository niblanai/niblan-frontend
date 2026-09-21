'use client';
import React, { useEffect, useState } from 'react';
import { getComments, addComment, deleteComment, type Comment } from '../../../services/posts.service';

interface CommentListProps {
  postId: string;
  currentAccountId?: string;
  onCommentAdded?: () => void;
}

export default function CommentList({ postId, currentAccountId, onCommentAdded }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('niblan_token');
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    getComments(token, postId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'تعذر تحميل التعليقات');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem('niblan_token');
    if (!token) return;

    setSubmitting(true);
    try {
      const created = await addComment(token, postId, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment('');
      onCommentAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إضافة التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const token = localStorage.getItem('niblan_token');
    if (!token) return;
    try {
      await deleteComment(token, postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // silent — comment stays visible if delete fails
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
      {loading && <p className="text-xs text-slate-500">جاري تحميل التعليقات...</p>}
      {!loading && error && <p className="text-xs text-red-400">{error}</p>}

      {!loading && comments.map((c) => (
        <div key={c.id} className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-semibold text-white shrink-0 overflow-hidden">
            {c.author?.avatar_url ? (
              <img src={c.author.avatar_url} alt={c.author.display_name} className="w-full h-full object-cover" />
            ) : (
              (c.author?.display_name ?? '؟')[0]
            )}
          </div>
          <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">{c.author?.display_name}</span>
              {c.author?.account_id === currentAccountId && (
                <button onClick={() => handleDelete(c.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <p className="text-sm text-slate-300 mt-0.5">{c.body}</p>
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="اكتب تعليق..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#f43f5e]/50 transition-colors"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-slate-300 hover:bg-white/[0.1] disabled:opacity-50 transition-colors"
        >
          إرسال
        </button>
      </form>
    </div>
  );
}
