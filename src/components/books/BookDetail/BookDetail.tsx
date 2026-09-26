'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookOpen, Heart, X } from 'lucide-react';
import { getToken } from '@/services/auth.service';
import { Book, getBookBookmark, setBookBookmark } from '@/services/books.service';

interface BookDetailProps {
	book: Book;
	locale: string;
	onClose: () => void;
}

export function BookDetail({ book, locale, onClose }: BookDetailProps) {
	const isArabic = locale === 'ar';
	const [favorited, setFavorited] = useState(false);
	const [checking, setChecking] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const token = getToken();
		if (!token) {
			setChecking(false);
			return;
		}
		let active = true;
		getBookBookmark(token, book.id)
			.then((value) => {
				if (active) setFavorited(value);
			})
			.catch(() => {
				if (active) setError(isArabic ? 'تعذر التحقق من المفضلة.' : 'Could not check favorite status.');
			})
			.finally(() => {
				if (active) setChecking(false);
			});
		return () => {
			active = false;
		};
	}, [book.id, isArabic]);

	const toggleFavorite = async () => {
		const token = getToken();
		if (!token) {
			setError(isArabic ? 'سجّل الدخول لحفظ الكتاب في المفضلة.' : 'Sign in to save this book to favorites.');
			return;
		}
		setSaving(true);
		setError('');
		try {
			await setBookBookmark(token, book.id, !favorited);
			setFavorited((value) => !value);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : (isArabic ? 'تعذر تحديث المفضلة.' : 'Could not update favorites.'));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
			role="presentation"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="book-detail-title"
				dir={isArabic ? 'rtl' : 'ltr'}
				className="relative grid max-h-[min(88vh,760px)] w-full max-w-3xl overflow-y-auto border border-[#ded4bf] bg-[#faf7ef] shadow-[0_28px_80px_rgba(0,0,0,.4)] sm:grid-cols-[minmax(210px,.75fr)_1.25fr]"
			>
				<button type="button" onClick={onClose} aria-label={isArabic ? 'إغلاق' : 'Close'} className="absolute end-3 top-3 z-10 grid h-9 w-9 place-items-center border border-black/10 bg-white/90 text-[#363126] hover:bg-white">
					<X size={18} />
				</button>
				<div className="min-h-64 bg-[#e7dfce] sm:min-h-[400px]">
					{book.cover_url ? (
						<img src={book.cover_url} alt="" className="h-full max-h-[42vh] w-full object-cover sm:max-h-none" />
					) : (
						<div className="grid h-full min-h-64 place-items-center text-[#9b8b68]"><BookOpen size={42} /></div>
					)}
				</div>
				<div className="flex min-w-0 flex-col p-5 sm:p-8">
					{book.category_name && <p className="text-xs font-medium text-[#8a6b27]">{book.category_name}</p>}
					<h2 id="book-detail-title" className="mt-2 text-2xl font-semibold leading-snug text-[#211f1a]">{book.title}</h2>
					<p className="mt-2 text-sm text-[#716b60]">{book.author_display_name}</p>
					<p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#474238]">{book.description || (isArabic ? 'لا يوجد وصف لهذا الكتاب.' : 'No description for this book.')}</p>

					<div className="mt-auto pt-8">
						{error && <p role="alert" className="mb-3 text-sm text-[#9d3a2f]">{error}</p>}
						<div className="flex flex-wrap gap-3">
							<Link href={`/${locale}/books/${book.id}`} onClick={onClose} className="flex min-h-11 flex-1 items-center justify-center gap-2 bg-[#c69a3e] px-4 text-sm font-semibold text-[#201b11] hover:bg-[#b78d34]">
								<BookOpen size={17} />{isArabic ? 'اقرأ الكتاب' : 'Read book'}
							</Link>
							<button type="button" onClick={toggleFavorite} disabled={checking || saving} aria-pressed={favorited} className={`flex min-h-11 items-center justify-center gap-2 border px-4 text-sm font-medium transition disabled:opacity-50 ${favorited ? 'border-[#a4483a]/30 bg-[#a4483a]/10 text-[#94352b]' : 'border-[#d6cebd] bg-white text-[#454035] hover:border-[#a4483a]'}`}>
								<Heart size={17} fill={favorited ? 'currentColor' : 'none'} />
								{saving
									? isArabic ? 'جارٍ الحفظ...' : 'Saving...'
									: favorited
										? isArabic ? 'إزالة من المفضلة' : 'Remove favorite'
										: isArabic ? 'حفظ في المفضلة' : 'Save to favorites'}
							</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
