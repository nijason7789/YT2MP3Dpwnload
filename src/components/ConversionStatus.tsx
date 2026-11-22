import React from 'react';
import { Loader2, CheckCircle, XCircle, Download } from 'lucide-react';
import { ConversionStatus as Status } from '../types';
import './ConversionStatus.css';

interface ConversionStatusProps {
  status: Status;
  downloadUrl?: string | null;
  onDownload?: () => void;
  onReset?: () => void;
}

export const ConversionStatus: React.FC<ConversionStatusProps> = ({
  status,
  downloadUrl,
  onDownload,
  onReset
}) => {
  const renderStatusIcon = () => {
    switch (status.status) {
      case 'loading':
      case 'converting':
        return <Loader2 data-testid="loader-icon" className="status-icon spinning" size={24} />;
      case 'success':
        return <CheckCircle className="status-icon success" size={24} />;
      case 'error':
        return <XCircle className="status-icon error" size={24} />;
      default:
        return null;
    }
  };

  const getStatusClass = () => {
    switch (status.status) {
      case 'loading':
      case 'converting':
        return 'loading';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return '';
    }
  };

  if (status.status === 'idle') {
    return null;
  }

  return (
    <div className={`conversion-status ${getStatusClass()}`}>
      <div className="status-content">
        {renderStatusIcon()}
        <div className="status-text">
          <p className="status-message">{status.message}</p>
          {status.progress && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              <span className="progress-text">{status.progress}%</span>
            </div>
          )}
        </div>
      </div>

      {status.status === 'success' && downloadUrl && (
        <div className="action-buttons">
          <button 
            onClick={onDownload}
            className="download-button"
          >
            <Download size={20} />
            下載 MP3
          </button>
          <button 
            onClick={onReset}
            className="reset-button"
          >
            轉換其他影片
          </button>
        </div>
      )}

      {status.status === 'error' && (
        <button 
          onClick={onReset}
          className="retry-button"
        >
          重新嘗試
        </button>
      )}
    </div>
  );
};
