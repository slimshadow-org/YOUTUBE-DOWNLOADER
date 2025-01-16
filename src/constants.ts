export const WORKER_BASE_URL = 'https://cors.slimshadowapps.workers.dev';

export const DOWNLOAD_OPTIONS = [
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
    { key: "wav", label: "WAV", quality: "" }
] as const;