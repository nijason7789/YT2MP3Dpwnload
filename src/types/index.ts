export interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
  url: string;
}

export interface ConversionStatus {
  status: 'idle' | 'loading' | 'converting' | 'success' | 'error';
  progress?: number;
  message?: string;
}

export interface DownloadResponse {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
  videoInfo?: VideoInfo;
}
