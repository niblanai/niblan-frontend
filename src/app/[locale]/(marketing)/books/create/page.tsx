import { BookCreator } from '@/components/books/BookCreator/BookCreator';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <BookCreator locale={locale} />;
}