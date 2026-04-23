import { useState, useEffect } from 'react';
import { useAdminVideos, useAdminCategories, useAdminChannels } from '../../hooks/useVideos';
import { extractYouTubeId, getYouTubeThumbnailUrl, getYouTubeVideoInfo } from '../../lib/youtube';
import type { Video } from '../../types';

export function AdminVideosPage() {
  const { videos, loading, deleteVideo } = useAdminVideos();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary">
            Videos
          </h1>
          <p className="text-text-muted mt-1">
            {videos.length} video{videos.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Video
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <VideoForm
          videoId={editingId}
          onClose={() => {
            setIsAdding(false);
            setEditingId(null);
          }}
        />
      )}

      {/* Video List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-xl" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 text-text-muted mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
            No Videos Yet
          </h2>
          <p className="text-text-muted mb-6">
            Add your first video to get started
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2 bg-accent-primary text-white rounded-lg"
          >
            Add Video
          </button>
        </div>
      ) : (
        <div className="bg-bg-secondary rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left p-4 text-sm font-medium text-text-muted">Video</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted hidden md:table-cell">Category</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted hidden lg:table-cell">Featured</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted hidden lg:table-cell">Trending</th>
                <th className="text-right p-4 text-sm font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className="border-b border-border-subtle last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={video.thumbnail || getYouTubeThumbnailUrl(video.youtube_id)}
                        alt={video.title}
                        className="w-24 h-14 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium text-text-primary line-clamp-1">
                          {video.title}
                        </h3>
                        <p className="text-sm text-text-muted line-clamp-1">
                          {video.youtube_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {video.category ? (
                      <span
                        className="inline-block px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: video.category.color + '30', color: video.category.color }}
                      >
                        {video.category.name}
                      </span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    {video.is_featured ? (
                      <span className="text-accent-gold">✓</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    {video.is_trending ? (
                      <span className="text-accent-primary">✓</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingId(video.id)}
                        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2l4.5-4.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this video?')) {
                            deleteVideo(video.id);
                          }
                        }}
                        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface VideoFormProps {
  videoId?: string | null;
  onClose: () => void;
}

function VideoForm({ videoId, onClose }: VideoFormProps) {
  const { videos, addVideo, updateVideo } = useAdminVideos();
  const { categories } = useAdminCategories();
  const { channels } = useAdminChannels();
  
  const existing = videoId ? videos.find(v => v.id === videoId) : null;
  
  const [youtubeUrl, setYoutubeUrl] = useState(existing?.youtube_url || '');
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [categoryId, setCategoryId] = useState(existing?.category_id || '');
  const [channelId, setChannelId] = useState(existing?.channel_id || '');
  const [tags, setTags] = useState(existing?.tags?.join(', ') || '');
  const [duration, setDuration] = useState(existing?.duration || '');
  const [isFeatured, setIsFeatured] = useState(existing?.is_featured || false);
  const [isTrending, setIsTrending] = useState(existing?.is_trending || false);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  
  const youtubeId = extractYouTubeId(youtubeUrl);
  const thumbnail = youtubeId ? getYouTubeThumbnailUrl(youtubeId) : '';

  // Auto-fetch video info when URL changes
  useEffect(() => {
    if (youtubeUrl && !existing && !title) {
      setFetchingInfo(true);
      getYouTubeVideoInfo(youtubeUrl).then(info => {
        if (info?.title) {
          setTitle(info.title);
          setDescription(info.description || '');
        }
        setFetchingInfo(false);
      });
    }
  }, [youtubeUrl]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeId || !title) return;
    
    const videoData = {
      title,
      description: description || null,
      youtube_url: youtubeUrl,
      youtube_id: youtubeId,
      thumbnail,
      category_id: categoryId || null,
      channel_id: channelId || null,
      creator_id: channelId || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      duration: duration || null,
      is_featured: isFeatured,
      is_trending: isTrending,
    };
    
    if (videoId) {
      await updateVideo(videoId, videoData);
    } else {
      await addVideo(videoData as Omit<Video, 'id' | 'created_at' | 'updated_at' | 'view_count'>);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-bg-secondary rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-xl font-heading font-bold text-text-primary">
            {videoId ? 'Edit Video' : 'Add Video'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* YouTube URL */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              YouTube URL *
            </label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              required
            />
            {fetchingInfo && <p className="text-sm text-accent-primary mt-1">Fetching video info...</p>}
            {thumbnail && !fetchingInfo && (
              <div className="mt-2">
                <img src={thumbnail} alt="Preview" className="w-48 rounded" />
              </div>
            )}
          </div>
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              required
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video description"
              rows={3}
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
            />
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Channel */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Channel
            </label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="">Select channel</option>
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="action, sci-fi, opening"
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>
          
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 3:45"
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>
          
          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border-subtle bg-bg-tertiary text-accent-primary focus:ring-accent-primary"
              />
              <span className="text-text-primary">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 rounded border-border-subtle bg-bg-tertiary text-accent-primary focus:ring-accent-primary"
              />
              <span className="text-text-primary">Trending</span>
            </label>
          </div>
          
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
              disabled={!youtubeId || !title}
              className="px-6 py-2 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {videoId ? 'Update Video' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}