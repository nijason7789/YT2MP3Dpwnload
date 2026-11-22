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
  placeholder = "在此貼上 YouTube 影片網址…"
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('請貼上 YouTube 影片網址');
      return;
    }

    if (!isValidYouTubeUrl(url.trim())) {
      setError('請輸入有效的 YouTube 影片網址');
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
            aria-label="YouTube 影片網址"
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
        轉換成 MP3
      </button>
    </form>
  );
};
