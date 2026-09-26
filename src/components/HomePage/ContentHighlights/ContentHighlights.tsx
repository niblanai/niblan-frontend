'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SectionHeader from '../SectionHeader';
import { Book, getPublicBooks } from '@/services/books.service';

interface ContentHighlightsProps {
  locale: string;
}

const AUDIO = [
  { ar: 'فن التفكير الواضح', en: 'The Art of Clear Thinking', minutes: 30, image: '/images/audio-1.jpg' },
  { ar: 'تاريخ الأندلس', en: 'History of Andalusia', minutes: 45, image: '/images/audio-2.jpg' },
  { ar: 'الذكاء العاطفي', en: 'Emotional Intelligence', minutes: 28, image: '/images/audio-3.jpg' },
];

const ARTICLES = [
  { ar: 'كيف تبني عادة يومية تدوم', en: 'How to build a habit that lasts', ar_author: 'أحمد أل سليمان', en_author: 'Ahmed Al Suleiman', minutes: 5, image: '/images/article-1.jpg' },
  { ar: 'مستقبل التعليم في عصر الذكاء الاصطناعي', en: 'The future of education in the AI era', ar_author: 'سارة الخطيب', en_author: 'Sara Al Khatib', minutes: 7, image: '/images/article-2.jpg' },
  { ar: 'أسرار التركيز العميق', en: 'The secrets of deep focus', ar_author: 'محمد العبدالله', en_author: 'Mohamed Al Abdullah', minutes: 4, image: '/images/article-3.jpg' },
];

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#15130D" stroke="none">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
    </svg>
  );
}

export default function ContentHighlights({ locale }: ContentHighlightsProps) {
  const isArabic = locale === 'ar';
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    let active = true;
    getPublicBooks()
      .then((items) => {
        if (active) setBooks(items.slice(0, 3));
      })
      .catch(() => {
        if (active) setBooks([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-4">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Interactive books */}
        <div className="bg-white border border-[#E8DFCB] rounded-2xl p-5">
          <SectionHeader
            title={isArabic ? 'كتب تفاعلية' : 'Interactive Books'}
            viewAllHref={`/${locale}/books`}
            viewAllLabel={isArabic ? 'عرض الكل' : 'View all'}
          />
          <div className="space-y-4">
            {books.length === 0 && <p className="py-4 text-xs text-[#8A8172]">{isArabic ? 'لا توجد كتب منشورة بعد.' : 'No published books yet.'}</p>}
            {books.map((book) => (
              <Link key={book.id} href={`/${locale}/books/${book.id}`} className="flex gap-3 group">
                <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-[#EFE8D8]">
                  {book.cover_url && <img src={book.cover_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-[#211B12] group-hover:text-[#C69A3E] transition truncate">
                    {book.title}
                  </div>
                  <div className="text-xs text-[#8A8172] mb-1.5 truncate">{book.author_display_name}</div>
                  <div className="text-xs text-[#8A8172] line-clamp-2">{book.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Audio recordings */}
        <div className="bg-white border border-[#E8DFCB] rounded-2xl p-5">
          <SectionHeader
            title={isArabic ? 'التسجيلات الصوتية' : 'Audio Recordings'}
            viewAllHref={`/${locale}/audio`}
            viewAllLabel={isArabic ? 'عرض الكل' : 'View all'}
          />
          <div className="space-y-3">
            {AUDIO.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={isArabic ? 'تشغيل' : 'Play'}
                  className="w-8 h-8 shrink-0 rounded-full bg-[#F0E7CE] flex items-center justify-center hover:bg-[#E6D9B4] transition"
                >
                  <PlayIcon />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-[#211B12] truncate">{isArabic ? item.ar : item.en}</div>
                  <div className="text-xs text-[#8A8172]">{item.minutes} {isArabic ? 'دقيقة' : 'min'}</div>
                </div>
                <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 bg-[#EFE8D8]" />
                <button type="button" aria-label={isArabic ? 'خيارات' : 'Options'} className="text-[#B3AB98] hover:text-[#8A8172] shrink-0">
                  <DotsIcon />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Featured articles */}
        <div className="bg-white border border-[#E8DFCB] rounded-2xl p-5">
          <SectionHeader
            title={isArabic ? 'مقالات مختارة' : 'Featured Articles'}
            viewAllHref={`/${locale}/articles`}
            viewAllLabel={isArabic ? 'عرض الكل' : 'View all'}
          />
          <div className="space-y-4">
            {ARTICLES.map((article, i) => (
              <Link key={i} href={`/${locale}/articles/${i}`} className="flex items-center gap-3 group">
                <img src={article.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 bg-[#EFE8D8]" />
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-[#211B12] group-hover:text-[#C69A3E] transition truncate">
                    {isArabic ? article.ar : article.en}
                  </div>
                  <div className="text-xs text-[#8A8172] truncate">
                    {isArabic ? article.ar_author : article.en_author} · {article.minutes} {isArabic ? 'دقائق قراءة' : 'min read'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
