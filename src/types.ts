export interface VideoMetadata {
  title: string;
  thumbnail_url: string;
}

export interface DownloadOption {
  key: string;
  label: string;
  quality: string;
}

export interface DownloadResponse {
  id: string;
  success?: number;
  download_url?: string;
  progress?: number;
}