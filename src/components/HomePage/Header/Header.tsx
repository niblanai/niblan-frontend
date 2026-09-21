'use client';

import Link from 'next/link';
import React from 'react';
import CreateMenu from '../CreateMenu';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

interface HeaderProps {
  locale: string;
}

// ⚠ English labels below are my own translation for the `en` locale — the
// source design was Arabic-only, so there's no reference copy for these.
const NAV_ITEMS = [
  { ar: 'الرئيسية', en: 'Home', href: '', active: true },
  { ar: 'المكتبة', en: 'Library', href: 'library' },
  { ar: 'الغرف', en: 'Rooms', href: 'rooms' },
  { ar: 'المقالات', en: 'Articles', href: 'articles' },
  { ar: 'التسجيلات الصوتية', en: 'Audio', href: 'audio' },
  { ar: 'الكتب التفاعلية', en: 'Interactive Books', href: 'interactive-books' },
  { ar: 'المسابقات', en: 'Competitions', href: 'competitions' },
  { ar: 'المجتمع', en: 'Community', href: 'community' },
];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

export default function Header({ locale }: HeaderProps) {
  const isArabic = locale === 'ar';
  // Real user avatar from GET /users/me (shares the page-level cache with
  // Sidebar — one request total, not one per component).
  const { user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 bg-[#F8F3E7]/95 backdrop-blur-sm border-b border-[#E8DFCB]">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo — renders at the visual "start" (right in RTL) */}
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
          {/* ⚠ placeholder path — put the real logo file at apps/frontend/public/images/logo.svg (or change the extension below to match) */}
          <img src="/images/logo.svg" alt="NIBLAN" className="h-10 w-auto object-contain" />
          <div className="leading-tight hidden sm:block">
            <div className="font-bold text-base text-[#15130D] tracking-wide">NIBLAN</div>
            <div className="text-[11px] text-[#8A8172]">{isArabic ? 'مدينتك للمعرفة' : 'Your city of knowledge'}</div>
          </div>
        </Link>

        {/* Center nav */}
        <nav className="flex items-center gap-3 lg:gap-5 text-sm text-[#4A4436] whitespace-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href ? `/${item.href}` : ''}`}
              className={`flex items-center gap-1.5 pb-1 transition ${
                item.active
                  ? 'text-[#15130D] font-semibold border-b-2 border-[#C69A3E]'
                  : 'hover:text-[#C69A3E]'
              }`}
            >
              {item.active && <HomeIcon />}
              {isArabic ? item.ar : item.en}
            </Link>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-white border border-[#E8DFCB] rounded-full px-4 py-2 w-56 xl:w-72 text-[#8A8172]">
            <SearchIcon />
            <input
              type="text"
              placeholder={isArabic ? 'ابحث في الكتب، المقالات، التسجيلات، الغرف...' : 'Search books, articles, audio, rooms...'}
              className="bg-transparent outline-none text-sm w-full placeholder:text-[#B3AB98] text-[#211B12]"
            />
          </div>

          {/* Replaced the dead /create link with a dropdown menu of creation
              options (today: create post; placeholders for more later). */}
          <CreateMenu locale={locale} variant="header" />

          <button
            type="button"
            aria-label={isArabic ? 'الرسائل' : 'Messages'}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#4A4436] hover:bg-[#EFE8D8] transition"
          >
            <MailIcon />
          </button>

          <button
            type="button"
            aria-label={isArabic ? 'الإشعارات' : 'Notifications'}
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#4A4436] hover:bg-[#EFE8D8] transition"
          >
            <BellIcon />
            <span className="absolute -top-0.5 -right-0.5 bg-[#C0392B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              5
            </span>
          </button>

          <Link href={`/${locale}/profile`} className="flex items-center gap-1 shrink-0">
            <span className="w-9 h-9 rounded-full bg-[#E8DFCB] overflow-hidden border border-[#E8DFCB] block">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <img src="/images/avatar-placeholder.jpg" alt="" className="w-full h-full object-cover" />
              )}
            </span>
            <ChevronIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}
