import { useState, useEffect } from 'react';
import { searchYouTube, type YouTubeSearchResult } from '../../lib/youtube';

interface YouTubeSearchModalProps {
  onSelect: (url: string, info: { title: string; thumbnail: string } | null) => void;
  onClose: () => void;
}

export function YouTubeSearchModal({ onSelect, onClose }: YouTubeSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<YouTubeSearchResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setSelected(null);
    
    const searchResults = await searchYouTube(query);
    setResults(searchResults);
    setLoading(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-4xl max-h-[85vh] bg-bg-secondary rounded-xl flex flex-col">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-heading font-bold text-text-primary">Search YouTube</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg">
            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 border-b border-border-subtle flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for videos..."
              className="flex-1 px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {!loading && results.length === 0 && query && (
            <div className="text-center py-12 text-text-muted">
              {results.length === 0 ? 'No results found. Try a different search.' : 'Search for a video to add.'}
            </div>
          )}
          
          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {results.map((video) => (
                <div
                  key={video.videoId}
                  onClick={() => setSelected(video)}
                  className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selected?.videoId === video.videoId 
                      ? 'bg-accent-primary/20 ring-2 ring-accent-primary' 
                      : 'bg-bg-tertiary hover:bg-border-subtle'
                  }`}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-40 h-[90px] object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-text-muted mt-1">{video.author}</p>
                    {video.duration && (
                      <p className="text-xs text-text-muted mt-1">{video.duration}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-accent-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="p-4 border-t border-border-subtle flex-shrink-0">
            <button
              onClick={() => {
                const url = `https://www.youtube.com/watch?v=${selected.videoId}`;
                onSelect(url, {
                  title: selected.title,
                  thumbnail: selected.thumbnail,
                });
              }}
              className="w-full py-3 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg transition-colors"
            >
              Add: {selected.title}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}