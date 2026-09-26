import { FavoritesPage } from '@/components/favorites/FavoritesPage';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <FavoritesPage locale={locale} />;
}