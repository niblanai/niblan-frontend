import Link from 'next/link';
import React from 'react';
import SectionHeader from '../SectionHeader';

interface KnowledgeGatesProps {
  locale: string;
}

// ⚠ Titles/counts/image paths are transcribed from the design mockup —
// treat as placeholder content until wired up to real category data.
const GATES = [
  { ar: 'الفلسفة والحياة', en: 'Philosophy & Life', count: 1245, image: '/images/gate-philosophy.jpg', href: 'philosophy' },
  { ar: 'العلوم والتقنية', en: 'Science & Technology', count: 2340, image: '/images/gate-science.jpg', href: 'science' },
  { ar: 'التاريخ والحضارات', en: 'History & Civilizations', count: 1890, image: '/images/gate-history.jpg', href: 'history' },
  { ar: 'الأدب واللغات', en: 'Literature & Languages', count: 2120, image: '/images/gate-literature.jpg', href: 'literature' },
  { ar: 'الأعمال والريادة', en: 'Business & Entrepreneurship', count: 1560, image: '/images/gate-business.jpg', href: 'business' },
];

export default function KnowledgeGates({ locale }: KnowledgeGatesProps) {
  const isArabic = locale === 'ar';

  return (
    <section className="py-8">
      <SectionHeader
        title={isArabic ? 'بوابات المعرفة' : 'Knowledge Gates'}
        viewAllHref={`/${locale}/gates`}
        viewAllLabel={isArabic ? 'عرض الكل' : 'View all'}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {GATES.map((gate) => (
          <Link
            key={gate.href}
            href={`/${locale}/gates/${gate.href}`}
            className="group relative rounded-xl overflow-hidden h-40 block bg-[#DDD1B0]"
          >
            <img src={gate.image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute bottom-0 p-3 text-white">
              <div className="font-semibold text-sm">{isArabic ? gate.ar : gate.en}</div>
              <div className="text-xs text-white/70">
                {gate.count.toLocaleString()} {isArabic ? 'محتوى' : 'items'}
              </div>
            </div>
          </Link>
        ))}

        <Link
          href={`/${locale}/gates`}
          className="rounded-xl h-40 bg-[#15130D] flex flex-col items-center justify-center gap-2 text-white hover:bg-[#221E15] transition"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D9B565" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span className="text-sm font-semibold">{isArabic ? 'وغيرها' : 'And more'}</span>
          <span className="text-xs text-white/60">{isArabic ? 'اكتشف المزيد' : 'Discover more'}</span>
        </Link>
      </div>
    </section>
  );
}
