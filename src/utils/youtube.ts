/** Parse only supported YouTube hosts and complete 11-character video IDs. */
export const extractVideoId = (value: string): string | null => {
  try {
    const text = value.trim();
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null;
    let id: string | null = null;
    if (url.hostname === 'youtu.be') {
      id = url.pathname.slice(1);
    } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(url.hostname)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v');
      else id = url.pathname.match(/^\/(?:embed|v|shorts|live)\/([^/]+)\/?$/)?.[1] || null;
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

export const isValidYouTubeUrl = (url: string): boolean => extractVideoId(url) !== null;

/**
 * Formats duration from seconds to MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Sanitizes filename for download
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .split('')
    .map((ch) => /[a-z0-9]/i.test(ch) ? ch.toLowerCase() : '_')
    .join('');
};
