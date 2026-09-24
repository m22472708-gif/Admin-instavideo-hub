// Neutral fallback for broken image links (Blank neutral canvas, no demo text)
export const FALLBACK_BANNER_IMAGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600" viewBox="0 0 1600 600"><rect width="1600" height="600" fill="%2318181b"/></svg>`;

/**
 * Universal Proxy URL generator to bypass:
 * 1. 403 Forbidden hotlinking blocks
 * 2. Cross-Origin Resource Sharing (CORS) blocks
 * 3. Mixed content (HTTP images on HTTPS app)
 */
export function getProxyImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.includes('wsrv.nl') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return `https://wsrv.nl/?url=${encodeURIComponent(trimmed)}`;
}

/**
 * Smart URL sanitizer that auto-corrects common copy-pasted link formats:
 * - Google Images redirects (extracts imgurl)
 * - Google Drive share links -> direct CDN image
 * - Imgur page links -> direct image
 * - Dropbox preview links -> direct raw image
 * - Missing https:// protocol
 */
export function sanitizeBannerUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '';
  }
  let clean = url.trim();

  // If already a base64 data URL, return directly
  if (clean.startsWith('data:image/') || clean.startsWith('blob:')) {
    return clean;
  }

  // Auto-prefix https:// if user pasted without protocol (e.g. i.ibb.co/... or images.unsplash.com/...)
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }

  // Google Images Search Link: extract the real destination image URL
  // e.g. https://www.google.com/imgres?imgurl=https%3A%2F%2Fexample.com%2Fbanner.jpg&imgrefurl=...
  if (clean.includes('google.') && clean.includes('imgurl=')) {
    try {
      const parsed = new URL(clean);
      const actualImg = parsed.searchParams.get('imgurl');
      if (actualImg) {
        clean = decodeURIComponent(actualImg);
      }
    } catch {
      // ignore
    }
  }

  // Google Drive sharing link conversion:
  // e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // or https://drive.google.com/open?id=FILE_ID
  const gDriveMatch = clean.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+))/);
  if (gDriveMatch) {
    const fileId = gDriveMatch[1] || gDriveMatch[2];
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // Dropbox link conversion:
  // replace ?dl=0 or dl=1 with ?raw=1
  if (clean.includes('dropbox.com')) {
    clean = clean.replace(/[?&]dl=[01]/, '?raw=1');
    if (!clean.includes('raw=1')) {
      clean += clean.includes('?') ? '&raw=1' : '?raw=1';
    }
  }

  // Imgur page conversion:
  // e.g. https://imgur.com/abc1234 -> https://i.imgur.com/abc1234.jpg
  const imgurMatch = clean.match(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/);
  if (imgurMatch) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  return clean;
}
