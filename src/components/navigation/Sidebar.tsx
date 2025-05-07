import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Clock, ListMusic, Plus, User, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPlaylists, createPlaylist, onPlaylistsChanged } from '../../lib/supabase-db';
import { Playlist } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Sidebar: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const { currentUser } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    // Get initial playlists
    const fetchPlaylists = async () => {
      try {
        const userPlaylists = await getPlaylists(currentUser.id);
        setPlaylists(userPlaylists);
      } catch (error) {
        console.error('Error fetching playlists:', error);
        toast.error('Failed to load playlists');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
    // Set up real-time listener
    const unsubscribe = onPlaylistsChanged(currentUser.id, (updatedPlaylists) => {
      setPlaylists(updatedPlaylists);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);
  
  const handleCreatePlaylist = async () => {
    if (!currentUser || !newPlaylistName.trim()) return;
    try {
      await createPlaylist(currentUser.id, { name: newPlaylistName.trim() });
      setNewPlaylistName('');
      setIsCreating(false);
      toast.success('Playlist created!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
    }
  };
  
  return (
    <div className="h-full bg-dark-900 border-r border-dark-700 px-4 py-5 flex flex-col">
      {/* App logo and title */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center">
          <ListMusic size={18} />
        </div>
        <h1 className="text-xl font-bold">Musik</h1>
      </div>
      
      {/* Main navigation */}
      <nav className="mb-8">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/" 
              className={`nav-link flex items-center space-x-3 ${location.pathname === '/' ? 'nav-link-active' : ''}`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/search" 
              className={`nav-link flex items-center space-x-3 ${location.pathname === '/search' ? 'nav-link-active' : ''}`}
            >
              <Search size={18} />
              <span>Search</span>
            </Link>
          </li>
          {currentUser && (
            <>
              <li>
                <Link 
                  to="/history" 
                  className={`nav-link flex items-center space-x-3 ${location.pathname === '/history' ? 'nav-link-active' : ''}`}
                >
                  <Clock size={18} />
                  <span>History</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className={`nav-link flex items-center space-x-3 ${location.pathname === '/profile' ? 'nav-link-active' : ''}`}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      
      {/* Playlist section - only shown when logged in */}
      {currentUser ? (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase text-dark-400">Your Playlists</h2>
            <button 
              onClick={() => setIsCreating(true)}
              className="text-dark-400 hover:text-white transition-colors"
              title="Create Playlist"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {/* Create playlist form */}
          {isCreating && (
            <div className="mb-4">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full text-sm rounded-md bg-dark-700 border-dark-600 mb-2"
                autoFocus
              />
              <div className="flex space-x-2 text-sm">
                <button 
                  onClick={handleCreatePlaylist}
                  className="btn-primary px-3 py-1"
                  disabled={!newPlaylistName.trim()}
                >
                  Create
                </button>
                <button 
                  onClick={() => {
                    setIsCreating(false);
                    setNewPlaylistName('');
                  }}
                  className="btn-secondary px-3 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Playlists list */}
          {loading ? (
            <LoadingSpinner size="sm" className="my-4" />
          ) : playlists.length === 0 ? (
            <p className="text-sm text-dark-400">No playlists yet</p>
          ) : (
            <ul className="space-y-1">
              {playlists.map((playlist) => (
                <li key={playlist.id}>
                  <Link
                    to={`/playlist/${playlist.id}`}
                    className={`text-sm block py-2 px-3 rounded-md truncate hover:bg-dark-800 ${
                      location.pathname === `/playlist/${playlist.id}` ? 'bg-dark-800 text-white' : 'text-dark-300'
                    }`}
                    title={playlist.name}
                  >
                    {playlist.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-dark-400 mb-4">Sign in to create and manage playlists</p>
          <Link 
            to="/login"
            className="btn-primary flex items-center space-x-2 px-4 py-2"
          >
            <LogIn size={18} />
            <span>Sign In</span>
          </Link>
        </div>
      )}
      
      {/* User section */}
      {currentUser && (
        <div className="pt-4 border-t border-dark-700 mt-4">
          <div className="flex items-center space-x-3">
            <img 
              src={currentUser.user_metadata?.avatar_url || 'https://via.placeholder.com/32'} 
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div className="truncate">
              <p className="text-sm font-medium truncate">{currentUser.user_metadata?.full_name}</p>
              <p className="text-xs text-dark-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar