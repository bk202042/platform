import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// This client is for API routes that don't need user authentication
export async function createApiClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
