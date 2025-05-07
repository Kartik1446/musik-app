import React from 'react';
import { Play, Pause, Music, Clock, MoreHorizontal } from 'lucide-react';
import { Song } from '../../types';
import { usePlayer } from '../../contexts/PlayerContext';
import { formatDistanceToNow } from 'date-fns';
// Using string dates instead of Firebase Timestamp

interface SongItemProps {
  song: Song;
  playlist?: Song[];
  onRemove?: () => void;
  showTimestamp?: boolean;
  timestamp?: string;
}

const SongItem: React.FC<SongItemProps> = ({ 
  song, 
  playlist, 
  onRemove,
  showTimestamp = false,
  timestamp,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const isCurrentSong = currentSong?.videoId === song.videoId;
  
  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, playlist || [song]);
    }
  };
  
  const formattedTime = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : null;
  
  return (
    <div 
      onClick={handlePlay}
      className={`flex items-center px-4 py-3 hover:bg-dark-700 transition-colors group cursor-pointer ${
        isCurrentSong ? 'bg-dark-700 border-l-2 border-secondary-500 pl-[14px]' : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-12 h-12 flex-shrink-0">
        {song.thumbnail ? (
          <img 
            src={song.thumbnail} 
            alt={song.title}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-700 rounded">
            <Music size={20} className="text-dark-400" />
          </div>
        )}
        
        <button
          onClick={handlePlay}
          className={`absolute inset-0 flex items-center justify-center rounded ${
            isCurrentSong && isPlaying 
              ? 'bg-black/60' 
              : 'bg-black/40 opacity-0 group-hover:opacity-100'
          } transition-opacity`}
        >
          {isCurrentSong && isPlaying ? (
            <Pause size={20} className="text-white" />
          ) : (
            <Play size={20} className="text-white ml-1" />
          )}
        </button>
      </div>
      
      {/* Song info */}
      <div className="ml-3 min-w-0 flex-1">
        <p className={`font-medium truncate ${isCurrentSong ? 'text-secondary-400' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-sm text-dark-400 truncate">{song.artist}</p>
      </div>
      
      {/* Duration or timestamp */}
      <div className="ml-4 flex items-center text-dark-400">
        {showTimestamp && formattedTime ? (
          <div className="flex items-center text-sm">
            <Clock size={14} className="mr-1" />
            <span>{formattedTime}</span>
          </div>
        ) : (
          <span className="text-sm">{song.duration}</span>
        )}
      </div>
      
      {/* Actions */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-4 text-dark-400 hover:text-white p-1.5 rounded-full hover:bg-dark-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal size={18} />
        </button>
      )}
    </div>
  );
};

export default SongItem;