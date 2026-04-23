export interface Video {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_id: string;
  thumbnail: string | null;
  category_id: string | null;
  creator_id: string | null;
  tags: string[];
  duration: string | null;
  is_featured: boolean;
  is_trending: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  creator?: Creator | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  created_at: string;
}

export interface Creator {
  id: string;
  name: string;
  youtube_channel_url: string | null;
  avatar: string | null;
  bio: string | null;
  created_at: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  videos?: PlaylistVideo[];
  video_count?: number;
}

export interface PlaylistVideo {
  id: string;
  playlist_id: string;
  video_id: string;
  position: number;
  created_at: string;
  video?: Video;
}

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  continue_watching: Record<string, { timestamp: number; updated_at: string }>;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}