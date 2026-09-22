import { BookReader } from '@/components/books/BookReader';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <BookReader locale={locale} />;
}
