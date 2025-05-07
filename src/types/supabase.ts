export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          display_name: string
          email: string
          photo_url: string
        }
        Insert: {
          id: string
          created_at?: string
          display_name: string
          email: string
          photo_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          display_name?: string
          email?: string
          photo_url?: string
        }
      }
      playlists: {
        Row: {
          id: string
          created_at: string
          name: string
          user_id: string
          songs: Json
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          user_id: string
          songs?: Json
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          user_id?: string
          songs?: Json
        }
      }
      play_history: {
        Row: {
          id: string
          played_at: string
          user_id: string
          video_id: string
          title: string
          artist: string
          thumbnail: string
          duration: string
          view_count?: number
        }
        Insert: {
          id?: string
          played_at?: string
          user_id: string
          video_id: string
          title: string
          artist: string
          thumbnail: string
          duration: string
          view_count?: number
        }
        Update: {
          id?: string
          played_at?: string
          user_id?: string
          video_id?: string
          title?: string
          artist?: string
          thumbnail?: string
          duration?: string
          view_count?: number
        }
      }
    }
  }
}