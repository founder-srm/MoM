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
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          created_at?: string | null
        }
      }
      meetings: {
        Row: {
          meeting_id: string
          user_id: string
          title: string
          date: string | null
          participants: string | null
          description: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          meeting_id?: string
          user_id: string
          title: string
          date?: string | null
          participants?: string | null
          description?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          meeting_id?: string
          user_id?: string
          title?: string
          date?: string | null
          participants?: string | null
          description?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      audio_files: {
        Row: {
          file_id: string
          meeting_id: string
          storage_path: string
          storage_url: string | null
          file_name: string | null
          file_size: number | null
          mime_type: string | null
          created_at: string | null
        }
        Insert: {
          file_id?: string
          meeting_id: string
          storage_path: string
          storage_url?: string | null
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string | null
        }
        Update: {
          file_id?: string
          meeting_id?: string
          storage_path?: string
          storage_url?: string | null
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string | null
        }
      }
      transcripts: {
        Row: {
          transcript_id: string
          meeting_id: string
          transcript_text: string
          edited_text: string | null
          language: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          transcript_id?: string
          meeting_id: string
          transcript_text: string
          edited_text?: string | null
          language?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          transcript_id?: string
          meeting_id?: string
          transcript_text?: string
          edited_text?: string | null
          language?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      summaries: {
        Row: {
          summary_id: string
          meeting_id: string
          summary_text: string
          created_at: string | null
        }
        Insert: {
          summary_id?: string
          meeting_id: string
          summary_text: string
          created_at?: string | null
        }
        Update: {
          summary_id?: string
          meeting_id?: string
          summary_text?: string
          created_at?: string | null
        }
      }
      moms: {
        Row: {
          mom_id: string
          meeting_id: string
          mom_content: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          mom_id?: string
          meeting_id: string
          mom_content: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          mom_id?: string
          meeting_id?: string
          mom_content?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
