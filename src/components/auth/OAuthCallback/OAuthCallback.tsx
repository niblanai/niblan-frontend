"use client";
import React, { useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import AuthShell from '../AuthShell';

export default function OAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams() as { locale?: string; provider?: string } | undefined;
  const provider = params?.provider ?? 'provider';
  const locale = params?.locale ?? 'en';
  const isArabic = locale === 'ar';
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    // Simple placeholder flow: redirect back to localized login with status
    if (error) {
      router.replace(`/${locale}/auth/login?oauthError=${encodeURIComponent(error)}`);
      return;
    }

    if (code) {
      router.replace(`/${locale}/auth/login?oauth=${provider}&code=${encodeURIComponent(code)}`);
      return;
    }

    // No params, just go to login
    router.replace(`/${locale}/auth/login`);
  }, [code, error, provider, locale, router]);

  return (
    <AuthShell locale={locale} card={false}>
      <div className="text-center py-12">
        {/* Spinner with gold ring */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-[#E8DFCB]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#C69A3E] animate-spin" />
        </div>

        <h2 className="text-xl font-extrabold text-[#15130D] tracking-tight">
          {isArabic ? 'جاري معالجة تسجيل الدخول...' : 'Processing sign in...'}
        </h2>
        <p className="text-sm text-[#8A8172] mt-2">
          {isArabic ? 'المزوّد:' : 'Provider:'}{' '}
          <span className="font-semibold text-[#C69A3E] capitalize">{provider}</span>
        </p>
      </div>
    </AuthShell>
  );
}
