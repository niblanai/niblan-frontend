'use client';
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontSize from 'tiptap-extension-font-size';
import Toolbar from './Toolbar';

interface RichTextEditorProps {
  value: string; // HTML content
  onChange: (html: string) => void;
  placeholder?: string;
}

// RichTextEditor wraps TipTap with a cream/gold-styled toolbar (bold,
// italic, underline, font size, color, highlight, link, blockquote-as-quote).
// The editor outputs HTML; that HTML is stored verbatim in posts.body.
export default function RichTextEditor({ value, onChange, placeholder = 'اكتب منشورك هنا...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // starter-kit includes blockquote, bold, italic, heading, etc.
        // We override link separately so we control its behaviour.
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          // Make pasted/typed links visually distinct (gold underline) so
          // the user can see the word "became" a link.
          class: 'text-[#C69A3E] underline font-medium',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize.configure({ types: ['textStyle'] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // editorProps drop the default border styling so our outer card owns it.
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[120px] px-4 py-3 outline-none text-[#211B12] focus:outline-none [&_blockquote]:border-r-2 [&_blockquote]:border-[#C69A3E] [&_blockquote]:bg-[#FBF7EC] [&_blockquote]:pr-3 [&_blockquote]:py-2 [&_blockquote]:rounded-l-lg [&_blockquote]:text-[#4A4436] [&_blockquote]:italic [&_a]:text-[#C69A3E] [&_a]:underline',
      },
    },
  });

  // Keep the editor in sync when the parent resets `value` (e.g. after a
  // successful submit). Without this the old content lingers visually.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // In TipTap v2 the signature is setContent(html, emitUpdate, parseOptions):
      // emitUpdate=false so resetting the content here doesn't fire an extra
      // onUpdate back into the parent (avoids a render loop).
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#E8DFCB] bg-[#FBF7EC] overflow-hidden focus-within:border-[#C69A3E] transition-colors">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      {editor.isEmpty && (
        <p className="pointer-events-none -mt-[120px] mr-4 text-sm text-[#B3AB98]">{placeholder}</p>
      )}
    </div>
  );
}
