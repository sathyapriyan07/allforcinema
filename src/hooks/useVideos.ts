import { useState, useEffect, useCallback } from 'react';
import type { Video, Category, Channel, Playlist } from '../types';
import { supabase } from '../lib/supabase';

export function useVideos(options?: {
  categoryId?: string;
  creatorId?: string;
  featured?: boolean;
  trending?: boolean;
  limit?: number;
  orderBy?: string;
  ascending?: boolean;
}) {
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('videos').select('*');

      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }
      if (options?.creatorId) {
        query = query.eq('creator_id', options.creatorId);
      }
      if (options?.featured) {
        query = query.eq('is_featured', true);
      }
      if (options?.trending) {
        query = query.eq('is_trending', true);
      }

      const orderCol = options?.orderBy || 'created_at';
      query = query.order(orderCol, { ascending: options?.ascending ?? false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: videos, error: err } = await query;

      if (err) throw err;

      const enriched = await Promise.all((videos || []).map(async (v: Video) => {
        const [catRes, crRes] = await Promise.all([
          v.category_id ? supabase.from('categories').select('*').eq('id', v.category_id).single() : Promise.resolve({ data: null }),
          v.creator_id ? supabase.from('creators').select('*').eq('id', v.creator_id).single() : Promise.resolve({ data: null })
        ]);
        return {
          ...v,
          category: catRes.data as Category | null,
          creator: crRes.data as Channel | null
        };
      }));

      setData(enriched);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, [options?.categoryId, options?.creatorId, options?.featured, options?.trending, options?.limit, options?.orderBy, options?.ascending]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos: data, loading, error, refetch: fetchVideos };
}

export function useVideo(id: string) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchVideo() {
      setLoading(true);
      setError(null);

      try {
        const { data: v, error: err } = await supabase
          .from('videos')
          .select('*')
          .eq('id', id)
          .single();

        if (err) throw err;
        if (!v) {
          setError('Video not found');
          return;
        }

        const [catRes, crRes] = await Promise.all([
          v.category_id ? supabase.from('categories').select('*').eq('id', v.category_id).single() : Promise.resolve({ data: null }),
          v.creator_id ? supabase.from('creators').select('*').eq('id', v.creator_id).single() : Promise.resolve({ data: null })
        ]);

        setVideo({
          ...v,
          category: catRes.data as Category | null,
          creator: crRes.data as Channel | null
        });
      } catch (e) {
        setError((e as Error).message);
      }
      setLoading(false);
    }

    fetchVideo();
  }, [id]);

  return { video, loading, error };
}

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const { data: cats, error: err } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (err) throw err;
        setData(cats || []);
      } catch (e) {
        setError((e as Error).message);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  return { categories: data, loading, error };
}

export function useChannels() {
  const [data, setData] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const { data: crs, error: err } = await supabase
          .from('creators')
          .select('*')
          .order('name');
        if (err) throw err;
        setData(crs || []);
      } catch (e) {
        setError((e as Error).message);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  return { creators: data, loading, error };
}

export function usePlaylist(id: string) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const { data: pl, error: err } = await supabase
          .from('playlists')
          .select('*')
          .eq('id', id)
          .single();

        if (err) throw err;
        if (!pl) {
          setError('Playlist not found');
          return;
        }

        const { data: pvs, error: pvErr } = await supabase
          .from('playlist_videos')
          .select('*')
          .eq('playlist_id', id)
          .order('position');

        if (pvErr) throw pvErr;

        const enrichedVideos = await Promise.all((pvs || []).map(async (pv) => {
          const { data: v } = await supabase
            .from('videos')
            .select('*')
            .eq('id', pv.video_id)
            .single();
          return { ...pv, video: v };
        }));

        setPlaylist({
          ...pl,
          videos: enrichedVideos,
          video_count: enrichedVideos.length
        });
      } catch (e) {
        setError((e as Error).message);
      }
      setLoading(false);
    }

    fetch();
  }, [id]);

  return { playlist, loading, error };
}

export function usePlaylists(featured?: boolean) {
  const [data, setData] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('playlists')
          .select('*')
          .eq('is_public', true);

        if (featured) {
          query = query.eq('is_featured', true);
        }

        const { data: pls, error: err } = await query.order('created_at', { ascending: false });

        if (err) throw err;

        const withCounts = await Promise.all((pls || []).map(async (p) => {
          const { count } = await supabase
            .from('playlist_videos')
            .select('*', { count: 'exact', head: true })
            .eq('playlist_id', p.id);
          return { ...p, video_count: count || 0 };
        }));

        setData(withCounts);
      } catch (e) {
        setError((e as Error).message);
      }
      setLoading(false);
    }

    fetch();
  }, [featured]);

  return { playlists: data, loading, error };
}

export function useSearch(query: string) {
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    async function search() {
      setLoading(true);
      setError(null);

      try {
        const q = query.toLowerCase();
        const { data: videos, error: err } = await supabase
          .from('videos')
          .select('*')
          .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
          .limit(20);

        if (err) throw err;

        const enriched = await Promise.all((videos || []).map(async (v: Video) => {
          const [catRes, crRes] = await Promise.all([
            v.category_id ? supabase.from('categories').select('*').eq('id', v.category_id).single() : Promise.resolve({ data: null }),
            v.creator_id ? supabase.from('creators').select('*').eq('id', v.creator_id).single() : Promise.resolve({ data: null })
          ]);
          return {
            ...v,
            category: catRes.data as Category | null,
            creator: crRes.data as Channel | null
          };
        }));

        setResults(enriched);
      } catch (e) {
        setError((e as Error).message);
      }
      setLoading(false);
    }

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, loading, error };
}

