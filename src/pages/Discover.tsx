import { useSearchParams } from 'react-router-dom';
import { useVideos, useCategories } from '../hooks/useVideos';
import { VideoCard, VideoCardSkeleton } from '../components/video/VideoCard';

export function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryFilter = searchParams.get('category') || '';
  const tagFilter = searchParams.get('tag') || '';
  const sortFilter = searchParams.get('sort') || 'new';
  
  const { categories } = useCategories();
  
  const category = categories.find(c => c.slug === categoryFilter);
  
  const { videos, loading } = useVideos({
    categoryId: category?.id,
    orderBy: sortFilter === 'popular' ? 'view_count' : sortFilter === 'featured' ? 'is_featured' : 'created_at',
    ascending: sortFilter === 'new',
    limit: 50,
  });

  const filteredVideos = videos.filter(v => {
    if (tagFilter && !v.tags?.includes(tagFilter)) return false;
    return true;
  });

  const allTags = [...new Set(videos.flatMap(v => v.tags || []))].slice(0, 20);

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-text-primary">
            Discover
          </h1>
          <p className="mt-2 text-text-secondary">
            Find your next favorite video
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Sort:</span>
            <select
              value={sortFilter}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                params.set('sort', e.target.value);
                setSearchParams(params);
              }}
              className="px-3 py-2 bg-bg-secondary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="new">Newest</option>
              <option value="popular">Popular</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value) {
                  params.set('category', e.target.value);
                } else {
                  params.delete('category');
                }
                setSearchParams(params);
              }}
              className="px-3 py-2 bg-bg-secondary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Tag:</span>
              <select
                value={tagFilter}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  if (e.target.value) {
                    params.set('tag', e.target.value);
                  } else {
                    params.delete('tag');
                  }
                  setSearchParams(params);
                }}
                className="px-3 py-2 bg-bg-secondary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(categoryFilter || tagFilter) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categoryFilter && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('category');
                  setSearchParams(params);
                }}
                className="px-3 py-1.5 bg-bg-secondary rounded-full text-sm flex items-center gap-2 hover:bg-bg-tertiary transition-colors"
              >
                Category: {category?.name}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </button>
            )}
            {tagFilter && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('tag');
                  setSearchParams(params);
                }}
                className="px-3 py-1.5 bg-bg-secondary rounded-full text-sm flex items-center gap-2 hover:bg-bg-tertiary transition-colors"
              >
                Tag: #{tagFilter}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted">No videos found matching your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}