import React, { ReactNode } from 'react';
import LanguageSwitcher from '../LanguageSwitcher';

interface AuthShellProps {
  children: ReactNode;
  /** 'ar' for Arabic, anything else for English. Defaults to 'ar' to keep
   *  the previous default behaviour for callers that don't pass a locale. */
  locale?: string;
  /** When true the page renders a compact centered card (default). Set to
   *  false for full-bleed pages such as the OAuth callback. */
  card?: boolean;
}

// Shared chrome for every authentication page. Keeps the cream/gold theme of
// the HomePage consistent across login, register, reset-password, etc.
export default function AuthShell({ children, locale = 'ar', card = true }: AuthShellProps) {
  const isArabic = locale === 'ar';

  return (
    <main className="min-h-screen bg-[#F8F3E7] text-[#211B12] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background video — loops forever, muted, no controls. Covers the area
          behind the card to give the page a living backdrop. */}
      <video
        className="pointer-events-none absolute inset-0 w-full h-full object-cover"
        src="/videos/video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      {/* Warm tint over the video so the white card stays readable and the
          palette stays cohesive with the gold/cream theme. */}
      <div className="pointer-events-none absolute inset-0 bg-[#F8F3E7]/70 backdrop-blur-[2px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#15130D]/30 via-transparent to-[#C69A3E]/15" />

      {/* Soft decorative glow in the corners */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-[#C69A3E]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#D9B565]/15 blur-[120px]" />

      {/* Language switcher — pinned to the top-right of the viewport */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher locale={locale} />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Brand lockup */}
        <div className="flex items-center gap-2 mb-8">
          <img src="/images/logo.svg" alt="NIBLAN" className="h-11 w-auto object-contain" />
          <div className="leading-tight">
            <div className="font-bold text-lg text-[#15130D] tracking-wide drop-shadow-sm">NIBLAN</div>
            <div className="text-[11px] text-[#4A4436]">
              {isArabic ? 'مدينتك للمعرفة' : 'Your city of knowledge'}
            </div>
          </div>
        </div>

        {card ? (
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md border border-[#E8DFCB] rounded-3xl shadow-[0_20px_60px_-15px_rgba(21,19,13,0.35)] p-6 sm:p-8 lg:p-10">
            {children}
          </div>
        ) : (
          <div className="w-full max-w-md">{children}</div>
        )}
      </div>
    </main>
  );
}
