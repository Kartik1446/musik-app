import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Volume2, VolumeX, Music } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

const MusicPlayer: React.FC = () => {
  const playerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    repeatMode,
    initPlayer,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
  } = usePlayer();
  
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  // Initialize player
  useEffect(() => {
    if (playerRef.current) {
      initPlayer('youtube-player').catch(console.error);
    }
  }, [initPlayer]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    seekTo(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Render repeat icon based on mode
  const renderRepeatIcon = () => {
    return (
      <button
        onClick={toggleRepeat}
        className={`focus:outline-none ${
          repeatMode !== 'none' ? 'text-secondary-500' : 'text-dark-400'
        }`}
        title={`Repeat ${repeatMode}`}
      >
        <Repeat size={18} />
        {repeatMode === 'one' && (
          <span className="absolute top-0 right-0 text-[8px] font-bold">1</span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full bg-dark-900 border-t border-dark-700 backdrop-blur-lg bg-opacity-95 px-4 py-3 md:py-4">
      <div className="max-w-7xl mx-auto">
        {/* Hidden Youtube player */}
        <div className="hidden">
          <div ref={playerRef} id="youtube-player"></div>
        </div>
        
        {/* Progress bar */}
        <div 
          ref={progressRef}
          className="w-full h-1 bg-dark-700 rounded-full cursor-pointer mb-3"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-secondary-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between">
          {/* Song info */}
          <div className="flex items-center flex-1 min-w-0">
            {currentSong ? (
              <>
                <img 
                  src={currentSong.thumbnail} 
                  alt={currentSong.title}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="ml-3 truncate">
                  <p className="font-medium truncate">{currentSong.title}</p>
                  <p className="text-sm text-dark-300 truncate">{currentSong.artist}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center text-dark-400">
                <Music size={24} className="mr-2" />
                <span>No track playing</span>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-4 mx-4">
            <button 
              onClick={playPrevious}
              className="text-dark-200 hover:text-white focus:outline-none"
              disabled={!currentSong}
            >
              <SkipBack size={22} />
            </button>
            
            <button 
              onClick={togglePlay}
              className="bg-secondary-600 hover:bg-secondary-700 text-white rounded-full w-10 h-10 flex items-center justify-center focus:outline-none"
              disabled={!currentSong}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
            </button>
            
            <button 
              onClick={playNext}
              className="text-dark-200 hover:text-white focus:outline-none"
              disabled={!currentSong}
            >
              <SkipForward size={22} />
            </button>
          </div>
          
          {/* Extra controls and time */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <div className="text-xs text-dark-300 hidden sm:block">
              <span>{formatTime(currentTime)}</span>
              <span> / </span>
              <span>{currentSong ? currentSong.duration : '0:00'}</span>
            </div>
            
            <div className="relative" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
              <button 
                onClick={toggleMute}
                className="text-dark-300 hover:text-white focus:outline-none"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-dark-800 p-2 rounded-md shadow-lg">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-2 appearance-none bg-dark-600 rounded-full"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${isMuted ? 0 : volume}%, #374151 ${isMuted ? 0 : volume}%, #374151 100%)`,
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="relative">
              {renderRepeatIcon()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;