import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

/**
 * 인증된 사용자 정보를 가져오는 함수
 * 인증되지 않은 경우 null 반환
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createClient();
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

/**
 * 인증이 필요한 페이지에서 사용하는 함수
 * 인증되지 않은 경우 로그인 페이지로 리다이렉트
 */
export async function requireAuth(redirectTo = "/auth/sign-in") {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * 이미 인증된 사용자가 접근하면 안 되는 페이지에서 사용하는 함수
 * 인증된 경우 지정된 페이지로 리다이렉트
 */
export async function redirectIfAuthenticated(redirectTo = "/") {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(redirectTo);
  }

  return null;
}
