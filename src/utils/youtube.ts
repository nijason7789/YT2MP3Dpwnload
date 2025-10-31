/**
 * Validates YouTube URL format
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
};

/**
 * Extracts video ID from YouTube URL
 */
export const extractVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

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
