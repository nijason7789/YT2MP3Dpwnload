import { useState, useCallback, useEffect, useRef } from 'react';
import { ConversionStatus, DownloadResponse } from '../types';
import { convertToMp3, wakeBackend } from '../services/api';
import { isValidYouTubeUrl } from '../utils/youtube';

export const useConverter = () => {
  const [status, setStatus] = useState<ConversionStatus>({ status: 'idle' });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const currentUrl = useRef<string | null>(null);
  const clearDownload = useCallback(() => {
    if (currentUrl.current?.startsWith('blob:')) URL.revokeObjectURL(currentUrl.current);
    currentUrl.current = null;
    setDownloadUrl(null);
  }, []);
  useEffect(() => {
    void wakeBackend().catch(() => {});
    return () => {
      if (currentUrl.current?.startsWith('blob:')) URL.revokeObjectURL(currentUrl.current);
    };
  }, []);

  const convert = useCallback(async (url: string): Promise<DownloadResponse> => {
    if (!isValidYouTubeUrl(url)) {
      const error = 'Please enter a valid YouTube URL';
      setStatus({ status: 'error', message: error });
      return { success: false, error };
    }

    clearDownload();
    setStatus({ status: 'loading', message: 'Starting download service. First use may take about a minute...' });
    
    try {
      await wakeBackend();
      setStatus({ status: 'converting', message: 'Preparing audio and converting to MP3 (videos up to 10 minutes)...' });
      
      const result = await convertToMp3(url);
      
      if (result.success && result.downloadUrl) {
        currentUrl.current = result.downloadUrl;
        setDownloadUrl(result.downloadUrl);
        setStatus({ status: 'success', message: 'Conversion completed!' });
      } else {
        setStatus({ status: 'error', message: result.error || 'Conversion failed' });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setStatus({ status: 'error', message: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [clearDownload]);

  const reset = useCallback(() => {
    setStatus({ status: 'idle' });
    clearDownload();
  }, [clearDownload]);

  return {
    status,
    downloadUrl,
    convert,
    reset
  };
};
