'use client';
import React, { useState, useRef, useEffect } from 'react';
import CreatePostModal from '../../posts/CreatePostModal';

interface CreateMenuProps {
  locale: string;
  // "header" = compact gold pill button (top bar); "sidebar" = full-width
  // dark-menu button. Same menu + modal either way.
  variant?: 'header' | 'sidebar';
}

// Replaces the dead /create links in the Header and Sidebar with a real
// dropdown menu. Today it only offers "create post" (which opens the
// CreatePostModal); the options array is structured so more creation types
// (book, article, podcast, ...) can be appended later without touching the
// menu wiring.
export default function CreateMenu({ locale, variant = 'header' }: CreateMenuProps) {
  const [open, setOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isArabic = locale === 'ar';

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const options = [
    {
      id: 'post',
      label: isArabic ? 'إنشاء منشور' : 'Create post',
      desc: isArabic ? 'شارك فكرة، مقال أو اقتباس' : 'Share a thought, article or quote',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
      ),
      onSelect: () => {
        setOpen(false);
        setPostModalOpen(true);
      },
    },
    // Placeholder slots for future creation types — disabled until built.
    {
      id: 'book',
      label: isArabic ? 'كتاب تفاعلي' : 'Interactive book',
      desc: isArabic ? 'قريباً' : 'Coming soon',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
      ),
      disabled: true,
      onSelect: () => {},
    },
    {
      id: 'article',
      label: isArabic ? 'مقال' : 'Article',
      desc: isArabic ? 'قريباً' : 'Coming soon',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
      ),
      disabled: true,
      onSelect: () => {},
    },
  ];

  const trigger = variant === 'sidebar' ? (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="mt-2 w-full flex items-center justify-center gap-1.5 bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] font-semibold text-sm py-2.5 rounded-xl transition"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      {isArabic ? 'إنشاء محتوى' : 'Create content'}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="hidden sm:flex items-center gap-1.5 bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] font-semibold text-sm px-4 py-2 rounded-full transition"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      {isArabic ? 'إنشاء' : 'Create'}
    </button>
  );

  return (
    <div className="relative" ref={containerRef}>
      {trigger}

      {open && (
        <div className="absolute z-50 mt-2 w-64 bg-white border border-[#E8DFCB] rounded-xl shadow-lg p-1.5 end-0">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={opt.disabled}
              onClick={opt.onSelect}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-[#FBF7EC]"
            >
              <span className="w-9 h-9 rounded-lg bg-[#C69A3E]/10 text-[#C69A3E] flex items-center justify-center shrink-0">
                {opt.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#15130D]">{opt.label}</span>
                <span className="block text-[11px] text-[#8A8172]">{opt.desc}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <CreatePostModal open={postModalOpen} onClose={() => setPostModalOpen(false)} />
    </div>
  );
}
