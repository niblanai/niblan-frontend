'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { Extension } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { Plugin } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { useRouter } from 'next/navigation';
import {
  AlignLeft,
  AlignRight,
  ArrowLeft,
  ArrowRight,
  Bold,
  ChevronLeft,
  ChevronRight,
  Heading2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Plus,
  Trash2,
  Underline as UnderlineIcon,
} from 'lucide-react';
import {
  BookCategory,
  createBook,
  getBookCategories,
  uploadBookCover,
  uploadBookPageImage,
} from '@/services/books.service';
import { DEFAULT_PAPER_TEXTURE_ID, PAPER_TEXTURES, type PaperTextureId } from '@/lib/books/paperTextures';
import { getPaperTextureStyle } from '@/lib/books/paperTextures';
import { paginateHtmlByTextLimit } from '@/lib/books/paginateHtml';
import BookPagePreview from './BookPagePreview';
import { GiBookmarklet, GiBookCover, GiNotebook } from 'react-icons/gi';
import { BsBook } from 'react-icons/bs';
import { CiGrid42 } from 'react-icons/ci';
import { MdOutlineSubtitles } from 'react-icons/md';
import { PiBookOpenText } from 'react-icons/pi';
import { RiBookShelfLine, RiImageAddFill, RiStarSFill } from 'react-icons/ri';

const PAGE_CHARACTER_LIMIT = 600;

const PageCharacterLimit = Extension.create<{ limit: number }>({
  name: 'pageCharacterLimit',
  addOptions() {
    return { limit: PAGE_CHARACTER_LIMIT };
  },
  addProseMirrorPlugins() {
    const limit = this.options.limit;
    return [
      new Plugin({
        filterTransaction: (transaction) =>
          !transaction.docChanged ||
          Array.from(transaction.doc.textContent).length <= limit,
      }),
    ];
  },
});

const BookImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      float: {
        default: 'right',
        parseHTML: (element) => element.dataset.float || element.style.float || 'right',
        renderHTML: (attributes) => {
          if (attributes.float !== 'left' && attributes.float !== 'right') return {};
          const margin = attributes.float === 'left' ? '0.25rem 0.9rem 0.5rem 0' : '0.25rem 0 0.5rem 0.9rem';
          return {
            'data-float': attributes.float,
            style: `float: ${attributes.float}; margin: ${margin}; width: 40%;`,
          };
        },
      },
      width: {
        default: '40%',
        parseHTML: (element) => element.style.width || element.getAttribute('width') || '40%',
        renderHTML: (attributes) => {
          const width =
            typeof attributes.width === 'string' && /^\d+(?:\.\d+)?%$/.test(attributes.width)
              ? attributes.width
              : '40%';
          return { style: `width: ${width}; max-width: 65%; height: auto;` };
        },
      },
    };
  },
}).configure({ inline: true, allowBase64: false });

type ChapterPageDraft = {
  id: string;
  content: string;
  characters: number;
};

type ChapterDraft = {
  id: string;
  title: string;
  pages: ChapterPageDraft[];
  activePageIndex: number;
};

