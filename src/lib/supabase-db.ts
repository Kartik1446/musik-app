import { supabase } from './supabase';
import { Song, Playlist, User, PlayHistory } from '../types';

// User operations
export const createUserProfile = async (uid: string, userData: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: uid,
      display_name: userData.displayName || 'User',
      email: userData.email || '',
      photo_url: userData.photoURL || '',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserProfile = async (uid: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .single();

  if (error) return null;

  return {
    id: data.id,
    displayName: data.display_name,
    email: data.email,
    photoURL: data.photo_url,
    createdAt: data.created_at,
  } as User;
};

// Playlist operations
export const createPlaylist = async (uid: string, playlistData: Partial<Playlist>) => {
  const { data, error } = await supabase
    .from('playlists')
    .insert({
      name: playlistData.name,
      user_id: uid,
      songs: [],
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPlaylists = async (uid: string) => {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    createdAt: playlist.created_at,
    songs: playlist.songs as Song[] || [],
  })) as Playlist[];
};

export const getPlaylistById = async (uid: string, playlistId: string) => {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .eq('user_id', uid)
    .single();

  if (error) return null;

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    songs: data.songs as Song[] || [],
  } as Playlist;
};

export const updatePlaylist = async (uid: string, playlistId: string, data: Partial<Playlist>) => {
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.songs) updateData.songs = data.songs;

  const { error } = await supabase
    .from('playlists')
    .update(updateData)
    .eq('id', playlistId)
    .eq('user_id', uid);

  if (error) throw error;
};

export const deletePlaylist = async (uid: string, playlistId: string) => {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId)
    .eq('user_id', uid);

  if (error) throw error;
};

export const addSongToPlaylist = async (uid: string, playlistId: string, song: Song) => {
  // First get the current playlist
  const playlist = await getPlaylistById(uid, playlistId);
  if (!playlist) return;

  // Add the song to the songs array
  const updatedSongs = [...(playlist.songs || []), song];
  
  // Update the playlist
  return updatePlaylist(uid, playlistId, { songs: updatedSongs });
};

export const removeSongFromPlaylist = async (uid: string, playlistId: string, songIndex: number) => {
  // First get the current playlist
  const playlist = await getPlaylistById(uid, playlistId);
  if (!playlist) return;

  // Remove the song from the songs array
  const updatedSongs = [...(playlist.songs || [])];
  updatedSongs.splice(songIndex, 1);
  
  // Update the playlist
  return updatePlaylist(uid, playlistId, { songs: updatedSongs });
};

export const reorderPlaylistSongs = async (uid: string, playlistId: string, songs: Song[]) => {
  return updatePlaylist(uid, playlistId, { songs });
};

// Play history operations
export const addToPlayHistory = async (uid: string, song: Song) => {
  const { data, error } = await supabase
    .from('play_history')
    .insert({
      user_id: uid,
      video_id: song.videoId,
      title: song.title,
      artist: song.artist,
      thumbnail: song.thumbnail,
      duration: song.duration,
      view_count: song.viewCount,
      played_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPlayHistory = async (uid: string, limitCount = 20) => {
  const { data, error } = await supabase
    .from('play_history')
    .select('*')
    .eq('user_id', uid)
    .order('played_at', { ascending: false })
    .limit(limitCount);

  if (error) throw error;

  return data.map(item => ({
    id: item.id,
    videoId: item.video_id,
    title: item.title,
    artist: item.artist,
    thumbnail: item.thumbnail,
    duration: item.duration,
    viewCount: item.view_count,
    playedAt: item.played_at,
  })) as PlayHistory[];
};

// Realtime listeners
export const onPlaylistsChanged = (uid: string, callback: (playlists: Playlist[]) => void) => {
  const subscription = supabase
    .channel('playlists-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'playlists',
        filter: `user_id=eq.${uid}`,
      },
      async () => {
        // Fetch the updated playlists
        const playlists = await getPlaylists(uid);
        callback(playlists);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

export const onPlaylistChanged = (uid: string, playlistId: string, callback: (playlist: Playlist) => void) => {
  const subscription = supabase
    .channel(`playlist-${playlistId}-channel`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'playlists',
        filter: `id=eq.${playlistId}`,
      },
      async () => {
        // Fetch the updated playlist
        const playlist = await getPlaylistById(uid, playlistId);
        if (playlist) callback(playlist);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};