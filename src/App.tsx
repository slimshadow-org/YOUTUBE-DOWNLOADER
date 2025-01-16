import { useState, useEffect } from 'react';
import { VideoMetadata, DownloadResponse } from './types';
import { WORKER_BASE_URL, DOWNLOAD_OPTIONS } from './constants';

function App() {
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [format, setFormat] = useState(DOWNLOAD_OPTIONS[0].key);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getVideoMetadata = async (url: string) => {
    setMessage('Fetching video metadata...');
    const noembedUrl = `${WORKER_BASE_URL}/noembed?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await fetch(noembedUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMetadata(data);
      setMessage('');
    } catch (error) {
      setMessage(`Error fetching metadata: ${(error as Error).message}`);
    }
  };

  const trackDownloadProgress = async (downloadId: string) => {
    const progressUrl = `${WORKER_BASE_URL}/progress`;
    let isDownloadComplete = false;

    while (!isDownloadComplete) {
      try {
        const response = await fetch(`${progressUrl}?id=${downloadId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data: DownloadResponse = await response.json();

        if (data.success === 1 && data.download_url) {
          isDownloadComplete = true;
          setMessage('Download complete!');
          setDownloadUrl(data.download_url);
          setIsLoading(false);
        } else if (data.success === 1) {
          setMessage('Download failed on the server.');
          isDownloadComplete = true;
          setIsLoading(false);
        } else if (data.progress) {
          const progressPercent = Math.round(data.progress / 10);
          setProgress(progressPercent);
        }
      } catch (error) {
        setMessage(`Error: ${(error as Error).message}`);
        isDownloadComplete = true;
        setIsLoading(false);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  };

  const handleDownload = async () => {
    if (!url) {
      setMessage('Please enter a YouTube URL.');
      return;
    }

    setIsLoading(true);
    setDownloadUrl('');
    setProgress(0);

    try {
      await getVideoMetadata(url);
      
      setMessage('Initiating download...');
      const downloadUrl = `${WORKER_BASE_URL}/download`;
      const response = await fetch(
        `${downloadUrl}?button=1&start=1&end=1&format=${format}&iframe_source=website&url=${encodeURIComponent(url)}`
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: DownloadResponse = await response.json();
      if (data && data.id) {
        setMessage(`Download started with ID: ${data.id}`);
        trackDownloadProgress(data.id);
      } else {
        throw new Error('Failed to initiate download.');
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 transition-colors duration-200 flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-200 dark:bg-dark-800 hover:bg-gray-300 dark:hover:bg-dark-700 transition-colors duration-200 shadow-lg"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="container mx-auto px-3 py-6 md:px-4 md:py-8 max-w-4xl flex-grow">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl p-4 md:p-6 space-y-6 transition-colors duration-200 mt-8">
          <div className="text-center space-y-1 md:space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              YouTube Downloader
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Download YouTube videos in various formats
            </p>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Enter YouTube URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="youtubeUrl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:text-white transition-colors duration-200"
                  placeholder="Paste YouTube link here"
                />
              </div>
            </div>

            {metadata && (
              <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-3 space-y-2 transition-colors duration-200">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{metadata.title}</h2>
                <img
                  src={metadata.thumbnail_url}
                  alt="Video Thumbnail"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}

            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Select Format
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:text-white transition-colors duration-200"
              >
                {DOWNLOAD_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label} {option.quality}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDownload}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium text-sm md:text-base transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 dark:bg-dark-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                'Start Download'
              )}
            </button>

            {progress > 0 && (
              <div className="space-y-1.5">
                <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs md:text-sm text-center text-gray-600 dark:text-gray-400">
                  {progress}% Complete
                </p>
              </div>
            )}

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`${metadata?.title || 'video'}.${format === 'webm_audio' ? 'webm' : format}`}
                className="block w-full text-center py-3 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm md:text-base transition-all duration-200 transform hover:scale-[1.02]"
              >
                Download Now
              </a>
            )}

            {message && (
              <div className={`text-center text-sm md:text-base font-medium rounded-lg p-2.5 ${
                message.includes('Error') 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="w-full py-4 px-3 mt-8 bg-white dark:bg-dark-800 shadow-lg transition-colors duration-200">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} SlimShadow Org. All rights reserved.
          </p>
          <p className="text-xs mt-1 text-gray-500 dark:text-gray-500">
            This tool is for personal use only. Please respect YouTube's terms of service.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;