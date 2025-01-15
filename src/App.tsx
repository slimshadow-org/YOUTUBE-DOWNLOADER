import React, { useState, useEffect } from 'react';
import { Download, Youtube, AlertCircle, CheckCircle2, Moon, Sun } from 'lucide-react';
import { getVideoMetadata, initiateDownload, getDownloadProgress } from './api';
import type { DownloadOption, VideoMetadata } from './types';

const downloadOptions: DownloadOption[] = [
  { key: "mp3", label: "MP3", quality: "" },
  { key: "m4a", label: "M4A", quality: "" },
  { key: "360", label: "MP4", quality: "360p" },
  { key: "480", label: "MP4", quality: "480p" },
  { key: "720", label: "MP4", quality: "720p" },
  { key: "1080", label: "MP4", quality: "1080p" },
  { key: "4k", label: "MP4", quality: "4K" },
  { key: "8k", label: "MP4", quality: "8K" },
  { key: "webm_audio", label: "WEBM", quality: "Audio" },
  { key: "aac", label: "AAC", quality: "" },
  { key: "flac", label: "FLAC", quality: "" },
  { key: "ogg", label: "OGG", quality: "" },
  { key: "opus", label: "OPUS", quality: "" },
  { key: "wav", label: "WAV", quality: "" },
];

function App() {
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMetadata(null);
    setDownloadProgress(null);
    setDownloadUrl('');

    if (!url.includes('youtube.com/') && !url.includes('youtu.be/')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    try {
      const data = await getVideoMetadata(url);
      setMetadata(data);
    } catch (err) {
      setError('Failed to fetch video information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFormat) {
      setError('Please select a format');
      return;
    }

    setError('');
    setDownloadProgress(0);
    setDownloadUrl('');

    try {
      const downloadInfo = await initiateDownload(url, selectedFormat);
      if (!downloadInfo?.id) throw new Error('Failed to start download');

      const checkProgress = async () => {
        const progress = await getDownloadProgress(downloadInfo.id);
        
        if (progress.success === 1 && progress.download_url) {
          setDownloadProgress(100);
          setDownloadUrl(progress.download_url);
          return;
        }
        
        if (progress.progress) {
          setDownloadProgress(progress.progress / 10);
          setTimeout(checkProgress, 5000);
        }
      };

      checkProgress();
    } catch (err) {
      setError('Download failed. Please try again.');
      setDownloadProgress(null);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 
      ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-gray-700'} 
              shadow-lg hover:scale-110 transition-transform duration-200`}
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Youtube className={`w-12 h-12 ${darkMode ? 'text-red-500' : 'text-red-600'}`} />
          </div>
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            YouTube Downloader
          </h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Download YouTube videos in various formats and qualities
          </p>
        </div>

        <form onSubmit={handleUrlSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              className={`flex-1 px-4 py-3 rounded-lg border ${darkMode ? 
                'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 
                'bg-white border-gray-300'} 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isLoading ? 'Loading...' : 'Fetch Video'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 
            rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {metadata && (
          <div className={`rounded-xl shadow-lg p-6 mb-8 ${darkMode ? 
            'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex flex-col sm:flex-row gap-6">
              <img
                src={metadata.thumbnail_url}
                alt={metadata.title}
                className="w-full sm:w-48 h-auto rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{metadata.title}</h2>
                <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  By {metadata.author_name}
                </p>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 
                    'text-gray-300' : 'text-gray-700'}`}>
                    Select Format
                  </label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 
                      'bg-gray-700 border-gray-600 text-white' : 
                      'bg-white border-gray-300 text-gray-900'} 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  >
                    <option value="">Choose format...</option>
                    {downloadOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label} {option.quality}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={!selectedFormat || downloadProgress !== null}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg 
                    hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>
            </div>

            {downloadProgress !== null && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${darkMode ? 
                    'text-gray-300' : 'text-gray-700'}`}>
                    Download Progress
                  </span>
                  <span className={`text-sm font-medium ${darkMode ? 
                    'text-gray-300' : 'text-gray-700'}`}>
                    {downloadProgress}%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2.5 ${darkMode ? 
                  'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {downloadUrl && (
              <div className={`mt-6 flex items-center gap-3 p-4 rounded-lg ${darkMode ? 
                'bg-green-900/50 border-green-800 text-green-300' : 
                'bg-green-50 border-green-200 text-green-700'} border`}>
                <CheckCircle2 className="w-5 h-5" />
                <span>Download ready! </span>
                <a
                  href={downloadUrl}
                  className={`font-medium underline ${darkMode ? 
                    'text-green-300 hover:text-green-200' : 
                    'text-green-700 hover:text-green-800'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click here to download
                </a>
              </div>
            )}
          </div>
        )}

        <footer className={`text-center mt-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-sm">
            © {new Date().getFullYear()} SlimShadow Apps. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;