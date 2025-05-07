import axios from 'axios';
import { Song } from '../types';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchSongs = async (query: string, maxResults = 10) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults,
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        key: API_KEY,
      },
    });

    const videos = response.data.items;
    const videoIds = videos.map((video: any) => video.id.videoId).join(',');

    // Get video details for duration
    const detailsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds,
        key: API_KEY,
      },
    });

    // Map the videos with their details
    return videos.map((video: any, index: number) => {
      const videoDetails = detailsResponse.data.items[index];
      const title = video.snippet.title;
      // Extract artist from title or channel name as fallback
      let artist = video.snippet.channelTitle;
      
      // Try to extract artist from title (common format: "Artist - Title")
      const titleParts = title.split(' - ');
      if (titleParts.length > 1) {
        artist = titleParts[0].trim();
      }

      return {
        videoId: video.id.videoId,
        title: title,
        artist: artist,
        thumbnail: video.snippet.thumbnails.high.url,
        duration: formatDuration(videoDetails?.contentDetails?.duration || 'PT0M0S'),
        viewCount: videoDetails?.statistics?.viewCount || 0,
      } as Song;
    });
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw error;
  }
};

// Format ISO 8601 duration to readable format (e.g. PT1H2M3S -> 1:02:03)
const formatDuration = (isoDuration: string) => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return '0:00';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Get video embed URL
export const getEmbedUrl = (videoId: string) => {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
};

// Load YouTube iFrame API script
export const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    // If the API is already loaded, resolve immediately
    if (window.YT) {
      resolve(window.YT);
      return;
    }

    // Create the script element
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up the callback when the API is ready
    window.onYouTubeIframeAPIReady = () => {
      resolve(window.YT);
    };
  });
};