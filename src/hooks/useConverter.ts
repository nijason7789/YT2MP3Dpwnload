import { useState, useCallback, useEffect, useRef } from 'react';
import { ConversionStatus, DownloadResponse } from '../types';
import { convertToMp3, wakeBackend } from '../services/api';
import { isValidYouTubeUrl } from '../utils/youtube';
import { chineseError } from '../utils/errors';

export const useConverter = () => {
  const [status, setStatus] = useState<ConversionStatus>({ status: 'idle' });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState('audio.mp3');

  const currentUrl = useRef<string | null>(null);
  const clearDownload = useCallback(() => {
    if (currentUrl.current?.startsWith('blob:')) URL.revokeObjectURL(currentUrl.current);
    currentUrl.current = null;
    setDownloadUrl(null);
    setFilename('audio.mp3');
  }, []);
  useEffect(() => {
    void wakeBackend().catch(() => {});
    return () => {
      if (currentUrl.current?.startsWith('blob:')) URL.revokeObjectURL(currentUrl.current);
    };
  }, []);

  const convert = useCallback(async (url: string): Promise<DownloadResponse> => {
    if (!isValidYouTubeUrl(url)) {
      const error = '請輸入有效的 YouTube 影片網址';
      setStatus({ status: 'error', message: error });
      return { success: false, error };
    }

    clearDownload();
    setStatus({ status: 'loading', message: '正在啟動下載服務，首次使用可能需要約一分鐘…' });
    
    try {
      await wakeBackend();
      setStatus({ status: 'converting', message: '正在準備音訊並轉換成 MP3，請稍候…' });
      
      const result = await convertToMp3(url);
      
      if (result.success && result.downloadUrl) {
        currentUrl.current = result.downloadUrl;
        setDownloadUrl(result.downloadUrl);
        setFilename(result.filename || 'audio.mp3');
        setStatus({ status: 'success', message: '轉換完成！' });
      } else {
        setStatus({ status: 'error', message: chineseError(result.error) });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? chineseError(error.message) : '發生未預期的錯誤，請稍後再試。';
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
    filename,
    convert,
    reset
  };
};
