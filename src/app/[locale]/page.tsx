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

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <Sidebar locale={locale} />

        <div className="flex-1 min-w-0">
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
