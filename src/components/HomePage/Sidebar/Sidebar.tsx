'use client';

import Link from 'next/link';
import React from 'react';
import CreateMenu from '../CreateMenu';
import { formatCount, useCurrentUser } from '../../../hooks/useCurrentUser';

interface SidebarProps {
  locale: string;
}

// The profile card at the top renders the logged-in user's real data
// (name, avatar, follower/following/achievement counts via /users/me).
// FRIEND_ACTIVITY below is still placeholder content from the design
// mockup — replace with a real activity feed when that API exists.
const NAV_ITEMS = [
  { ar: 'الرئيسية', en: 'Home', href: '', active: true, icon: 'home' },
  { ar: 'ملفي الشخصي', en: 'My Profile', href: 'profile', icon: 'user' },
  { ar: 'المكتبة', en: 'Library', href: 'library', icon: 'book' },
  { ar: 'غرفي', en: 'My Rooms', href: 'my-rooms', icon: 'room' },
  { ar: 'مقالاتي', en: 'My Articles', href: 'my-articles', icon: 'article' },
  { ar: 'التسجيلات المحفوظة', en: 'Saved Recordings', href: 'saved-recordings', icon: 'save' },
  { ar: 'الكتب التفاعلية', en: 'Interactive Books', href: 'interactive-books', icon: 'interactive' },
  { ar: 'المفضلة', en: 'Favorites', href: 'favorites', icon: 'star' },
  { ar: 'إنجازاتي', en: 'My Achievements', href: 'achievements', icon: 'trophy' },
  { ar: 'إعدادات الحساب', en: 'Account Settings', href: 'settings', icon: 'settings' },
];

const FRIEND_ACTIVITY = [
  { ar: 'سارة أحمد أنهت كتاب', ar_target: 'فن اللامبالاة', en: 'Sara Ahmed finished', en_target: 'The Art of Not Giving a F*ck', ar_ago: 'منذ ساعة', en_ago: '1h ago', avatar: '/images/friend-1.jpg' },
  { ar: 'محمد علي نشر مقال جديد', ar_target: 'عن التعلم العميق', en: 'Mohamed Ali posted a new article', en_target: 'on deep learning', ar_ago: 'منذ 3 ساعات', en_ago: '3h ago', avatar: '/images/friend-2.jpg' },
  { ar: 'نور خالد انضمت إلى غرفة', ar_target: 'نادي كتاب نيسان', en: 'Nour Khaled joined a room', en_target: 'Nisan Book Club', ar_ago: 'منذ 5 ساعات', en_ago: '5h ago', avatar: '/images/friend-3.jpg' },
];

function icon(name: string) {
  const common = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'home': return <svg {...common}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>;
    case 'user': return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>;
    case 'book': return <svg {...common}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>;
    case 'room': return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3-6 7-6s7 2.7 7 6" /><circle cx="17" cy="8" r="2.5" /><path d="M17 12.5c2.5.3 4 2.2 4 4.5" /></svg>;
    case 'article': return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
    case 'save': return <svg {...common}><path d="M6 3h12v18l-6-4-6 4V3z" /></svg>;
    case 'interactive': return <svg {...common}><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 21h8M12 18v3" /></svg>;
    case 'star': return <svg {...common} fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
    case 'trophy': return <svg {...common}><path d="M8 4h8v4a4 4 0 01-8 0V4z" /><path d="M8 4H5a3 3 0 003 3M16 4h3a3 3 0 01-3 3M10 14v3m4-3v3M8 20h8" /></svg>;
    case 'settings': return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.3.9a7 7 0 00-2-1.2L14 3h-4l-.6 2.5a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.6a7 7 0 000 2.4l-2 1.6 2 3.4 2.3-.9a7 7 0 002 1.2L10 21h4l.6-2.5a7 7 0 002-1.2l2.3.9 2-3.4-2-1.6c.07-.4.1-.8.1-1.2z" /></svg>;
    default: return null;
  }
}

