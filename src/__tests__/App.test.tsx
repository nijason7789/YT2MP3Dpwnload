import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { useConverter } from '../hooks/useConverter';

jest.mock('../hooks/useConverter');

it('downloads the MP3 using the original Unicode video title', () => {
  (useConverter as jest.Mock).mockReturnValue({
    status: { status: 'success', message: 'Done' },
    downloadUrl: 'blob:audio', filename: '中文歌曲 🎵.mp3', convert: jest.fn(), reset: jest.fn()
  });
  let downloaded = '';
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloaded = this.download;
  });
  try {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /download mp3/i }));
    expect(downloaded).toBe('中文歌曲 🎵.mp3');
  } finally { click.mockRestore(); }
});
