export interface DownloadOption {
  key: string;
  label: string;
  quality: string;
}

export interface VideoMetadata {
  title: string;
  thumbnail_url: string;
  author_name: string;
}

export interface DownloadProgress {
  success: number;
  progress?: number;
  download_url?: string;
}