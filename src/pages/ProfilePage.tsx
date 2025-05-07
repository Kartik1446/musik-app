import React, { useState, useEffect } from 'react';
import { User, ListMusic, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPlaylists, createPlaylist } from '../lib/supabase-db';
import { Playlist } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import PlaylistCard from '../components/playlist/PlaylistCard';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) return;
    const fetchPlaylists = async () => {
      try {
        const userPlaylists = await getPlaylists(currentUser.id);
        setPlaylists(userPlaylists);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [currentUser]);
  
  const handleCreatePlaylist = async () => {
    if (!currentUser || !newPlaylistName.trim()) return;
    try {
      const playlistRef = await createPlaylist(currentUser.id, { name: newPlaylistName.trim() });
      setNewPlaylistName('');
      setIsCreating(false);
      toast.success('Playlist created!');
      // Navigate to the new playlist
      navigate(`/playlist/${playlistRef.id}`);
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!currentUser) {
    return null; // Should never happen as ProtectedRoute would redirect
  }
  
  return (
    <div className="py-6 px-4 md:px-8">
      {/* Profile header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-dark-800 mb-4 md:mb-0 md:mr-6">
            {currentUser.user_metadata?.avatar_url ? (
              <img 
                src={currentUser.user_metadata.avatar_url} 
                alt={currentUser.user_metadata.full_name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary-600">
                <User size={64} className="text-white" />
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-1">{currentUser.user_metadata?.full_name || 'User'}</h1>
            <p className="text-dark-400 mb-4">{currentUser.email}</p>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Playlists section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <ListMusic size={24} className="mr-2 text-secondary-400" />
            Your Playlists
          </h2>
          
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Create Playlist
          </button>
        </div>
        
        {/* Create playlist form */}
        {isCreating && (
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Create New Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="w-full rounded-md bg-dark-700 border-dark-600 mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button 
                onClick={handleCreatePlaylist}
                className="btn-primary"
                disabled={!newPlaylistName.trim()}
              >
                Create
              </button>
              <button 
                onClick={() => {
                  setIsCreating(false);
                  setNewPlaylistName('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Playlists grid */}
        {playlists.length === 0 ? (
          <div className="text-center py-12 bg-dark-800/50 rounded-lg border border-dark-700">
            <ListMusic size={48} className="mx-auto text-dark-500 mb-4" />
            <p className="text-xl font-semibold mb-2">No playlists yet</p>
            <p className="text-dark-400 mb-4">Create your first playlist to start organizing your music</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;