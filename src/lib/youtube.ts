export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export interface YouTubeVideoInfo {
  title: string;
  description: string;
  thumbnail_url: string;
}

export async function getYouTubeVideoInfo(url: string): Promise<YouTubeVideoInfo | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  // Use noembed API - provides title and author
  try {
    const response = await fetch(
      `https://noembed.com/embed?url=${encodeURIComponent(url)}&width=640`
    );
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || '',
        description: data.description || data.author_name || '',
        thumbnail_url: data.thumbnail_url || thumbnailUrl,
      };
    }
  } catch {
    // Fallback
  }
  
  // Fallback to YouTube oembed
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || '',
        description: data.author_name || '',
        thumbnail_url: thumbnailUrl,
      };
    }
  } catch {
    // Fallback
  }
  
  return {
    title: '',
    description: '',
    thumbnail_url: thumbnailUrl,
  };
}

export function getYouTubeEmbedUrl(youtubeId: string, autoplay = false): string {
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  params.set('rel', '0');
  params.set('modestbranding', '1');
  return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
}

export function getYouTubeThumbnailUrl(youtubeId: string, quality: 'default' | 'medium' | 'high' | 'maxresdefault' = 'maxresdefault'): string {
  return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}