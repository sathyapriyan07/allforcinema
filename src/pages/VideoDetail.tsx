import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useVideo, useVideos } from '../hooks/useVideos';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { VideoCard, VideoCardSkeleton } from '../components/video/VideoCard';

export function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { video, loading, error } = useVideo(id || '');
  const { videos: categoryVideos, loading: loadingCategory } = useVideos({
    categoryId: video?.category_id ?? undefined,
    limit: 6,
  });
  const { videos: channelVideos, loading: loadingChannel } = useVideos({
    channelId: video?.channel_id ?? undefined,
    limit: 6,
  });
  const [showDescription, setShowDescription] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
          <div className="aspect-video skeleton rounded-xl" />
          <div className="mt-6 space-y-4">
            <div className="h-8 skeleton rounded w-3/4" />
            <div className="h-4 skeleton rounded w-1/2" />
            <div className="h-20 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Video Not Found
          </h1>
          <p className="text-text-muted mb-6">
            The video you're looking for doesn't exist.
          </p>
          <Link to="/" className="text-accent-primary hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const otherVideos = [...(categoryVideos || []), ...(channelVideos || [])]
    .filter((v, index, self) => self.findIndex(x => x.id === v.id) === index)
    .filter(v => v.id !== video.id)
    .slice(0, 6);
  const loadingRelated = loadingCategory || loadingChannel;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <VideoPlayer video={video} />
            
            {/* Watch on YouTube */}
            <a
              href={video.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-lg transition-colors"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png" 
                alt="YouTube" 
                className="w-5 h-4 object-contain"
              />
              Watch on YouTube
            </a>

            {/* Music Streaming Links */}
            {(video.spotify_url || video.apple_music_url || video.youtube_music_url) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {video.spotify_url && (
                  <a
                    href={video.spotify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium rounded-lg text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Spotify
                  </a>
                )}
                {video.apple_music_url && (
                  <a
                    href={video.apple_music_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#FA243C] hover:bg-[#fc3856] text-white font-medium rounded-lg text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.68-.83 1.14-1.99 1.01-3.15-1.03.05-2.27.7-3.01 1.55-.67.76-1.23 2-1.09 3.15 1.15.09 2.34-.7 3.08-1.55z"/>
                    </svg>
                    Apple Music
                  </a>
                )}
                {video.youtube_music_url && (
                  <a
                    href={video.youtube_music_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#FF0000] hover:bg-[#ff3333] text-white font-medium rounded-lg text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm4.5 11.4l-6.3 3.6v-7.2l6.3 3.6z"/>
                    </svg>
                    YouTube Music
                  </a>
                )}
              </div>
            )}

            {/* Video Info */}
            <div>
              <h1 className="text-3xl font-heading font-bold text-text-primary">
                {video.title}
              </h1>
              
              <div className="flex items-center gap-4 mt-4 text-text-muted">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                  </svg>
                  {video.duration}
                </span>
                {video.category && (
                  <Link
                    to={`/category/${video.category.slug}`}
                    className="flex items-center gap-1 hover:text-text-primary transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: video.category.color }}
                    />
                    {video.category.name}
                  </Link>
                )}
              </div>

              {video.description && (
                <>
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="mt-4 text-sm font-medium text-accent-primary hover:underline"
                  >
                    {showDescription ? 'Hide Description' : 'Show Description'}
                  </button>
                  {showDescription && (
                    <p className="mt-2 text-text-secondary leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </>
              )}

              {video.tags && video.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/discover?tag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1.5 bg-bg-tertiary hover:bg-accent-primary/20 rounded-full text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {video.channel && (
                <Link to={`/channel/${video.channel.id}`} className="mt-6 p-4 bg-bg-secondary rounded-xl flex items-center gap-4 hover:bg-bg-tertiary transition-colors">
                  <div className="w-12 h-12 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold overflow-hidden">
                    {video.channel.avatar ? (
                      <img src={video.channel.avatar} alt={video.channel.name} className="w-full h-full object-cover" />
                    ) : (
                      video.channel.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">
                      {video.channel.name}
                    </h3>
                    {video.channel.bio && (
                      <p className="text-sm text-text-muted">
                        {video.channel.bio}
                      </p>
                    )}
                  </div>
                  {video.channel.youtube_channel_url && (
                    <a
                      href={video.channel.youtube_channel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-red-600 hover:text-red-700"
                    >
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png" 
                        alt="YouTube" 
                        className="w-5 h-4 object-contain"
                      />
                    </a>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-bold text-text-primary">
              Related Videos
            </h2>
            <div className="space-y-4">
              {loadingRelated
                ? Array.from({ length: 6 }).map((_, i) => <VideoCardSkeleton key={i} />)
                : otherVideos.map((v) => (
                    <VideoCard key={v.id} video={v} />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}