import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// PERFORMANCE: Supavisor connection pooling configuration
const getSupabaseConfig = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  // CRITICAL FIX: Properly construct Supavisor URL for connection pooling
  // Supabase URLs don't contain explicit ports, so we need to construct the pooled URL correctly
  let pooledUrl = baseUrl;
  
  // TEMPORARY FIX: Disable connection pooling during build process to prevent fetch failures
  // Only use Supavisor in production runtime (not during build)
  // Check if we're in Vercel runtime environment vs build environment
  const isVercelRuntime = process.env.VERCEL && process.env.VERCEL_ENV;
  const isRuntimeProduction = process.env.NODE_ENV === 'production' && isVercelRuntime;
  
  if (isRuntimeProduction && process.env.SUPABASE_POOLER_URL) {
    // Use dedicated pooler URL if provided
    pooledUrl = process.env.SUPABASE_POOLER_URL;
  } else if (isRuntimeProduction) {
    // Construct Supavisor URL for transaction mode (port 6543)
    // Extract the project reference from the URL
    const urlParts = baseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (urlParts && urlParts[1]) {
      pooledUrl = `https://${urlParts[1]}.pooler.supabase.com:6543`;
    }
  }
  
  // During build, use standard Supabase URL to prevent connection issues
  console.log('Supabase config:', { 
    url: pooledUrl, 
    isRuntimeProduction, 
    nodeEnv: process.env.NODE_ENV,
    isVercelRuntime
  });
  
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
