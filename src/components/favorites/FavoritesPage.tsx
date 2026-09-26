'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Bookmark, FileText, Headphones, Mic2 } from 'lucide-react';
import { getToken } from '@/services/auth.service';
import { Book, FavoriteArticle, FavoritePage, FavoritesResponse, getFavorites } from '@/services/books.service';
import { BookDetail } from '@/components/books/BookDetail';

type FavoriteKind = 'all' | 'books' | 'pages' | 'articles' | 'audio' | 'podcasts';

export function FavoritesPage({ locale = 'ar' }: { locale?: string }) {
  const isArabic = locale === 'ar';
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoritesResponse | null>(null);
  const [kind, setKind] = useState<FavoriteKind>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError(isArabic ? 'سجّل الدخول لعرض مفضلتك.' : 'Sign in to view your favorites.');
      setLoading(false);
      return;
    }
    let active = true;
    getFavorites(token)
      .then((result) => {
        if (active) setFavorites(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : (isArabic ? 'تعذر تحميل المفضلة.' : 'Could not load favorites.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isArabic]);

  const labels: Record<FavoriteKind, string> = {
    all: isArabic ? 'الكل' : 'All',
    books: isArabic ? 'الكتب' : 'Books',
    pages: isArabic ? 'صفحات الكتب' : 'Book pages',
    articles: isArabic ? 'المقالات' : 'Articles',
    audio: isArabic ? 'الصوتيات' : 'Audio',
    podcasts: isArabic ? 'البودكاست' : 'Podcasts',
  };

  const filters: FavoriteKind[] = ['all', 'books', 'pages', 'articles', 'audio', 'podcasts'];
  const counts: Record<FavoriteKind, number> = {
    all: favorites ? favorites.books.length + favorites.pages.length + favorites.articles.length + favorites.audio.length + favorites.podcasts.length : 0,
    books: favorites?.books.length ?? 0,
    pages: favorites?.pages.length ?? 0,
    articles: favorites?.articles.length ?? 0,
    audio: favorites?.audio.length ?? 0,
    podcasts: favorites?.podcasts.length ?? 0,
  };

  const emptyMessage = (type: FavoriteKind) => type === 'audio' || type === 'podcasts'
    ? isArabic ? 'لا توجد عناصر محفوظة من هذا النوع حتى الآن.' : 'No saved items of this type yet.'
    : isArabic ? 'لا توجد عناصر محفوظة هنا بعد.' : 'Nothing saved here yet.';

  const renderBooks = (books: Book[]) => books.length ? (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book) => (
        <button key={book.id} type="button" onClick={() => setSelectedBook(book)} className="group min-w-0 text-start">
          <div className="aspect-[3/4] overflow-hidden border border-[#d2c8b4] bg-[#e8dfce] shadow-[0_8px_18px_rgba(38,31,18,.12)] transition-transform group-hover:-translate-y-1">
            {book.cover_url ? <img src={book.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#9b8b68]"><BookOpen size={34} /></div>}
          </div>
          <h2 className="mt-3 truncate text-sm font-semibold text-[#28251f] group-hover:text-[#8a6b27]">{book.title}</h2>
          <p className="mt-1 truncate text-xs text-[#716b60]">{book.author_display_name}</p>
          {book.category_name && <p className="mt-1 truncate text-xs text-[#8a6b27]">{book.category_name}</p>}
        </button>
      ))}
    </div>
  ) : <EmptyMessage message={emptyMessage('books')} />;

  const renderPages = (pages: FavoritePage[]) => pages.length ? (
    <div className="divide-y divide-[#ded6c7] border-y border-[#ded6c7]">
      {pages.map((page) => (
        <Link key={page.id} href={`/${locale}/books/${page.book_id}#page-${page.page_number}`} className="flex items-center gap-4 py-4 hover:bg-white/60">
          <div className="h-20 w-14 shrink-0 overflow-hidden border border-[#d2c8b4] bg-[#e8dfce]">
            {page.cover_url && <img src={page.cover_url} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-[#28251f]">{page.book_title}</h2>
            <p className="mt-1 truncate text-xs text-[#716b60]">{page.author_display_name}</p>
            <p className="mt-1 truncate text-xs text-[#8a6b27]">{page.chapter_title}{page.label ? ` · ${page.label}` : ''}</p>
          </div>
          <span className="shrink-0 text-xs text-[#716b60]">{isArabic ? `ص ${page.page_number}` : `p. ${page.page_number}`}</span>
        </Link>
      ))}
    </div>
  ) : <EmptyMessage message={emptyMessage('pages')} />;

  const renderArticles = (articles: FavoriteArticle[]) => articles.length ? (
    <div className="divide-y divide-[#ded6c7] border-y border-[#ded6c7]">
      {articles.map((article) => (
        <Link key={article.id} href={`/${locale}/articles/${article.id}`} className="flex items-center gap-4 py-4 hover:bg-white/60">
          <div className="h-16 w-16 shrink-0 overflow-hidden border border-[#d2c8b4] bg-[#e8dfce]">
            {article.cover_url && <img src={article.cover_url} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[#28251f]">{article.title}</h2>
            <p className="mt-1 truncate text-xs text-[#716b60]">{article.author_display_name}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#716b60]">{article.excerpt}</p>
          </div>
        </Link>
      ))}
    </div>
  ) : <EmptyMessage message={emptyMessage('articles')} />;

  const renderEmptyType = (type: FavoriteKind) => (
    <EmptyMessage message={emptyMessage(type)} />
  );

  const section = (type: FavoriteKind, icon: React.ReactNode, content: React.ReactNode) => (
    <section key={type} className="mb-8">
      <div className="mb-4 flex items-center gap-2 border-b border-[#d9d1c0] pb-3 text-[#4c463c]">
        {icon}<h2 className="text-lg font-semibold">{labels[type]}</h2>
        <span className="text-xs text-[#8a8172]">{counts[type]}</span>
      </div>
      {content}
    </section>
  );

  const contentByKind: Record<FavoriteKind, React.ReactNode> = {
    all: (
      <>
        {section('books', <BookOpen size={18} />, renderBooks(favorites?.books ?? []))}
        {section('pages', <Bookmark size={18} />, renderPages(favorites?.pages ?? []))}
        {section('articles', <FileText size={18} />, renderArticles(favorites?.articles ?? []))}
        {section('audio', <Headphones size={18} />, renderEmptyType('audio'))}
        {section('podcasts', <Mic2 size={18} />, renderEmptyType('podcasts'))}
      </>
    ),
    books: renderBooks(favorites?.books ?? []),
    pages: renderPages(favorites?.pages ?? []),
    articles: renderArticles(favorites?.articles ?? []),
    audio: renderEmptyType('audio'),
    podcasts: renderEmptyType('podcasts'),
  };

  return (
    <main className="min-h-screen bg-[#f5f1e7] px-5 py-8 text-[#211f1a] sm:px-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 border-b border-[#d9d1c0] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6b27]">NIBLAN</p>
          <h1 className="mt-2 text-3xl font-semibold">{isArabic ? 'مفضلتي' : 'My favorites'}</h1>
        </header>

        <nav className="mb-7 flex gap-2 overflow-x-auto border-b border-[#d9d1c0]" aria-label={isArabic ? 'تصفية المفضلة' : 'Filter favorites'}>
          {filters.map((filter) => (
            <button key={filter} type="button" onClick={() => setKind(filter)} aria-pressed={kind === filter} className={`shrink-0 border-b-2 px-3 py-3 text-sm transition ${kind === filter ? 'border-[#98752c] font-semibold text-[#634c17]' : 'border-transparent text-[#716b60] hover:text-[#28251f]'}`}>
              {labels[filter]} <span className="ms-1 text-xs opacity-70">{counts[filter]}</span>
            </button>
          ))}
        </nav>

        {loading ? <p className="py-20 text-center text-sm text-[#716b60]">{isArabic ? 'جارٍ تحميل المفضلة...' : 'Loading favorites...'}</p>
          : error ? <div className="py-20 text-center"><p role="alert" className="text-sm text-[#9d3a2f]">{error}</p><button onClick={() => router.push(`/${locale}/auth/login`)} className="mt-4 border-b border-[#98752c] pb-1 text-sm text-[#634c17]">{isArabic ? 'تسجيل الدخول' : 'Sign in'}</button></div>
            : <div>{contentByKind[kind]}</div>}
      </div>
      {selectedBook && <BookDetail book={selectedBook} locale={locale} onClose={() => setSelectedBook(null)} />}
    </main>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return <p className="border-y border-[#ded6c7] py-8 text-center text-sm text-[#716b60]">{message}</p>;
}