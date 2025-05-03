import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
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
          supabaseResponse.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          supabaseResponse.cookies.set(name, "", options);
        },
      },
    },
  );

  // Get both user and session to check authentication status
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // List of public routes that don't require authentication
  const publicRoutes = ["/", "/search", "/properties", "/auth"];
  
  // Special callback routes that must be excluded from auth checks
  const authCallbackRoutes = ["/auth/callback", "/auth/reset-password", "/auth/confirm"];
  const isAuthCallback = authCallbackRoutes.some(route => 
    request.nextUrl.pathname === route
  );
  
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  ) || isAuthCallback;

  // For debugging - log auth status to server console
  console.log({
    path: request.nextUrl.pathname,
    isPublicRoute,
    isAuthCallback: authCallbackRoutes.some(route => request.nextUrl.pathname === route),
    hasUser: !!user,
    hasSession: !!session,
    userId: user?.id,
  });

  // Only redirect to sign-in for protected routes when user is not authenticated
  if (!session && !isPublicRoute) {
    // Debug session information
    console.log('Missing session for protected route', {
      cookies: request.cookies.getAll().map(c => c.name),
      authCookies: request.cookies.getAll().filter(c => c.name.includes('supabase')).map(c => c.name),
      path: request.nextUrl.pathname
    });
    
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    // Add a return parameter to redirect back to the intended page after sign-in
    url.searchParams.set('returnTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Apply middleware to all routes except static files and authentication callback routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
