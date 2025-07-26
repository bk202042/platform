import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
  const { data: claims } = await supabase.auth.getClaims();
  
  if (!claims || !claims.claims || !claims.claims.sub) return null;
  
  return {
    id: claims.claims.sub,
    email: claims.claims.email || '',
    user_metadata: claims.claims.user_metadata || {},
    app_metadata: claims.claims.app_metadata || {},
    aud: Array.isArray(claims.claims.aud) ? claims.claims.aud[0] : (claims.claims.aud || ''),
    created_at: claims.claims.iat ? new Date(claims.claims.iat * 1000).toISOString() : new Date().toISOString(),
    role: claims.claims.role || '',
    updated_at: new Date().toISOString()
  } as User;
}
