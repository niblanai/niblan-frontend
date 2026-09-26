import { BookReader } from '@/components/books/BookReader';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return <BookReader locale={locale} bookId={id} />;
}
