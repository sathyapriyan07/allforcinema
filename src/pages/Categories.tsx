import { Link, useParams } from 'react-router-dom';
import { useVideos } from '../hooks/useVideos';
import { useCategories } from '../hooks/useVideos';
import { VideoCard, VideoCardSkeleton } from '../components/video/VideoCard';

export function CategoriesPage() {
  const { categories, loading, error } = useCategories();

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-text-primary">
            Categories
          </h1>
          <p className="mt-2 text-text-secondary">
            Browse videos by category
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square skeleton rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-text-muted">Error loading categories</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
              No Categories Yet
            </h2>
            <p className="text-text-muted">
              Create categories in the admin panel
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group relative p-8 rounded-xl bg-bg-secondary card-glow hover:scale-105 transition-all duration-300 text-center"
              >
                {category.icon && (
                  <span className="text-5xl mb-3 block">{category.icon}</span>
                )}
                <h3 className="font-heading font-semibold text-lg text-text-primary group-hover:text-white transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-2 text-sm text-text-muted">
                    {category.description}
                  </p>
                )}
                <div
                  className="absolute inset-x-0 bottom-0 h-1 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: category.color }}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { categories } = useCategories();
  const category = categories.find(c => c.slug === slug);
  const { videos, loading } = useVideos({ categoryId: category?.id, limit: 50 });

  if (!category) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Category Not Found
          </h1>
          <p className="text-text-muted mb-6">
            The category doesn't exist.
          </p>
          <Link to="/categories" className="text-accent-primary hover:underline">
            View All Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          {category.icon && <span className="text-5xl">{category.icon}</span>}
          <div>
            <h1 className="text-4xl font-heading font-bold text-text-primary">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-2 text-text-secondary">{category.description}</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted">No videos in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}