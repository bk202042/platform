import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // The following line `request.cookies.set(name, value)` is from the original prompt.
          // Note: `request.cookies` (ReadonlyRequestCookies) doesn't typically have a `set` method,
          // and this call omits `options`. Adhere to this specific instruction.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          supabaseResponse = NextResponse.next({
            // Re-create response to apply cookies
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser(); // MUST NOT be removed.

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return `supabaseResponse`. If creating a new response:
  // 1. Pass `request`: `NextResponse.next({ request })`
  // 2. Copy cookies: `newResp.cookies.setAll(supabaseResponse.cookies.getAll())`
  // 3. Modify `newResp` (avoid cookie changes), then return `newResp`.
  // Failure can break sessions.

  return supabaseResponse;
}

// Apply middleware to all routes except static files and authentication callback routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
