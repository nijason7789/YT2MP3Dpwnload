import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UrlInput } from '../../components/UrlInput';

describe('UrlInput Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders correctly', () => {
    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    expect(screen.getByPlaceholderText('在此貼上 YouTube 影片網址…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /轉換成 MP3/i })).toBeInTheDocument();
  });

  it('shows error for invalid URL', async () => {
    const user = userEvent.setup();
    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('在此貼上 YouTube 影片網址…');
    const button = screen.getByRole('button', { name: /轉換成 MP3/i });
    
    await user.type(input, 'invalid-url');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('請輸入有效的 YouTube 影片網址')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid YouTube URL', async () => {
    const user = userEvent.setup();
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('在此貼上 YouTube 影片網址…');
    const button = screen.getByRole('button', { name: /轉換成 MP3/i });
    
    await user.type(input, validUrl);
    await user.click(button);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(validUrl);
    });
  });

  it('disables input and button when disabled prop is true', () => {
    render(<UrlInput onSubmit={mockOnSubmit} disabled={true} />);
    
    const input = screen.getByPlaceholderText('在此貼上 YouTube 影片網址…');
    const button = screen.getByRole('button', { name: /轉換成 MP3/i });
    
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('clears error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('在此貼上 YouTube 影片網址…');
    const button = screen.getByRole('button', { name: /轉換成 MP3/i });
    
    // First, trigger an error using an invalid URL
    await user.type(input, 'invalid-url');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('請輸入有效的 YouTube 影片網址')).toBeInTheDocument();
    });
    
    // Type additional characters to trigger error clearing (error clears when value.trim() is truthy)
    await user.type(input, 'https');
    
    await waitFor(() => {
      expect(screen.queryByText('請輸入有效的 YouTube 影片網址')).not.toBeInTheDocument();
    });
  });
});
