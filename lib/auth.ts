import { createClient } from "@/lib/supabase/server";

// Simple server-side user fetcher
export async function getInitialUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Server auth error:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting initial user:", error);
    return null;
  }
}
