import React from 'react';
import { Header } from '../../HomePage';

interface AppShellProps {
  locale: string;
  children: React.ReactNode;
}

// AppShell is the shared chrome (Header + optional Sidebar) reused by the
// home page and the (app) route group (profile, posts, ...) so the whole
// app shares the cream/gold design system and navigation. The home page
// already renders Header+Sidebar inline, so this is mainly for (app) pages.
export default function AppShell({ locale, children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#F8F3E7]">
      <Header locale={locale} />
      <div className="mx-auto max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
