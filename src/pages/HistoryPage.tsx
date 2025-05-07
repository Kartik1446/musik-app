import React, { useState, useEffect } from 'react';
import { Clock, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPlayHistory } from '../lib/supabase-db';
import { PlayHistory } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import SongItem from '../components/song/SongItem';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<PlayHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchHistory = async () => {
      try {
        const playHistory = await getPlayHistory(currentUser.id, 50);
        setHistory(playHistory);
      } catch (error) {
        console.error('Error fetching play history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [currentUser]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="py-6 px-4 md:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <Clock size={30} className="mr-3 text-secondary-400" />
          Recently Played
        </h1>
        <p className="text-dark-400">
          Your listening history from the last 50 tracks
        </p>
      </header>
      
      <section>
        {history.length === 0 ? (
          <div className="text-center py-12 bg-dark-800/50 rounded-lg border border-dark-700">
            <Music size={48} className="mx-auto text-dark-500 mb-4" />
            <p className="text-xl font-semibold mb-2">No listening history yet</p>
            <p className="text-dark-400">Start playing some music to track your history</p>
          </div>
        ) : (
          <div className="bg-dark-800/50 rounded-lg overflow-hidden border border-dark-700">
            {history.map((song) => (
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
    </div>
  );
};

export default HistoryPage;