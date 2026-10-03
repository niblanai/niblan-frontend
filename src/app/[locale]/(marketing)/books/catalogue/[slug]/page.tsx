import { BookCatalog } from '@/components/books/BookCatalog/BookCatalog';

export default async function CataloguePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return <BookCatalog locale={locale} initialCategorySlug={slug} />;
}
