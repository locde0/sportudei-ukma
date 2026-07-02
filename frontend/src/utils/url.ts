export function formatExternalUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  // If it's an email or phone, return as is
  if (url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url;
  }
  
  // If it already has a protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise, assume https
  return `https://${url}`;
}
