'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Book, getPublicBooks } from '@/services/books.service';
import { BookDetail } from '../BookDetail';

export function BookCatalog({ locale = 'ar' }: { locale?: string }) {
  const isArabic = locale === 'ar';
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getPublicBooks()
      .then((items) => {
        if (active) setBooks(items);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Request failed');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleBooks = books.filter((book) =>
    `${book.title} ${book.author_display_name} ${book.description}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );

  return (
    <main className="min-h-screen bg-[#f5f1e7] px-5 py-10 text-[#211f1a] sm:px-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#d9d1c0] pb-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6b27]">
              {isArabic ? 'مكتبة نبلان' : 'NIBLAN LIBRARY'}
            </p>
            <h1 className="text-3xl font-semibold">{isArabic ? 'الكتب المنشورة' : 'Published books'}</h1>
            <p className="mt-2 max-w-xl text-sm text-[#716b60]">
              {isArabic ? 'اكتشف كتبًا كتبها ونشرها مجتمع نبلان.' : 'Discover books written and published by the NIBLAN community.'}
            </p>
          </div>
          <label className="flex h-11 w-full max-w-sm items-center gap-2 border-b border-[#b6aa91] bg-white/50 px-3 text-[#777064] focus-within:border-[#98752c]">
            <Search size={17} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-[#211f1a] outline-none placeholder:text-[#8c867a]"
              placeholder={isArabic ? 'ابحث بالعنوان أو الكاتب' : 'Search title or author'}
              aria-label={isArabic ? 'ابحث في الكتب' : 'Search books'}
            />
          </label>
        </header>

        {loading ? (
          <div className="py-24 text-center text-sm text-[#716b60]">{isArabic ? 'جارٍ تحميل الكتب...' : 'Loading books...'}</div>
        ) : error ? (
          <div role="alert" className="py-24 text-center text-sm text-[#9d3a2f]">
            {isArabic ? 'تعذر تحميل الكتب. تحقق من اتصال الخادم.' : 'Could not load books. Check the server connection.'}
          </div>
        ) : visibleBooks.length === 0 ? (
          <div className="py-24 text-center">
            <BookOpen className="mx-auto mb-4 text-[#a39475]" size={34} aria-hidden="true" />
            <p className="text-sm text-[#716b60]">
              {query
                ? isArabic ? 'لا توجد نتائج مطابقة.' : 'No matching books.'
                : isArabic ? 'لا توجد كتب منشورة بعد.' : 'No books have been published yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleBooks.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => setSelectedBook(book)}
                aria-label={isArabic ? `تفاصيل ${book.title}` : `Details for ${book.title}`}
                className="group min-w-0 text-start"
              >
                <div className="relative aspect-[3/4] overflow-hidden border border-[#d2c8b4] bg-[#e8dfce] shadow-[0_8px_18px_rgba(38,31,18,0.12)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_26px_rgba(38,31,18,0.18)]">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#9b8b68]"><BookOpen size={42} aria-hidden="true" /></div>
                  )}
                </div>
                <h2 className="mt-3 truncate text-sm font-semibold text-[#28251f] group-hover:text-[#8a6b27]">{book.title}</h2>
                <p className="mt-1 truncate text-xs text-[#716b60]">{book.author_display_name}</p>
                {book.category_name && <p className="mt-1 truncate text-xs text-[#8a6b27]">{book.category_name}</p>}
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedBook && <BookDetail book={selectedBook} locale={locale} onClose={() => setSelectedBook(null)} />}
    </main>
  );
}