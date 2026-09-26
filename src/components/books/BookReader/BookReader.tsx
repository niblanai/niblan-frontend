'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ReaderControls } from './ReaderControls';
import { Bookmark } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import Link from 'next/link';
import { getToken } from '@/services/auth.service';
import { Book, getFavoritePageNumbers, getPublicBook, setFavoritePage } from '@/services/books.service';
import { saveReadingProgress } from '@/services/reading-progress.service';

type ReaderPage = {
  id: string;
  chapterId: string;
  label: string;
  chapter: string;
  title: string;
  content: string;
  pageNumber: number;
};

const PAGE_TEXT_LIMIT = 600;

function splitTextNode(node: Text, limit: number): Node[] {
  const text = node.textContent ?? '';
  if (text.length <= limit) return [document.createTextNode(text)];

  const tokens = text.match(/\s+|[^\s]+/gu) ?? [text];
  const chunks: string[] = [];
  let current = '';

  for (const token of tokens) {
    if (token.length > limit) {
      if (current) chunks.push(current);
      current = '';
      const characters = Array.from(token);
      for (let offset = 0; offset < characters.length; offset += limit) {
        chunks.push(characters.slice(offset, offset + limit).join(''));
      }
      continue;
    }
    if (current.length + token.length > limit) {
      chunks.push(current);
      current = '';
    }
    current += token;
  }
  if (current) chunks.push(current);
  return chunks.map((chunk) => document.createTextNode(chunk));
}

function splitNode(node: Node, limit: number): Node[] {
  if (node.nodeType === 3) return splitTextNode(node as Text, limit);
  if (node.nodeType !== 1) return [node.cloneNode(true)];

  const element = node as HTMLElement;
  const chunks: HTMLElement[] = [];
  let current = element.cloneNode(false) as HTMLElement;
  let currentLength = 0;

  for (const child of Array.from(element.childNodes)) {
    for (const childChunk of splitNode(child, limit)) {
      const childLength = childChunk.textContent?.length ?? 0;
      if (current.childNodes.length > 0 && currentLength + childLength > limit) {
        chunks.push(current);
        current = element.cloneNode(false) as HTMLElement;
        currentLength = 0;
      }
      current.appendChild(childChunk);
      currentLength += childLength;
    }
  }
  if (current.childNodes.length > 0 || chunks.length === 0) chunks.push(current);
  return chunks;
}

function paginateChapterContent(content: string): string[] {
  const sanitized = DOMPurify.sanitize(content);
  const parsed = new DOMParser().parseFromString(sanitized, 'text/html');
  const parts = Array.from(parsed.body.childNodes).flatMap((node) => splitNode(node, PAGE_TEXT_LIMIT));
  const pages: string[] = [];
  let currentParts: Node[] = [];
  let currentLength = 0;

  const flush = () => {
    if (currentParts.length === 0) return;
    const wrapper = document.createElement('div');
    currentParts.forEach((part) => wrapper.appendChild(part));
    pages.push(wrapper.innerHTML);
    currentParts = [];
    currentLength = 0;
  };

  for (const part of parts) {
    const partLength = part.textContent?.length ?? 0;
    if (currentParts.length > 0 && currentLength + partLength > PAGE_TEXT_LIMIT) flush();
    currentParts.push(part);
    currentLength += partLength;
  }
  flush();
  return pages.length > 0 ? pages : [''];
}

function paginateBook(book: Book, locale: string, bookId: string): ReaderPage[] {
  const isArabic = locale === 'ar';
  const pages: ReaderPage[] = [];

  book.chapters.forEach((chapter, chapterIndex) => {
    const chapterPages = paginateChapterContent(chapter.content);
    chapterPages.forEach((content, pageIndex) => {
      pages.push({
        id: `${bookId}-${chapterIndex}-${pageIndex}`,
        chapterId: chapter.id ?? '',
        label: isArabic ? `الفصل ${chapterIndex + 1}` : `Chapter ${chapterIndex + 1}`,
        chapter: chapter.title,
        title: pageIndex === 0 ? chapter.title : '',
        content,
        pageNumber: pages.length + 1,
      });
    });
  });

  return pages;
}

type BookFlipRef = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
  };
};

/* =========================
   Book Page
========================= */

const BookPage = React.forwardRef<
  HTMLDivElement,
  {
    page: ReaderPage;
    isArabic: boolean;
    isBlurred: boolean;
  }
