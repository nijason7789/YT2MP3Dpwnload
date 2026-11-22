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
        <h1 className="app-title">YouTube 轉 MP3</h1>
        <p className="app-subtitle">
          將 10 分鐘內的 YouTube 影片轉成 MP3
        </p>
      </div>
    </header>
  );
};
