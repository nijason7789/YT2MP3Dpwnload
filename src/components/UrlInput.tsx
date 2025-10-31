import React, { useState } from 'react';
import { Link, AlertCircle } from 'lucide-react';
import { isValidYouTubeUrl } from '../utils/youtube';
import './UrlInput.css';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  onSubmit,
  disabled = false,
  placeholder = "Paste YouTube URL here..."
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setError('');
    onSubmit(url.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    // Clear error when user starts typing
    if (error && value.trim()) {
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="url-input-form" noValidate>
      <div className="input-container">
        <div className="input-wrapper">
          <Link className="input-icon" size={20} />
          <input
            type="url"
            value={url}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`url-input ${error ? 'error' : ''}`}
            autoComplete="off"
            autoFocus
          />
        </div>
        
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
      
      <button
        type="submit"
        disabled={disabled || !url.trim()}
        className="submit-button"
      >
        Convert to MP3
      </button>
    </form>
  );
};
