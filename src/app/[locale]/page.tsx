import React from 'react';
import {
  Header,
  HomeHero,
  HomeFeatures,
  KnowledgeGates,
  ContentHighlights,
  ActiveRooms,
  AIAssistantPromo,
  Sidebar,
} from '../../components/HomePage';

interface RootPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function RootPage({ params }: RootPageProps) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-[#F8F3E7]">
      <Header locale={locale} />

      <div className="mx-auto flex max-w-[1536px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <Sidebar locale={locale} />
        <div className="min-w-0 flex-1">
          <HomeHero locale={locale} />
          <KnowledgeGates locale={locale} />
          <ContentHighlights locale={locale} />
          <ActiveRooms locale={locale} />
          <AIAssistantPromo locale={locale} />
          <HomeFeatures locale={locale} />
        </div>
      </div>
    </main>
  );
}
