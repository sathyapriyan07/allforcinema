import { Link } from 'react-router-dom';
import { useVideos, usePlaylists, useCategories } from '../hooks/useVideos';
import { VideoCard, VideoCardSkeleton } from '../components/video/VideoCard';
import { MaterialSymbol } from '../components/ui/MaterialSymbol';
import { PlaylistCard, PlaylistCardSkeleton } from '../components/playlist/PlaylistCard';
import type { Video, Playlist, Category } from '../types';

export function HomePage() {
  const { videos: featured, loading: loadingFeatured } = useVideos({ featured: true, limit: 6 });
  const { videos: trending, loading: loadingTrending } = useVideos({ trending: true, limit: 10 });
  const { videos: recent, loading: loadingRecent } = useVideos({ limit: 10 });
  const { playlists, loading: loadingPlaylists } = usePlaylists();
  const { categories, loading: loadingCategories } = useCategories();

  const heroVideo: Video | undefined = trending[0];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      {heroVideo && (
        <section className="relative aspect-video md:aspect-[16/9] h-[56.25vw] md:h-[70vh] md:min-h-[500px]">
          <img
            src={heroVideo.thumbnail || `https://img.youtube.com/vi/${heroVideo.youtube_id}/maxresdefault.jpg`}
            alt={heroVideo.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-16">
            <div className="max-w-4xl">
              <span className="inline-block px-3 py-1 bg-accent-primary rounded text-sm font-medium text-white mb-2 md:mb-4">
                Trending Now
              </span>
              <h1 className="text-xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-2 md:mb-4">
                {heroVideo.title}
              </h1>
              {heroVideo.description && (
                <p className="text-sm md:text-lg text-text-secondary mb-3 md:mb-6 line-clamp-2">
                  {heroVideo.description}
                </p>
              )}
              <div className="flex gap-2 md:gap-4">
                <Link
                  to={`/video/${heroVideo.id}`}
                  className="px-4 md:px-8 py-2 md:py-3 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2 text-sm md:text-base"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Watch Now
                </Link>
                {heroVideo.category && (
                  <Link
                    to={`/category/${heroVideo.category.slug}`}
                    className="px-4 md:px-8 py-2 md:py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors text-sm md:text-base"
                  >
                    {heroVideo.category.name}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8 space-y-12">
        {/* Categories Quick Links */}
        {!loadingCategories && categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-text-primary">
                Browse by Category
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category: Category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group relative p-6 rounded-xl bg-bg-secondary card-glow hover:scale-105 transition-all duration-300 text-center"
                >
                  {category.icon && (
                    <MaterialSymbol name={category.icon} className="text-4xl mb-2" />
                  )}
                  <h3 className="font-heading font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Videos */}
        {!loadingFeatured && featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-text-primary">
                Featured Videos
              </h2>
              <Link to="/discover?featured=true" className="text-text-secondary hover:text-text-primary transition-colors">
                View All
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:grid md:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:overflow-visible md:mx-0 md:px-0 md:pb-0">
              {loadingFeatured
                ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="w-[160px] md:w-auto flex-shrink-0"><VideoCardSkeleton /></div>)
                : featured.slice(0, 6).map((video: Video) => (
                    <div key={video.id} className="w-[160px] md:w-auto flex-shrink-0">
                      <VideoCard video={video} />
                    </div>
                  ))}
            </div>
          </section>
        )}

        {/* Featured Playlists */}
        {!loadingPlaylists && playlists.filter((p: Playlist) => p.is_featured).length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-text-primary">
                Featured Playlists
              </h2>
              <Link to="/playlists" className="text-text-secondary hover:text-text-primary transition-colors">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingPlaylists
                ? Array.from({ length: 4 }).map((_, i) => <PlaylistCardSkeleton key={i} />)
                : playlists.filter((p: Playlist) => p.is_featured).slice(0, 4).map((playlist: Playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
            </div>
          </section>
        )}

        {/* Trending Row */}
        {!loadingTrending && trending.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-text-primary">
                Trending Now
              </h2>
              <Link to="/discover?trending=true" className="text-text-secondary hover:text-text-primary transition-colors">
                View All
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4">
              {loadingTrending
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-[280px] flex-shrink-0">
                      <VideoCardSkeleton />
                    </div>
                  ))
                : trending.map((video: Video) => (
                    <div key={video.id} className="w-[280px] flex-shrink-0">
                      <VideoCard video={video} />
                    </div>
                  ))}
            </div>
          </section>
        )}

        {/* Recently Added */}
        {!loadingRecent && recent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-text-primary">
                Recently Added
              </h2>
              <Link to="/discover?sort=new" className="text-text-secondary hover:text-text-primary transition-colors">
                View All
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:grid md:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:overflow-visible md:mx-0 md:px-0 md:pb-0">
              {loadingRecent
                ? Array.from({ length: 10 }).map((_, i) => <div key={i} className="w-[160px] md:w-auto flex-shrink-0"><VideoCardSkeleton /></div>)
                : recent.slice(0, 10).map((video: Video) => (
                    <div key={video.id} className="w-[160px] md:w-auto flex-shrink-0">
                      <VideoCard video={video} />
                    </div>
                  ))}
            </div>
          </section>
        )}

        {/* All Playlists */}
        {!loadingPlaylists && playlists.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-text-primary">
                All Playlists
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingPlaylists
                ? Array.from({ length: 4 }).map((_, i) => <PlaylistCardSkeleton key={i} />)
                : playlists.slice(0, 4).map((playlist: Playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}