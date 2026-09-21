import Link from 'next/link';
import React from 'react';

interface AIAssistantPromoProps {
  locale: string;
}

export default function AIAssistantPromo({ locale }: AIAssistantPromoProps) {
  const isArabic = locale === 'ar';

  return (
    <section className="py-4">
      <div className="relative rounded-2xl overflow-hidden bg-[#15130D] min-h-[180px] flex items-center">
        {/* container already has a dark fallback bg, so a missing image here still looks intentional */}
        {/* ⚠ placeholder background art — replace with the real illustration asset */}
        <img
          src="/images/ai-assistant-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#15130D] via-[#15130D]/80 to-transparent" />

        <div className="relative z-10 p-8 max-w-md">
          <div className="text-sm text-[#D9B565] font-medium mb-1">
            {isArabic ? 'مساعدك الذكي' : 'Your smart assistant'}
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-2">{isArabic ? 'سديم' : 'Sadeem'}</h3>
          <p className="text-white/70 text-sm mb-5 leading-relaxed">
            {isArabic
              ? 'مستشارك المعرفي الخاص، اسأل عن أي موضوع وسديم هيساعدك في رحلتك المعرفية.'
              : 'Your personal knowledge advisor — ask about any topic and Sadeem will help you on your learning journey.'}
          </p>
          <Link
            href={`/${locale}/sadeem`}
            className="inline-block bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] font-semibold text-sm px-6 py-2.5 rounded-xl transition"
          >
            {isArabic ? 'اسأل سديم' : 'Ask Sadeem'}
          </Link>
        </div>
      </div>
    </section>
  );
}
