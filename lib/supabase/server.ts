import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// PERFORMANCE: Supavisor connection pooling configuration
const getSupabaseConfig = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  // Use Supavisor Transaction Mode (Port 6543) for serverless optimization
  // This provides connection pooling optimized for high-volume, short-lived connections
  const pooledUrl = baseUrl.replace(':5432', ':6543');
  
  return {
    url: pooledUrl,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Connection pool optimization settings
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'Connection': 'keep-alive',
      },
    },
  };
};

export async function createClient() {
  const cookieStore = await cookies();
  const config = getSupabaseConfig();

  return createServerClient(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      db: config.db,
      global: config.global,
    }
  );
}

export async function createAnonClient() {
  const config = getSupabaseConfig();
  
  return createServerClient(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op for anonymous client
        },
      },
      db: config.db,
      global: config.global,
    }
  );
}
