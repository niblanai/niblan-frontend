'use client';

import { useEffect, useState } from 'react';
import { Extension } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { Plugin } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Bold, ChevronLeft, ChevronRight, Heading2, Italic, List, ListOrdered, Plus, Trash2, Underline as UnderlineIcon, Upload } from 'lucide-react';
import { BookCategory, createBook, getBookCategories, uploadBookCover } from '@/services/books.service';

const PAGE_CHARACTER_LIMIT = 600;

const PageCharacterLimit = Extension.create({
  name: 'pageCharacterLimit',
  addProseMirrorPlugins() {
    return [new Plugin({
      filterTransaction: (transaction) =>
        !transaction.docChanged || Array.from(transaction.doc.textContent).length <= PAGE_CHARACTER_LIMIT,
    })];
  },
});

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

function ChapterPageEditor({ page, locale, onChange }: {
  page: ChapterPageDraft;
  locale: string;
  onChange: (content: string, characters: number) => void;
}) {
  const isArabic = locale === 'ar';
  const editor = useEditor({
    extensions: [StarterKit, Underline, PageCharacterLimit],
    content: page.content,
    immediatelyRender: false,
    onUpdate: ({ editor: activeEditor }) => onChange(
      activeEditor.getHTML(),
      Array.from(activeEditor.state.doc.textContent).length,
    ),
  }, [page.id]);

  const tools = [
    { label: isArabic ? 'عريض' : 'Bold', icon: Bold, run: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
    { label: isArabic ? 'مائل' : 'Italic', icon: Italic, run: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
    { label: isArabic ? 'تحته خط' : 'Underline', icon: UnderlineIcon, run: () => editor?.chain().focus().toggleUnderline().run(), active: editor?.isActive('underline') },
    { label: isArabic ? 'عنوان فرعي' : 'Heading', icon: Heading2, run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
    { label: isArabic ? 'قائمة نقطية' : 'Bullet list', icon: List, run: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList') },
    { label: isArabic ? 'قائمة مرقمة' : 'Numbered list', icon: ListOrdered, run: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList') },
  ];

  return (
    <div className="overflow-hidden border border-[#d6cebd] bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#e6e0d3] bg-[#faf8f2] p-2" role="toolbar" aria-label={isArabic ? 'أدوات تنسيق النص' : 'Text formatting'}>
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
      </div>
      <EditorContent
        editor={editor}
        dir={isArabic ? 'rtl' : 'ltr'}
        className="book-editor min-h-[330px] px-5 py-4 text-[15px] leading-8 text-[#302d27] [&_.ProseMirror]:min-h-[295px] [&_.ProseMirror]:outline-none [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:px-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:px-6"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e6e0d3] bg-[#faf8f2] px-4 py-2 text-xs text-[#716b60]" aria-live="polite">
        <span>{isArabic ? `كتبت ${page.characters} من ${PAGE_CHARACTER_LIMIT} حرفًا` : `${page.characters} of ${PAGE_CHARACTER_LIMIT} characters`}</span>
        <span>{isArabic ? `متبقي ${PAGE_CHARACTER_LIMIT - page.characters} حرفًا` : `${PAGE_CHARACTER_LIMIT - page.characters} characters remaining`}</span>
      </div>
    </div>
  );
}

export function BookCreator({ locale = 'ar' }: { locale?: string }) {
  const isArabic = locale === 'ar';
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [categoryID, setCategoryID] = useState('');
  const [chapters, setChapters] = useState<ChapterDraft[]>([
    { id: 'chapter-1', title: '', activePageIndex: 0, pages: [{ id: 'page-1', content: '<p></p>', characters: 0 }] },
  ]);
  const [activeChapter, setActiveChapter] = useState('chapter-1');
  const [coverURL, setCoverURL] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading] = useState(false);
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
        if (active) setError(cause instanceof Error ? cause.message : (isArabic ? 'تعذر تحميل التصنيفات.' : 'Could not load categories.'));
      });
    return () => {
      active = false;
    };
  }, [isArabic]);

  useEffect(() => () => {
    if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  const currentChapter = chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0];
  const currentPage = currentChapter?.pages[currentChapter.activePageIndex];

  const updateChapterTitle = (chapterId: string, title: string) => {
    setChapters((current) => current.map((chapter) => chapter.id === chapterId ? { ...chapter, title } : chapter));
  };

  const updatePage = (chapterIDToUpdate: string, pageID: string, content: string, characters: number) => {
    setChapters((current) => current.map((chapter) => chapter.id !== chapterIDToUpdate ? chapter : {
      ...chapter,
      pages: chapter.pages.map((page) => page.id === pageID ? { ...page, content, characters } : page),
    }));
  };

  const addPage = () => {
    if (!currentChapter) return;
    const page = { id: `page-${Date.now()}`, content: '<p></p>', characters: 0 };
    setChapters((current) => current.map((chapter) => chapter.id === currentChapter.id ? {
      ...chapter,
      pages: [...chapter.pages, page],
      activePageIndex: chapter.pages.length,
    } : chapter));
  };

  const removePage = () => {
    if (!currentChapter || currentChapter.pages.length <= 1) return;
    setChapters((current) => current.map((chapter) => {
      if (chapter.id !== currentChapter.id) return chapter;
      const pages = chapter.pages.filter((_, index) => index !== chapter.activePageIndex);
      return { ...chapter, pages, activePageIndex: Math.min(chapter.activePageIndex, pages.length - 1) };
    }));
  };

  const setActivePage = (pageIndex: number) => {
    if (!currentChapter || pageIndex < 0 || pageIndex >= currentChapter.pages.length) return;
    setChapters((current) => current.map((chapter) => chapter.id === currentChapter.id ? { ...chapter, activePageIndex: pageIndex } : chapter));
  };

  const handleCoverChange = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setError(isArabic ? 'اختر صورة JPEG أو PNG أو WebP بحجم أقل من 8 ميجابايت.' : 'Choose a JPEG, PNG, or WebP image under 8 MB.');
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
      setError(cause instanceof Error ? cause.message : (isArabic ? 'تعذر رفع الغلاف.' : 'Could not upload the cover.'));
      setCoverURL('');
    } finally {
      setUploading(false);
    }
  };

  const publish = async () => {
    setError('');
    if (!title.trim() || !coverURL || !categoryID || uploading || !chapters.length || chapters.some((chapter) => !chapter.title.trim() || !chapter.pages.length || chapter.pages.some((page) => !page.characters))) {
      setError(isArabic ? 'أكمل العنوان والغلاف والتصنيف وعنوان ومحتوى كل صفحة.' : 'Add a title, cover, category, and title and content for every page.');
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
        chapters: chapters.map((chapter) => ({
          title: chapter.title.trim(),
          content: chapter.pages.map((page) => page.content).join(''),
        })),
      });
      router.push(`/${locale}/books/${book.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (isArabic ? 'تعذر نشر الكتاب.' : 'Could not publish the book.'));
      setPublishing(false);
    }
  };

  const addChapter = () => {
    const id = `chapter-${Date.now()}`;
    setChapters((current) => [...current, {
      id,
      title: '',
      activePageIndex: 0,
      pages: [{ id: `${id}-page-1`, content: '<p></p>', characters: 0 }],
    }]);
    setActiveChapter(id);
  };

  const removeChapter = (chapterId: string) => {
    if (chapters.length === 1) return;
    const remaining = chapters.filter((chapter) => chapter.id !== chapterId);
    setChapters(remaining);
    if (activeChapter === chapterId) setActiveChapter(remaining[0].id);
  };

  return (
    <main className="min-h-screen bg-[#f5f1e7] px-4 py-8 text-[#211f1a] sm:px-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between border-b border-[#d9d1c0] pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6b27]">{isArabic ? 'مساحة الكتابة' : 'WRITING STUDIO'}</p>
            <h1 className="mt-2 text-2xl font-semibold">{isArabic ? 'إنشاء كتاب' : 'Create a book'}</h1>
          </div>
          <button type="button" onClick={() => router.push(`/${locale}/books`)} className="flex h-10 items-center gap-2 border border-[#d6cebd] px-3 text-sm text-[#5f594e] hover:bg-white">
            {isArabic ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {isArabic ? 'الكتب المنشورة' : 'Published books'}
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_270px]">
          <section className="min-w-0">
            <label className="mb-5 block text-sm font-medium">
              {isArabic ? 'عنوان الكتاب' : 'Book title'}
              <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} className="mt-2 h-12 w-full border border-[#d6cebd] bg-white px-3 text-base outline-none focus:border-[#99762e]" />
            </label>
            <label className="mb-7 block text-sm font-medium">
              {isArabic ? 'نبذة' : 'Description'}
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2 w-full resize-y border border-[#d6cebd] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#99762e]" />
            </label>
            <label className="mb-7 block text-sm font-medium">
              {isArabic ? 'تصنيف الكتاب' : 'Book category'}
              <select
                value={categoryID}
                onChange={(event) => setCategoryID(event.target.value)}
                disabled={!categories.length}
                className="mt-2 h-12 w-full border border-[#d6cebd] bg-white px-3 text-sm outline-none focus:border-[#99762e] disabled:text-[#8c867a]"
              >
                {!categories.length && <option value="">{isArabic ? 'لا توجد تصنيفات متاحة' : 'No categories available'}</option>}
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">{isArabic ? 'فصول الكتاب' : 'Book chapters'}</h2>
              <button type="button" onClick={addChapter} className="flex h-9 items-center gap-2 border border-[#d6cebd] bg-white px-3 text-sm hover:border-[#99762e]">
                <Plus size={16} />{isArabic ? 'إضافة فصل' : 'Add chapter'}
              </button>
            </div>

            <nav className="mb-3 flex gap-1 overflow-x-auto border-b border-[#d6cebd]" aria-label={isArabic ? 'فصول الكتاب' : 'Book chapters'}>
              {chapters.map((chapter, index) => (
                <button key={chapter.id} type="button" onClick={() => setActiveChapter(chapter.id)} className={`max-w-48 shrink-0 border-b-2 px-3 py-2 text-sm ${activeChapter === chapter.id ? 'border-[#98752c] font-semibold text-[#634c17]' : 'border-transparent text-[#777064] hover:text-[#302d27]'}`}>
                  {chapter.title || (isArabic ? `فصل ${index + 1}` : `Chapter ${index + 1}`)}
                </button>
              ))}
            </nav>

            {currentChapter && (
              <>
                <div className="mb-3 flex gap-2">
                  <input value={currentChapter.title} onChange={(event) => updateChapterTitle(currentChapter.id, event.target.value)} placeholder={isArabic ? 'عنوان الفصل' : 'Chapter title'} className="h-11 min-w-0 flex-1 border border-[#d6cebd] bg-white px-3 text-sm outline-none focus:border-[#99762e]" />
                  <button type="button" onClick={() => removeChapter(currentChapter.id)} disabled={chapters.length === 1} title={isArabic ? 'حذف الفصل' : 'Delete chapter'} aria-label={isArabic ? 'حذف الفصل' : 'Delete chapter'} className="grid h-11 w-11 shrink-0 place-items-center border border-[#d6cebd] text-[#82796a] hover:border-[#a4483a] hover:text-[#a4483a] disabled:opacity-30">
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setActivePage(currentChapter.activePageIndex - 1)} disabled={currentChapter.activePageIndex === 0} title={isArabic ? 'الصفحة السابقة' : 'Previous page'} aria-label={isArabic ? 'الصفحة السابقة' : 'Previous page'} className="grid h-9 w-9 place-items-center border border-[#d6cebd] bg-white text-[#625d53] disabled:opacity-30">
                      {isArabic ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
                    </button>
                    <span className="min-w-20 text-center text-xs text-[#716b60]">
                      {isArabic ? `صفحة ${currentChapter.activePageIndex + 1} من ${currentChapter.pages.length}` : `Page ${currentChapter.activePageIndex + 1} of ${currentChapter.pages.length}`}
                    </span>
                    <button type="button" onClick={() => setActivePage(currentChapter.activePageIndex + 1)} disabled={currentChapter.activePageIndex >= currentChapter.pages.length - 1} title={isArabic ? 'الصفحة التالية' : 'Next page'} aria-label={isArabic ? 'الصفحة التالية' : 'Next page'} className="grid h-9 w-9 place-items-center border border-[#d6cebd] bg-white text-[#625d53] disabled:opacity-30">
                      {isArabic ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={addPage} className="flex h-9 items-center gap-2 border border-[#d6cebd] bg-white px-3 text-sm hover:border-[#99762e]">
                      <Plus size={15} />{isArabic ? 'إضافة صفحة' : 'Add page'}
                    </button>
                    <button type="button" onClick={removePage} disabled={currentChapter.pages.length === 1} title={isArabic ? 'حذف الصفحة' : 'Delete page'} aria-label={isArabic ? 'حذف الصفحة' : 'Delete page'} className="grid h-9 w-9 place-items-center border border-[#d6cebd] text-[#82796a] hover:border-[#a4483a] hover:text-[#a4483a] disabled:opacity-30">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {currentPage && (
                  <ChapterPageEditor
                    key={`${currentChapter.id}:${currentPage.id}`}
                    page={currentPage}
                    locale={locale}
                    onChange={(content, characters) => updatePage(currentChapter.id, currentPage.id, content, characters)}
                  />
                )}
              </>
            )}
          </section>

          <aside className="self-start border-t border-[#d6cebd] pt-5 lg:border-t-0 lg:border-s lg:ps-6 lg:pt-0">
            <h2 className="text-sm font-semibold">{isArabic ? 'غلاف الكتاب' : 'Book cover'}</h2>
            <label className="mt-3 flex aspect-[3/4] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed border-[#b7aa8e] bg-white text-center text-sm text-[#716b60] hover:border-[#98752c]">
              {coverPreview ? (
                <img src={coverPreview} alt={isArabic ? 'معاينة غلاف الكتاب' : 'Book cover preview'} className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-3 px-5"><Upload size={25} /><span>{isArabic ? 'اختر صورة للغلاف' : 'Choose a cover image'}</span></span>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handleCoverChange(event.target.files?.[0])} />
            </label>
            <p className="mt-2 text-xs leading-5 text-[#81796b]">{uploading ? (isArabic ? 'جارٍ رفع الغلاف...' : 'Uploading cover...') : (isArabic ? 'JPEG أو PNG أو WebP، حتى 8 ميجابايت' : 'JPEG, PNG, or WebP, up to 8 MB')}</p>
          </aside>
        </div>

        {error && <p role="alert" className="mt-6 border-s-2 border-[#a4483a] bg-[#a4483a]/5 px-3 py-2 text-sm text-[#8d3027]">{error}</p>}
        <footer className="mt-8 flex justify-end border-t border-[#d9d1c0] pt-5">
          <button type="button" onClick={publish} disabled={publishing || uploading} className="min-h-11 bg-[#c69a3e] px-6 text-sm font-semibold text-[#201b11] transition hover:bg-[#b78d34] disabled:cursor-wait disabled:opacity-60">
            {publishing ? (isArabic ? 'جارٍ النشر...' : 'Publishing...') : (isArabic ? 'نشر الكتاب' : 'Publish book')}
          </button>
        </footer>
      </div>
    </main>
  );
}