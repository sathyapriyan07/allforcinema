import { Link, useParams } from 'react-router-dom';
import { usePlaylist } from '../hooks/useVideos';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { PlaylistQueue } from '../components/playlist/PlaylistQueue';
import { usePlayerStore } from '../store/playerStore';
import { useEffect } from 'react';

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { playlist, loading, error } = usePlaylist(id || '');
  const { currentVideo, setCurrentVideo, setQueue, playFromQueue, setPlaylist } = usePlayerStore();

  useEffect(() => {
    if (playlist?.videos) {
      setPlaylist(playlist);
    }
  }, [playlist, setPlaylist]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 skeleton rounded-xl mb-8" />
            <div className="h-8 skeleton rounded w-1/2 mb-4" />
            <div className="h-24 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Playlist Not Found
          </h1>
          <p className="text-text-muted mb-6">
            The playlist you're looking for doesn't exist.
          </p>
          <Link to="/playlists" className="text-accent-primary hover:underline">
            View All Playlists
          </Link>
        </div>
      </div>
    );
  }

  const videos = playlist.videos?.map(pv => pv.video!).filter(Boolean) || [];

  const handlePlayAll = () => {
    if (videos.length > 0) {
      setQueue(videos);
      setPlaylist(playlist);
      setCurrentVideo(videos[0]);
    }
  };

  const handleVideoClick = (index: number) => {
    if (videos.length > 0) {
      setQueue(videos);
      setPlaylist(playlist);
      playFromQueue(index);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Banner */}
      <div className="relative h-64 md:h-80">
        <img
          src={playlist.cover_image || 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'}
          alt={playlist.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-overlay-top" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-3 mb-2">
            {playlist.is_featured && (
              <span className="px-3 py-1 bg-accent-gold rounded-full text-xs font-bold text-black">
                Featured
              </span>
            )}
            <span className="text-text-muted text-sm">
              {videos.length} videos
            </span>
          </div>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-text-secondary max-w-2xl line-clamp-2">
              {playlist.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        {/* Play Button */}
        <div className="mb-8">
          <button
            onClick={handlePlayAll}
            disabled={videos.length === 0}
            className="px-8 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Play All
          </button>
        </div>

        {/* Layout: Player + Queue */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            {currentVideo ? (
              <VideoPlayer 
                video={currentVideo} 
                onEnded={() => {
                  // Auto-play is handled in the player component
                }}
              />
            ) : videos.length > 0 ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-bg-secondary flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-20 h-20 text-text-muted mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <p className="text-text-muted">Click a video in the queue to play</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-xl overflow-hidden bg-bg-secondary flex items-center justify-center">
                <div className="text-center">
                  <p className="text-text-muted">No videos in this playlist</p>
                </div>
              </div>
            )}
          </div>

          {/* Queue */}
          <div>
            <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
              Up Next
            </h2>
            <PlaylistQueue
              videos={videos}
              currentVideoId={currentVideo?.id}
              onVideoClick={handleVideoClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}