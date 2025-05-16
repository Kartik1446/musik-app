import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Song } from '../types';
import { loadYouTubeAPI } from '../lib/youtube';
import { addToPlayHistory } from '../lib/supabase-db';

interface PlayerState {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

interface PlayerContextType extends PlayerState {
  player: YT.Player | null;
  initPlayer: (elementId: string) => Promise<void>;
  playSong: (song: Song, playlist?: Song[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
}

const initialState: PlayerState = {
  currentSong: null,
  playlist: [],
  isPlaying: false,
  volume: 80,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  repeatMode: 'none',
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlayerState>(initialState);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [timeUpdateInterval, setTimeUpdateInterval] = useState<number | null>(null);
  const { currentUser } = useAuth();

  // Initialize the YouTube player
  const initPlayer = useCallback(async (elementId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // First check if YouTube API script is loaded
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
      }
      
      // Wait for YT object to be available
      const YT = await loadYouTubeAPI() as any;
      
      const newPlayer = new YT.Player(elementId, {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
          controls: 0,
          autoplay: 0,
          disablekb: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            setState(prev => ({ 
              ...prev, 
              isLoading: false,
              volume: event.target.getVolume(),
              isMuted: event.target.isMuted()
            }));
          },
          onStateChange: (event: any) => {
            // YouTube states: -1 (not started), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (event.data === YT.PlayerState.PLAYING) {
              setState(prev => ({ 
                ...prev, 
                isPlaying: true,
                duration: event.target.getDuration(),
              }));
            } else if (event.data === YT.PlayerState.PAUSED) {
              setState(prev => ({ ...prev, isPlaying: false }));
            } else if (event.data === YT.PlayerState.ENDED) {
              // Handle end of song
              if (state.repeatMode === 'one') {
                event.target.seekTo(0);
                event.target.playVideo();
              } else if (state.repeatMode === 'all' || state.playlist.length > 0) {
                playNext();
              } else {
                setState(prev => ({ ...prev, isPlaying: false }));
              }
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
          }
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.repeatMode]);

  // Play a song
  const playSong = useCallback((song: Song, playlist?: Song[]) => {
    if (!player || !song.videoId) return;
    
    setState(prev => ({
      ...prev,
      currentSong: song,
      playlist: playlist || [],
      isLoading: true,
    }));
    
    player.loadVideoById(song.videoId);
    
    // Add to play history
    if (currentUser) {
      addToPlayHistory(currentUser.id, song).catch(error => {
        console.error('Error adding to play history:', error);
      });
    }
  }, [player, currentUser]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!player || !state.currentSong) return;
    
    if (state.isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [player, state.isPlaying, state.currentSong]);

  // Play next song
  const playNext = useCallback(() => {
    if (!state.currentSong || state.playlist.length === 0) return;
    
    const currentIndex = state.playlist.findIndex(
      song => song.videoId === state.currentSong?.videoId
    );
    
    if (currentIndex === -1 || currentIndex === state.playlist.length - 1) {
      // End of playlist, play first song if repeat all
      if (state.repeatMode === 'all') {
        playSong(state.playlist[0], state.playlist);
      }
    } else {
      playSong(state.playlist[currentIndex + 1], state.playlist);
    }
  }, [state.currentSong, state.playlist, state.repeatMode, playSong]);

  // Play previous song
  const playPrevious = useCallback(() => {
    if (!state.currentSong || state.playlist.length === 0) return;
    
    // If current time is more than 3 seconds, restart the current song
    if (state.currentTime > 3) {
      player?.seekTo(0);
      player?.playVideo();
      return;
    }
    
    const currentIndex = state.playlist.findIndex(
      song => song.videoId === state.currentSong?.videoId
    );
    
    if (currentIndex === -1 || currentIndex === 0) {
      // Beginning of playlist, play last song if repeat all
      if (state.repeatMode === 'all') {
        playSong(state.playlist[state.playlist.length - 1], state.playlist);
      }
    } else {
      playSong(state.playlist[currentIndex - 1], state.playlist);
    }
  }, [state.currentSong, state.playlist, state.currentTime, state.repeatMode, player, playSong]);

  // Seek to a specific time
  const seekTo = useCallback((time: number) => {
    if (!player) return;
    player.seekTo(time);
  }, [player]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (!player) return;
    player.setVolume(volume);
    setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  }, [player]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!player) return;
    
    if (state.isMuted) {
      player.unMute();
      setState(prev => ({ 
        ...prev, 
        isMuted: false,
        volume: player.getVolume()
      }));
    } else {
      player.mute();
      setState(prev => ({ ...prev, isMuted: true }));
    }
  }, [player, state.isMuted]);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    setState(prev => ({
      ...prev,
      repeatMode: prev.repeatMode === 'none' 
        ? 'all' 
        : prev.repeatMode === 'all' 
          ? 'one' 
          : 'none'
    }));
  }, []);

  // Update current time
  useEffect(() => {
    if (player && state.isPlaying) {
      const interval = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          currentTime: player.getCurrentTime(),
        }));
      }, 1000);
      
      setTimeUpdateInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    } else if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval);
      setTimeUpdateInterval(null);
    }
  }, [player, state.isPlaying]);

  const value = {
    ...state,
    player,
    initPlayer,
    playSong,
    playNext,
    playPrevious,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};