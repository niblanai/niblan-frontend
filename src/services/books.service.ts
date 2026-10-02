import { resolveApiBase } from './api';

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
	chapters: BookChapter[];
	author_account_id: string;
	author_display_name: string;
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
	chapters: BookChapter[];
}

async function readResponse<T>(response: Response): Promise<T> {
	const payload = response.status === 204 ? undefined : await response.json();
	if (!response.ok) {
		throw new Error(payload?.error || response.statusText || 'Request failed');
	}
	return payload as T;
}

export async function getPublicBooks(): Promise<Book[]> {
	const response = await fetch(`${API_BASE}/books`, { cache: 'no-store' });
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

export async function createBook(token: string, input: CreateBookInput): Promise<Book> {
	const response = await fetch(`${API_BASE}/books`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(input),
	});
	return readResponse<Book>(response);
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
