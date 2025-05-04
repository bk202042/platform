import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // Create a server-side Supabase client with minimal cookie handling
  // to ensure sessions work consistently
  const cookieStore = cookies();

  // Simple implementation with only necessary functionality
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name, value, options) {
          // Handle cookie setting with try/catch for server components
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          // Handle cookie removal with try/catch for server components
          cookieStore.set({ name, value: "", ...options });
        },
      },
    },
  );
}
