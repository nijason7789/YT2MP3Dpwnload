import axios from 'axios';
import { DownloadResponse } from '../types';
import { extractVideoId } from '../utils/youtube';

const API_URL = (process.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
let waking: Promise<void> | null = null;

export const wakeBackend = (): Promise<void> => {
  if (!API_URL) return Promise.reject(new Error('The download server URL is not configured.'));
  if (!waking) {
    waking = (async () => {
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          const response = await axios.get(`${API_URL}/health`, { timeout: 20000 });
          if (response.data.ready === true) return;
          return Promise.reject(new Error('The download server is not configured.'));
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 403) {
            throw new Error('This website is not allowed by the download server.');
          }
          if (attempt === 5) throw new Error('The download server is still starting. Please try again shortly.');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    })().finally(() => { waking = null; });
  }
  return waking;
};

export const convertToMp3 = async (videoUrl: string): Promise<DownloadResponse> => {
  const id = extractVideoId(videoUrl);
  if (!id) return { success: false, error: 'Please enter a valid YouTube URL' };
  if (!API_URL) return { success: false, error: 'The download server URL is not configured.' };
  try {
    const response = await axios.post(`${API_URL}/convert`, { id }, { responseType: 'blob', timeout: 240000 });
    if (!response.data.size || !response.headers['content-type']?.includes('audio/mpeg')) {
      return { success: false, error: 'The server did not return an MP3 file.' };
    }
    let filename = 'audio.mp3';
    const encoded = response.headers['content-disposition']?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    if (encoded) {
      try { filename = decodeURIComponent(encoded); } catch { /* Keep the default for malformed headers. */ }
    }
    return { success: true, downloadUrl: URL.createObjectURL(response.data), filename };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        const data = JSON.parse(await error.response.data.text());
        if (typeof data.error === 'string') return { success: false, error: data.error };
      } catch { /* Fall through for non-JSON proxy errors. */ }
    }
    return { success: false, error: 'Unable to convert audio. Please try again later.' };
  }
};
