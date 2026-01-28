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
          id: number
          username: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          reputation: number
          language_code: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          reputation?: number
          language_code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          reputation?: number
          language_code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          type: 'TASK' | 'EVENT'
          title: string
          description: string
          price: number | null
          currency: 'USD' | 'KZT' | 'RUB' | 'EUR'
          event_date: string | null
          latitude: number
          longitude: number
          location: unknown
          status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          author_id: number
          executor_id: number | null
          telegram_topic_id: number | null
          telegram_chat_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'TASK' | 'EVENT'
          title: string
          description: string
          price?: number | null
          currency?: 'USD' | 'KZT' | 'RUB' | 'EUR'
          event_date?: string | null
          latitude: number
          longitude: number
          location?: unknown
          status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          author_id: number
          executor_id?: number | null
          telegram_topic_id?: number | null
          telegram_chat_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'TASK' | 'EVENT'
          title?: string
          description?: string
          price?: number | null
          currency?: 'USD' | 'KZT' | 'RUB' | 'EUR'
          event_date?: string | null
          latitude?: number
          longitude?: number
          location?: unknown
          status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          author_id?: number
          executor_id?: number | null
          telegram_topic_id?: number | null
          telegram_chat_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      responses: {
        Row: {
          id: string
          item_id: string
          user_id: number
          message: string
          status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: number
          message: string
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: number
          message?: string
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          item_id: string
          sender_id: number
          text: string
          telegram_message_id: number | null
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          sender_id: number
          text: string
          telegram_message_id?: number | null
          is_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          sender_id?: number
          text?: string
          telegram_message_id?: number | null
          is_system?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          item_id: string
          author_id: number
          target_user_id: number
          rating: number
          text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          author_id: number
          target_user_id: number
          rating: number
          text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          author_id?: number
          target_user_id?: number
          rating?: number
          text?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      nearby_items: {
        Args: {
          lat: number
          lng: number
          radius_meters?: number
          item_type?: 'TASK' | 'EVENT' | null
        }
        Returns: {
          id: string
          type: 'TASK' | 'EVENT'
          title: string
          description: string
          price: number | null
          currency: 'USD' | 'KZT' | 'RUB' | 'EUR'
          event_date: string | null
          latitude: number
          longitude: number
          status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          author_id: number
          distance_meters: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
