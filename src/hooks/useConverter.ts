import { useState, useCallback } from 'react';
import { ConversionStatus, DownloadResponse } from '../types';
import { convertToMp3 } from '../services/api';
import { isValidYouTubeUrl } from '../utils/youtube';

export const useConverter = () => {
  const [status, setStatus] = useState<ConversionStatus>({ status: 'idle' });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const convert = useCallback(async (url: string): Promise<DownloadResponse> => {
    if (!isValidYouTubeUrl(url)) {
      const error = 'Please enter a valid YouTube URL';
      setStatus({ status: 'error', message: error });
      return { success: false, error };
    }

    setStatus({ status: 'loading', message: 'Preparing conversion...' });
    
    try {
      setStatus({ status: 'converting', progress: 50, message: 'Converting to MP3...' });
      
      const result = await convertToMp3(url);
      
      if (result.success && result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);
        setStatus({ status: 'success', message: 'Conversion completed!' });
      } else {
        setStatus({ status: 'error', message: result.error || 'Conversion failed' });
      }
      
      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setStatus({ status: 'error', message: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const reset = useCallback(() => {
    setStatus({ status: 'idle' });
    setDownloadUrl(null);
  }, []);

  return {
    status,
    downloadUrl,
    convert,
    reset
  };
};
