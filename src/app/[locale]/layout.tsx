import type { ReactNode } from 'react';
import '../globals.css';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export const metadata = {
  title: 'NIBLAN',
  description: 'NIBLAN - Platform for learning and content creation',
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  return (
    <html lang={locale} dir={isArabic ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
