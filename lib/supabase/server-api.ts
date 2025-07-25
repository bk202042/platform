import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
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
          } catch (_error) {
            // API routes can't set cookies, but this ensures consistent reading
          }
        },
      },
    }
  );

  // Ensure authentication context is properly set
  await supabase.auth.getUser();

  return supabase;
}

// 기존 코드와의 호환성을 위해 createApiClient 별칭 추가
export const createApiClient = createClient;
