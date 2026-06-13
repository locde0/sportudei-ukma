const MEDIA_BASE = (import.meta.env.VITE_MEDIA_URL ?? '').replace(/\/$/, '');

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/.test(url)) return url;

  const path = url.startsWith('/') ? url : `/${url}`;
  return MEDIA_BASE ? `${MEDIA_BASE}${path}` : url;
}
