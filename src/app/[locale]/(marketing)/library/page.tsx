import { LibraryPage } from '@/components/Library';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LibraryPage locale={locale} />;
}
