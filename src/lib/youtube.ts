/**
 * YouTube URL utilities and video embed helpers
 */

interface YouTubeVideoInfo {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com, youtu.be, youtube-nocookie.com
 */
export function extractYouTubeId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // youtu.be format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }

    // youtube.com, youtube-nocookie.com format
    if (
      urlObj.hostname.includes('youtube.com') ||
      urlObj.hostname.includes('youtube-nocookie.com')
    ) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return videoId;
      }
    }

    // Fallback: try to extract from /embed/ or /watch routes
    const match = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      return match[1];
    }

    return null;
  } catch {
    // Invalid URL
    return null;
  }
}

/**
 * Normalize YouTube URL to standard embed format
 */
export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return null;
  }
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Get thumbnail URL for a YouTube video
 */
export function getYouTubeThumbnail(
  url: string,
  quality: 'default' | 'medium' | 'high' | 'standard' = 'high'
): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return null;
  }

  const qualityMap = {
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
    medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    standard: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
  };

  return qualityMap[quality];
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

/**
 * Parse YouTube URLs from string array
 * Returns valid video IDs, filters out invalid URLs
 */
export function parseYouTubeUrls(urls: string[]): YouTubeVideoInfo[] {
  return urls
    .map(url => {
      const id = extractYouTubeId(url.trim());
      if (!id) return null;

      return {
        id,
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail: getYouTubeThumbnail(url, 'high'),
      } as YouTubeVideoInfo;
    })
    .filter(Boolean) as YouTubeVideoInfo[];
}

/**
 * Generate embed HTML for a YouTube video
 */
export function generateYouTubeEmbed(
  url: string,
  options?: {
    width?: number | string;
    height?: number | string;
    title?: string;
    allowFullscreen?: boolean;
  }
): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return null;
  }

  const width = options?.width || '100%';
  const height = options?.height || '315';
  const title = options?.title || 'YouTube video';
  const allowFullscreen = options?.allowFullscreen !== false;

  return `<iframe
    width="${width}"
    height="${height}"
    src="https://www.youtube.com/embed/${videoId}"
    title="${title}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    ${allowFullscreen ? 'allowfullscreen' : ''}
  ></iframe>`;
}

/**
 * React component for displaying YouTube video
 * This would be used in a client component
 */
export function YoutubeEmbedProps(url: string) {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return null;
  }

  return {
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: getYouTubeThumbnail(url, 'high'),
  };
}

export default {
  extractYouTubeId,
  normalizeYouTubeUrl,
  getYouTubeThumbnail,
  isValidYouTubeUrl,
  parseYouTubeUrls,
  generateYouTubeEmbed,
  YoutubeEmbedProps,
};
