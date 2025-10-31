import { isValidYouTubeUrl, extractVideoId, formatDuration, sanitizeFilename } from '../../utils/youtube';

describe('YouTube Utils', () => {
  describe('isValidYouTubeUrl', () => {
    it('should validate correct YouTube URLs', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ',
        'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'https://www.youtube.com/v/dQw4w9WgXcQ'
      ];

      validUrls.forEach(url => {
        expect(isValidYouTubeUrl(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'https://www.google.com',
        'not-a-url',
        'https://vimeo.com/123456',
        'https://youtube.com/watch?v=invalid',
        ''
      ];

      invalidUrls.forEach(url => {
        expect(isValidYouTubeUrl(url)).toBe(false);
      });
    });
  });

  describe('extractVideoId', () => {
    it('should extract video ID from various YouTube URL formats', () => {
      const testCases = [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'https://youtu.be/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' }
      ];

      testCases.forEach(({ url, expected }) => {
        expect(extractVideoId(url)).toBe(expected);
      });
    });

    it('should return null for invalid URLs', () => {
      expect(extractVideoId('https://www.google.com')).toBeNull();
      expect(extractVideoId('invalid-url')).toBeNull();
    });
  });

  describe('formatDuration', () => {
    it('should format seconds to MM:SS format', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(125)).toBe('2:05');
      expect(formatDuration(3661)).toBe('61:01');
      expect(formatDuration(30)).toBe('0:30');
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filenames for download', () => {
      expect(sanitizeFilename('Hello World!')).toBe('hello_world_');
      expect(sanitizeFilename('Test@#$%^&*()')).toBe('test_________');
      expect(sanitizeFilename('Normal123')).toBe('normal123');
    });
  });
});
