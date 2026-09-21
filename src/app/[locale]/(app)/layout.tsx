import React from 'react';
import AppShell from '../../../components/layout/AppShell';

// Wraps every page in the (app) route group (profile, posts, settings, ...)
// in the shared cream/gold chrome (Header + Sidebar) so these pages match
// the home page design instead of rendering bare. The locale comes from the
// dynamic [locale] segment.
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AppShell locale={locale}>{children}</AppShell>;
}
