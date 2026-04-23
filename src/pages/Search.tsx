import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useVideos';
import { useEffect, useState } from 'react';
import { VideoCard, VideoCardSkeleton } from '../components/video/VideoCard';
import { debounce } from '../lib/utils';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const { results, loading } = useSearch(query);
  
  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce((value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      setSearchParams(params);
    }, 500);
    
    debouncedSearch(query);
  }, [query]);

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-text-primary">
            Search
          </h1>
          
          {/* Search Input */}
          <div className="mt-4 max-w-xl">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search videos, creators, tags..."
                className="w-full h-14 pl-12 pr-4 bg-bg-secondary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary text-lg"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {query.length < 2 ? (
          <div className="text-center py-16">
            <svg className="w-20 h-20 text-text-muted mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <p className="text-text-muted text-lg">
              Enter at least 2 characters to search
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">
              No results found for "{query}"
            </p>
          </div>
        ) : (
          <>
            <p className="text-text-muted mb-6">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}