import React from 'react';

interface HomeFeaturesProps {
  locale: string;
}

// ⚠ This replaces the previous "Vast Library / Active Community / Smart
// Learning" 3-card layout — the new design shows a 4-item icon strip
// instead, so the content below was rewritten to match the mockup.
const FEATURES = [
  {
    ar_title: 'محتوى موثوق',
    en_title: 'Trusted Content',
    ar_desc: 'جودة عالية ومراجعة دقيقة',
    en_desc: 'High quality, carefully reviewed',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    ar_title: 'مجتمع داعم',
    en_title: 'Supportive Community',
    ar_desc: 'تعلم وتبادل الخبرات',
    en_desc: 'Learn and share experience',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20c0-3.3 3-6 7-6s7 2.7 7 6" />
        <circle cx="17" cy="8" r="2.5" />
        <path d="M17 12.5c2.5.3 4 2.2 4 4.5" />
      </svg>
    ),
  },
  {
    ar_title: 'ذكاء اصطناعي متقدم',
    en_title: 'Advanced AI',
    ar_desc: 'مساعدتك في كل خطوة',
    en_desc: 'Helping you every step',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none" />
        <path d="M8 15c1 1 2 1.5 4 1.5s3-.5 4-1.5" />
      </svg>
    ),
  },
  {
    ar_title: 'تعلم مستمر',
    en_title: 'Continuous Learning',
    ar_desc: 'رحلتك لا تتوقف',
    en_desc: 'Your journey never stops',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 109-9" />
        <path d="M3 4v8h8" />
      </svg>
    ),
  },
];

export default function HomeFeatures({ locale }: HomeFeaturesProps) {
  const isArabic = locale === 'ar';

  return (
    <div className="py-10">
      <div className="bg-white border border-[#E8DFCB] rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#E8DFCB]">
        {FEATURES.map((feature, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-2 p-6">
            <div className="w-11 h-11 rounded-full border border-[#E8DFCB] flex items-center justify-center text-[#C69A3E]">
              {feature.icon}
            </div>
            <div className="font-semibold text-sm text-[#211B12]">
              {isArabic ? feature.ar_title : feature.en_title}
            </div>
            <div className="text-xs text-[#8A8172]">{isArabic ? feature.ar_desc : feature.en_desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
