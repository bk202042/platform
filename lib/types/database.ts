export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      agent_registrations: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          sales_volume: string;
          zip_code: string;
          status: 'pending' | 'approved' | 'rejected';
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
          status?: 'pending' | 'approved' | 'rejected';
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
          status?: 'pending' | 'approved' | 'rejected';
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
