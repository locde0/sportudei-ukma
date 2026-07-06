const MEDIA_BASE = (import.meta.env.VITE_MEDIA_URL ?? '').replace(/\/$/, '');

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/.test(url)) return url;

  const path = url.startsWith('/') ? url : `/${url}`;
  return MEDIA_BASE ? `${MEDIA_BASE}${path}` : url;
}

export function resolveVariantUrl(url: string | null | undefined, variant: 'md' | 'sm' | 'full' = 'full'): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/.test(url)) return url;

  let variantUrl = url;
  if (variant !== 'full') {
    const lastDot = url.lastIndexOf('.');
    if (lastDot > -1) {
      variantUrl = `${url.substring(0, lastDot)}_${variant}${url.substring(lastDot)}`;
    }
  }

  const path = variantUrl.startsWith('/') ? variantUrl : `/${variantUrl}`;
  return MEDIA_BASE ? `${MEDIA_BASE}${path}` : variantUrl;
}
