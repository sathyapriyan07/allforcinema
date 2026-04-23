import { Link } from 'react-router-dom';
import type { Playlist } from '../../types';

interface PlaylistCardProps {
  playlist: Playlist;
  className?: string;
}

export function PlaylistCard({ playlist, className }: PlaylistCardProps) {
  const coverImage = playlist.cover_image || 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg';

  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className={`block rounded-lg overflow-hidden hover:bg-bg-secondary p-1 ${className || ''}`}
    >
      {/* Cover Image */}
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <img
          src={coverImage}
          alt={playlist.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="mt-2 px-1">
        <h3 className="font-medium text-text-primary line-clamp-2 text-sm leading-snug">
          {playlist.title}
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          {playlist.video_count || 0} videos
        </p>
      </div>
    </Link>
  );
}

interface PlaylistCardSkeletonProps {
  className?: string;
}

export function PlaylistCardSkeleton({ className }: PlaylistCardSkeletonProps) {
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