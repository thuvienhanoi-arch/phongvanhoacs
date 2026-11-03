/**
 * Facebook Video URL parsing and embed helpers
 */

export interface ParsedVideoSource {
  type: 'facebook' | 'youtube' | 'direct' | 'unknown';
  embedUrl: string;
  originalUrl: string;
  isValid: boolean;
  videoId?: string;
}

export function parseVideoUrl(url: string): ParsedVideoSource {
  if (!url || typeof url !== 'string') {
    return {
      type: 'unknown',
      embedUrl: '',
      originalUrl: url,
      isValid: false
    };
  }

  const cleanUrl = url.trim();

  // YouTube check
  const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
      originalUrl: cleanUrl,
      isValid: true,
      videoId: ytMatch[1]
    };
  }

  // Direct MP4 / WebM check
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(cleanUrl)) {
    return {
      type: 'direct',
      embedUrl: cleanUrl,
      originalUrl: cleanUrl,
      isValid: true
    };
  }

  // Facebook Video check (facebook.com, fb.watch, fb.com)
  const isFb = /(facebook\.com|fb\.watch|fb\.gg)/i.test(cleanUrl);
  if (isFb) {
    // Official Facebook Video Embed Player URL
    const encoded = encodeURIComponent(cleanUrl);
    const fbEmbed = `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&t=0`;
    
    // Extract video ID if possible
    let videoId: string | undefined;
    const vMatch = cleanUrl.match(/[?&]v=(\d+)/) || cleanUrl.match(/\/videos\/(\d+)/) || cleanUrl.match(/\/reel\/(\d+)/);
    if (vMatch) {
      videoId = vMatch[1];
    }

    return {
      type: 'facebook',
      embedUrl: fbEmbed,
      originalUrl: cleanUrl,
      isValid: true,
      videoId
    };
  }

  // Default fallback to iframe if valid URL
  try {
    new URL(cleanUrl);
    return {
      type: 'unknown',
      embedUrl: cleanUrl,
      originalUrl: cleanUrl,
      isValid: true
    };
  } catch {
    return {
      type: 'unknown',
      embedUrl: '',
      originalUrl: cleanUrl,
      isValid: false
    };
  }
}

/**
 * Generate Facebook share link
 */
export function getFacebookShareUrl(shareUrl: string, quote?: string): string {
  const params = new URLSearchParams({
    u: shareUrl
  });
  if (quote) {
    params.set('quote', quote);
  }
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}
