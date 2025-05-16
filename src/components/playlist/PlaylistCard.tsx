import React from 'react';
import { Link } from 'react-router-dom';
import { Playlist } from '../../types';
import { Music } from 'lucide-react';

interface PlaylistCardProps {
  playlist: Playlist;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  // Try to get thumbnail from the first song in the playlist
  const thumbnail = playlist.songs && playlist.songs.length > 0
    ? playlist.songs[0].thumbnail
    : null;
  
  return (
    <Link to={`/playlist/${playlist.id}`} className="card group">
      <div className="relative aspect-square overflow-hidden bg-dark-700">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-dark-700 to-dark-800">
            <Music size={48} className="text-dark-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/80"></div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
        <p className="text-sm text-dark-400 mt-1">
          {playlist.songs?.length || 0} {playlist.songs?.length === 1 ? 'song' : 'songs'}
        </p>
      </div>
    </Link>
  );
};

export default PlaylistCard;