import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
// Define a simplified Database type directly inline to avoid import issues
interface Database {
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
          status: string;
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
          status?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          sales_volume?: string;
          zip_code?: string;
          status?: string;
          notes?: string;
          updated_at?: string;
          processed_at?: string;
        };
      };
    };
  };
}

// This client is for API routes that don't need user authentication
export function createApiClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    throw new Error(
      "Missing required environment variables for Supabase connection",
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}
