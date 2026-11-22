import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { ConversionStatus } from './components/ConversionStatus';
import { useConverter } from './hooks/useConverter';
import './App.css';

function App() {
  const { status, downloadUrl, filename, convert, reset } = useConverter();

  const handleUrlSubmit = async (url: string) => {
    await convert(url);
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isConverting = status.status === 'loading' || status.status === 'converting';

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <UrlInput 
          onSubmit={handleUrlSubmit}
          disabled={isConverting}
        />
        
        <ConversionStatus
          status={status}
          downloadUrl={downloadUrl}
          onDownload={handleDownload}
          onReset={reset}
        />
      </main>

      <footer className="app-footer">
        <p>
          YouTube 音訊轉檔，支援 10 分鐘內的影片。
          <span className="footer-note">免註冊即可使用。</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
