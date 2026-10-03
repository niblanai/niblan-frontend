import { resolveApiBase } from './api';
import type { PaperTextureId } from '@/lib/books/paperTextures';

const API_BASE = resolveApiBase();

export interface BookChapter {
	id?: string;
	chapter_number?: number;
	title: string;
	content: string;
}

export interface Book {
	id: string;
	title: string;
	description: string;
	cover_url: string;
	language: 'ar' | 'en';
	category_id: string;
	category_name: string;
	paper_texture_id: PaperTextureId;
	free_write: boolean;
	chapters: BookChapter[];
	author_account_id: string;
	author_display_name: string;
	view_count?: number;
	average_rating?: number;
	published_at: string;
	created_at: string;
}

export interface BookCategory {
	id: string;
	name: string;
	slug: string;
}

export interface FavoritePage {
	id: string;
	book_id: string;
	book_title: string;
	cover_url: string;
	author_display_name: string;
	chapter_id: string;
	chapter_title: string;
	page_number: number;
	label: string;
	created_at: string;
}

export interface FavoriteArticle {
	id: string;
	title: string;
	excerpt: string;
	cover_url: string;
	author_account_id: string;
	author_display_name: string;
	created_at: string;
}

export interface FavoritesResponse {
	books: Book[];
	pages: FavoritePage[];
	articles: FavoriteArticle[];
	audio: unknown[];
	podcasts: unknown[];
}

export interface CreateBookInput {
	title: string;
	description: string;
	cover_url: string;
	language: 'ar' | 'en';
	category_id: string;
	paper_texture_id: PaperTextureId;
	free_write: boolean;
	chapters: BookChapter[];
}

async function readResponse<T>(response: Response): Promise<T> {
	if (response.status === 204) return undefined as T;

	const responseText = await response.text();
	let payload: { error?: string } | undefined;
	if (responseText) {
		try {
			payload = JSON.parse(responseText) as { error?: string };
		} catch {
			const details = responseText.replace(/\s+/g, ' ').slice(0, 180);
			throw new Error(
				`Server returned an invalid response (HTTP ${response.status})${details ? `: ${details}` : '.'}`
			);
		}
	}
	if (!response.ok) {
		throw new Error(payload?.error || response.statusText || `Request failed (HTTP ${response.status})`);
	}
	return payload as T;
}

export async function getPublicBooks(catalogueSlug?: string, perCategoryLimit?: number): Promise<Book[]> {
	const params = new URLSearchParams();
	if (catalogueSlug) params.set('catalogue', catalogueSlug);
	if (perCategoryLimit) params.set('per_category_limit', String(perCategoryLimit));
	const query = params.toString();
	const endpoint = query ? `${API_BASE}/books?${query}` : `${API_BASE}/books`;
	const response = await fetch(endpoint, { cache: 'no-store' });
	const payload = await readResponse<{ books: Book[] }>(response);
	return payload.books ?? [];
}

export async function getUserBooks(token: string | null, user: { id?: string; username?: string; display_name?: string } | null): Promise<Book[]> {
	if (!user) return [];

	const candidates: string[] = [];
	if (user.id) candidates.push(`${API_BASE}/books?author_account_id=${encodeURIComponent(user.id)}`);
	if (user.username) candidates.push(`${API_BASE}/users/${encodeURIComponent(user.username)}/books`);
	if (user.id) candidates.push(`${API_BASE}/users/${encodeURIComponent(user.id)}/books`);
	candidates.push(`${API_BASE}/books`);

	const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

	for (const url of candidates) {
		try {
			const response = await fetch(url, {
				cache: 'no-store',
				headers,
			});
			if (!response.ok) continue;
			const payload = await response.json();
			const books = payload.books ?? payload.items ?? payload.data ?? [];
			if (Array.isArray(books) && books.length > 0) {
				if (user.id) {
					return books.filter((book: Book) => book.author_account_id === user.id);
				}
				return books;
			}
		} catch {
			continue;
		}
	}

	const publicBooks = await getPublicBooks();
	if (!user.id && !user.display_name && user.username) {
		return publicBooks.filter((book) => book.author_display_name === user.username || book.author_display_name === user.username.replace(/_+/g, ' '));
	}
	return publicBooks.filter((book) => {
		if (user.id && book.author_account_id === user.id) return true;
		if (user.username && (book.author_display_name === user.username || book.author_display_name === user.username.replace(/_+/g, ' '))) return true;
		return false;
	});
}

