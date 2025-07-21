import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export async function getSessionUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}
