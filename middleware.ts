import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 응답 객체를 생성하여 쿠키를 설정할 수 있도록 준비합니다.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // request가 아닌 response 객체의 쿠키를 수정해야 합니다.
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // request가 아닌 response 객체의 쿠키를 삭제해야 합니다.
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    },
  );

  // 세션을 검증하고 새로고침합니다.
  await supabase.auth.getUser();

  // 수정된 쿠키가 포함된 응답을 반환합니다.
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
