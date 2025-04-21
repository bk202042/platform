import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// This client doesn't use cookies and is suitable for use in cached functions
export async function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