export function useAdminVideos() {
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    }
    setData(videos || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addVideo = useCallback(async (video: Omit<Video, 'id' | 'created_at' | 'updated_at' | 'view_count'>) => {
    const { data: newVideo, error } = await supabase
      .from('videos')
      .insert({ ...video, view_count: 0 })
      .select()
      .single();
    if (error) throw error;
    if (newVideo) {
      setData(prev => [newVideo, ...prev]);
    }
    return newVideo;
  }, []);

  const updateVideo = useCallback(async (id: string, updates: Partial<Video>) => {
    const { data: updated, error } = await supabase
      .from('videos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setData(prev => prev.map(v => v.id === id ? updated : v));
    return updated;
  }, []);

  const deleteVideo = useCallback(async (id: string) => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) throw error;
    setData(prev => prev.filter(v => v.id !== id));
  }, []);

  return { videos: data, loading, refetch: fetch, addVideo, updateVideo, deleteVideo };
}

export function useAdminPlaylists() {
  const [data, setData] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: playlists, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    }

    const withCounts = await Promise.all((playlists || []).map(async (p) => {
      const { count } = await supabase
        .from('playlist_videos')
        .select('*', { count: 'exact', head: true })
        .eq('playlist_id', p.id);
      return { ...p, video_count: count || 0 };
    }));

    setData(withCounts);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addPlaylist = useCallback(async (playlist: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: newPlaylist, error } = await supabase
      .from('playlists')
      .insert(playlist)
      .select()
      .single();
    if (error) throw error;
    if (newPlaylist) {
      setData(prev => [{ ...newPlaylist, video_count: 0 }, ...prev]);
    }
    return newPlaylist;
  }, []);

  const updatePlaylist = useCallback(async (id: string, updates: Partial<Playlist>) => {
    const { data: updated, error } = await supabase
      .from('playlists')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setData(prev => prev.map(p => p.id === id ? { ...updated, video_count: prev.find(x => x.id === id)?.video_count || 0 } : p));
    return updated;
  }, []);

  const deletePlaylist = useCallback(async (id: string) => {
    const { error } = await supabase.from('playlists').delete().eq('id', id);
    if (error) throw error;
    setData(prev => prev.filter(p => p.id !== id));
  }, []);

  const addVideoToPlaylist = useCallback(async (playlistId: string, videoId: string) => {
    const { count } = await supabase
      .from('playlist_videos')
      .select('*', { count: 'exact', head: true })
      .eq('playlist_id', playlistId);
    const { error } = await supabase
      .from('playlist_videos')
      .insert({ playlist_id: playlistId, video_id: videoId, position: (count || 0) + 1 });
    if (error) throw error;
    setData(prev => prev.map(p => p.id === playlistId ? { ...p, video_count: (p.video_count || 0) + 1 } : p));
  }, []);

  const removeVideoFromPlaylist = useCallback(async (playlistVideoId: string) => {
    const { data: pv } = await supabase.from('playlist_videos').select('playlist_id').eq('id', playlistVideoId).single();
    const { error } = await supabase.from('playlist_videos').delete().eq('id', playlistVideoId);
    if (error) throw error;
    if (pv) {
      setData(prev => prev.map(p => p.id === pv.playlist_id ? { ...p, video_count: Math.max(0, (p.video_count || 1) - 1) } : p));
    }
  }, []);

  const reorderPlaylistVideos = useCallback(async (playlistId: string, videoIds: string[]) => {
    await supabase.from('playlist_videos').delete().eq('playlist_id', playlistId);
    const inserts = videoIds.map((videoId, index) => ({
      playlist_id: playlistId,
      video_id: videoId,
      position: index + 1
    }));
    const { error } = await supabase.from('playlist_videos').insert(inserts);
    if (error) throw error;
    setData(prev => prev.map(p => p.id === playlistId ? { ...p, video_count: videoIds.length } : p));
  }, []);

  return { playlists: data, loading, refetch: fetch, addPlaylist, updatePlaylist, deletePlaylist, addVideoToPlaylist, removeVideoFromPlaylist, reorderPlaylistVideos };
}

export function useAdminCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) {
      console.error(error);
    }
    setData(categories || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addCategory = useCallback(async (category: Omit<Category, 'id' | 'created_at'>) => {
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    if (newCategory) {
      setData(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return newCategory;
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const { data: updated, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setData(prev => prev.map(c => c.id === id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)));
    return updated;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    setData(prev => prev.filter(c => c.id !== id));
  }, []);

  return { categories: data, loading, refetch: fetch, addCategory, updateCategory, deleteCategory };
}

export function useAdminChannels() {
  const [data, setData] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: channels, error } = await supabase
      .from('channels')
      .select('*')
      .order('name');
    if (error) {
      console.error(error);
    }
    setData(channels || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addChannel = useCallback(async (channel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: newChannel, error } = await supabase
      .from('channels')
      .insert(channel)
      .select()
      .single();
    if (error) throw error;
    if (newChannel) {
      setData(prev => [...prev, newChannel].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return newChannel;
  }, []);

  const updateChannel = useCallback(async (id: string, updates: Partial<Channel>) => {
    const { data: updated, error } = await supabase
      .from('channels')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setData(prev => prev.map(c => c.id === id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)));
    return updated;
  }, []);

  const deleteChannel = useCallback(async (id: string) => {
    const { error } = await supabase.from('channels').delete().eq('id', id);
    if (error) throw error;
    setData(prev => prev.filter(c => c.id !== id));
  }, []);

  return { channels: data, loading, refetch: fetch, addChannel, updateChannel, deleteChannel };
}