function ChapterPageEditor({
  page,
  locale,
  paperTextureID,
  isFreeWrite,
  onChange,
  onUploadImage,
  onError,
}: {
  page: ChapterPageDraft;
  locale: string;
  paperTextureID: PaperTextureId;
  isFreeWrite: boolean;
  onChange: (content: string, characters: number) => void;
  onUploadImage: (file: File) => Promise<string>;
  onError: (message: string) => void;
}) {
  const isArabic = locale === 'ar';
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        BookImage,
        PageCharacterLimit.configure({ limit: isFreeWrite ? Number.MAX_SAFE_INTEGER : PAGE_CHARACTER_LIMIT }),
      ],
      content: page.content,
      immediatelyRender: false,
      onUpdate: ({ editor: activeEditor }) =>
        onChange(activeEditor.getHTML(), Array.from(activeEditor.state.doc.textContent).length),
    },
    [page.id, isFreeWrite]
  );
  useEffect(() => {
    if (editor && editor.getHTML() !== page.content) editor.commands.setContent(page.content, false);
  }, [editor, page.content]);

  const handleImageFile = async (file?: File) => {
    if (!file) return;
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      onError(isArabic ? 'اختر صورة JPEG أو PNG أو WebP بحجم أقل من 8 ميجابايت.' : 'Choose a JPEG, PNG, or WebP image under 8 MB.');
      return;
    }
    try {
      const src = await onUploadImage(file);
      editor?.chain().focus().setImage({ src, alt: file.name }).run();
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : (isArabic ? 'تعذر رفع صورة الصفحة.' : 'Could not upload the page image.'));
    }
  };

  const tools = [
    {
      label: isArabic ? 'عريض' : 'Bold',
      icon: Bold,
      run: () => editor?.chain().focus().toggleBold().run(),
      active: editor?.isActive('bold'),
    },
    {
      label: isArabic ? 'مائل' : 'Italic',
      icon: Italic,
      run: () => editor?.chain().focus().toggleItalic().run(),
      active: editor?.isActive('italic'),
    },
    {
      label: isArabic ? 'تحته خط' : 'Underline',
      icon: UnderlineIcon,
      run: () => editor?.chain().focus().toggleUnderline().run(),
      active: editor?.isActive('underline'),
    },
    {
      label: isArabic ? 'عنوان فرعي' : 'Heading',
      icon: Heading2,
      run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor?.isActive('heading', { level: 2 }),
    },
    {
      label: isArabic ? 'قائمة نقطية' : 'Bullet list',
      icon: List,
      run: () => editor?.chain().focus().toggleBulletList().run(),
      active: editor?.isActive('bulletList'),
    },
    {
      label: isArabic ? 'قائمة مرقمة' : 'Numbered list',
      icon: ListOrdered,
      run: () => editor?.chain().focus().toggleOrderedList().run(),
      active: editor?.isActive('orderedList'),
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg shadow-sm border border-[#d6cebd] bg-white">
      <div
        className="flex flex-wrap items-center gap-1 border-b border-[#e6e0d3] bg-[#faf8f2] p-2"
        role="toolbar"
        aria-label={isArabic ? 'أدوات تنسيق النص' : 'Text formatting'}
      >
        {tools.map(({ label, icon: Icon, run, active }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={run}
            className={`grid h-9 w-9 place-items-center transition ${active ? 'bg-[#e8d8ad] text-[#634c17]' : 'text-[#625d53] hover:bg-[#eee9dc]'}`}
          >
            <Icon size={17} aria-hidden="true" />
          </button>
        ))}
        <button
          type="button"
          title={isArabic ? 'إضافة صورة إلى الصفحة' : 'Add an image to the page'}
          aria-label={isArabic ? 'إضافة صورة إلى الصفحة' : 'Add an image to the page'}
          onClick={() => imageInputRef.current?.click()}
          className="grid h-9 w-9 place-items-center text-[#625d53] transition hover:bg-[#eee9dc]"
        >
          <ImagePlus size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          title={isArabic ? 'محاذاة الصورة لليسار' : 'Float image left'}
          aria-label={isArabic ? 'محاذاة الصورة لليسار' : 'Float image left'}
          disabled={!editor?.isActive('image')}
          onClick={() => editor?.chain().focus().updateAttributes('image', { float: 'left' }).run()}
          className="grid h-9 w-9 place-items-center text-[#625d53] transition hover:bg-[#eee9dc] disabled:opacity-30"
        >
          <AlignLeft size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          title={isArabic ? 'محاذاة الصورة لليمين' : 'Float image right'}
          aria-label={isArabic ? 'محاذاة الصورة لليمين' : 'Float image right'}
          disabled={!editor?.isActive('image')}
          onClick={() => editor?.chain().focus().updateAttributes('image', { float: 'right' }).run()}
          className="grid h-9 w-9 place-items-center text-[#625d53] transition hover:bg-[#eee9dc] disabled:opacity-30"
        >
          <AlignRight size={17} aria-hidden="true" />
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => void handleImageFile(event.target.files?.[0])}
        />
      </div>
      <EditorContent
        editor={editor}
        dir={isArabic ? 'rtl' : 'ltr'}
        className="book-editor min-h-[200px] px-5 py-4 text-[15px] leading-8 text-[#302d27] [&_.ProseMirror]:min-h-[255px] [&_.ProseMirror]:outline-none [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:px-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:px-6"
        style={getPaperTextureStyle(paperTextureID)}
      />
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e6e0d3] bg-[#faf8f2] px-4 py-2 text-xs text-[#716b60]"
        aria-live="polite"
      >
        {isFreeWrite ? (
          <span>{isArabic ? `كتبت ${page.characters} حرفًا — ستنتقل الزيادة لصفحات تلقائيًا` : `${page.characters} characters — overflow creates pages automatically`}</span>
        ) : (
          <>
            <span>
              {isArabic
                ? `كتبت ${page.characters} من ${PAGE_CHARACTER_LIMIT} حرفًا`
                : `${page.characters} of ${PAGE_CHARACTER_LIMIT} characters`}
            </span>
            <span>
              {isArabic
                ? `متبقي ${PAGE_CHARACTER_LIMIT - page.characters} حرفًا`
                : `${PAGE_CHARACTER_LIMIT - page.characters} characters remaining`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function BookCreator({ locale = 'ar' }: { locale?: string }) {
  const isArabic = locale === 'ar';
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [paperTextureID, setPaperTextureID] = useState<PaperTextureId>(DEFAULT_PAPER_TEXTURE_ID);
  const [freeWrite, setFreeWrite] = useState(false);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [categoryID, setCategoryID] = useState('');
  const [chapters, setChapters] = useState<ChapterDraft[]>([
    {
      id: 'chapter-1',
      title: '',
      activePageIndex: 0,
      pages: [{ id: 'page-1', content: '<p></p>', characters: 0 }],
    },
  ]);
  const [activeChapter, setActiveChapter] = useState('chapter-1');
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [coverURL, setCoverURL] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingPageImage, setUploadingPageImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getBookCategories()
      .then((items) => {
        if (!active) return;
        setCategories(items);
        setCategoryID(items[0]?.id ?? '');
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : isArabic
                ? 'تعذر تحميل التصنيفات.'
                : 'Could not load categories.'
          );
      });
    return () => {
      active = false;
    };
  }, [isArabic]);

  useEffect(
    () => () => {
      if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    },
    [coverPreview]
  );

  const currentChapter = chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0];
  const currentChapterNumber = chapters.findIndex((chapter) => chapter.id === currentChapter?.id) + 1;
  const currentPage = currentChapter?.pages[currentChapter.activePageIndex];
  const previewPages = useMemo(
    () =>
      freeWrite && typeof window !== 'undefined'
        ? paginateHtmlByTextLimit(currentPage?.content ?? '', PAGE_CHARACTER_LIMIT)
        : [currentPage?.content ?? ''],
    [currentPage?.content, freeWrite]
  );
  const visiblePreviewIndex = Math.min(previewPageIndex, previewPages.length - 1);

  useEffect(() => {
    setPreviewPageIndex(0);
  }, [activeChapter, currentPage?.id, freeWrite]);

  const changeWritingMode = (enabled: boolean) => {
    setFreeWrite(enabled);
    setChapters((current) =>
      current.map((chapter) => {
        if (enabled) {
          const page = {
            id: `${chapter.id}-freewrite`,
            content: chapter.pages.map((item) => item.content).join(''),
            characters: chapter.pages.reduce((count, item) => count + item.characters, 0),
          };
          return { ...chapter, pages: [page], activePageIndex: 0 };
        }
        const content = chapter.pages[0]?.content ?? '<p></p>';
        const contents = paginateHtmlByTextLimit(content, PAGE_CHARACTER_LIMIT);
        return {
          ...chapter,
          pages: contents.map((pageContent, index) => ({
            id: `${chapter.id}-page-${index + 1}`,
            content: pageContent,
            characters: Array.from(new DOMParser().parseFromString(pageContent, 'text/html').body.textContent ?? '').length,
          })),
          activePageIndex: 0,
        };
      })
    );
  };

  const handlePageImageUpload = async (file: File): Promise<string> => {
    const token = localStorage.getItem('niblan_token');
    if (!token) throw new Error(isArabic ? 'سجّل الدخول لإضافة صورة إلى الصفحة.' : 'Sign in to add an image to the page.');
    setError('');
    setUploadingPageImage(true);
    try {
      return await uploadBookPageImage(token, file);
    } finally {
      setUploadingPageImage(false);
    }
  };

  const handlePreviewImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!currentChapter || !currentPage) return;
    const source = event.dataTransfer.getData('text/plain');
    if (!source) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const float = event.clientX < bounds.left + bounds.width / 2 ? 'left' : 'right';
    const parsed = new DOMParser().parseFromString(currentPage.content, 'text/html');
    const image = Array.from(parsed.body.querySelectorAll('img')).find((item) => item.getAttribute('src') === source);
    if (!image) return;
    const sourceParent = image.parentElement;
    const blocks = Array.from(parsed.body.querySelectorAll('p, h1, h2, h3, li, blockquote'));
    const targetElement = document.elementFromPoint(event.clientX, event.clientY);
    const previewBlock = targetElement?.closest('p, h1, h2, h3, li, blockquote');
    const targetText = previewBlock?.textContent?.trim();
    const targetBlock =
      (targetText ? blocks.find((block) => (block.textContent ?? '').trim().includes(targetText)) : undefined) ??
      (sourceParent && blocks.includes(sourceParent) ? sourceParent : blocks[0]);
    if (targetBlock && previewBlock && sourceParent !== targetBlock) {
      const targetBounds = previewBlock.getBoundingClientRect();
      const insertAtStart = event.clientY < targetBounds.top + targetBounds.height / 2;
      image.remove();
      if (sourceParent && sourceParent !== targetBlock && !sourceParent.textContent?.trim() && !sourceParent.querySelector('img')) {
        sourceParent.remove();
      }
      if (insertAtStart) targetBlock.prepend(image);
      else targetBlock.append(image);
    }
    image.dataset.float = float;
    image.style.float = float;
    image.style.width = '40%';
    image.style.margin = float === 'left' ? '0.25rem 0.9rem 0.5rem 0' : '0.25rem 0 0.5rem 0.9rem';
    updatePage(currentChapter.id, currentPage.id, parsed.body.innerHTML, currentPage.characters);
  };

  const handlePreviewImageResize = (source: string, widthPercent: number) => {
    if (!currentChapter || !currentPage) return;
    const parsed = new DOMParser().parseFromString(currentPage.content, 'text/html');
    const image = Array.from(parsed.body.querySelectorAll('img')).find((item) => item.getAttribute('src') === source);
    if (!image) return;
    image.style.width = `${widthPercent}%`;
    image.style.maxWidth = '65%';
    image.style.height = 'auto';
    updatePage(currentChapter.id, currentPage.id, parsed.body.innerHTML, currentPage.characters);
  };

  const updateChapterTitle = (chapterId: string, title: string) => {
    setChapters((current) =>
      current.map((chapter) => (chapter.id === chapterId ? { ...chapter, title } : chapter))
    );
  };

  const updatePage = (
    chapterIDToUpdate: string,
    pageID: string,
    content: string,
    characters: number
  ) => {
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id !== chapterIDToUpdate
          ? chapter
          : {
              ...chapter,
              pages: chapter.pages.map((page) =>
                page.id === pageID ? { ...page, content, characters } : page
              ),
            }
      )
    );
  };

  const addPage = () => {
    if (!currentChapter) return;
    const page = { id: `page-${Date.now()}`, content: '<p></p>', characters: 0 };
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === currentChapter.id
          ? {
              ...chapter,
              pages: [...chapter.pages, page],
              activePageIndex: chapter.pages.length,
            }
          : chapter
      )
    );
  };

  const removePage = () => {
    if (!currentChapter || currentChapter.pages.length <= 1) return;
    setChapters((current) =>
      current.map((chapter) => {
        if (chapter.id !== currentChapter.id) return chapter;
        const pages = chapter.pages.filter((_, index) => index !== chapter.activePageIndex);
        return {
          ...chapter,
          pages,
          activePageIndex: Math.min(chapter.activePageIndex, pages.length - 1),
        };
      })
    );
  };

  const setActivePage = (pageIndex: number) => {
    if (!currentChapter || pageIndex < 0 || pageIndex >= currentChapter.pages.length) return;
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === currentChapter.id ? { ...chapter, activePageIndex: pageIndex } : chapter
      )
    );
  };

  const handleCoverChange = async (file?: File) => {
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      setError(
        isArabic
          ? 'اختر صورة JPEG أو PNG أو WebP بحجم أقل من 8 ميجابايت.'
          : 'Choose a JPEG, PNG, or WebP image under 8 MB.'
      );
      return;
    }
    const token = localStorage.getItem('niblan_token');
    if (!token) {
      setError(isArabic ? 'سجّل الدخول لرفع غلاف الكتاب.' : 'Sign in to upload a book cover.');
      return;
    }
    setError('');
    setCoverPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      setCoverURL(await uploadBookCover(token, file));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : isArabic
            ? 'تعذر رفع الغلاف.'
            : 'Could not upload the cover.'
      );
      setCoverURL('');
    } finally {
      setUploading(false);
    }
  };

  const publish = async () => {
    setError('');
    if (
      !title.trim() ||
      !coverURL ||
      !categoryID ||
      uploading ||
      !chapters.length ||
      chapters.some(
        (chapter) =>
          !chapter.title.trim() ||
          !chapter.pages.length ||
          chapter.pages.some((page) => !page.characters && !/<img\b/i.test(page.content))
      )
    ) {
      setError(
        isArabic
          ? 'أكمل العنوان والغلاف والتصنيف وعنوان ومحتوى كل صفحة.'
          : 'Add a title, cover, category, and title and content for every page.'
      );
      return;
    }
    const token = localStorage.getItem('niblan_token');
    if (!token) {
      setError(isArabic ? 'سجّل الدخول لنشر كتابك.' : 'Sign in to publish your book.');
      return;
    }
    setPublishing(true);
    try {
      const book = await createBook(token, {
        title: title.trim(),
        description: description.trim(),
        cover_url: coverURL,
        language: isArabic ? 'ar' : 'en',
        category_id: categoryID,
        paper_texture_id: paperTextureID,
        free_write: freeWrite,
        chapters: chapters.map((chapter) => ({
          title: chapter.title.trim(),
          content: chapter.pages.map((page) => page.content).join(freeWrite ? '' : '<hr data-book-page-break="true" />'),
        })),
      }, locale);
      router.push(`/${locale}/books/${book.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : isArabic
            ? 'تعذر نشر الكتاب.'
            : 'Could not publish the book.'
      );
      setPublishing(false);
    }
  };

  const addChapter = () => {
    const id = `chapter-${Date.now()}`;
    setChapters((current) => [
      ...current,
      {
        id,
        title: '',
        activePageIndex: 0,
        pages: [{ id: `${id}-page-1`, content: '<p></p>', characters: 0 }],
      },
    ]);
    setActiveChapter(id);
  };

  const removeChapter = (chapterId: string) => {
    if (chapters.length === 1) return;
    const remaining = chapters.filter((chapter) => chapter.id !== chapterId);
    setChapters(remaining);
    if (activeChapter === chapterId) setActiveChapter(remaining[0].id);
  };

  return (
    <main
      className="min-h-screen   bg-[#f5f1e7] px-4 py-8 text-[#211f1a] sm:px-8"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between border-b border-[#d9d1c0] p-3 shadow-lg rounded-lg">
          <div className="flex">
            <span className=" justify-center m-3">
              {/*  */}
              <GiBookmarklet size={50} />
            </span>

            <div>
              <h1 className="mt-2 text-2xl font-extrabold">
                {isArabic ? 'إنشاء كتاب' : 'Create a book'}
              </h1>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6b27]">
                {isArabic ? 'مساحة الكتابة' : 'WRITING STUDIO'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/books`)}
            className="flex rounded-full shadow-lg h-10 items-center gap-2 border border-[#d6cebd] px-3 text-sm text-[#5f594e] hover:bg-white"
          >
            {isArabic ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {isArabic ? 'الكتب المنشورة' : 'Published books'}
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
          <section className="min-w-0">
            <div className="border rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <span className="m-3">
                  {/* <IoBookOutline size={40} /> */}
                  <BsBook size={35} />
                </span>

                <p className="font-bold">{isArabic ? 'تفاصيل الكتاب' : 'Book Details'}</p>
              </div>

              <div className="flex gap-6">
                <label className="mb-5 block w-1/2 text-sm font-medium">
                  <div className="flex gap-1">
                    <p className="font-semibold flex gap-1 ">
                      {' '}
                      <span>
                        <MdOutlineSubtitles size={22} />
                      </span>{' '}
                      {isArabic ? 'عنوان الكتاب' : 'Book title'}
                    </p>
                    <span>
                      <RiStarSFill className="text-red-700 " size={12} />
                    </span>
                  </div>

                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={200}
                    placeholder={isArabic ? 'أدخل عنوان الكتاب' : 'Enter book title'}
                    className="mt-2 shadow-md placeholder:text-xs h-12 w-full rounded-lg border border-[#d6cebd] bg-white px-3 text-base outline-none focus:border-[#99762e]"
                  />
                </label>

                <label className="mb-7 block w-1/2 text-sm font-medium">
                  <div className="flex gap-1 ">
                    <span className='font-extrabold'>                    <CiGrid42 size={22} />
</span>
                    <p> {isArabic ? 'تصنيف الكتاب' : 'Book category'}</p>
                    <span>
                      <RiStarSFill className="text-red-700" size={12} />
                    </span>
                  </div>

                  <select
                    value={categoryID}
                    onChange={(event) => setCategoryID(event.target.value)}
                    disabled={!categories.length}
                    className="mt-2 h-12 w-full shadow-md rounded-lg border border-[#d6cebd] bg-white px-3 text-sm outline-none focus:border-[#99762e] disabled:text-[#8c867a]"
                  >
                    {!categories.length && (
                      <option value="">
                        {isArabic ? 'لا توجد تصنيفات متاحة' : 'No categories available'}
                      </option>
                    )}

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mb-7 block text-sm font-medium">
                <div className="flex gap-1">
                  <p className="flex gap-1">
                    {' '}
                    <span>
                      <GiNotebook size={22} />
                    </span>{' '}
                    {isArabic ? 'نبذة' : 'Description'}
                  </p>
                  <span>
                    <RiStarSFill className="text-red-700" size={12} />
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="mt-2 w-full shadow-md resize-y rounded-lg border border-[#d6cebd] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#99762e]"
                  placeholder={isArabic ? 'أدخل وصف الكتاب' : 'Enter book description'}
                />
              </label>
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold">{isArabic ? 'ثيم ورق الكتاب' : 'Book paper theme'}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PAPER_TEXTURES.map((texture) => (
                    <button
                      key={texture.id}
                      type="button"
                      onClick={() => setPaperTextureID(texture.id)}
                      aria-pressed={paperTextureID === texture.id}
                      className={`overflow-hidden rounded-lg border text-start transition ${paperTextureID === texture.id ? 'border-[#8a6722] ring-2 ring-[#c69a3e]/40' : 'border-[#d6cebd] hover:border-[#99762e]'}`}
                    >
                      <span
                        className="block h-14"
                        style={getPaperTextureStyle(texture.id, 'left')}
                      />
                      <span className="block px-2 py-1.5 text-xs">{isArabic ? texture.name.ar : texture.name.en}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* chapter */}

            <div className=" border shadow-lg rounded-lg mt-3 p-4">
             <div className='rounded-lg border shadow-lg p-2'>
               <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1">
                  <span>
                    <RiBookShelfLine size={26} />
                  </span>
                  <h2 className="text-base font-semibold flex">
                    {isArabic ? 'فصول الكتاب' : 'Book chapters'}
                     <span>
                    <RiStarSFill className="text-red-700" size={12} />
                  </span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={addChapter}
                  className="rounded-lg font-bold flex h-9 items-center gap-2 border border-[#d6cebd] bg-white px-3 text-sm hover:border-[#99762e] ~"
                >
                  <Plus size={16} />
                  {isArabic ? 'إضافة فصل' : 'Add chapter'}
                </button>
              </div>

              <nav
                className="mb-3 flex gap-1 overflow-x-auto border-b border-[#d6cebd]"
                aria-label={isArabic ? 'فصول الكتاب' : 'Book chapters'}
              >
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => setActiveChapter(chapter.id)}
                    className={`max-w-48 shrink-0 border-b-2 px-3 py-2 text-sm ${activeChapter === chapter.id ? 'border-[#98752c] font-semibold text-[#634c17]' : 'border-transparent text-[#777064] hover:text-[#302d27]'}`}
                  >
                    {chapter.title || (isArabic ? `فصل ${index + 1}` : `Chapter ${index + 1}`)}
                  </button>
                ))}
              </nav>
             </div>

              {currentChapter && (
                <>
                  <div className="mb-3 flex gap-2 border shadow-lg rounded-lg p-2">
                    <input
                      value={currentChapter.title}
                      onChange={(event) =>
                        updateChapterTitle(currentChapter.id, event.target.value)
                      }
                      placeholder={isArabic ? 'عنوان الفصل' : 'Chapter title'}
                      className="h-11 min-w-0 flex-1 border shadow-md rounded-lg border-[#d6cebd] bg-white px-3 text-sm outline-none focus:border-[#99762e]"
                    />
                    <button
                      type="button"
                      onClick={() => removeChapter(currentChapter.id)}
                      disabled={chapters.length === 1}
                      title={isArabic ? 'حذف الفصل' : 'Delete chapter'}
                      aria-label={isArabic ? 'حذف الفصل' : 'Delete chapter'}
                      className="grid h-11 w-11 rounded-lg shadow-sm shrink-0 place-items-center border border-[#d6cebd] text-[#0e0d0d] hover:border-[#a4483a] hover:text-[#a4483a] disabled:opacity-30"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                <div className='border shadow-lg rounded-lg p-2'>
                    <div className="mb-3 border rounded-lg shadow-lg p-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span>
                          {' '}
                          <PiBookOpenText size={26} />
                        </span>
                        <h2 className="flex text-base font-semibold">
                          {isArabic ? 'محتوى الكتاب' : 'Book Content'}
                          <span>
                            {' '}
                            <RiStarSFill className="text-red-700" size={12} />
                          </span>
                        </h2>
                      </div>

                      {!freeWrite && (
                        <>
                          <button
                            type="button"
                            onClick={() => setActivePage(currentChapter.activePageIndex - 1)}
                            disabled={currentChapter.activePageIndex === 0}
                            title={isArabic ? 'الصفحة السابقة' : 'Previous page'}
                            aria-label={isArabic ? 'الصفحة السابقة' : 'Previous page'}
                            className="grid rounded-full shadow-xl h-9 w-9 place-items-center border border-[#d6cebd] bg-white text-[#625d53] disabled:opacity-30"
                          >
                            {isArabic ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
                          </button>
                          <span className="min-w-20 text-center text-xs text-[#716b60]">
                            {isArabic
                              ? `صفحة ${currentChapter.activePageIndex + 1} من ${currentChapter.pages.length}`
                              : `Page ${currentChapter.activePageIndex + 1} of ${currentChapter.pages.length}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActivePage(currentChapter.activePageIndex + 1)}
                            disabled={currentChapter.activePageIndex >= currentChapter.pages.length - 1}
                            title={isArabic ? 'الصفحة التالية' : 'Next page'}
                            aria-label={isArabic ? 'الصفحة التالية' : 'Next page'}
                            className="grid rounded-full h-9 w-9 place-items-center border border-[#d6cebd] bg-white text-[#625d53] disabled:opacity-30"
                          >
                            {isArabic ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
                          </button>
                        </>
                      )}
                    </div>
                    {!freeWrite && <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={addPage}
                        className="flex rounded-lg shadow-lg h-9 items-center gap-2 border border-[#d6cebd] bg-white px-3 text-sm hover:border-[#99762e]"
                      >
                        <Plus size={15} />
                        {isArabic ? 'إضافة صفحة' : 'Add page'}
                      </button>
                      <button
                        type="button"
                        onClick={removePage}
                        disabled={currentChapter.pages.length === 1}
                        title={isArabic ? 'حذف الصفحة' : 'Delete page'}
                        aria-label={isArabic ? 'حذف الصفحة' : 'Delete page'}
                        className="grid h-9 w-9  place-items-center border border-[#d6cebd] rounded-lg hover:border-[#a4483a] hover:text-[#a4483a] disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>}
                  </div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d6cebd] bg-white/70 p-3">
                    <div>
                      <p className="text-sm font-semibold">{isArabic ? 'طريقة كتابة المحتوى' : 'Writing mode'}</p>
                      <p className="mt-1 text-xs text-[#716b60]">
                        {freeWrite
                          ? (isArabic ? 'تدفق مفتوح مع إنشاء صفحات تلقائيًا' : 'Continuous writing with automatic pages')
                          : (isArabic ? 'كتابة صفحة تلو الأخرى' : 'Write one page at a time')}
                      </p>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={freeWrite}
                        onChange={(event) => changeWritingMode(event.target.checked)}
                        className="h-4 w-4 accent-[#99762e]"
                      />
                      {isArabic ? 'الكتابة الحرة' : 'Free-write mode'}
                    </label>
                  </div>
                  <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(190px,0.62fr)]">
                    {currentPage && (
                      <ChapterPageEditor
                        key={`${currentChapter.id}:${currentPage.id}`}
                        page={currentPage}
                        locale={locale}
                        paperTextureID={paperTextureID}
                        isFreeWrite={freeWrite}
                        onUploadImage={handlePageImageUpload}
                        onError={setError}
                        onChange={(content, characters) =>
                          updatePage(currentChapter.id, currentPage.id, content, characters)
                        }
                      />
                    )}
                    <BookPagePreview
                      locale={locale}
                      paperTextureID={paperTextureID}
                      chapterLabel={isArabic ? `الفصل ${currentChapterNumber}` : `Chapter ${currentChapterNumber}`}
                      chapterTitle={currentChapter?.title ?? ''}
                      showChapterHeading={freeWrite ? visiblePreviewIndex === 0 : currentChapter?.activePageIndex === 0}
                      pageNumber={freeWrite ? visiblePreviewIndex + 1 : (currentChapter?.activePageIndex ?? 0) + 1}
                      content={previewPages[visiblePreviewIndex] ?? ''}
                      hasContent={Boolean(currentPage?.characters || /<img\b/i.test(previewPages[visiblePreviewIndex] ?? ''))}
                      freeWrite={freeWrite}
                      previewPageIndex={visiblePreviewIndex}
                      previewPageCount={previewPages.length}
                      uploadingImage={uploadingPageImage}
                      onPreviewPageChange={setPreviewPageIndex}
                      onDrop={handlePreviewImageDrop}
                      onImageResize={handlePreviewImageResize}
                    />
                  </div>
                </div>
                </>
              )}
            </div>
          </section>

          <div>
            <aside className="self-start rounded-xl  border border-[#e5ddd1] bg-[#fffdf9] p-5 shadow-lg lg:border-t-0">
              <div className="mb-2 flex items-center gap-2">
                <GiBookCover size={23} className="text-[#5f4738]" />
                <h3 className="text-sm font-semibold text-[#292929]">{isArabic ? 'غلاف الكتاب' : 'Book cover'}</h3>
                <RiStarSFill className="text-red-700" size={12} />
              </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[#b7aa8e] bg-[#fdfaf5] p-3 transition hover:border-[#98752c]">
                  {coverPreview ? (
                    <img src={coverPreview} alt={isArabic ? 'معاينة غلاف الكتاب' : 'Book cover preview'} className="h-20 w-16 rounded object-cover" />
                  ) : (
                    <span className="grid h-20 w-16 shrink-0 place-items-center rounded bg-[#f8f1e8] text-[#806451]"><RiImageAddFill size={30} /></span>
                  )}
                  <span className="text-sm text-[#5f594e]">
                    {uploading
                      ? (isArabic ? 'جارٍ رفع الغلاف...' : 'Uploading cover...')
                      : (isArabic ? 'اضغط لاختيار صورة الغلاف (حتى 8 ميجابايت)' : 'Choose a cover image (up to 8 MB)')}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => void handleCoverChange(event.target.files?.[0])}
                  />
                </label>
            </aside>
            <div>
              <footer className="mt-6 flex justify-end border-t border-[#d9d1c0] pt-5">
                <button
                  type="button"
                  onClick={publish}
                  disabled={publishing || uploading || uploadingPageImage}
                  className="rounded-full shadow-lg min-h-11 w-full  border px-8 text-sm font-bold text-white transition bg-[#614a3c] hover:bg-[#b78d34] disabled:cursor-wait disabled:opacity-60"
                >
                  {publishing
                    ? isArabic
                      ? 'جارٍ النشر...'
                      : 'Publishing...'
                    : isArabic
                      ? 'نشر الكتاب'
                      : 'Publish book'}
                </button>
              </footer>
              {error && (
                <p
                  role="alert"
                  className="mt-6 border-s-2 border-[#a4483a] bg-[#a4483a]/5 px-3 py-2 text-sm text-[#8d3027]"
                >
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
