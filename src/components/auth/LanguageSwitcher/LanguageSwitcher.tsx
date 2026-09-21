"use client";
import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

interface LanguageSwitcherProps {
  /** Extra classes for the outer button. */
  className?: string;
  /** Force a specific current locale instead of reading from the URL. */
  locale?: string;
}

// Swaps the `/{locale}` segment at the start of the pathname so the user
// stays on the same page but in the other language (ar <-> en).
export default function LanguageSwitcher({ className = '', locale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams() as { locale?: string } | undefined;

  const current = (locale ?? params?.locale ?? 'ar').toLowerCase();
  const target = current === 'ar' ? 'en' : 'ar';

  const handleToggle = () => {
    // Replace only the leading locale segment, keep the rest of the path
    // (and search/hash) intact so we stay on the same page.
    const segments = (pathname ?? '').split('/').filter(Boolean);
    if (segments.length > 0) {
      segments[0] = target;
    } else {
      segments.push(target);
    }
    router.push('/' + segments.join('/'));
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={current === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      className={`group inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md border border-[#E8DFCB] px-3 py-1.5 text-sm font-bold text-[#4A4436] hover:border-[#C69A3E] hover:text-[#15130D] shadow-[0_4px_16px_-6px_rgba(21,19,13,0.25)] transition-all duration-300 ${className}`}
    >
      {/* Globe icon */}
      <svg className="w-4 h-4 text-[#C69A3E] transition-transform duration-500 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
      </svg>
      <span>{target.toUpperCase()}</span>
    </button>
  );
}
