import React from 'react';
import { Music, Youtube } from 'lucide-react';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <Youtube className="logo-icon youtube" size={32} />
          <span className="logo-arrow">→</span>
          <Music className="logo-icon music" size={32} />
        </div>
        <h1 className="app-title">YT2MP3 Converter</h1>
        <p className="app-subtitle">
          Convert YouTube videos to high-quality MP3 files instantly
        </p>
      </div>
    </header>
  );
};
