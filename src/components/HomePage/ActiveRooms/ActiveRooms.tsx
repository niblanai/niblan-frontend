import Link from 'next/link';
import React from 'react';
import SectionHeader from '../SectionHeader';

interface ActiveRoomsProps {
  locale: string;
}

// ⚠ Titles/participant counts/images transcribed from the design mockup —
// placeholder content, small text in the source image may not be 100%
// legible, double check exact Arabic wording against the source file.
const ROOMS = [
  { ar: 'نادي كتاب نيسان', en: 'Nisan Book Club', participants: 336, image: '/images/room-1.jpg', href: 'book-club' },
  { ar: 'مناقشة: مستقبل البشرية', en: 'Discussion: The Future of Humanity', participants: 184, image: '/images/room-2.jpg', href: 'future-humanity' },
  { ar: 'ورشة كتابة إبداعية', en: 'Creative Writing Workshop', participants: 98, image: '/images/room-3.jpg', href: 'creative-writing' },
  { ar: 'تطوير الذات والمهارات', en: 'Self & Skills Development', participants: 312, image: '/images/room-4.jpg', href: 'self-development' },
];

function PeopleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3-6 7-6s7 2.7 7 6" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M17 12.5c2.5.3 4 2.2 4 4.5" />
    </svg>
  );
}

export default function ActiveRooms({ locale }: ActiveRoomsProps) {
  const isArabic = locale === 'ar';

  return (
    <section className="py-8">
      <SectionHeader
        title={isArabic ? 'غرف نشطة الآن' : 'Active Rooms Now'}
        viewAllHref={`/${locale}/rooms`}
        viewAllLabel={isArabic ? 'عرض الكل' : 'View all'}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROOMS.map((room) => (
          <div key={room.href} className="relative rounded-xl overflow-hidden h-44 bg-[#DDD1B0]">
            <img src={room.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-0 p-3 flex flex-col justify-between">
              <div />
              <div>
                <div className="font-semibold text-sm text-white mb-1">{isArabic ? room.ar : room.en}</div>
                <div className="flex items-center gap-1 text-xs text-white/70 mb-2">
                  <PeopleIcon />
                  {room.participants.toLocaleString()} {isArabic ? 'مشارك' : 'participants'}
                </div>
                <Link
                  href={`/${locale}/rooms/${room.href}`}
                  className="block text-center bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] text-xs font-semibold py-1.5 rounded-lg transition"
                >
                  {isArabic ? 'انضم' : 'Join'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
