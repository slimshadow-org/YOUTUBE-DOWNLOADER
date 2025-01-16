const youtubeUrlInput = document.getElementById('youtubeUrl');
const videoInfo = document.getElementById('videoInfo');
const videoTitle = document.getElementById('videoTitle');
const videoThumbnail = document.getElementById('videoThumbnail');
const downloadFormatSelect = document.getElementById('downloadFormat');
const downloadButton = document.getElementById('downloadButton');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const downloadLink = document.getElementById('downloadLink');
const downloadLinkAnchor = downloadLink.querySelector('a');
const messageElement = document.getElementById('message');

// Base URL for your Cloudflare Worker
const workerBaseUrl = 'https://cors.slimshadowapps.workers.dev';

// Download options (same as in your Python code)
const downloadOptions = [
    { "key": "mp3", "label": "MP3", "quality": "" },
    { "key": "m4a", "label": "M4A", "quality": "" },
    { "key": "360", "label": "MP4", "quality": "360p" },
    { "key": "480", "label": "MP4", "quality": "480p" },
    { "key": "720", "label": "MP4", "quality": "720p" },
    { "key": "1080", "label": "MP4", "quality": "1080p" },
    { "key": "4k", "label": "MP4", "quality": "4K" },
    { "key": "8k", "label": "MP4", "quality": "8K" },
    { "key": "webm_audio", "label": "WEBM", "quality": "Audio" },
    { "key": "aac", "label": "AAC", "quality": "" },
    { "key": "flac", "label": "FLAC", "quality": "" },
    { "key": "ogg", "label": "OGG", "quality": "" },
    { "key": "opus", "label": "OPUS", "quality": "" },
    { "key": "wav", "label": "WAV", "quality": "" }
];

// Populate download format options
downloadOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.key;
    optionElement.textContent = `${option.label} ${option.quality}`;
    downloadFormatSelect.appendChild(optionElement);
});

// Event listener for the download button
downloadButton.addEventListener('click', async () => {
    const youtubeUrl = youtubeUrlInput.value;
    const selectedFormat = downloadFormatSelect.value;

    if (!youtubeUrl) {
        messageElement.textContent = 'Please enter a YouTube URL.';
        return;
    }

    // Hide any previous download link or message
    downloadLink.style.display = 'none';
    messageElement.textContent = '';

    // Show video info and initiate download
    try {
        await showVideoInfo(youtubeUrl);
        initiateDownload(youtubeUrl, selectedFormat);
    } catch (error) {
        messageElement.textContent = error.message;
    }
});

// Function to fetch and display video metadata
async function showVideoInfo(youtubeUrl) {
    videoInfo.style.display = 'none'; // Hide while fetching
    messageElement.textContent = 'Fetching video metadata...';

    try {
        const metadata = await getVideoMetadata(youtubeUrl);
        if (metadata) {
            videoTitle.textContent = metadata.title;
            videoThumbnail.src = metadata.thumbnail_url;
            videoThumbnail.style.display = 'block';
            videoInfo.style.display = 'block';
            messageElement.textContent = '';
        } else {
            throw new Error('Could not fetch video metadata.');
        }
    } catch (error) {
        throw new Error('Error fetching video metadata: ' + error.message);
    }
}

// Function to get video metadata using noembed.com (via Cloudflare Worker)
async function getVideoMetadata(url) {
    messageElement.textContent = 'Fetching video metadata...';
    const noembedUrl = `${workerBaseUrl}/noembed?url=${encodeURIComponent(url)}`; // Use worker URL
    try {
        const response = await fetch(noembedUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        messageElement.textContent = '';
        return data;
    } catch (error) {
        messageElement.textContent = `Error fetching video metadata: ${error.message}`;
        return null;
    }
}

// Function to initiate download (via Cloudflare Worker)
async function initiateDownload(url, format) {
    messageElement.textContent = `Initiating download as ${format}...`;
    const downloadUrl = `${workerBaseUrl}/download`; // Use worker URL

    try {
        const response = await fetch(`${downloadUrl}?button=1&start=1&end=1&format=${format}&iframe_source=website&url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data && data.id) {
            messageElement.textContent = `Download started with ID: ${data.id}`;
            trackDownloadProgress(data.id, format);
        } else {
            throw new Error('Failed to initiate download.');
        }
    } catch (error) {
        messageElement.textContent = `Error initiating download: ${error.message}`;
    }
}

// Function to track download progress (via Cloudflare Worker)
async function trackDownloadProgress(downloadId, format) {
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';

    const progressUrl = `${workerBaseUrl}/progress`; // Use worker URL
    let isDownloadComplete = false;

    while (!isDownloadComplete) {
        try {
            const response = await fetch(`${progressUrl}?id=${downloadId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success === 1 && data.download_url) {
                // Download complete
                isDownloadComplete = true;
                messageElement.textContent = 'Download complete!';
                downloadLinkAnchor.href = data.download_url;

                // Set the download attribute for the filename
                let filename = videoTitle.textContent + '.' + (format === 'webm_audio' ? 'webm' : format);
                filename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_'); // Sanitize filename
                downloadLinkAnchor.download = filename;

                downloadLink.style.display = 'block';
                progressContainer.style.display = 'none';
            } else if (data.success === 1) {
                // Server error during download
                messageElement.textContent = 'Download failed on the server.';
                progressContainer.style.display = 'none';
                isDownloadComplete = true;
            } else if (data.progress) {
                // Update progress
                const progressPercent = Math.round(data.progress / 10);
                progressBar.style.width = `${progressPercent}%`;
                progressText.textContent = `${progressPercent}%`;
            } else {
                // Waiting for the download to start
                progressText.textContent = 'Waiting for download to start...';
            }
        } catch (error) {
            messageElement.textContent = `Error fetching progress: ${error.message}`;
            progressContainer.style.display = 'none';
            isDownloadComplete = true;
        }

        // Wait for 5 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}