>(({ page, isArabic, isBlurred }, ref) => {
  return (
    <article
      ref={ref}
      className="book-page relative h-full w-full overflow-hidden rounded-[5px] border border-[#b99562] bg-[#f3ead3] shadow-[0_75px_130px_rgba(0,0,0,0.45),0_35px_75px_rgba(0,0,0,0.25),inset_60px_20px_60px_-35px_rgba(10,10,0,0.2),inset_-60px_20px_60px_-35px_rgba(20,10,0,0.2)] select-none"
    >
      <div className="page-texture pointer-events-none absolute inset-0 opacity-90" />

      <div className="relative z-10 flex h-full w-full flex-col p-5 sm:p-7">
        <div className={`min-h-0 flex-1 transition-[filter] duration-300 ${isBlurred ? 'blur-[1.2px]' : 'blur-0'}`}>
          <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-[#5d4631]">
            <span>{page.label}</span>
            <span>{page.pageNumber}</span>
          </div>

          <div className="mb-3 border-b border-[#8c6f46]/30 pb-2 text-right text-[12px] font-semibold text-[#4c3728]">
            {page.chapter}
          </div>

          {page.title && <h2 className="mb-4 text-right text-[26px] font-semibold leading-tight text-[#2a1f17]">{page.title}</h2>}

          <div className="space-y-4 overflow-hidden text-right text-[13px] leading-7 text-[#2d231c]">
            <div className="book-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }} />
          </div>
        </div>

        <div className="mt-3 flex shrink-0 items-center justify-between text-[10px] tracking-[0.16em] text-[#5a4031]">
          <span>{isArabic ? 'نِبلان' : 'NIBLAN'}</span>
          <span>{page.pageNumber}</span>
        </div>
      </div>
    </article>
  );
});

BookPage.displayName = 'BookPage';

/* =========================
   Book Reader
========================= */

type BookFlipEvent = {
  data?: number | string | null;
};

export function BookReader({ locale = 'ar', bookId }: { locale?: string; bookId: string }) {
  const isArabic = locale === 'ar';

  const bookRef = useRef<BookFlipRef | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [startPage, setStartPage] = useState(0);
  const [book, setBook] = useState<Book | null>(null);
  const [pages, setPages] = useState<ReaderPage[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favoritePages, setFavoritePages] = useState<number[]>([]);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');

  // Zoom states
  const [isFlipping, setIsFlipping] = useState(false);
  const [viewMode, setViewMode] = useState<'left' | 'right' | 'spread'>('left');

  const totalPages = pages.length;

  useEffect(() => {
    let active = true;
    setBook(null);
    setLoadError(false);
    setCurrentIndex(0);
    setStartPage(0);
    getPublicBook(bookId)
      .then((item) => {
        if (active) {
          const bookPages = paginateBook(item, locale, bookId);
          const requestedPage = Number(window.location.hash.match(/^#page-(\d+)$/)?.[1] ?? 1);
          const firstPage = Math.max(0, Math.min(bookPages.length - 1, requestedPage - 1));
          setBook(item);
          setPages(bookPages);
          setCurrentIndex(firstPage);
          setStartPage(firstPage);
        }
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [bookId, locale]);

  /* =========================
     Zoom Transform
  ========================= */
  const zoomTransform = useMemo(() => {
    if (isFlipping) {
      // أثناء التقليب: zoom out
      return {
        scale: 0.85,
        translateX: 0,
      };
    }

    if (viewMode === 'left') {
      // zoom على الجنب الأيسر
      return {
        scale: 1.15,
        translateX: 180,
      };
    }

    if (viewMode === 'right') {
      // zoom على الجنب الأيمن
      return {
        scale: 1.15,
        translateX: -180,
      };
    }

    // spread view
    return {
      scale: 1,
      translateX: 0,
    };
  }, [isFlipping, viewMode]);

  /* =========================
     Navigation
  ========================= */
  const handleFlipNext = useCallback(() => {
    if (bookRef.current) {
      setIsFlipping(true);
      setViewMode('spread');
      // في العربي: التقدم معناه flipNext (من اليسار لليمين)
      // في الإنجليزي: التقدم معناه flipNext (من اليسار لليمين)
      bookRef.current.pageFlip().flipNext();
    }
  }, []);

  const handleFlipPrev = useCallback(() => {
    if (bookRef.current) {
      setIsFlipping(true);
      setViewMode('spread');
      // في العربي: الرجوع معناه flipPrev (من اليمين لليسار)
      // في الإنجليزي: الرجوع معناه flipPrev (من اليمين لليسار)
      bookRef.current.pageFlip().flipPrev();
    }
  }, []);

  const handleAdvanceArrow = useCallback(() => {
    if (viewMode === 'left') {
      // انتقل لليمين
      setViewMode('right');
    } else if (viewMode === 'right') {
      // قلب الصفحة
      handleFlipNext();
    }
  }, [viewMode, handleFlipNext]);

  /* =========================
     Flip Events
  ========================= */
  const handleFlip = useCallback((e: BookFlipEvent) => {
    const nextIndex = typeof e.data === 'number' ? e.data : Number(e.data ?? 0);
    setCurrentIndex(nextIndex);
  }, []);

  const handleChangeState = useCallback((e: BookFlipEvent) => {
    if (e.data === 'flipping' || e.data === 'user_fold') {
      setIsFlipping(true);
      setViewMode('spread');
      return;
    }

    // بعد التقليب: zoom على اليسار
    setIsFlipping(false);
    setViewMode('left');
  }, []);

  /* =========================
     Fullscreen
  ========================= */
  const handleFullscreen = async () => {
    if (!fullscreenRef.current) return;

    if (!document.fullscreenElement) {
      await fullscreenRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  /* =========================
     Saved Page
  ========================= */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setFavoritePages([]);
      return;
    }
    let active = true;
    getFavoritePageNumbers(token, bookId)
      .then((pageNumbers) => {
        if (active) setFavoritePages(pageNumbers);
      })
      .catch(() => {
        if (active) setFavoritePages([]);
      });
    return () => {
      active = false;
    };
  }, [bookId]);

  useEffect(() => {
    if (!book || !pages.length) return;
    const page = pages[currentIndex];
    if (!page) return;

    saveReadingProgress({
      bookId,
      bookTitle: book.title,
      chapterId: page.chapterId,
      page: currentIndex + 1,
    });
  }, [book, bookId, currentIndex, pages]);

  const handleSavePage = async () => {
    const token = getToken();
    const page = pages[currentIndex];
    if (!token) {
      setFavoriteError(isArabic ? 'سجّل الدخول لحفظ الصفحة في المفضلة.' : 'Sign in to save this page.');
      return;
    }
    if (!page?.chapterId) return;
    const pageNumber = currentIndex + 1;
    const favorited = favoritePages.includes(pageNumber);
    setFavoriteBusy(true);
    setFavoriteError('');
    try {
      await setFavoritePage(token, bookId, pageNumber, page.chapterId, !favorited);
      setFavoritePages((current) => favorited
        ? current.filter((number) => number !== pageNumber)
        : [...current, pageNumber]);
    } catch (cause) {
      setFavoriteError(cause instanceof Error ? cause.message : (isArabic ? 'تعذر حفظ الصفحة.' : 'Could not save page.'));
    } finally {
      setFavoriteBusy(false);
    }
  };

  const progress = Math.round(((currentIndex + 1) / totalPages) * 100);

  if (!book && !loadError) {
    return <main className="grid min-h-screen place-items-center bg-[#14181d] text-sm text-[#f5ebd7]">{isArabic ? 'جارٍ تحميل الكتاب...' : 'Loading book...'}</main>;
  }

  if (loadError || !book) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#14181d] px-6 text-center text-[#f5ebd7]" dir={isArabic ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-2xl font-semibold">{isArabic ? 'الكتاب غير متاح' : 'Book unavailable'}</h1>
          <Link href={`/${locale}/books`} className="mt-5 inline-flex border-b border-[#d6b26b] pb-1 text-sm text-[#f4d79a]">
            {isArabic ? 'العودة إلى الكتب' : 'Back to books'}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#14181d] px-4 py-6 text-[#f5ebd7] sm:px-6 lg:px-8"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#d2b57e] opacity-80 sm:text-xs">
            {isArabic ? 'قراءة مميزة' : 'Premium reader'}
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-[#f7f0e1] sm:text-4xl">
            {book.title}
          </h1>
          <p className="mt-2 text-xs text-[#d9c8a7]">{book.author_display_name}</p>
          {book.category_name && <p className="mt-1 text-xs text-[#d6b26b]">{book.category_name}</p>}
        </div>

        <div className="mx-auto max-w-[1380px] rounded-[28px] border border-white/10 bg-[#1a1d24]/90 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6">
          <div className="sticky top-16 z-50 mb-5 flex items-center justify-between gap-4 border-b border-white/10 bg-[#1a1d24]/95 py-2 text-xs text-[#e9d9b8] backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d3ab62]/60 bg-[#2b2118] text-sm text-[#f4d79a]">
                {isArabic ? 'ب' : 'B'}
              </span>

              <span className="font-medium">{isArabic ? 'نِبلان' : 'NIBLAN'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFlipPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f8e8c7] transition hover:border-[#d6b26b]/60 hover:bg-[#d6b26b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={isArabic ? 'الصفحة السابقة' : 'Previous page'}
                disabled={currentIndex === 0}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={handleFlipNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f8e8c7] transition hover:border-[#d6b26b]/60 hover:bg-[#d6b26b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={isArabic ? 'الصفحة التالية' : 'Next page'}
                disabled={currentIndex >= totalPages - 1}
              >
                ›
              </button>
            </div>
          </div>

          <div
            ref={fullscreenRef}
            className={`book-reader-surface relative flex h-[700px] w-full items-center justify-center !overflow-hidden rounded-[18px] border border-white/10 bg-[#14181d] ${
              isFullscreen ? 'bg-[#14181d]' : ''
            }`}
          >
            <div
              ref={containerRef}
              className="relative flex h-full w-full items-center justify-center transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translateX(${zoomTransform.translateX}px) scale(${zoomTransform.scale})`,
                transformOrigin: 'center center',
              }}
            >
              {/* @ts-expect-error react-pageflip supports this ref at runtime, but omits it from its declaration. */}
              <HTMLFlipBook
                width={460}
                height={600}
                size="stretch"
                minWidth={300}
                maxWidth={500}
                minHeight={400}
                maxHeight={600}
                maxShadowOpacity={0.5}
                showCover={false}
                mobileScrollSupport={true}
                key={`${book.id}:${pages.length}:${startPage}`}
                ref={bookRef}
                className="demo-book"
                usePortrait={true}
                startPage={startPage}
                drawShadow={true}
                flippingTime={800}
                onFlip={handleFlip}
                onChangeState={handleChangeState}
              >
                {pages.map((page) => (
                  <BookPage
                    key={page.id}
                    page={page}
                    isArabic={isArabic}
                    isBlurred={viewMode !== 'spread' && page.pageNumber !== currentIndex + (viewMode === 'right' ? 2 : 1)}
                  />
                ))}
              </HTMLFlipBook>
            </div>

            {/* السهم للانتقال بين الجنبين */}
            {!isFlipping && viewMode !== 'spread' && currentIndex < totalPages - 1 && (
              <button
                type="button"
                onClick={handleAdvanceArrow}
                className="absolute bottom-10 left-1/2 z-30 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-[#d6b26b]/60 bg-[#1d1712]/85 text-3xl text-[#f3d9a3] shadow-[0_18px_36px_rgba(0,0,0,0.35)] transition hover:scale-105"
                aria-label={
                  viewMode === 'left'
                    ? isArabic
                      ? 'الانتقال للجنب الأيمن'
                      : 'Move to right side'
                    : isArabic
                      ? 'الصفحة التالية'
                      : 'Next page'
                }
              >
                {viewMode === 'left' ? '→' : '⮕'}
              </button>
            )}

            <div className="absolute bottom-4 left-4 z-40 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSavePage}
                disabled={favoriteBusy}
                className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition ${
                  favoritePages.includes(currentIndex + 1)
                    ? 'border-[#d6b26b] bg-[#d6b26b]/20 text-[#f4d79a]'
                    : 'border-white/10 bg-black/40 text-white hover:bg-black/60'
                }`}
                aria-pressed={favoritePages.includes(currentIndex + 1)}
                aria-label={favoritePages.includes(currentIndex + 1)
                  ? isArabic ? 'إزالة الصفحة من المفضلة' : 'Remove page from favorites'
                  : isArabic ? 'حفظ الصفحة في المفضلة' : 'Save page to favorites'}
              >
                <Bookmark size={22} fill={favoritePages.includes(currentIndex + 1) ? 'currentColor' : 'none'} />
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-lg text-white backdrop-blur-sm transition hover:bg-black/60"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                ⛶
              </button>
            </div>
            {favoriteError && <p role="alert" className="absolute bottom-4 right-4 z-40 max-w-[70%] bg-[#141a22]/95 px-3 py-2 text-xs text-[#f4d79a]">{favoriteError}</p>}
          </div>

          <div>
            <div className="relative">
              <ReaderControls
                currentIndex={currentIndex}
                totalPages={totalPages}
                onPrevious={handleFlipPrev}
                onNext={handleFlipNext}
                locale={locale}
              />
            </div>

            <div className="mt-3 px-4">
              <div className="mb-2 flex items-center justify-between text-xs text-[#e9d9b8]">
                <span>{isArabic ? 'تقدم القراءة' : 'Reading progress'}</span>

                <span>{progress}%</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#d6b26b] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default BookReader;
