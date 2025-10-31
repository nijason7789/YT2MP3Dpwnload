import { renderHook, act } from '@testing-library/react';
import { useConverter } from '../../hooks/useConverter';
import * as api from '../../services/api';

// Mock the API module
jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('useConverter Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with idle status', () => {
    const { result } = renderHook(() => useConverter());
    
    expect(result.current.status.status).toBe('idle');
    expect(result.current.downloadUrl).toBeNull();
  });

  it('handles successful conversion', async () => {
    const mockResponse = {
      success: true,
      downloadUrl: 'https://example.com/download.mp3',
      videoInfo: {
        title: 'Test Video',
        duration: '3:45',
        thumbnail: 'https://example.com/thumb.jpg',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    };
    
    mockedApi.convertToMp3.mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useConverter());
    
    await act(async () => {
      await result.current.convert('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });
    
    expect(result.current.status.status).toBe('success');
    expect(result.current.downloadUrl).toBe('https://example.com/download.mp3');
  });

  it('handles conversion failure', async () => {
    const mockResponse = {
      success: false,
      error: 'Conversion failed'
    };
    
    mockedApi.convertToMp3.mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useConverter());
    
    await act(async () => {
      await result.current.convert('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });
    
    expect(result.current.status.status).toBe('error');
    expect(result.current.status.message).toBe('Conversion failed');
  });

  it('validates YouTube URL before conversion', async () => {
    const { result } = renderHook(() => useConverter());
    
    await act(async () => {
      await result.current.convert('invalid-url');
    });
    
    expect(result.current.status.status).toBe('error');
    expect(result.current.status.message).toBe('Please enter a valid YouTube URL');
    expect(mockedApi.convertToMp3).not.toHaveBeenCalled();
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => useConverter());
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.status.status).toBe('idle');
    expect(result.current.downloadUrl).toBeNull();
  });
});