export default function Sidebar({ locale }: SidebarProps) {
  const isArabic = locale === 'ar';
  // Real data: name/avatar/counts come from GET /users/me (cached per page).
  const { user } = useCurrentUser();

  return (
    <aside className="w-full lg:w-[300px] shrink-0 space-y-4">
      {/* Profile card */}
      <div className="bg-white border border-[#E8DFCB] rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover bg-[#E8DFCB]" />
          ) : (
            <img src="/images/avatar-placeholder.jpg" alt="" className="w-14 h-14 rounded-full object-cover bg-[#E8DFCB]" />
          )}
          <div className="min-w-0">
            <div className="text-xs text-[#8A8172]">{isArabic ? 'أهلاً بك' : 'Welcome back'}</div>
            <div className="font-bold text-sm text-[#211B12] truncate">
              {user?.display_name ?? (isArabic ? '...' : '...')}
            </div>
            <div className="text-xs text-[#C69A3E] font-medium truncate">@{user?.username ?? '...'}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 text-center border-t border-[#E8DFCB] pt-4">
          <div>
            <div className="font-bold text-sm text-[#211B12]">{formatCount(user?.achievement_count)}</div>
            <div className="text-[11px] text-[#8A8172]">{isArabic ? 'الإنجازات' : 'Achievements'}</div>
          </div>
          <div className="border-x border-[#E8DFCB]">
            <div className="font-bold text-sm text-[#211B12]">{formatCount(user?.follower_count)}</div>
            <div className="text-[11px] text-[#8A8172]">{isArabic ? 'المتابعون' : 'Followers'}</div>
          </div>
          <div>
            <div className="font-bold text-sm text-[#211B12]">{formatCount(user?.following_count)}</div>
            <div className="text-[11px] text-[#8A8172]">{isArabic ? 'المتابعات' : 'Following'}</div>
          </div>
        </div>
      </div>

      {/* Nav menu */}
      <div className="bg-[#15130D] rounded-2xl p-3">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href ? `/${item.href}` : ''}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                item.active ? 'bg-[#C69A3E] text-[#15130D] font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {icon(item.icon)}
              {isArabic ? item.ar : item.en}
            </Link>
          ))}
        </nav>
        {/* Replaced the dead /create link with the same dropdown used in the
            Header — "sidebar" variant renders the full-width button shape. */}
        <CreateMenu locale={locale} variant="sidebar" />
      </div>

      {/* Daily goal */}
      <div className="bg-white border border-[#E8DFCB] rounded-2xl p-5">
        <div className="font-bold text-sm text-[#211B12] mb-2">{isArabic ? 'هدفك اليومي' : 'Your daily goal'}</div>
        <p className="text-xs text-[#8A8172] mb-3">
          {isArabic ? 'اقرأ أو استمع لمدة 120 دقيقة' : 'Read or listen for 120 minutes'}
        </p>
        <div className="h-2 rounded-full bg-[#F0E7CE] overflow-hidden mb-2">
          <div className="h-full bg-[#C69A3E] rounded-full" style={{ width: '67%' }} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8A8172]">80 / 120 {isArabic ? 'دقيقة' : 'min'}</span>
          <Link href={`/${locale}/challenges`} className="text-[#C69A3E] font-medium hover:underline">
            {isArabic ? 'عرض التحديات' : 'View challenges'}
          </Link>
        </div>
      </div>

      {/* Friends activity */}
      <div className="bg-white border border-[#E8DFCB] rounded-2xl p-5">
        <div className="font-bold text-sm text-[#211B12] mb-3">{isArabic ? 'نشاط الأصدقاء' : 'Friends activity'}</div>
        <div className="space-y-3">
          {FRIEND_ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <img src={item.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 bg-[#E8DFCB]" />
              <div className="min-w-0">
                <div className="text-xs text-[#4A4436] leading-snug">
                  <span className="font-semibold text-[#211B12]">{isArabic ? item.ar : item.en}</span>{' '}
                  <span className="text-[#8A8172]">&ldquo;{isArabic ? item.ar_target : item.en_target}&rdquo;</span>
                </div>
                <div className="text-[11px] text-[#B3AB98] mt-0.5">{isArabic ? item.ar_ago : item.en_ago}</div>
              </div>
            </div>
          ))}
        </div>
        <Link href={`/${locale}/activity`} className="block text-center text-xs text-[#C69A3E] font-medium hover:underline mt-3">
          {isArabic ? 'عرض كل النشاط' : 'View all activity'}
        </Link>
      </div>
    </aside>
  );
}
