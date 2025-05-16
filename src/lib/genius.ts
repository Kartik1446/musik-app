import axios from 'axios';

const API_KEY = import.meta.env.VITE_GENIUS_API_KEY;
const BASE_URL = 'https://api.genius.com';

// Due to CORS issues, we'll need to proxy this through a backend service
// For MVP, we can show a placeholder for the actual implementation
export const searchSong = async (title: string, artist: string) => {
  try {
    // This would typically be a direct API call
    // const response = await axios.get(`${BASE_URL}/search`, {
    //   params: {
    //     q: `${artist} ${title}`,
    //     access_token: API_KEY,
    //   },
    // });
    
    // For MVP, we'll return a mock response
    // In a real implementation, you would make this call through a backend proxy
    return {
      found: true,
      songId: 'mock-song-id',
      title,
      artist,
    };
  } catch (error) {
    console.error('Error searching Genius:', error);
    return {
      found: false,
      error: 'Failed to search for lyrics',
    };
  }
};

export const getLyrics = async (songId: string) => {
  try {
    // In a real implementation, this would fetch the actual lyrics
    // For MVP, we'll return placeholder lyrics
    
    // Mock lyrics for demonstration
    return {
      lyrics: "This is a placeholder for song lyrics.\n\nIn a production environment, you would fetch real lyrics from the Genius API through a backend proxy to avoid CORS issues.\n\nThe lyrics would be properly formatted with line breaks and verses.",
    };
  } catch (error) {
    console.error('Error getting lyrics:', error);
    return {
      error: 'Failed to get lyrics',
    };
  }
};

// A helper function that combines the search and lyrics fetch
export const getSongLyrics = async (title: string, artist: string) => {
  try {
    const searchResult = await searchSong(title, artist);
    
    if (searchResult.found && searchResult.songId) {
      const lyricsResult = await getLyrics(searchResult.songId);
      return {
        found: true,
        title: searchResult.title,
        artist: searchResult.artist,
        lyrics: lyricsResult.lyrics,
      };
    }
    
    return {
      found: false,
      error: 'No lyrics found for this song',
    };
  } catch (error) {
    console.error('Error getting song lyrics:', error);
    return {
      found: false,
      error: 'Failed to get lyrics',
    };
  }
};