import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListMusic, Clock, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPlaylists, getPlayHistory } from '../lib/supabase-db';
import { Playlist, PlayHistory } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import PlaylistCard from '../components/playlist/PlaylistCard';
import SongItem from '../components/song/SongItem';
import MusicVisualizer from '../components/ui/MusicVisualizer';
import { searchSongs } from '../lib/youtube';

const HomePage: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<PlayHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingSongs, setTrendingSongs] = useState([]);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trending music
        const trending = await searchSongs('trending music', 10);
        setTrendingSongs(trending);
        // If user is logged in, fetch their data
        if (currentUser) {
          const [userPlaylists, history] = await Promise.all([
            getPlaylists(currentUser.id),
            getPlayHistory(currentUser.id, 10),
          ]);
          setPlaylists(userPlaylists);
          setRecentlyPlayed(history);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };
    fetchData();
  }, [currentUser]);
  
  return (
    <div className="py-6 px-4 md:px-8">
      <header className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/70 to-dark-900/20 rounded-xl z-0"></div>
        <div className="relative z-10 p-6 md:p-8 rounded-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to Musik</h1>
          <p className="text-dark-300">{currentUser?.user_metadata?.full_name || 'Discover your favorite music'}</p>
          <MusicVisualizer className="mt-6" />
        </div>
      </header>
      
      {/* Trending Music */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ListMusic size={20} className="mr-2 text-secondary-400" />
          Trending Music
        </h2>
        
        <div className="bg-dark-800/50 rounded-lg overflow-hidden border border-dark-700">
          {trendingSongs.map((song) => (
            <SongItem key={song.videoId} song={song} />
          ))}
        </div>
      </section>
      
      {/* Recently played - only shown when logged in */}
      {currentUser && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Clock size={20} className="mr-2 text-secondary-400" />
              Recently Played
            </h2>
            <Link to="/history" className="text-sm text-secondary-400 hover:text-secondary-300">
              View All
            </Link>
          </div>
          
          {recentlyPlayed.length === 0 ? (
            <div className="text-center py-8 bg-dark-800/50 rounded-lg border border-dark-700">
              <p className="text-dark-400">No recently played tracks</p>
              <Link to="/search" className="btn-primary mt-4 inline-block">
                Discover Music
              </Link>
            </div>
          ) : (
            <div className="bg-dark-800/50 rounded-lg overflow-hidden border border-dark-700">
              {recentlyPlayed.slice(0, 5).map((song) => (
                <SongItem 
                  key={song.id} 
                  song={song} 
                  showTimestamp 
                  timestamp={song.playedAt} 
                />
              ))}
            </div>
          )}
        </section>
      )}
      
      {/* Your playlists - only shown when logged in */}
      {currentUser && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <ListMusic size={20} className="mr-2 text-secondary-400" />
              Your Playlists
            </h2>
            <Link to="/profile" className="text-sm text-secondary-400 hover:text-secondary-300">
              View All
            </Link>
          </div>
          
          {playlists.length === 0 ? (
            <div className="text-center py-8 bg-dark-800/50 rounded-lg border border-dark-700">
              <p className="text-dark-400">No playlists yet</p>
              <Link to="/profile" className="btn-primary mt-4 inline-flex items-center">
                <Plus size={16} className="mr-1" />
                Create Playlist
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default HomePage;