export async function getPublicBook(id: string): Promise<Book> {
	const response = await fetch(`${API_BASE}/books/${encodeURIComponent(id)}`, { cache: 'no-store' });
	return readResponse<Book>(response);
}

export async function getBookCategories(): Promise<BookCategory[]> {
	const response = await fetch(`${API_BASE}/books/categories`, { cache: 'no-store' });
	const payload = await readResponse<{ categories: BookCategory[] }>(response);
	return payload.categories ?? [];
}

export async function uploadBookCover(token: string, file: File): Promise<string> {
	const formData = new FormData();
	formData.append('file', file);
	const response = await fetch(`${API_BASE}/books/cover`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: formData,
	});
	const payload = await readResponse<{ cover_url: string }>(response);
	return payload.cover_url;
}

export async function uploadBookPageImage(token: string, file: File): Promise<string> {
	const formData = new FormData();
	formData.append('file', file);
	const response = await fetch(`${API_BASE}/books/cover`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: formData,
	});
	const payload = await readResponse<{ cover_url: string }>(response);
	return payload.cover_url;
}

export async function createBook(token: string, input: CreateBookInput, locale = 'en'): Promise<Book> {
	const response = await fetch(`${API_BASE}/books`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(input),
	});
	const book = await readResponse<Book>(response);
	if (book.paper_texture_id !== input.paper_texture_id) {
		throw new Error(
			locale === 'ar'
				? 'لم يؤكد الخادم حفظ ثيم الورق المختار. تحقق من تحديث قاعدة بيانات الكتب والـ backend.'
				: 'The server did not confirm the selected paper theme was saved. Check the book database migration and backend deployment.'
		);
	}
	return book;
}

export async function getBookBookmark(token: string, bookId: string): Promise<boolean> {
	const response = await fetch(`${API_BASE}/books/${encodeURIComponent(bookId)}/bookmark`, {
		headers: { Authorization: `Bearer ${token}` },
		cache: 'no-store',
	});
	const payload = await readResponse<{ favorited: boolean }>(response);
	return payload.favorited;
}

export async function setBookBookmark(token: string, bookId: string, favorited: boolean): Promise<void> {
	const response = await fetch(`${API_BASE}/books/${encodeURIComponent(bookId)}/bookmark`, {
		method: favorited ? 'POST' : 'DELETE',
		headers: { Authorization: `Bearer ${token}` },
	});
	await readResponse<{ favorited: boolean }>(response);
}

export async function getFavoritePageNumbers(token: string, bookId: string): Promise<number[]> {
	const response = await fetch(`${API_BASE}/books/${encodeURIComponent(bookId)}/pages/bookmarks`, {
		headers: { Authorization: `Bearer ${token}` },
		cache: 'no-store',
	});
	const payload = await readResponse<{ page_numbers: number[] }>(response);
	return payload.page_numbers ?? [];
}

export async function setFavoritePage(
	token: string,
	bookId: string,
	pageNumber: number,
	chapterId: string,
	favorited: boolean,
): Promise<void> {
	const response = await fetch(`${API_BASE}/books/${encodeURIComponent(bookId)}/pages/${pageNumber}/bookmark`, {
		method: favorited ? 'POST' : 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
			...(favorited ? { 'Content-Type': 'application/json' } : {}),
		},
		...(favorited ? { body: JSON.stringify({ chapter_id: chapterId }) } : {}),
	});
	await readResponse<{ favorited: boolean }>(response);
}

export async function getFavorites(token: string): Promise<FavoritesResponse> {
	const response = await fetch(`${API_BASE}/favorites`, {
		headers: { Authorization: `Bearer ${token}` },
		cache: 'no-store',
	});
	const payload = await readResponse<FavoritesResponse>(response);
	return {
		books: payload.books ?? [],
		pages: payload.pages ?? [],
		articles: payload.articles ?? [],
		audio: payload.audio ?? [],
		podcasts: payload.podcasts ?? [],
	};
}
