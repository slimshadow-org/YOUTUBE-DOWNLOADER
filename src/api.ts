const CORS_PROXY = 'https://cors.slimshadowapps.workers.dev';

export async function getVideoMetadata(url: string): Promise<any> {
  try {
    const response = await fetch(`${CORS_PROXY}/noembed?url=${url}`);
    if (!response.ok) throw new Error('Failed to fetch video metadata');
    return response.json();
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    throw error;
  }
}

export async function initiateDownload(url: string, format: string): Promise<any> {
  try {
    const params = new URLSearchParams({
      button: '1',
      start: '1',
      end: '1',
      format,
      iframe_source: 'web-app',
      url,
    });
    
    const response = await fetch(`${CORS_PROXY}/download?${params}`);
    if (!response.ok) throw new Error('Failed to initiate download');
    return response.json();
  } catch (error) {
    console.error('Error initiating download:', error);
    throw error;
  }
}

export async function getDownloadProgress(downloadId: string): Promise<any> {
  try {
    const response = await fetch(`${CORS_PROXY}/progress?id=${downloadId}`);
    if (!response.ok) throw new Error('Failed to get download progress');
    return response.json();
  } catch (error) {
    console.error('Error getting download progress:', error);
    throw error;
  }
}