'use client';

import { BookOpen } from 'lucide-react';
import type { Book } from '@/services/books.service';

interface BookCardProps {
	book: Book;
	locale?: string;
	onSelect: (book: Book) => void;
}

export function BookCard({ book, locale = 'ar', onSelect }: BookCardProps) {
	const isArabic = locale === 'ar';

	return (
		<button
			type="button"
			onClick={() => onSelect(book)}
			aria-label={isArabic ? `تفاصيل ${book.title}` : `Details for ${book.title}`}
			className="group min-w-0 text-start"
		>
			<div className="relative aspect-[3/4] overflow-hidden border border-[#d2c8b4] bg-[#e8dfce] shadow-[0_8px_18px_rgba(38,31,18,0.12)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_26px_rgba(38,31,18,0.18)]">
				{book.cover_url ? (
					<img src={book.cover_url} alt="" className="h-full w-full object-cover" />
				) : (
					<div className="flex h-full items-center justify-center text-[#9b8b68]"><BookOpen size={42} aria-hidden="true" /></div>
				)}
			</div>
			<h2 className="mt-3 truncate text-sm font-semibold text-[#28251f] group-hover:text-[#8a6b27]">{book.title}</h2>
			<p className="mt-1 truncate text-xs text-[#716b60]">{book.author_display_name}</p>
			{book.category_name && <p className="mt-1 truncate text-xs text-[#8a6b27]">{book.category_name}</p>}
		</button>
	);
}
