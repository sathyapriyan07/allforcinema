import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminPlaylists, useAdminVideos } from '../../hooks/useVideos';
import type { Playlist } from '../../types';
import { getYouTubeThumbnailUrl } from '../../lib/youtube';

export function AdminPlaylistsPage() {
  const { playlists, loading, deletePlaylist } = useAdminPlaylists();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary">
            Playlists
          </h1>
          <p className="text-text-muted mt-1">
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Create Playlist
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <PlaylistForm
          playlistId={editingId}
          onClose={() => {
            setIsAdding(false);
            setEditingId(null);
          }}
        />
      )}

      {/* Playlist Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video skeleton rounded-xl" />
          ))}
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
            Create your first playlist to get started
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2 bg-accent-primary text-white rounded-lg"
          >
            Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="group relative rounded-xl overflow-hidden bg-bg-secondary card-glow"
            >
              {/* Cover */}
              <div className="relative aspect-video">
                <img
                  src={playlist.cover_image || 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'}
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 gradient-overlay opacity-60" />
                {playlist.is_featured && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-accent-gold rounded-full text-xs font-bold text-black">
                    Featured
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="p-4">
                <h3 className="font-heading font-semibold text-text-primary line-clamp-1">
                  {playlist.title}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  {playlist.video_count || 0} videos
                </p>
              </div>
              
              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingId(playlist.id)}
                  className="p-2 bg-bg-secondary/80 rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  <svg className="w-4 h-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2l4.5-4.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this playlist?')) {
                      deletePlaylist(playlist.id);
                    }
                  }}
                  className="p-2 bg-bg-secondary/80 rounded-lg hover:bg-red-500 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface PlaylistFormProps {
  playlistId?: string | null;
  onClose: () => void;
}

function PlaylistForm({ playlistId, onClose }: PlaylistFormProps) {
  const { playlists, addPlaylist, updatePlaylist, addVideoToPlaylist } = useAdminPlaylists();
  const { videos } = useAdminVideos();
  
  const existing = playlistId ? playlists.find(p => p.id === playlistId) : null;
  
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [coverImage, setCoverImage] = useState(existing?.cover_image || '');
  const [isFeatured, setIsFeatured] = useState(existing?.is_featured || false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showVideoSelector, setShowVideoSelector] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) return;
    
    if (playlistId) {
      await updatePlaylist(playlistId, {
        title,
        description: description || null,
        cover_image: coverImage || null,
        is_featured: isFeatured,
      });
    } else {
      const newPlaylist = await addPlaylist({
        title,
        description: description || null,
        cover_image: coverImage || null,
        is_featured: isFeatured,
        is_public: true,
      } as Omit<Playlist, 'id' | 'created_at' | 'updated_at'>);
      
      // Add videos to playlist if any selected
      for (const videoId of selectedVideos) {
        await addVideoToPlaylist(newPlaylist.id, videoId);
      }
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-4xl bg-bg-secondary rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-text-primary">
            {playlistId ? 'Edit Playlist' : 'Create Playlist'}
          </h2>
          {playlistId && (
            <Link
              to={`/playlist/${playlistId}`}
              target="_blank"
              className="text-sm text-accent-primary hover:underline"
            >
              View on Site
            </Link>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Playlist title"
                className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Playlist description"
                rows={3}
                className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Cover Image URL
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
              {coverImage && (
                <div className="mt-2">
                  <img src={coverImage} alt="Preview" className="w-48 rounded" />
                </div>
              )}
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border-subtle bg-bg-tertiary text-accent-primary focus:ring-accent-primary"
              />
              <span className="text-text-primary">Featured</span>
            </label>
          </div>

          {/* Add Videos (only for new playlists) */}
          {!playlistId && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">
                  Add Videos ({selectedVideos.length} selected)
                </label>
                <button
                  type="button"
                  onClick={() => setShowVideoSelector(true)}
                  className="text-sm text-accent-primary hover:underline"
                >
                  Select Videos
                </button>
              </div>
              
              {selectedVideos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedVideos.map((videoId) => {
                    const video = videos.find(v => v.id === videoId);
                    return video ? (
                      <div
                        key={videoId}
                        className="flex items-center gap-2 px-2 py-1 bg-bg-tertiary rounded"
                      >
                        <img
                          src={video.thumbnail || getYouTubeThumbnailUrl(video.youtube_id)}
                          alt={video.title}
                          className="w-16 h-10 object-cover rounded"
                        />
                        <span className="text-sm text-text-primary line-clamp-1">
                          {video.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedVideos(prev => prev.filter(id => id !== videoId))}
                          className="text-text-muted hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Video Selector Modal */}
          {showVideoSelector && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
              <div className="w-full max-w-3xl bg-bg-primary rounded-xl max-h-[80vh] overflow-y-auto">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-bg-primary">
                  <h3 className="font-heading font-bold text-text-primary">
                    Select Videos
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowVideoSelector(false)}
                    className="text-text-muted hover:text-text-primary"
                  >
                    ×
                  </button>
                </div>
                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                  {videos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => {
                        setSelectedVideos(prev =>
                          prev.includes(video.id)
                            ? prev.filter(id => id !== video.id)
                            : [...prev, video.id]
                        );
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        selectedVideos.includes(video.id)
                          ? 'bg-accent-primary/20 border border-accent-primary'
                          : 'bg-bg-secondary hover:bg-bg-tertiary border border-transparent'
                      }`}
                    >
                      <img
                        src={video.thumbnail || getYouTubeThumbnailUrl(video.youtube_id)}
                        alt={video.title}
                        className="w-24 h-14 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-text-primary">{video.title}</h4>
                        {video.category && (
                          <p className="text-sm text-text-muted">
                            {video.category.name}
                          </p>
                        )}
                      </div>
                      {selectedVideos.includes(video.id) && (
                        <svg className="w-5 h-5 text-accent-primary" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <div className="p-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setShowVideoSelector(false)}
                    className="w-full py-2 bg-accent-primary text-white rounded-lg"
                  >
                    Done ({selectedVideos.length} selected)
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-bg-tertiary hover:bg-border-subtle text-text-secondary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title}
              className="px-6 py-2 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {playlistId ? 'Update Playlist' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}