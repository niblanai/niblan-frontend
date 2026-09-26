export type ReadingProgressEntry = {
  bookId: string;
  bookTitle?: string;
  chapterId?: string;
  page: number;
  updatedAt: string;
};

const STORAGE_KEY = 'niblan_reading_progress';

function readStorage(): ReadingProgressEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReadingProgressEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(entries: ReadingProgressEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getReadingProgress(): ReadingProgressEntry[] {
  return readStorage().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getLastReadingProgress(): ReadingProgressEntry | null {
  const entries = getReadingProgress();
  return entries[0] ?? null;
}

export function saveReadingProgress(entry: {
  bookId: string;
  bookTitle?: string;
  chapterId?: string;
  page: number;
}) {
  const current = readStorage();
  const nextEntry: ReadingProgressEntry = {
    ...entry,
    page: Math.max(1, entry.page || 1),
    updatedAt: new Date().toISOString(),
  };

  const filtered = current.filter((item) => item.bookId !== entry.bookId);
  const updated = [nextEntry, ...filtered].slice(0, 25);
  writeStorage(updated);
  return nextEntry;
}

export function clearReadingProgress(bookId?: string) {
  const current = readStorage();
  const filtered = bookId ? current.filter((item) => item.bookId !== bookId) : [];
  writeStorage(filtered);
}
