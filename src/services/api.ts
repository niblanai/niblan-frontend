export function resolveApiBase(): string {
  const envBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL;

  if (envBase) {
    return envBase;
  }

  return 'https://desktop-ckusqv1.tail3f63c4.ts.net/api/v1';
}
