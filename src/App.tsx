import React, { useState, useEffect } from 'react';
import { Download, Youtube, AlertCircle } from 'lucide-react';
import { getVideoMetadata, initiateDownload, getDownloadProgress } from './api';
import type { DownloadOption, VideoMetadata, DownloadProgress } from './types';

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
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMetadata(null);
    
    try {
      const data = await getVideoMetadata(url);
      setMetadata(data);
    } catch (err) {
      setError('Failed to fetch video information. Please check the URL and try again.');
    }
  };

  const handleDownload = async () => {
    if (!selectedFormat || !url) return;
    
    setDownloading(true);
    setProgress(0);
    setError('');

    try {
      const downloadInfo = await initiateDownload(url, selectedFormat);
      if (downloadInfo?.id) {
        startProgressTracking(downloadInfo.id);
      } else {
        throw new Error('Failed to start download');
      }
    } catch (err) {
      setError('Failed to start download. Please try again.');
      setDownloading(false);
    }
  };

  const startProgressTracking = async (downloadId: string) => {
    const checkProgress = async () => {
      try {
        const progressInfo: DownloadProgress = await getDownloadProgress(downloadId);
        
        if (progressInfo.success === 1 && progressInfo.download_url) {
          setDownloading(false);
          window.location.href = progressInfo.download_url;
          return;
        }
        
        if (progressInfo.progress !== undefined) {
          setProgress(progressInfo.progress / 10);
        }
        
        if (downloading) {
          setTimeout(checkProgress, 1000);
        }
      } catch (err) {
        setError('Failed to track download progress');
        setDownloading(false);
      }
    };

    checkProgress();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Youtube className="mx-auto h-16 w-16 text-white" />
          <h1 className="mt-4 text-4xl font-bold text-white">
            YouTube Downloader
          </h1>
          <p className="mt-2 text-lg text-white/80">
            Download YouTube videos in various formats
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                YouTube URL
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Get Video Info
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {metadata && (
            <div className="mt-6 space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={metadata.thumbnail_url}
                  alt={metadata.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{metadata.title}</h3>
                <p className="mt-1 text-sm text-gray-500">By {metadata.author_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Format
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {downloadOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSelectedFormat(option.key)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        selectedFormat === option.key
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      } border hover:bg-purple-50`}
                    >
                      {option.label} {option.quality}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={handleDownload}
                  disabled={!selectedFormat || downloading}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {downloading ? 'Downloading...' : 'Download'}
                </button>
              </div>

              {downloading && (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    {progress.toFixed(0)}% Complete
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="mt-8 text-center">
          <p className="text-sm text-white/80">
            © {new Date().getFullYear()} SlimShadow Org. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;