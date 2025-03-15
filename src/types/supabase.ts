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
      books: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          author: string | null
          description: string | null
          url: string | null
          cover_url: string | null
          user_id: string
          book_status: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          author?: string | null
          description?: string | null
          url?: string | null
          cover_url?: string | null
          user_id: string
          book_status?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          author?: string | null
          description?: string | null
          url?: string | null
          cover_url?: string | null
          user_id?: string
          book_status?: number
        }
        Relationships: [
          {
            foreignKeyName: "books_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      book_countries: {
        Row: {
          id: string
          book_id: string
          country_code: string
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          country_code: string
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          country_code?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_countries_book_id_fkey"
            columns: ["book_id"]
            referencedRelation: "books"
            referencedColumns: ["id"]
          }
        ]
      }
      book_cities: {
        Row: {
          id: string
          book_id: string
          city_id: string
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          city_id: string
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          city_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_cities_book_id_fkey"
            columns: ["book_id"]
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_cities_city_id_fkey"
            columns: ["city_id"]
            referencedRelation: "cities"
            referencedColumns: ["id"]
          }
        ]
      }
      podcasts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          cover_url: string | null
          audio_url: string | null
          url: string | null
          user_id: string
          podcast_status: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          cover_url?: string | null
          audio_url?: string | null
          url?: string | null
          user_id: string
          podcast_status?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          cover_url?: string | null
          audio_url?: string | null
          url?: string | null
          user_id?: string
          podcast_status?: number
        }
        Relationships: [
          {
            foreignKeyName: "podcasts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      podcast_countries: {
        Row: {
          id: string
          podcast_id: string
          country_code: string
          created_at: string
        }
        Insert: {
          id?: string
          podcast_id: string
          country_code: string
          created_at?: string
        }
        Update: {
          id?: string
          podcast_id?: string
          country_code?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_countries_podcast_id_fkey"
            columns: ["podcast_id"]
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          }
        ]
      }
      podcast_cities: {
        Row: {
          id: string
          podcast_id: string
          city_id: string
          created_at: string
        }
        Insert: {
          id?: string
          podcast_id: string
          city_id: string
          created_at?: string
        }
        Update: {
          id?: string
          podcast_id?: string
          city_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_cities_podcast_id_fkey"
            columns: ["podcast_id"]
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_cities_city_id_fkey"
            columns: ["city_id"]
            referencedRelation: "cities"
            referencedColumns: ["id"]
          }
        ]
      }
      cities: {
        Row: {
          id: string
          name: string
          country_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country_code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country_code?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_code_fkey"
            columns: ["country_code"]
            referencedRelation: "countries"
            referencedColumns: ["code"]
          }
        ]
      }
      countries: {
        Row: {
          code: string
          name: string
          created_at: string
        }
        Insert: {
          code: string
          name: string
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
