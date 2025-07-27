import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  
  // Use getClaims() for improved performance with JWT signing keys
  const {
    data,
    error
  } = await supabase.auth.getClaims();
  
  if (error || !data?.claims) {
    console.error('AUTH|getSessionUser|failed:', error?.message || 'No claims found');
    return null;
  }
  
  const claims = data.claims;
  
  // Convert claims to User object format for backward compatibility
  const user: User = {
    id: claims.sub,
    email: claims.email,
    email_confirmed_at: claims.email_confirmed_at,
    phone: claims.phone,
    phone_confirmed_at: claims.phone_confirmed_at,
    created_at: claims.created_at,
    updated_at: claims.updated_at,
    last_sign_in_at: claims.last_sign_in_at,
    role: claims.role,
    aud: Array.isArray(claims.aud) ? claims.aud[0] : claims.aud,
    app_metadata: claims.app_metadata || {},
    user_metadata: claims.user_metadata || {}
  };
  
  console.log('AUTH|getSessionUser|success:', user.id);
  return user;
}

export async function getInitialUser(): Promise<User | null> {
  // Delegate to getSessionUser for consistency with JWT signing keys
  return getSessionUser();
}

// Helper function to get raw claims if needed
export async function getSessionClaims() {
  const supabase = await createClient();
  return await supabase.auth.getClaims();
}
