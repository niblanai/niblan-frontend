'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, Maximize2, Minimize2 } from 'lucide-react';
import Link from 'next/link';
import { getPaperTextureStyle } from '@/lib/books/paperTextures';
import { paginateHtmlByTextLimit } from '@/lib/books/paginateHtml';
import { sanitizeBookHtml } from '@/lib/books/sanitizeBookHtml';
import { getToken } from '@/services/auth.service';
import { Book, getFavoritePageNumbers, getPublicBook, setFavoritePage } from '@/services/books.service';
import { saveReadingProgress } from '@/services/reading-progress.service';
import { ReadingRoomScene, type ReadingTheme } from './ReadingRoomScene';
import { BookRainOverlay } from './BookRainOverlay';

type ReaderPage = {
  id: string;
  chapterId: string;
  label: string;
  chapter: string;
  title: string;
  content: string;
  pageNumber: number;
  paperTextureID: string;
};

const PAGE_TEXT_LIMIT = 600;

function paginateChapterContent(content: string, freeWrite: boolean): string[] {
  const sanitized = sanitizeBookHtml(content);
  const authoredPages = freeWrite
    ? [sanitized]
    : sanitized.split(/<hr\b(?=[^>]*\bdata-book-page-break(?:\s|=|\/|>))[^>]*\/?>/gi);
  return authoredPages.flatMap((page) => paginateHtmlByTextLimit(page, PAGE_TEXT_LIMIT));
}

