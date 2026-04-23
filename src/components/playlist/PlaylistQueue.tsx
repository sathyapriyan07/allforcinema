import { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { getYouTubeThumbnailUrl } from '../../lib/youtube';
import type { Video } from '../../types';

interface PlaylistQueueProps {
  videos: Video[];
  currentVideoId?: string;
  onVideoClick: (index: number) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
}

export function PlaylistQueue({
  videos,
  currentVideoId,
  onVideoClick,
}: PlaylistQueueProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentVideoId]);

  if (videos.length === 0) {
    return (
      <div className="p-8 text-center text-text-muted">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7.5 17l5-3.5V8.5L7.5 12l5 3.5V17z" />
        </svg>
        <p>No videos in this playlist</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 hide-scrollbar">
      {videos.map((video, index) => {
        const isActive = video.id === currentVideoId;
        const thumbnail = video.thumbnail || getYouTubeThumbnailUrl(video.youtube_id);

        return (
          <button
            key={video.id}
            onClick={() => onVideoClick(index)}
            className={cn(
              'w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-left group',
              isActive
                ? 'bg-accent-primary/20 border-l-4 border-accent-primary'
                : 'bg-bg-secondary hover:bg-bg-tertiary border-l-4 border-transparent'
            )}
          >
            {/* Index */}
            <span className={cn(
              'w-6 text-center text-sm font-medium',
              isActive ? 'text-accent-primary' : 'text-text-muted'
            )}>
              {index + 1}
            </span>

            {/* Thumbnail */}
            <div className="relative w-24 h-14 rounded overflow-hidden flex-shrink-0">
              <img
                src={thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {video.duration && (
                <span className="absolute bottom-1 right-1 px-1 bg-black/80 rounded text-[10px] text-white">
                  {video.duration}
                </span>
              )}
              {isActive && (
                <div className="absolute inset-0 bg-accent-primary/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-primary" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                'text-sm font-medium line-clamp-2',
                isActive ? 'text-accent-primary' : 'text-text-primary'
              )}>
                {video.title}
              </h4>
              {video.creator && (
                <p className="text-xs text-text-muted mt-0.5">
                  {video.creator.name}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}