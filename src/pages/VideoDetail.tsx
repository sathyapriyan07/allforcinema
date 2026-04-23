import { Link, useParams } from 'react-router-dom';
import { useVideo, useVideos } from '../hooks/useVideos';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { VideoCard, VideoCardSkeleton } from '../components/video/VideoCard';

export function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { video, loading, error } = useVideo(id || '');
  const { videos: related, loading: loadingRelated } = useVideos({
    categoryId: video?.category_id ?? undefined,
    limit: 6,
  });

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

  const otherVideos = related.filter(v => v.id !== video.id).slice(0, 6);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <VideoPlayer video={video} autoplay />

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
                <p className="mt-4 text-text-secondary leading-relaxed">
                  {video.description}
                </p>
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

              {video.creator && (
                <div className="mt-6 p-4 bg-bg-secondary rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold">
                    {video.creator.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">
                      {video.creator.name}
                    </h3>
                    {video.creator.bio && (
                      <p className="text-sm text-text-muted">
                        {video.creator.bio}
                      </p>
                    )}
                  </div>
                  {video.creator.youtube_channel_url && (
                    <a
                      href={video.creator.youtube_channel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-bg-tertiary rounded-lg hover:bg-accent-primary transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8-4.003z" />
                      </svg>
                    </a>
                  )}
                </div>
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
                    <VideoCard key={v.id} video={v} showCategory={false} />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}