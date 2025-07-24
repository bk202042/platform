export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Vietnamese Location Types
export type CommunityCategory =
  | "general"
  | "housing"
  | "jobs"
  | "marketplace"
  | "events"
  | "questions"
  | "recommendations";

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: {
          id: string;
          name: string;
          name_en?: string;
          name_ko?: string;
          country: string;
          timezone: string;
          is_major_city: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string;
          name_ko?: string;
          country?: string;
          timezone?: string;
          is_major_city?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string;
          name_ko?: string;
          country?: string;
          timezone?: string;
          is_major_city?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      apartments: {
        Row: {
          id: string;
          name: string;
          name_en?: string;
          name_ko?: string;
          district?: string;
          district_en?: string;
          district_ko?: string;
          address?: string;
          address_en?: string;
          address_ko?: string;
          city_id: string;
          latitude?: number;
          longitude?: number;
          is_featured: boolean;
          slug?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string;
          name_ko?: string;
          district?: string;
          district_en?: string;
          district_ko?: string;
          address?: string;
          address_en?: string;
          address_ko?: string;
          city_id: string;
          latitude?: number;
          longitude?: number;
          is_featured?: boolean;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string;
          name_ko?: string;
          district?: string;
          district_en?: string;
          district_ko?: string;
          address?: string;
          address_en?: string;
          address_ko?: string;
          city_id?: string;
          latitude?: number;
          longitude?: number;
          is_featured?: boolean;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_locations: {
        Row: {
          id: string;
          user_id: string;
          city_id: string;
          apartment_id?: string;
          is_primary: boolean;
          notification_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          city_id: string;
          apartment_id?: string;
          is_primary?: boolean;
          notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          city_id?: string;
          apartment_id?: string;
          is_primary?: boolean;
          notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_posts: {
        Row: {
          id: string;
          apartment_id: string;
          user_id: string;
          category: CommunityCategory;
          title?: string;
          body: string;
          images?: string[];
          likes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
          status: "draft" | "published" | "archived";
          search_vector?: string;
          view_count: number;
          last_activity_at: string;
        };
        Insert: {
          id?: string;
          apartment_id: string;
          user_id: string;
          category: CommunityCategory;
          title?: string;
          body: string;
          images?: string[];
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
          status?: "draft" | "published" | "archived";
          search_vector?: string;
          view_count?: number;
          last_activity_at?: string;
        };
        Update: {
          id?: string;
          apartment_id?: string;
          user_id?: string;
          category?: CommunityCategory;
          title?: string;
          body?: string;
          images?: string[];
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
          status?: "draft" | "published" | "archived";
          search_vector?: string;
          view_count?: number;
          last_activity_at?: string;
        };
      };
      community_post_images: {
        Row: {
          id: string;
          post_id: string;
          storage_path: string;
          display_order: number;
          alt_text?: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          storage_path: string;
          display_order?: number;
          alt_text?: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          storage_path?: string;
          display_order?: number;
          alt_text?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      community_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          parent_id?: string;
          content: string;
          created_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          parent_id?: string;
          content: string;
          created_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          parent_id?: string;
          content?: string;
          created_at?: string;
          is_deleted?: boolean;
        };
      };
      community_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      search_suggestions: {
        Row: {
          id: string;
          query: string;
          suggestion_type:
            | "apartment"
            | "category"
            | "user"
            | "content"
            | "location";
          metadata: Json;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          query: string;
          suggestion_type:
            | "apartment"
            | "category"
            | "user"
            | "content"
            | "location";
          metadata?: Json;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          query?: string;
          suggestion_type?:
            | "apartment"
            | "category"
            | "user"
            | "content"
            | "location";
          metadata?: Json;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_activity: {
        Row: {
          id: string;
          user_id?: string;
          activity_type:
            | "view"
            | "like"
            | "comment"
            | "post"
            | "search"
            | "filter";
          resource_type: "post" | "comment" | "user" | "apartment" | "search";
          resource_id?: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          activity_type:
            | "view"
            | "like"
            | "comment"
            | "post"
            | "search"
            | "filter";
          resource_type: "post" | "comment" | "user" | "apartment" | "search";
          resource_id?: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?:
            | "view"
            | "like"
            | "comment"
            | "post"
            | "search"
            | "filter";
          resource_type?: "post" | "comment" | "user" | "apartment" | "search";
          resource_id?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      agent_registrations: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          sales_volume: string;
          zip_code: string;
          status: "pending" | "approved" | "rejected";
          notes?: string;
          created_at: string;
          updated_at?: string;
          processed_at?: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          sales_volume: string;
          zip_code: string;
          status?: "pending" | "approved" | "rejected";
          notes?: string;
          created_at?: string;
          updated_at?: string;
          processed_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          sales_volume?: string;
          zip_code?: string;
          status?: "pending" | "approved" | "rejected";
          notes?: string;
          created_at?: string;
          updated_at?: string;
          processed_at?: string;
        };
      };
      property_listings: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: string;
          property_type: string;
          bedrooms: number;
          bathrooms: number;
          square_footage: string;
          address: string;
          features: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: string;
          property_type: string;
          bedrooms: number;
          bathrooms: number;
          square_footage: string;
          address: string;
          features?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: string;
          property_type?: string;
          bedrooms?: number;
          bathrooms?: number;
          square_footage?: string;
          address?: string;
          features?: Json;
          created_by?: string | null;
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
}
