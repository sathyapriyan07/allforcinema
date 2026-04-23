-- CineStream Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#e50914',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  youtube_channel_url TEXT,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL UNIQUE,
  thumbnail TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  duration TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for video queries
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_creator ON videos(creator_id);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_trending ON videos(is_trending);
CREATE INDEX IF NOT EXISTS idx_videos_created ON videos(created_at DESC);

-- ============================================
-- PLAYLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PLAYLIST_VIDEOS TABLE (Junction)
-- ============================================
CREATE TABLE IF NOT EXISTS playlist_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, video_id),
  UNIQUE(playlist_id, position)
);

-- Index for playlist queries
CREATE INDEX IF NOT EXISTS idx_playlist_videos_playlist ON playlist_videos(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_videos_position ON playlist_videos(playlist_id, position);

-- ============================================
-- PROFILES TABLE (User Roles)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  continue_watching JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_profile_id FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Insert sample categories
INSERT INTO categories (name, slug, description, color, icon) VALUES
  ('Action', 'action', 'High-octane action films', '#e50914', '🔥'),
  ('Comedy', 'comedy', 'Laugh out loud', '#ffd700', '😂'),
  ('Drama', 'drama', 'Emotional stories', '#8b5cf6', '🎭'),
  ('Sci-Fi', 'sci-fi', 'Future and beyond', '#06b6d4', '🚀'),
  ('Horror', 'horror', 'Scary movies', '#dc2626', '👻'),
  ('Documentary', 'documentary', 'Real stories', '#22c55e', '📹')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample creators
INSERT INTO creators (name, youtube_channel_url, bio) VALUES
  ('MovieClips', 'https://youtube.com/@movieclips', 'Best movie moments'),
  ('FilmTheory', 'https://youtube.com/@filmtheory', 'In-depth film analysis')
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read creators" ON creators FOR SELECT USING (true);
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Public read playlists" ON playlists FOR SELECT USING (is_public = true);
CREATE POLICY "Public read playlist_videos" ON playlist_videos FOR SELECT USING (
  EXISTS (SELECT 1 FROM playlists WHERE playlists.id = playlist_videos.playlist_id AND playlists.is_public = true)
);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

-- Admin policies (full access) -- NOTE: Removed profiles admin policy due to infinite recursion
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin full access creators" ON creators FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin full access videos" ON videos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin full access playlists" ON playlists FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin full access playlist_videos" ON playlist_videos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for videos
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for playlists
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get video count for a playlist
CREATE OR REPLACE FUNCTION get_playlist_video_count(p_playlist_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM playlist_videos WHERE playlist_id = p_playlist_id;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE BUCKETS (Optional)
-- ============================================

-- Create storage bucket for covers/thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('covers', 'covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Admin upload covers" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'covers' AND 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update covers" ON storage.objects FOR UPDATE USING (
  bucket_id = 'covers' AND 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete covers" ON storage.objects FOR DELETE USING (
  bucket_id = 'covers' AND 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ============================================
-- COMPLETE!
-- ============================================
-- Your database is now ready. Configure your frontend:
-- 1. Create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
-- 2. Users will need to sign up and you can manually set their role to 'admin' in the profiles table
-- 3. The app uses mock data by default if Supabase is not connected