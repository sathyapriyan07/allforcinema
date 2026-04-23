import { useState, useEffect, useRef } from 'react';
import { getYouTubeSearchUrl, getYouTubeThumbnailUrl, getYouTubeVideoInfo } from '../../lib/youtube';

interface YouTubeSearchModalProps {
  onSelect: (url: string, info: { title: string; thumbnail: string } | null) => void;
  onClose: () => void;
}

export function YouTubeSearchModal({ onSelect, onClose }: YouTubeSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'youtube_navigation' && event.data?.url) {
        const url = event.data.url;
        if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
          setSelectedUrl(url);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    if (iframeRef.current) {
      iframeRef.current.src = getYouTubeSearchUrl(query);
    }
  };

  const handleSelect = async () => {
    if (!selectedUrl) return;
    setLoading(true);
    const info = await getYouTubeVideoInfo(selectedUrl);
    setLoading(false);
    const videoId = selectedUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || '';
    onSelect(selectedUrl, {
      title: info?.title || '',
      thumbnail: info?.thumbnail_url || getYouTubeThumbnailUrl(videoId),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-5xl h-[80vh] bg-bg-secondary rounded-xl flex flex-col">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-text-primary">Search YouTube</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg">
            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 border-b border-border-subtle">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for videos..."
              className="flex-1 px-4 py-2 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <iframe
              ref={iframeRef}
              src="https://www.youtube.com"
              className="w-full h-full border-0"
              title="YouTube Search"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            />
          </div>
          
          {selectedUrl && (
            <div className="w-full md:w-80 p-4 border-t md:border-t-0 md:border-l border-border-subtle bg-bg-tertiary">
              <h3 className="text-sm font-medium text-text-secondary mb-3">Selected Video</h3>
              <div className="bg-bg-secondary rounded-lg p-3">
                {selectedUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] && (
                  <img
                    src={getYouTubeThumbnailUrl(selectedUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || '')}
                    alt="Thumbnail"
                    className="w-full rounded mb-2"
                  />
                )}
                <p className="text-sm text-text-primary line-clamp-2 mb-2">{selectedUrl}</p>
                <button
                  onClick={handleSelect}
                  disabled={loading}
                  className="w-full py-2 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Use This Video'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}