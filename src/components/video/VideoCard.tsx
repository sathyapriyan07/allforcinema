import { Link } from 'react-router-dom';
import { getYouTubeThumbnailUrl } from '../../lib/youtube';
import type { Video } from '../../types';

interface VideoCardProps {
  video: Video;
  className?: string;
  showDuration?: boolean;
}

export function VideoCard({ video, className, showDuration = true }: VideoCardProps) {
  const thumbnail = video.thumbnail || getYouTubeThumbnailUrl(video.youtube_id);

  return (
    <Link
      to={`/video/${video.id}`}
      className={`block rounded-lg overflow-hidden hover:bg-bg-secondary p-1 ${className || ''}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <img
          src={thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Duration Badge */}
        {showDuration && video.duration && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/90 rounded text-xs text-white font-medium">
            {video.duration}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 px-1">
        <h3 className="font-medium text-text-primary line-clamp-2 text-sm leading-snug">
          {video.title}
        </h3>
        {video.category && (
          <p className="mt-1 text-xs text-text-muted">
            {video.category.name}
          </p>
        )}
      </div>
    </Link>
  );
}

interface VideoCardSkeletonProps {
  className?: string;
}

export function VideoCardSkeleton({ className }: VideoCardSkeletonProps) {
  return (
    <div className={`rounded-lg overflow-hidden ${className || ''}`}>
      <div className="aspect-video bg-bg-tertiary rounded-lg" />
      <div className="mt-2 px-1 space-y-2">
        <div className="h-4 bg-bg-tertiary rounded w-3/4" />
        <div className="h-3 bg-bg-tertiary rounded w-1/2" />
      </div>
    </div>
  );
}