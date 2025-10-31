import axios from 'axios';
import { DownloadResponse, VideoInfo } from '../types';

// Using RapidAPI YouTube to MP3 converter service
const API_BASE_URL = 'https://youtube-mp4-mp3-downloader.p.rapidapi.com';
// Use environment variable or empty string for API key
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '';

// Debug: Log API key status (only length for security)
console.log('API Key status:', API_KEY ? `Set (${API_KEY.length} chars)` : 'Not set');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'youtube-mp4-mp3-downloader.p.rapidapi.com'
  }
});

/**
 * Extract video ID from YouTube URL
 */
const extractVideoId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/).*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/);
  return match?.[1] || '';
};

/**
 * Convert YouTube video to MP3
 */
export const convertToMp3 = async (videoUrl: string): Promise<DownloadResponse> => {
  try {
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      return {
        success: false,
        error: 'Invalid YouTube URL. Please provide a valid YouTube video URL.'
      };
    }

    // Start download process
    const downloadResponse = await apiClient.get('/api/v1/download', {
      params: {
        format: 'mp3',
        id: videoId,
        audioQuality: '128',
        addInfo: 'true'
      }
    });

    if (downloadResponse.data) {
      // Check if download was successful and we have a progressId
      if (downloadResponse.data.success && downloadResponse.data.progressId) {
        // Need to poll for progress using the progressId
        return await pollForDownloadProgress(downloadResponse.data.progressId, videoUrl, videoId, downloadResponse.data.title);
      } else {
        return {
          success: false,
          error: downloadResponse.data.error || 'Failed to start download process'
        };
      }
    } else {
      return {
        success: false,
        error: 'No response from download service'
      };
    }
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      };
    }
    
    if (error.response?.status === 403) {
      return {
        success: false,
        error: 'API key is invalid or expired. Please check your configuration.'
      };
    }
    
    if (error.response?.data?.error) {
      return {
        success: false,
        error: error.response.data.error
      };
    }
    
    return {
      success: false,
      error: 'Failed to convert video. Please check your internet connection and try again.'
    };
  }
};

/**
 * Poll for download progress
 */
const pollForDownloadProgress = async (
  progressId: string, 
  videoUrl: string, 
  videoId: string,
  title?: string,
  maxAttempts: number = 30
): Promise<DownloadResponse> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const progressResponse = await apiClient.get('/api/v1/progress', {
        params: {
          id: progressId
        }
      });

      if (progressResponse.data) {
        if (progressResponse.data.finished && progressResponse.data.downloadUrl) {
          return {
            success: true,
            downloadUrl: progressResponse.data.downloadUrl,
            videoInfo: {
              title: title || 'Unknown Title',
              duration: '0:00', // Duration not provided in progress response
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              url: videoUrl
            }
          };
        } else if (progressResponse.data.status === 'Failed') {
          return {
            success: false,
            error: progressResponse.data.error || 'Download failed'
          };
        }
        // If status is not 'Finished', continue polling
      }

      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Progress polling error:', error);
    }
  }

  return {
    success: false,
    error: 'Download timeout. Please try again.'
  };
};

/**
 * Get video information without converting
 */
export const getVideoInfo = async (videoUrl: string): Promise<VideoInfo | null> => {
  try {
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      return null;
    }

    // Use the download endpoint with addInfo to get video information
    const response = await apiClient.get('/api/v1/download', {
      params: {
        format: 'mp3',
        id: videoId,
        audioQuality: '128',
        addInfo: 'true'
      }
    });

    if (response.data && !response.data.error) {
      return {
        title: response.data.title || 'Unknown Title',
        duration: response.data.duration || '0:00',
        thumbnail: response.data.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        url: videoUrl
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching video info:', error);
    return null;
  }
};
