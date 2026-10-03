import { resolveApiBase } from '@/services/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get('url');
  if (!source) {
    return new Response('A cover URL is required.', { status: 400 });
  }

  let coverUrl: URL;
  let apiUrl: URL;
  try {
    apiUrl = new URL(resolveApiBase());
    coverUrl = new URL(source, apiUrl.origin);
  } catch {
    return new Response('The cover URL is invalid.', { status: 400 });
  }

  if (!['https:', 'http:'].includes(coverUrl.protocol) || coverUrl.origin !== apiUrl.origin || coverUrl.username || coverUrl.password) {
    return new Response('The cover URL is not allowed.', { status: 403 });
  }

  try {
    const upstream = await fetch(coverUrl, { cache: 'force-cache' });
    if (!upstream.ok || !upstream.body) {
      console.error(`Book cover proxy received HTTP ${upstream.status} for ${coverUrl.pathname}.`);
      return new Response('The book cover could not be loaded.', { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      console.error(`Book cover proxy rejected non-image content for ${coverUrl.pathname}.`);
      return new Response('The requested cover is not an image.', { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error(`Book cover proxy failed for ${coverUrl.pathname}.`, error);
    return new Response('The book cover could not be loaded.', { status: 502 });
  }
}
