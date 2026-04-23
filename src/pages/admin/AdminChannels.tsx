import { useState, useEffect } from 'react';
import { useAdminChannels } from '../../hooks/useVideos';
import { getYouTubeChannelInfo } from '../../lib/youtube';
import type { Channel } from '../../types';

export function AdminChannelsPage() {
  const { channels, loading, deleteChannel } = useAdminChannels();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary">
            Channels
          </h1>
          <p className="text-text-muted mt-1">
            {channels.length} channel{channels.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Channel
        </button>
      </div>

      {(isAdding || editingId) && (
        <ChannelForm
          channelId={editingId}
          onClose={() => {
            setIsAdding(false);
            setEditingId(null);
          }}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-bg-secondary rounded-xl skeleton" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 text-text-muted mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
            No Channels Yet
          </h2>
          <p className="text-text-muted mb-6">
            Add your first YouTube channel to get started
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2 bg-accent-primary text-white rounded-lg"
          >
            Add Channel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-bg-secondary rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={channel.avatar || `https://ui-avatars.com/api/?name=${channel.name}&background=random`}
                  alt={channel.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary truncate">
                    {channel.name}
                  </h3>
                  {channel.subscriber_count && (
                    <p className="text-sm text-text-muted">{channel.subscriber_count}</p>
                  )}
                </div>
              </div>
              {channel.youtube_channel_url && (
                <a
                  href={channel.youtube_channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent-primary hover:underline block truncate"
                >
                  YouTube Channel
                </a>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditingId(channel.id)}
                  className="flex-1 px-3 py-1.5 bg-bg-tertiary hover:bg-border-subtle text-text-secondary rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this channel?')) {
                      deleteChannel(channel.id);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ChannelFormProps {
  channelId?: string | null;
  onClose: () => void;
}

function ChannelForm({ channelId, onClose }: ChannelFormProps) {
  const { channels, addChannel, updateChannel } = useAdminChannels();
  const existing = channelId ? channels.find(c => c.id === channelId) : null;

  const [name, setName] = useState(existing?.name || '');
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState(existing?.youtube_channel_url || '');
  const [avatar, setAvatar] = useState(existing?.avatar || '');
  const [bio, setBio] = useState(existing?.bio || '');
  const [subscriberCount, setSubscriberCount] = useState(existing?.subscriber_count || '');
  const [isFeatured, setIsFeatured] = useState(existing?.is_featured || false);
  const [fetchingInfo, setFetchingInfo] = useState(false);

  // Auto-fetch channel info when URL changes
  useEffect(() => {
    if (youtubeChannelUrl && !existing && !name) {
      setFetchingInfo(true);
      getYouTubeChannelInfo(youtubeChannelUrl).then(info => {
        if (info?.name) {
          setName(info.name);
          if (info.avatar_url) setAvatar(info.avatar_url);
          if (info.description) setBio(info.description);
        }
        setFetchingInfo(false);
      });
    }
  }, [youtubeChannelUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const channelData = {
      name,
      youtube_channel_url: youtubeChannelUrl || null,
      avatar: avatar || null,
      bio: bio || null,
      subscriber_count: subscriberCount || null,
      is_featured: isFeatured,
    };

    if (channelId) {
      await updateChannel(channelId, channelData);
    } else {
      await addChannel(channelData as Omit<Channel, 'id' | 'created_at' | 'updated_at'>);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-bg-secondary rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-xl font-heading font-bold text-text-primary">
            {channelId ? 'Edit Channel' : 'Add Channel'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Channel Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., MovieClips"
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">YouTube Channel URL</label>
            <input
              type="url"
              value={youtubeChannelUrl}
              onChange={(e) => setYoutubeChannelUrl(e.target.value)}
              placeholder="https://youtube.com/@channel"
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary"
            />
            {fetchingInfo && <p className="text-sm text-accent-primary mt-1">Fetching channel info...</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Avatar URL</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Subscriber Count</label>
            <input
              type="text"
              value={subscriberCount}
              onChange={(e) => setSubscriberCount(e.target.value)}
              placeholder="e.g., 1M subscribers"
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Channel description"
              rows={3}
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary resize-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-text-primary">Featured</span>
          </label>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-bg-tertiary rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={!name} className="flex-1 py-2 bg-accent-primary text-white rounded-lg disabled:opacity-50">
              {channelId ? 'Update' : 'Add Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}