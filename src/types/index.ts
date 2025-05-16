// Types without Firebase dependencies

export interface Song {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  viewCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: string; // ISO string format
  songs: Song[];
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: string; // ISO string format
}

export interface PlayHistory extends Song {
  id: string;
  playedAt: string; // ISO string format
}

export interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  loadVideoById: (videoId: string) => void;
}