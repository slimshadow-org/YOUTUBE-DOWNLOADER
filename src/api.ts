const API_BASE_URL = 'https://p.oceansaver.in';

export async function getVideoMetadata(url: string): Promise<any> {
  const response = await fetch(`https://noembed.com/embed?url=${url}`);
  if (!response.ok) throw new Error('Failed to fetch video metadata');
  return response.json();
}

export async function initiateDownload(url: string, format: string): Promise<any> {
  const params = new URLSearchParams({
    button: '1',
    start: '1',
    end: '1',
    format,
    iframe_source: 'web-app',
    url,
  });

  const response = await fetch(`${API_BASE_URL}/ajax/download.php?${params}`);
  if (!response.ok) throw new Error('Failed to initiate download');
  return response.json();
}

export async function getDownloadProgress(downloadId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ajax/progress.php?id=${downloadId}`);
  if (!response.ok) throw new Error('Failed to get download progress');
  return response.json();
}