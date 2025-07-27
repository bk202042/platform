import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('AUTH|getSessionUser|failed:', error?.message || 'No user found');
    return null;
  }
  
  console.log('AUTH|getSessionUser|success:', user.id);
  return user;
}

export async function getInitialUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: claims,
  } = await supabase.auth.getClaims();
  
  // Convert claims to User object format for compatibility
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