function paginateBook(book: Book, locale: string, bookId: string): ReaderPage[] {
  const isArabic = locale === 'ar';
  const pages: ReaderPage[] = [];

  book.chapters.forEach((chapter, chapterIndex) => {
    const chapterPages = paginateChapterContent(chapter.content, book.free_write);
    chapterPages.forEach((content, pageIndex) => {
      pages.push({
        id: `${bookId}-${chapterIndex}-${pageIndex}`,
        chapterId: chapter.id ?? '',
        label: isArabic ? `الفصل ${chapterIndex + 1}` : `Chapter ${chapterIndex + 1}`,
        chapter: chapter.title,
        title: pageIndex === 0 ? chapter.title : '',
        content,
        pageNumber: pages.length + 1,
        paperTextureID: book.paper_texture_id,
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
      className={`book-page relative h-full w-full overflow-hidden rounded-[5px] border border-[#b99562] bg-[#f3ead3] shadow-[0_75px_130px_rgba(0,0,0,0.45),0_35px_75px_rgba(0,0,0,0.25),inset_60px_20px_60px_-35px_rgba(10,10,0,0.2),inset_-60px_20px_60px_-35px_rgba(20,10,0,0.2)] select-none ${page.pageNumber === 1 ? 'book-page--cover-backed' : ''}`}
    >
      <div
        className={`page-texture page-texture--${page.pageNumber % 2 === 1 ? 'right' : 'left'} pointer-events-none absolute inset-0`}
        style={getPaperTextureStyle(page.paperTextureID, page.pageNumber % 2 === 1 ? 'right' : 'left')}
      />

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

          <div className="space-y-4 text-right text-[13px] leading-7 text-[#2d231c]">
            <div className="book-content book-reader-content" dangerouslySetInnerHTML={{ __html: sanitizeBookHtml(page.content) }} />
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

const CoverPage = React.forwardRef<HTMLDivElement, { book: Book; isBackCover?: boolean }>(
  ({ book, isBackCover = false }, ref) => (
    <div
      ref={ref}
      data-density="hard"
      className={`book-cover-page relative flex h-full w-full items-end overflow-visible rounded-[5px] border border-[#b99562] p-8 text-right text-[#fff4d7] shadow-[0_25px_45px_rgba(0,0,0,0.45)] ${isBackCover ? 'book-back-cover-page' : ''}`}
    >
      {!isBackCover && book.cover_url && (
        <Image src={book.cover_url} alt={book.title} fill sizes="520px" priority unoptimized className="book-cover-image object-cover" />
      )}
      {isBackCover ? (
        <div className="w-full border-t border-[#e0c487]/40 pt-4 text-center text-sm tracking-[0.18em] text-[#e0c487]">
          {isArabicBook(book.language) ? 'نِبلان' : 'NIBLAN'}
        </div>
      ) : (
        <div className="relative z-10 w-full bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-3 pt-16">
          <h2 className="text-2xl font-semibold leading-tight">{book.title}</h2>
          <p className="mt-2 text-sm text-white/80">{book.author_display_name}</p>
        </div>
      )}
    </div>
  ),
);

CoverPage.displayName = 'CoverPage';

const BlankPage = React.forwardRef<HTMLDivElement, { paperTextureID: string }>(({ paperTextureID }, ref) => (
  <div ref={ref} className="book-page h-full w-full rounded-[5px] border border-[#b99562] bg-[#f3ead3]" aria-hidden="true">
    <div className="page-texture page-texture--left h-full w-full" style={getPaperTextureStyle(paperTextureID, 'left')} />
  </div>
));

BlankPage.displayName = 'BlankPage';

function isArabicBook(language: Book['language']): boolean {
  return language === 'ar';
}

/* =========================
   Book Reader
========================= */

type BookFlipEvent = {
  data?: number | string | null;
};

const READING_THEMES = [
  { id: 'morning', ar: 'صباح هادئ', en: 'Morning' },
  { id: 'evening', ar: 'مساء ذهبي', en: 'Golden evening' },
  { id: 'night-window', ar: 'نافذة ليلية', en: 'Night window' },
  { id: 'cafe', ar: 'مقهى', en: 'Cafe' },
  { id: 'home', ar: 'المنزل', en: 'Home' },
  { id: 'fireplace', ar: 'بجوار المدفأة', en: 'Fireplace' },
  { id: 'rain-video', ar: 'مطر هادئ', en: 'Quiet rain' },
] as const;

type ReaderAtmosphere = ReadingTheme | 'rain-video';

function ReadingCandle({ isArabic }: { isArabic: boolean }) {
  const [isLit, setIsLit] = useState(true);
  const [flameTilt, setFlameTilt] = useState(0);

  return (
    <button
      type="button"
      aria-label={isArabic ? (isLit ? 'إطفاء الشمعة' : 'إشعال الشمعة') : (isLit ? 'Extinguish candle' : 'Light candle')}
      aria-pressed={isLit}
      title={isArabic ? 'اضغط لإشعال أو إطفاء الشمعة' : 'Click to light or extinguish the candle'}
      onClick={() => setIsLit((lit) => !lit)}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        setFlameTilt(Math.max(-12, Math.min(12, ((event.clientX - bounds.left) / bounds.width - 0.5) * 24)));
      }}
      onPointerLeave={() => setFlameTilt(0)}
      style={{ '--flame-tilt': `${flameTilt}deg` } as React.CSSProperties}
      className="reader-candle absolute bottom-[8%] end-[4%] z-20"
    >
      <span className={`reader-candle__glow ${isLit ? 'is-lit' : ''}`} />
      <span className={`reader-candle__smoke ${isLit ? '' : 'is-visible'}`} />
      <span className={`reader-candle__flame ${isLit ? 'is-lit' : ''}`} />
      <span className="reader-candle__wick" />
      <span className="reader-candle__body" />
      <span className="reader-candle__base" />
    </button>
  );
}

export function BookReader({ locale = 'ar', bookId }: { locale?: string; bookId: string }) {
  const isArabic = locale === 'ar';

  const bookRef = useRef<BookFlipRef | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [startPage, setStartPage] = useState(0);
  const [book, setBook] = useState<Book | null>(null);
  const [pages, setPages] = useState<ReaderPage[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [isReadMode, setIsReadMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingTheme, setReadingTheme] = useState<ReaderAtmosphere>('morning');
  const [isRainVideoPlaying, setIsRainVideoPlaying] = useState(false);
  const [favoritePages, setFavoritePages] = useState<number[]>([]);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');

  // Zoom states
  const [isFlipping, setIsFlipping] = useState(false);
  const [viewMode, setViewMode] = useState<'left' | 'right' | 'spread'>('left');
  const [flipDirection, setFlipDirection] = useState<'next' | 'previous'>('next');

  const totalPages = pages.length;
  const totalFlipPages = totalPages + 2 + (totalPages % 2);
  const lastFlipPageIndex = totalFlipPages - 1;
  const activePage = pages[currentIndex - 1];
  const stackPageIndex = isFlipping
    ? flipDirection === 'next'
      ? Math.min(lastFlipPageIndex, currentIndex === 0 ? currentIndex + 1 : currentIndex + 2)
      : Math.max(0, currentIndex - 2)
    : currentIndex;
  const totalSheets = Math.ceil(totalPages / 2);
  const consumedSheets = Math.min(totalSheets, Math.floor(Math.max(0, stackPageIndex - 1) / 2));
  const rightPageStackDepth = Math.max(0, totalSheets - consumedSheets) * 5;
  const leftPageStackDepth = consumedSheets * 5;

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
          const requestedPage = Number(window.location.hash.match(/^#page-(\d+)$/)?.[1] ?? 0);
          const firstPage = requestedPage > 0 ? Math.min(bookPages.length, requestedPage) : 0;
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
      return { scale: 0.85, translateX: 0 };
    }

    if (currentIndex === 0 || currentIndex === lastFlipPageIndex) {
      return { scale: 1, translateX: 0 };
    }

    if (viewMode === 'left') {
      return { scale: 1.08, translateX: 145 };
    }

    if (viewMode === 'right') {
      return { scale: 1.08, translateX: -145 };
    }

    return { scale: 1, translateX: 0 };
  }, [currentIndex, isFlipping, lastFlipPageIndex, viewMode]);

  /* =========================
     Navigation
  ========================= */
  const handleFlipNext = useCallback(() => {
    if (bookRef.current) {
      setFlipDirection('next');
      setIsFlipping(true);
      setViewMode('spread');
      // في العربي: التقدم معناه flipNext (من اليسار لليمين)
      // في الإنجليزي: التقدم معناه flipNext (من اليسار لليمين)
      bookRef.current.pageFlip().flipNext();
    }
  }, []);

  const handleFlipPrev = useCallback(() => {
    if (bookRef.current) {
      setFlipDirection('previous');
      setIsFlipping(true);
      setViewMode('spread');
      // في العربي: الرجوع معناه flipPrev (من اليمين لليسار)
      // في الإنجليزي: الرجوع معناه flipPrev (من اليمين لليسار)
      bookRef.current.pageFlip().flipPrev();
    }
  }, []);

  const toggleFullscreen = async () => {
    if (!fullscreenRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await fullscreenRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === fullscreenRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  useEffect(() => {
    const handleReaderKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') handleFlipNext();
      if (event.key === 'ArrowLeft') handleFlipPrev();
    };

    window.addEventListener('keydown', handleReaderKeyDown);

    return () => {
      window.removeEventListener('keydown', handleReaderKeyDown);
    };
  }, [handleFlipNext, handleFlipPrev]);

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
    const page = activePage;
    if (!page) return;

    saveReadingProgress({
      bookId,
      bookTitle: book.title,
      chapterId: page.chapterId,
      page: page.pageNumber,
    });
  }, [activePage, book, bookId, pages.length]);

  const handleSavePage = async () => {
    const token = getToken();
    const page = activePage;
    if (!token) {
      setFavoriteError(isArabic ? 'سجّل الدخول لحفظ الصفحة في المفضلة.' : 'Sign in to save this page.');
      return;
    }
    if (!page?.chapterId) return;
    const pageNumber = page.pageNumber;
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

  const progress = totalPages === 0
    ? 0
    : currentIndex === 0
      ? 0
      : Math.round(((activePage?.pageNumber ?? totalPages) / totalPages) * 100);

  if (!book && !loadError) {
    return <main className="reader-page grid min-h-screen place-items-center text-sm">{isArabic ? 'جارٍ تحميل الكتاب...' : 'Loading book...'}</main>;
  }

  if (loadError || !book) {
    return (
      <main className="reader-page grid min-h-screen place-items-center px-6 text-center" dir={isArabic ? 'rtl' : 'ltr'}>
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
      className={`reader-page min-h-screen ${isReadMode ? 'reader-page--read-mode' : ''}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="reader-layout mx-auto w-full max-w-[1800px] px-3 py-4 sm:px-6 sm:py-6">
        <header className="reader-header mb-3 flex flex-wrap items-center justify-between gap-4 sm:mb-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#947331] sm:text-xs">
              {isArabic ? 'مساحة القراءة' : 'READING ROOM'}
            </p>
            <h1 className="mt-1 truncate text-xl font-semibold text-[#29231a] sm:text-2xl">{book.title}</h1>
            {!isReadMode && <p className="mt-1 text-xs text-[#766a55]">{book.author_display_name}{book.category_name ? ` · ${book.category_name}` : ''}</p>}
          </div>
          <button
            type="button"
            onClick={() => setIsReadMode((value) => !value)}
            aria-pressed={isReadMode}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 border border-[#a9843f]/50 bg-white/70 px-4 text-xs font-semibold tracking-[0.12em] text-[#5e4824] transition hover:bg-[#f3e4c1]"
          >
            <BookOpen size={16} aria-hidden="true" />
            {isReadMode ? 'EXIT READ MODE' : 'READ MODE'}
          </button>
        </header>

        {!isReadMode && (
          <nav className="reader-theme-picker mb-3 flex items-center gap-2 overflow-x-auto pb-2" aria-label={isArabic ? 'أجواء القراءة' : 'Reading atmosphere'}>
            {READING_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  if (theme.id === 'rain-video') setIsRainVideoPlaying(false);
                  setReadingTheme(theme.id);
                }}
                aria-pressed={readingTheme === theme.id}
                className={`shrink-0 border px-3 py-2 text-xs transition-colors ${readingTheme === theme.id ? 'border-[#8a6b27] bg-[#8a6b27] text-white' : 'border-[#b9a982]/70 bg-white/50 text-[#554a35] hover:bg-white/80'}`}
              >
                {isArabic ? theme.ar : theme.en}
              </button>
            ))}
          </nav>
        )}

        <section ref={fullscreenRef} className={`reader-stage reader-stage--${readingTheme}`} aria-label={isArabic ? 'قارئ الكتاب' : 'Book reader'}>
          <div className={`reader-scene reader-scene--${readingTheme}`} aria-hidden="true">
            {readingTheme === 'rain-video' ? (
              <video
                className={`reader-rain-video ${isRainVideoPlaying ? 'is-playing' : ''}`}
                src="/videos/videoplayback.mp4"
                poster="/images/night%20sky.svg"
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                onPlaying={() => setIsRainVideoPlaying(true)}
                onWaiting={() => setIsRainVideoPlaying(false)}
                onError={() => setIsRainVideoPlaying(false)}
                aria-hidden="true"
              />
            ) : (
              <>
                {readingTheme === 'night-window' && <div className="reader-night-sky" />}
                <ReadingRoomScene theme={readingTheme} />
              </>
            )}
          </div>
          <div className="book-reader-surface relative z-10 flex h-full w-full items-center justify-center">
            <div
              ref={containerRef}
              className="relative flex h-full w-full items-center justify-center transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translateX(${zoomTransform.translateX}px) scale(${zoomTransform.scale}) rotateY(-4deg) rotateX(1deg)`,
                transformOrigin: 'center center',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* @ts-expect-error react-pageflip supports this ref at runtime, but omits it from its declaration. */}
              <HTMLFlipBook
                width={430}
                height={559}
                size="stretch"
                minWidth={280}
                maxWidth={480}
                minHeight={400}
                maxHeight={624}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                key={`${book.id}:${totalFlipPages}:${startPage}`}
                ref={bookRef}
                className="demo-book"
                style={{
                  '--page-stack-depth': `${rightPageStackDepth}px`,
                  '--right-page-stack-depth': `${rightPageStackDepth}px`,
                  '--left-page-stack-depth': `${leftPageStackDepth}px`,
                  '--right-page-stack-opacity': rightPageStackDepth > 0 ? 1 : 0,
                  '--left-page-stack-opacity': leftPageStackDepth > 0 ? 1 : 0,
                } as React.CSSProperties}
                usePortrait={true}
                startPage={startPage}
                drawShadow={true}
                flippingTime={800}
                onFlip={handleFlip}
                onChangeState={handleChangeState}
              >
                <CoverPage key={`${book.id}-front-cover`} book={book} />
                {pages.map((page) => (
                  <BookPage
                    key={page.id}
                    page={page}
                    isArabic={isArabic}
                    isBlurred={viewMode !== 'spread' && page.pageNumber !== currentIndex + (viewMode === 'right' ? 1 : 0)}
                  />
                ))}
                {pages.length % 2 === 1 && (
                  <BlankPage key={`${book.id}-back-cover-spacer`} paperTextureID={book.paper_texture_id} />
                )}
                <CoverPage key={`${book.id}-back-cover`} book={book} isBackCover />
              </HTMLFlipBook>
            </div>
            {readingTheme === 'rain-video' && <BookRainOverlay targetRef={containerRef} />}
            {currentIndex > 0 && currentIndex < lastFlipPageIndex && (
              <button
                type="button"
                onClick={() => setViewMode((mode) => (mode === 'left' ? 'right' : 'left'))}
                disabled={isFlipping}
                className="absolute end-4 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#e0bd72] bg-[#4a321b]/90 text-[#f4d68f] shadow-[0_0_18px_rgba(217,175,87,0.38),inset_0_1px_2px_rgba(255,239,190,0.45)] transition hover:scale-105 hover:bg-[#62431f] disabled:opacity-50"
                aria-label={isArabic ? 'نقل التكبير إلى الصفحة الأخرى' : 'Move zoom to the other page'}
                title={isArabic ? 'نقل التكبير إلى الصفحة الأخرى' : 'Move zoom to the other page'}
              >
                {viewMode === 'left' ? <ArrowRight size={21} /> : <ArrowLeft size={21} />}
              </button>
            )}
            <ReadingCandle isArabic={isArabic} />
            <div className="absolute bottom-5 start-5 z-30 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSavePage}
                disabled={favoriteBusy || !activePage}
                className={`grid h-10 w-10 place-items-center border transition ${
                  activePage && favoritePages.includes(activePage.pageNumber)
                    ? 'border-[#d6b26b] bg-[#d6b26b]/25 text-[#684b17]'
                    : 'border-[#8a6b27]/40 bg-[#fffaf0]/80 text-[#5e4824] hover:bg-white'
                }`}
                aria-pressed={activePage ? favoritePages.includes(activePage.pageNumber) : false}
                aria-label={activePage && favoritePages.includes(activePage.pageNumber)
                  ? isArabic ? 'إزالة الصفحة من المفضلة' : 'Remove page from favorites'
                  : isArabic ? 'حفظ الصفحة في المفضلة' : 'Save page to favorites'}
              >
                <Bookmark size={20} fill={activePage && favoritePages.includes(activePage.pageNumber) ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="grid h-10 w-10 place-items-center border border-[#8a6b27]/40 bg-[#fffaf0]/80 text-[#5e4824] transition hover:bg-white"
                aria-label={isFullscreen ? (isArabic ? 'الخروج من ملء الشاشة' : 'Exit fullscreen') : (isArabic ? 'ملء الشاشة' : 'Fullscreen')}
                title={isFullscreen ? (isArabic ? 'الخروج من ملء الشاشة' : 'Exit fullscreen') : (isArabic ? 'ملء الشاشة' : 'Fullscreen')}
              >
                {isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
              </button>
            </div>
            {favoriteError && <p role="alert" className="absolute bottom-5 start-28 z-30 max-w-[65%] border border-[#a9843f]/30 bg-[#fffaf0]/95 px-3 py-2 text-xs text-[#684b17]">{favoriteError}</p>}
          </div>
        </section>

        <div className="reader-progress mx-auto mt-4 w-full max-w-[1400px] px-2 sm:mt-5 sm:px-4">
          <div className="mb-2 flex items-center justify-between text-xs text-[#5e513d]">
            <span>{isArabic ? 'تقدم القراءة' : 'Reading progress'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#6f5b3c]/20" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={isArabic ? 'تقدم القراءة' : 'Reading progress'}>
            <div className="h-full rounded-full bg-[#a9843f] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default BookReader;
