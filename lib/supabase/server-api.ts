import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (_error) {
            // API 라우트에서는 쿠키를 설정할 수 없으므로 에러 무시
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (_error) {
            // API 라우트에서는 쿠키를 설정할 수 없으므로 에러 무시
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
