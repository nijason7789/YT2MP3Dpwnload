import { render, screen, fireEvent } from '@testing-library/react';
import { ConversionStatus } from '../../components/ConversionStatus';
import { ConversionStatus as Status } from '../../types';

describe('ConversionStatus Component', () => {
  const mockOnDownload = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    mockOnDownload.mockClear();
    mockOnReset.mockClear();
  });

  it('renders nothing when status is idle', () => {
    const status: Status = { status: 'idle' };
    const { container } = render(
      <ConversionStatus status={status} onDownload={mockOnDownload} onReset={mockOnReset} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders loading state correctly', () => {
    const status: Status = { status: 'loading', message: 'Preparing conversion...' };
    render(
      <ConversionStatus status={status} onDownload={mockOnDownload} onReset={mockOnReset} />
    );
    
    expect(screen.getByText('Preparing conversion...')).toBeInTheDocument();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('renders converting state with progress', () => {
    const status: Status = { 
      status: 'converting', 
      message: 'Converting to MP3...', 
      progress: 75 
    };
    render(
      <ConversionStatus status={status} onDownload={mockOnDownload} onReset={mockOnReset} />
    );
    
    expect(screen.getByText('Converting to MP3...')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders success state with download button', () => {
    const status: Status = { status: 'success', message: 'Conversion completed!' };
    const downloadUrl = 'https://example.com/download.mp3';
    
    render(
      <ConversionStatus 
        status={status} 
        downloadUrl={downloadUrl}
        onDownload={mockOnDownload} 
        onReset={mockOnReset} 
      />
    );
    
    expect(screen.getByText('Conversion completed!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download mp3/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /convert another/i })).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    const status: Status = { status: 'error', message: 'Conversion failed' };
    
    render(
      <ConversionStatus status={status} onDownload={mockOnDownload} onReset={mockOnReset} />
    );
    
    expect(screen.getByText('Conversion failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onDownload when download button is clicked', () => {
    const status: Status = { status: 'success', message: 'Conversion completed!' };
    const downloadUrl = 'https://example.com/download.mp3';
    
    render(
      <ConversionStatus 
        status={status} 
        downloadUrl={downloadUrl}
        onDownload={mockOnDownload} 
        onReset={mockOnReset} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /download mp3/i }));
    expect(mockOnDownload).toHaveBeenCalledTimes(1);
  });

  it('calls onReset when retry button is clicked', () => {
    const status: Status = { status: 'error', message: 'Conversion failed' };
    
    render(
      <ConversionStatus status={status} onDownload={mockOnDownload} onReset={mockOnReset} />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });
});
