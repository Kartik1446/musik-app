import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, MusicIcon, Loader2 } from 'lucide-react';
import { searchSongs } from '../lib/youtube';
import { Song } from '../types';
import SongItem from '../components/song/SongItem';
import { usePlayer } from '../contexts/PlayerContext';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const searchResults = await searchSongs(debouncedQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to search for music');
      } finally {
        setLoading(false);
      }
    };
    
    handleSearch();
  }, [debouncedQuery]);
  
  // Handle suggestions
  useEffect(() => {
    if (query.trim()) {
      // This would typically come from an API, but for demo we'll use static suggestions
      const mockSuggestions = [
        `${query} song`,
        `${query} artist`,
        `${query} album`,
        `${query} remix`,
        `${query} live`
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };
  
  return (
    <div className="py-6 px-4 md:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={20} className="text-dark-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search for songs, artists..."
            className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-dark-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      
      <section>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={40} className="text-secondary-500 animate-spin mb-4" />
            <p className="text-dark-400">Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="bg-dark-800/50 rounded-lg overflow-hidden border border-dark-700">
              {results.map((song) => (
                <SongItem
                  key={song.videoId}
                  song={song}
                  playlist={results}
                />
              ))}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-12 bg-dark-800/50 rounded-lg border border-dark-700">
            <MusicIcon size={48} className="mx-auto text-dark-500 mb-4" />
            <p className="text-xl font-semibold mb-2">No results found</p>
            <p className="text-dark-400 mb-4">Try different keywords or check your spelling</p>
          </div>
        ) : (
          <div className="text-center py-16 bg-dark-800/50 rounded-lg border border-dark-700">
            <SearchIcon size={48} className="mx-auto text-dark-500 mb-4" />
            <p className="text-xl font-semibold mb-2">Discover new music</p>
            <p className="text-dark-400">
              Search for songs, artists or albums to start listening
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;