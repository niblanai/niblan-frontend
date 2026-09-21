'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  // Max width class for the panel, e.g. "max-w-lg". Defaults to "max-w-xl".
  maxWidth?: string;
}

// A lightweight, dependency-free modal styled to match the home page's
// cream/gold system. Renders a centered panel over a dimmed backdrop; closes
// on backdrop click or Escape. Used by the create-post flow but generic
// enough for any dialog (edit forms, confirmations, etc.).
//
// Renders through a React Portal into document.body: the modal must escape
// any ancestor stacking context (e.g. the sticky z-50 header that hosts the
// CreateMenu dropdown) — otherwise it appears BEHIND the page UI.
export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-xl' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  // createPortal needs the DOM, which only exists after hydration on the
  // client — render nothing until mounted to stay SSR-safe.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} my-8 rounded-2xl bg-white border border-[#E8DFCB] shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFCB]">
            <h2 className="text-base font-semibold text-[#15130D]">{title}</h2>
            <button onClick={onClose} className="text-[#8A8172] hover:text-[#15130D] transition-colors" aria-label="إغلاق">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
