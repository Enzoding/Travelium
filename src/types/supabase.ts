export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          author: string | null;
          description: string | null;
          url: string | null;
          cover_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
          book_status: number;
        };
        Insert: {
          id: string;
          title: string;
          author?: string | null;
          description?: string | null;
          url?: string | null;
          cover_url?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          book_status?: number;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string | null;
          description?: string | null;
          url?: string | null;
          cover_url?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          book_status?: number;
        };
      };
      podcasts: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          url: string | null;
          cover_url: string | null;
          audio_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
          podcast_status: number;
        };
        Insert: {
          id: string;
          title: string;
          description?: string | null;
          url?: string | null;
          cover_url?: string | null;
          audio_url?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          podcast_status?: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          url?: string | null;
          cover_url?: string | null;
          audio_url?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          podcast_status?: number;
        };
      };
      countries: {
        Row: {
          code: string;
          name: string;
          created_at: string;
        };
        Insert: {
          code: string;
          name: string;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          created_at?: string;
        };
      };
      cities: {
        Row: {
          id: string;
          name: string;
          country_code: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          country_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country_code?: string;
          created_at?: string;
        };
      };
      book_cities: {
        Row: {
          id: string;
          book_id: string;
          city_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          city_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          city_id?: string;
          created_at?: string;
        };
      };
      podcast_cities: {
        Row: {
          id: string;
          podcast_id: string;
          city_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          podcast_id: string;
          city_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          podcast_id?: string;
          city_id?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};