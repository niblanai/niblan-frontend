'use client';
import React, { useState } from 'react';
import { createPost, uploadPostMedia, type Post, type MediaAttachmentInput } from '../../../services/posts.service';
import RichTextEditor from '../RichTextEditor';

interface PostFormProps {
  onCreated?: (post: Post) => void;
  // When provided, the form edits this post instead of creating a new one.
  editingPost?: Post | null;
  onUpdated?: (post: Post) => void;
  onCancelEdit?: () => void;
}

interface PendingAttachment {
  fileId: string;
  url: string;
  type: 'image' | 'gif' | 'audio';
  name: string;
}

function mimeToType(mime: string): 'image' | 'gif' | 'audio' | null {
  if (mime === 'image/gif') return 'gif';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  return null;
}

export default function PostForm({ onCreated, editingPost, onUpdated, onCancelEdit }: PostFormProps) {
  const isEditing = !!editingPost;

  const [title, setTitle] = useState(editingPost?.title ?? '');
  // body is now rich HTML (from TipTap). Empty editor → '<p></p>', which
  // we treat as "no body" at submit time.
  const [body, setBody] = useState(editingPost?.body ?? '');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>(editingPost?.visibility ?? 'public');
  const [attachments, setAttachments] = useState<PendingAttachment[]>(
    (editingPost?.media ?? []).map((m) => ({ fileId: m.id, url: m.url, type: m.type === 'video' ? 'image' : m.type, name: m.caption ?? 'media' })),
  );
  const [uploading, setUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    const token = localStorage.getItem('niblan_token');
    if (!token) return;

    setError(null);
    setUploading(true);
    try {
      for (const file of files) {
        const type = mimeToType(file.type);
        if (!type) {
          setError('نوع الملف غير مدعوم — صور، GIF، أو صوت بس');
          continue;
        }
        const { file_id, url } = await uploadPostMedia(token, file);
        setAttachments((prev) => [...prev, { fileId: file_id, url, type, name: file.name }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (fileId: string) => {
    setAttachments((prev) => prev.filter((a) => a.fileId !== fileId));
  };

  const isBodyEmpty = (html: string) => {
    const trimmed = html.replace(/<[^>]*>/g, '').trim();
    return trimmed.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('niblan_token');
    if (!token) return;

    if (!title.trim() && isBodyEmpty(body) && attachments.length === 0) {
      setError('اكتب حاجة أو ضيف صورة الأول');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const media: MediaAttachmentInput[] = attachments.map((a, i) => ({
        file_id: a.fileId,
        type: a.type,
        position: i,
      }));

      if (isEditing && editingPost) {
        // Edit mode: PATCH the post with the full new media set.
        const { updatePost } = await import('../../../services/posts.service');
        const updated = await updatePost(token, editingPost.id, {
          title: title.trim() || undefined,
          body: isBodyEmpty(body) ? undefined : body,
          visibility,
          media,
        });
        onUpdated?.(updated);
      } else {
        const created = await createPost(token, {
          title: title.trim() || undefined,
          body: isBodyEmpty(body) ? undefined : body,
          visibility,
          media,
        });
        onCreated?.(created);
      }

      // Reset after a successful create (edit callers handle their own reset
      // via the key remount from the parent).
      setTitle('');
      setBody('');
      setAttachments([]);
      onCancelEdit?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل نشر المنشور');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E8DFCB] rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#15130D]">
          {isEditing ? 'تعديل المنشور' : 'إنشاء منشور'}
        </h3>
        {isEditing && (
          <button type="button" onClick={onCancelEdit} className="text-xs text-[#8A8172] hover:text-[#C0392B] transition-colors">
            إلغاء التعديل
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-[#C0392B]/30 bg-[#C0392B]/10 p-3 text-sm text-[#C0392B]">{error}</div>
      )}

      <input
        type="text"
        placeholder="عنوان المنشور (اختياري)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={300}
        className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] placeholder-[#B3AB98] outline-none focus:border-[#C69A3E] transition-colors"
      />

      <RichTextEditor value={body} onChange={setBody} />

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div key={a.fileId} className="relative">
              {a.type === 'audio' ? (
                <div className="w-40 bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl p-2 text-xs text-[#4A4436] truncate">🎵 {a.name}</div>
              ) : (
                <img src={a.url} alt={a.name} className="w-20 h-20 object-cover rounded-xl border border-[#E8DFCB]" />
              )}
              <button
                type="button"
                onClick={() => removeAttachment(a.fileId)}
                className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#15130D]/80 text-white flex items-center justify-center text-xs hover:bg-[#C0392B] transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer text-[#4A4436] hover:text-[#C69A3E] transition-colors" title="أضف صورة أو GIF أو صوت">
            <input type="file" accept="image/*,audio/*" multiple className="hidden" onChange={handleFilesSelected} disabled={uploading} />
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'public' | 'followers' | 'private')}
            className="bg-[#FBF7EC] border border-[#E8DFCB] rounded-lg py-1.5 px-2 text-xs text-[#4A4436] outline-none focus:border-[#C69A3E]"
          >
            <option value="public">عام</option>
            <option value="followers">المتابعين فقط</option>
            <option value="private">خاص</option>
          </select>
          {uploading && <span className="text-xs text-[#8A8172]">جاري رفع الملف...</span>}
        </div>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="px-5 py-2.5 rounded-xl bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? 'جاري الحفظ...' : isEditing ? 'حفظ التعديلات' : 'نشر'}
        </button>
      </div>
    </form>
  );
}
