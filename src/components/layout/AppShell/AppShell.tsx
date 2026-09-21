import React from 'react';
import { Header, Sidebar } from '../../HomePage';

interface AppShellProps {
  locale: string;
  children: React.ReactNode;
  // When true (e.g. on the profile page), the content renders full-width
  // without the home-page sidebar — the page owns its own left column.
  hideSidebar?: boolean;
}

// AppShell is the shared chrome (Header + optional Sidebar) reused by the
// home page and the (app) route group (profile, posts, ...) so the whole
// app shares the cream/gold design system and navigation. The home page
// already renders Header+Sidebar inline, so this is mainly for (app) pages.
export default function AppShell({ locale, children, hideSidebar = false }: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#F8F3E7]">
      <Header locale={locale} />
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {!hideSidebar && <Sidebar locale={locale} />}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </main>
  );
}
