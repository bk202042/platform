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
  // Delegate to getSessionUser for consistency with JWT signing keys
  return getSessionUser();
}
