import axios from 'axios';
import { convertToMp3, wakeBackend } from '../services/api';
jest.mock('axios');
const client = axios as jest.Mocked<typeof axios>;
describe('backend API', () => {
  beforeEach(() => jest.clearAllMocks());
  it('wakes the server', async () => {
    client.get.mockResolvedValueOnce({ data: { ready: true } });
    await wakeBackend();
    expect(client.get).toHaveBeenCalledWith('https://api.example.com/health', { timeout: 20000 });
  });
  it('reports missing server configuration immediately instead of retrying startup', async () => {
    client.get.mockResolvedValueOnce({ data: { ready: false } });
    await expect(wakeBackend()).rejects.toThrow('not configured');
    expect(client.get).toHaveBeenCalledTimes(1);
  });
  it('downloads MP3 without exposing a provider key', async () => {
    URL.createObjectURL = jest.fn(() => 'blob:mp3');
    client.post.mockResolvedValueOnce({ data: new Blob(['mp3']), headers: { 'content-type': 'audio/mpeg' } });
    expect(await convertToMp3('https://www.youtube.com/watch?v=jNQXAC9IVRw')).toEqual({ success: true, downloadUrl: 'blob:mp3', filename: 'audio.mp3' });
    expect(client.post).toHaveBeenCalledWith('https://api.example.com/convert', { id: 'jNQXAC9IVRw' }, { responseType: 'blob', timeout: 240000 });
  });
  it('rejects HTML returned by a proxy', async () => {
    client.post.mockResolvedValueOnce({ data: new Blob(['html']), headers: { 'content-type': 'text/html' } });
    expect((await convertToMp3('https://youtu.be/jNQXAC9IVRw')).success).toBe(false);
  });
  it('preserves the Unicode download filename from the backend', async () => {
    URL.createObjectURL = jest.fn(() => 'blob:mp3');
    client.post.mockResolvedValueOnce({ data: new Blob(['mp3']), headers: {
      'content-type': 'audio/mpeg',
      'content-disposition': `attachment; filename="audio.mp3"; filename*=UTF-8''${encodeURIComponent('中文歌曲 🎵.mp3')}`
    } });
    const result = await convertToMp3('https://youtu.be/jNQXAC9IVRw');
    expect(result.filename).toBe('中文歌曲 🎵.mp3');
  });
});
