'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';

interface ToolbarProps {
  editor: Editor;
}

// Small button wrapper — keeps the active (pressed) state styled gold.
function TButton({ active, onClick, title, disabled, children }: { active?: boolean; onClick: () => void; title: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        // Prevent the editor from losing selection (and the command from
        // silently no-op'ing) when a toolbar button is clicked.
        e.preventDefault();
        if (!disabled) onClick();
      }}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? 'bg-[#C69A3E]/15 text-[#C69A3E]' : 'text-[#4A4436] hover:bg-[#EFE8D8]'
      }`}
    >
      {children}
    </button>
  );
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const COLORS = ['#211B12', '#C69A3E', '#B78D34', '#C0392B', '#0ea5e9', '#16a34a', '#7c3aed', '#4A4436'];

export default function Toolbar({ editor }: ToolbarProps) {
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const fsRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);

  // Close the popovers on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fsRef.current && !fsRef.current.contains(e.target as Node)) setShowFontSize(false);
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColors(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('الرابط (URL):', previousUrl ?? 'https://');
    // Cancelled → leave the selection untouched.
    if (url === null) return;
    // Empty → unset the link.
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#E8DFCB] bg-[#F8F3E7]">
      <TButton title="عريض" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <span className="font-bold">B</span>
      </TButton>
      <TButton title="مائل" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic">I</span>
      </TButton>
      <TButton title="خط تحتي" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </TButton>

      <div className="w-px h-5 bg-[#E8DFCB] mx-1" />

      {/* Font size popover */}
      <div className="relative" ref={fsRef}>
        <TButton title="حجم الخط" active={showFontSize} onClick={() => { setShowFontSize((v) => !v); setShowColors(false); editor.chain().focus().run(); }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5L12 5l7.5 14.5M7 14.5h10" /></svg>
        </TButton>
        {showFontSize && (
          <div className="absolute z-20 mt-1 bg-white border border-[#E8DFCB] rounded-lg shadow-lg p-1 grid grid-cols-2 gap-0.5 w-40">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setFontSize(size).run(); setShowFontSize(false); }}
                className="text-xs text-[#4A4436] hover:bg-[#EFE8D8] rounded px-2 py-1 text-right"
                style={{ fontSize: size }}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color popover */}
      <div className="relative" ref={colorRef}>
        <TButton title="لون النص" onClick={() => { setShowColors((v) => !v); setShowFontSize(false); editor.chain().focus().run(); }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25l-3 7.5-3-7.5" /></svg>
        </TButton>
        {showColors && (
          <div className="absolute z-20 mt-1 bg-white border border-[#E8DFCB] rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setShowColors(false); }}
                className="w-6 h-6 rounded border border-[#E8DFCB] hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setShowColors(false); }}
              className="col-span-4 text-[10px] text-[#8A8172] hover:text-[#C0392B] py-1"
            >
              إزالة اللون
            </button>
          </div>
        )}
      </div>

      {/* Highlight (line highlight / marker) */}
      <TButton title="خط تحتي ملوّن" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
      </TButton>

      <div className="w-px h-5 bg-[#E8DFCB] mx-1" />

      <TButton title="رابط" active={editor.isActive('link')} onClick={setLink}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
      </TButton>

      {/* Quote as a block format (linear quote formatting, not a separate field) */}
      <TButton title="اقتباس" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" /></svg>
      </TButton>
    </div>
  );
}
