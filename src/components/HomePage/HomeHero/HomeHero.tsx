import Link from 'next/link';
import React from 'react';

interface HomeHeroProps {
  locale: string;
  // ⚠ These three are shown hardcoded from the design mockup. In a real
  // page these almost certainly come from the logged-in user's data —
  // swap this default for real props/fetching when that's wired up.
  knowledgeLevelLabel?: string;
  progressPercent?: number;
  points?: number;
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function BulbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0012 2z" />
    </svg>
  );
}

export default function HomeHero({
  locale,
  knowledgeLevelLabel,
  progressPercent = 0,
  points = 0,
}: HomeHeroProps) {
  const isArabic = locale === 'ar';
  const level = knowledgeLevelLabel ?? (isArabic ? 'مبتدئ' : 'Beginner');

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <section className="pt-6">
      <div className="relative rounded-3xl overflow-hidden min-h-[420px] md:min-h-[520px] flex flex-col md:flex-row md:items-end md:justify-end bg-[#2A2418]">
        {/* ⚠ placeholder hero image — replace with the real city illustration asset */}
        <img
          src="/images/hero-city.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        {/* Knowledge level card — stacked block on mobile, floating card from md up */}
        <div className="relative md:absolute md:top-6 md:right-6 z-10 w-64 mx-auto mt-6 md:mx-0 md:mt-0 bg-[#15130D]/90 backdrop-blur-sm rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/70">{isArabic ? 'مستواك المعرفي' : 'Your knowledge level'}</span>
            <span className="flex items-center gap-1 bg-[#C69A3E]/20 text-[#D9B565] text-xs font-semibold px-2 py-1 rounded-full">
              <BulbIcon />
              {level}
            </span>
          </div>

          <div className="flex flex-col items-center mb-4">
            <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#D9B565"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                transform="rotate(90 50 50)"
                className="fill-white font-bold text-[20px]"
              >
                {progressPercent}%
              </text>
            </svg>
            <span className="text-xs text-white/60 mt-1">{isArabic ? 'من المستوى القادم' : 'to next level'}</span>
          </div>

          <div className="text-center mb-4">
            <div className="text-2xl font-bold">{points.toLocaleString()}</div>
            <div className="text-xs text-white/60">{isArabic ? 'نقاط المعرفة' : 'knowledge points'}</div>
          </div>

          <Link
            href={`/${locale}/profile/journey`}
            className="block text-center bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] font-semibold text-sm py-2.5 rounded-xl transition"
          >
            {isArabic ? 'استعرض رحلتك' : 'View your journey'}
          </Link>
        </div>

        {/* Welcome copy */}
        <div className="relative z-10 p-6 pt-4 md:p-12 max-w-full md:max-w-[min(36rem,calc(100%-19rem))]">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
            {isArabic ? 'مرحبًا بك في نبلان' : 'Welcome to Niblan'}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium mb-4">
            {isArabic ? 'مدينتك للمعرفة' : 'Your city of knowledge'}
          </p>
          <p className="text-white/75 mb-8 leading-relaxed">
            {isArabic
              ? 'استكشف، تعلم، شارك، وتقدم في رحلتك المعرفية وسط مجتمع من أبناء المدينة.'
              : 'Explore, learn, share, and progress on your learning journey among a community of fellow citizens.'}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/library`}
              className="flex items-center gap-2 bg-white hover:bg-white/90 text-[#15130D] font-semibold px-6 py-3 rounded-xl transition"
            >
              <BookIcon />
              {isArabic ? 'متابعة القراءة' : 'Continue reading'}
            </Link>
            <Link
              href={`/${locale}/explore`}
              className="bg-[#15130D] hover:bg-[#221E15] text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              {isArabic ? 'اكتشف المدينة' : 'Discover the city'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
