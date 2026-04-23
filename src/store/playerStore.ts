import { create } from 'zustand';
import type { Video, Playlist } from '../types';

interface PlayerState {
  currentVideo: Video | null;
  queue: Video[];
  queueIndex: number;
  isPlaying: boolean;
  autoplay: boolean;
  playlist: Playlist | null;
  
  setCurrentVideo: (video: Video | null) => void;
  setQueue: (videos: Video[]) => void;
  setQueueIndex: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setIsPlaying: (playing: boolean) => void;
  setAutoplay: (autoplay: boolean) => void;
  setPlaylist: (playlist: Playlist | null) => void;
  playFromQueue: (index: number) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentVideo: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  autoplay: true,
  playlist: null,

  setCurrentVideo: (video) => set({ currentVideo: video }),
  
  setQueue: (videos) => set({ queue: videos, queueIndex: 0 }),
  
  setQueueIndex: (index) => set({ queueIndex: index }),
  
  playNext: () => {
    const { queue, queueIndex, autoplay } = get();
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      set({ queueIndex: nextIndex, currentVideo: queue[nextIndex], isPlaying: autoplay });
    }
  },
  
  playPrevious: () => {
    const { queue, queueIndex } = get();
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      set({ queueIndex: prevIndex, currentVideo: queue[prevIndex], isPlaying: true });
    }
  },
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setAutoplay: (autoplay) => set({ autoplay }),
  setPlaylist: (playlist) => set({ playlist }),
  
  playFromQueue: (index) => {
    const { queue } = get();
    if (index >= 0 && index < queue.length) {
      set({ queueIndex: index, currentVideo: queue[index], isPlaying: true });
    }
  },
  
  clearQueue: () => set({ queue: [], queueIndex: 0, currentVideo: null, isPlaying: false, playlist: null }),
}));