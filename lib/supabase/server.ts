import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// PERFORMANCE: Supavisor connection pooling configuration
const getSupabaseConfig = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  // CRITICAL FIX: Properly construct Supavisor URL for connection pooling
  // Supabase URLs don't contain explicit ports, so we need to construct the pooled URL correctly
  const pooledUrl = baseUrl;
  
  // CRITICAL FIX: Disable Supavisor connection pooling due to DNS resolution issues in Vercel
  // The pooler.supabase.com domain is not accessible from Vercel's production environment
  // Falling back to direct Supabase URLs for now
  // TODO: Re-enable once Vercel network access to pooler domain is resolved
  
  console.log('SUPAVISOR DISABLED: Using direct Supabase URLs due to Vercel DNS issues');
  
  // Always use direct Supabase URL (pooledUrl = baseUrl at this point)
  console.log('Supabase config:', { 
    url: pooledUrl, 
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL || 'false'
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
