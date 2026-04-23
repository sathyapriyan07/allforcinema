import { Link } from 'react-router-dom';
import { usePlaylists } from '../hooks/useVideos';
import { PlaylistCard } from '../components/playlist/PlaylistCard';
import { PlaylistCardSkeleton } from '../components/playlist/PlaylistCard';

export function PlaylistsPage() {
  const { playlists, loading, error } = usePlaylists();

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-text-primary">
            Playlists
          </h1>
          <p className="mt-2 text-text-secondary">
            Curated collections of the best videos
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <PlaylistCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-text-muted">Error loading playlists</p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-20 h-20 text-text-muted mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7.5 17l5-3.5V8.5L7.5 12l5 3.5V17z" />
            </svg>
            <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
              No Playlists Yet
            </h2>
            <p className="text-text-muted mb-6">
              Create your first playlist in the admin panel
            </p>
            <Link to="/admin/playlists" className="px-6 py-2 bg-accent-primary text-white rounded-lg">
              Create Playlist
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}