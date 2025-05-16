import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Play, Pause, Edit2, Save, Trash2, ArrowLeft } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../contexts/AuthContext';
import { getPlaylistById, updatePlaylist, deletePlaylist, removeSongFromPlaylist, reorderPlaylistSongs, onPlaylistChanged } from '../lib/supabase-db';
import { Playlist, Song } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import SongItem from '../components/song/SongItem';
import toast from 'react-hot-toast';

interface DraggableSongItemProps {
  song: Song;
  index: number;
  playlist: Song[];
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onRemove: () => void;
}

const DraggableSongItem: React.FC<DraggableSongItemProps> = ({ 
  song, 
  index, 
  playlist, 
  moveItem,
  onRemove,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const isCurrentSong = currentSong?.videoId === song.videoId;
  
  const [{ isDragging }, drag] = useDrag({
    type: 'SONG',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: 'SONG',
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);
      
      // Update the index for the dragged item directly to avoid flickering
      item.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, playlist);
    }
  };
  
  return (
    <div 
      ref={ref} 
      className={`flex items-center px-4 py-3 hover:bg-dark-700 transition-colors ${
        isDragging ? 'opacity-50 bg-dark-700' : ''
      } ${isCurrentSong ? 'bg-dark-700 border-l-2 border-secondary-500 pl-[14px]' : ''}`}
      style={{ cursor: 'move' }}
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
              : 'bg-black/40 opacity-0 hover:opacity-100'
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
      
      {/* Duration */}
      <div className="ml-4">
        <span className="text-sm text-dark-400">{song.duration}</span>
      </div>
      
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="ml-4 text-dark-400 hover:text-error-500 p-1.5 rounded-full hover:bg-dark-600 opacity-0 hover:opacity-100 transition-opacity"
        title="Remove from playlist"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentSong, playSong, isPlaying, togglePlay } = usePlayer();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    if (!currentUser || !id) return;
    
    const unsubscribe = onPlaylistChanged(currentUser.id, id, (updatedPlaylist) => {
      setPlaylist(updatedPlaylist);
      setSongs(updatedPlaylist.songs || []);
      setEditedName(updatedPlaylist.name);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser, id]);
  
  const handlePlayAll = () => {
    if (!playlist || songs.length === 0) return;
    
    playSong(songs[0], songs);
  };
  
  const handleRename = async () => {
    if (!currentUser || !id || !editedName.trim() || editedName === playlist?.name) {
      setIsEditing(false);
      return;
    }
    
    try {
      await updatePlaylist(currentUser.id, id, { name: editedName });
      setIsEditing(false);
      toast.success('Playlist renamed');
    } catch (error) {
      console.error('Error renaming playlist:', error);
      toast.error('Failed to rename playlist');
    }
  };
  
  const handleDeletePlaylist = async () => {
    if (!currentUser || !id) return;
    
    try {
      await deletePlaylist(currentUser.id, id);
      toast.success('Playlist deleted');
      navigate('/');
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };
  
  const handleRemoveSong = async (index: number) => {
    if (!currentUser || !id) return;
    
    try {
      await removeSongFromPlaylist(currentUser.id, id, index);
      toast.success('Song removed from playlist');
    } catch (error) {
      console.error('Error removing song:', error);
      toast.error('Failed to remove song');
    }
  };
  
  const moveSong = async (dragIndex: number, hoverIndex: number) => {
    const updatedSongs = [...songs];
    const [removed] = updatedSongs.splice(dragIndex, 1);
    updatedSongs.splice(hoverIndex, 0, removed);
    
    setSongs(updatedSongs);
    
    if (currentUser && id) {
      try {
        await reorderPlaylistSongs(currentUser.id, id, updatedSongs);
      } catch (error) {
        console.error('Error reordering songs:', error);
        // Revert if error occurs
        setSongs(playlist?.songs || []);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!playlist) {
    return (
      <div className="py-6 px-4 md:px-8 text-center">
        <p className="text-xl text-dark-400 mb-4">Playlist not found</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary inline-flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="py-6 px-4 md:px-8">
      {/* Playlist header */}
      <header className="mb-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-dark-400 hover:text-white mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-dark-800 rounded-lg overflow-hidden flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            {songs.length > 0 && songs[0].thumbnail ? (
              <img 
                src={songs[0].thumbnail} 
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
                <Music size={64} className="text-dark-500" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-dark-400 uppercase font-semibold mb-1">Playlist</p>
            
            {isEditing ? (
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-2xl md:text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-secondary-500 w-full max-w-md"
                  autoFocus
                />
                <button
                  onClick={handleRename}
                  className="ml-2 p-2 bg-secondary-600 hover:bg-secondary-700 rounded-md"
                  title="Save"
                >
                  <Save size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center mb-2">
                <h1 className="text-2xl md:text-3xl font-bold mr-2">{playlist.name}</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded-md"
                  title="Rename playlist"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
            
            <p className="text-dark-400 mb-4">
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePlayAll}
                disabled={songs.length === 0}
                className={`btn-primary px-5 py-2.5 flex items-center ${
                  songs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Play size={20} className="mr-2" />
                Play All
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-secondary p-2.5"
                title="Delete playlist"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Songs list */}
      <section>
        {songs.length === 0 ? (
          <div className="text-center py-12 bg-dark-800/50 rounded-lg border border-dark-700">
            <Music size={48} className="mx-auto text-dark-500 mb-4" />
            <p className="text-xl font-semibold mb-2">No songs in this playlist</p>
            <p className="text-dark-400 mb-4">Search for music to add to this playlist</p>
            <button
              onClick={() => navigate('/search')}
              className="btn-primary"
            >
              Search Music
            </button>
          </div>
        ) : (
          <div className="bg-dark-800/50 rounded-lg overflow-hidden border border-dark-700">
            {songs.map((song, index) => (
              <DraggableSongItem
                key={`${song.videoId}-${index}`}
                song={song}
                index={index}
                playlist={songs}
                moveItem={moveSong}
                onRemove={() => handleRemoveSong(index)}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80">
          <div className="bg-dark-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Delete Playlist?</h2>
            <p className="text-dark-300 mb-6">
              Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeletePlaylist}
                className="btn-danger flex-1"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;