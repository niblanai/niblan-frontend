export function resolveApiBase(): string {
  const envBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL;

  if (envBase) {
    return envBase;
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol || 'https:';
    const hostname = window.location.hostname || 'localhost';
    return `${protocol}//${hostname}:8080/api/v1`;
  }

  return 'https://desktop-ckusqv1.tail3f63c4.ts.net/api/v1';
}
