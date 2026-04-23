import { useEffect, useRef } from 'react';
import { getYouTubeEmbedUrl } from '../../lib/youtube';
import { usePlayerStore } from '../../store/playerStore';
import type { Video } from '../../types';

interface VideoPlayerProps {
  video: Video;
  autoplay?: boolean;
  onEnded?: () => void;
}

export function VideoPlayer({ video, autoplay = false, onEnded }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { autoplay: globalAutoplay, playNext } = usePlayerStore();

  const embedUrl = getYouTubeEmbedUrl(video.youtube_id, autoplay || globalAutoplay);

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.info === 'ended' || event.data?.event === 'onStateChange') {
      if (event.data?.playerState === 0) {
        onEnded?.();
        playNext();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEnded, playNext]);

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-bg-secondary">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={video.title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function VideoPlayerFullscreen() {
  const { currentVideo, queue, queueIndex, playNext, playPrevious } = usePlayerStore();

  if (!currentVideo) {
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden bg-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <svg className="w-20 h-20 text-text-muted mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <p className="text-text-muted">Select a video to play</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <VideoPlayer video={currentVideo} autoplay onEnded={playNext} />

      {/* Info */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          {currentVideo.title}
        </h1>
        {currentVideo.description && (
          <p className="mt-2 text-text-secondary">{currentVideo.description}</p>
        )}
        {currentVideo.tags && currentVideo.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {currentVideo.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-bg-tertiary rounded-full text-xs text-text-secondary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Queue Navigation */}
      {queue.length > 0 && (
        <div className="flex items-center gap-4 pt-4 border-t border-border-subtle">
          <button
            onClick={playPrevious}
            disabled={queueIndex === 0}
            className="p-2 rounded-lg bg-bg-tertiary hover:bg-border-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 20L9 12l10-8v16zM5 4h2v16H5V4z" />
            </svg>
          </button>
          <span className="text-sm text-text-muted">
            {queueIndex + 1} / {queue.length}
          </span>
          <button
            onClick={playNext}
            disabled={queueIndex === queue.length - 1}
            className="p-2 rounded-lg bg-bg-tertiary hover:bg-border-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 4l10 8-10 8V4zM17 4h2v16h-2V4z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}