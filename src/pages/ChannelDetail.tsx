import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { VideoCard, VideoCardSkeleton } from '../components/video/VideoCard';
import type { Channel, Video } from '../types';

export function ChannelPage() {
  const { id } = useParams<{ id: string }>();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      
      const { data: channelData } = await supabase
        .from('channels')
        .select('*')
        .eq('id', id)
        .single();
      
      if (channelData) {
        setChannel(channelData);
        
        const { data: videosData } = await supabase
          .from('videos')
          .select('*, category:categories(*)')
          .eq('channel_id', id)
          .order('created_at', { ascending: false });
        
        setVideos(videosData || []);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full skeleton" />
            <div className="space-y-2">
              <div className="h-8 w-48 skeleton rounded" />
              <div className="h-4 w-32 skeleton rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading text-text-primary mb-4">Channel Not Found</h1>
          <Link to="/" className="text-accent-primary hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Channel Header */}
      <div className="bg-bg-secondary border-b border-border-subtle">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <img
              src={channel.avatar || `https://ui-avatars.com/api/?name=${channel.name}&background=random&size=128`}
              alt={channel.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
            />
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">
                {channel.name}
              </h1>
              {channel.subscriber_count && (
                <p className="text-text-muted mt-1">{channel.subscriber_count}</p>
              )}
              {channel.bio && (
                <p className="text-text-secondary mt-3 max-w-xl">{channel.bio}</p>
              )}
              {channel.youtube_channel_url && (
                <a
                  href={channel.youtube_channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
                >
                  Visit YouTube Channel
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Videos */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
          {videos.length} Video{videos.length !== 1 ? 's' : ''}
        </h2>
        
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted">No videos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('channels')
        .select('*')
        .order('name');
      setChannels(data || []);
      setLoading(false);
    };
    fetchChannels();
  }, []);

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">
          Channels
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-bg-secondary rounded-lg">
                <div className="w-12 h-12 rounded-full skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton rounded w-20" />
                  <div className="h-3 skeleton rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted">No channels yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {channels.map((channel) => (
              <Link
                key={channel.id}
                to={`/channel/${channel.id}`}
                className="flex items-center gap-3 p-4 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors"
              >
                <img
                  src={channel.avatar || `https://ui-avatars.com/api/?name=${channel.name}&background=random&size=64`}
                  alt={channel.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary truncate">
                    {channel.name}
                  </h3>
                  {channel.subscriber_count && (
                    <p className="text-sm text-text-muted">{channel.subscriber_count}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}