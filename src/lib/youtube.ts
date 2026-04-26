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

export interface YouTubeChannelInfo {
  name: string;
  avatar_url: string;
  banner_url: string;
  description: string;
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

export async function getYouTubeChannelInfo(channelUrl: string): Promise<YouTubeChannelInfo | null> {
  // Extract channel ID or handle various YouTube channel URL formats
  const patterns = [
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
  ];

  let channelName = '';
  
  for (const pattern of patterns) {
    const match = channelUrl.match(pattern);
    if (match) {
      channelName = match[1];
      break;
    }
  }

  if (!channelName) return null;

  // Return with default avatar based on channel name
  return {
    name: channelName,
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=random&size=128`,
    banner_url: '',
    description: '',
  };
}

export function getYouTubeEmbedUrl(youtubeId: string, autoplay = false): string {
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  params.set('rel', '0');
  params.set('modestbranding', '1');
  params.set('playsinline', '0');
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

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: string;
}

const INVIDIOUS_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://inv.nadeko.net',
  'https://yewtu.be',
];

const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

export async function searchYouTube(query: string): Promise<YouTubeSearchResult[]> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      let url = `${instance}/search?q=${encodeURIComponent(query)}&format=json`;
      
      for (const proxy of CORS_PROXIES) {
        try {
          const proxiedUrl = proxy + encodeURIComponent(url);
          const response = await fetch(proxiedUrl);
          if (response.ok) {
            const data = await response.json();
            return data
              .filter((item: any) => item.type === 'video')
              .map((item: any) => ({
                videoId: item.videoId,
                title: item.title,
                author: item.author,
                thumbnail: item.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`,
                duration: item.lengthSeconds ? formatDuration(item.lengthSeconds) : '',
              }));
          }
        } catch {
          continue;
        }
      }
    } catch {
      continue;
    }
  }
  return [];
}