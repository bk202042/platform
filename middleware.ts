import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/admin", "/profile", "/community/new"];

// Auth routes that should redirect if already authenticated
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/community", "/properties", "/about", "/auth"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next({
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
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const pathname = request.nextUrl.pathname;

    // Skip authentication check for public routes and API routes
    if (
      isPublicRoute(pathname) ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/")
    ) {
      return response;
    }

    // Get user with error handling
    let user = null;
    try {
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Middleware auth error:", error);
        // Continue without user if there's an error
      } else {
        user = authUser;
      }
    } catch (error) {
      console.error("Middleware unexpected error:", error);
      // Continue without user if there's an unexpected error
    }

    // Handle protected routes
    if (isProtectedRoute(pathname)) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/sign-in";
        // Add return URL for post-authentication redirect
        url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
      }

      // Check if user has required permissions for admin routes
      if (pathname.startsWith("/admin")) {
        const isAdmin = user.user_metadata?.role === "admin";
        if (!isAdmin) {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }
    }

    // Handle auth routes - redirect if already authenticated
    if (isAuthRoute(pathname) && user) {
      const url = request.nextUrl.clone();

      // Check for return URL
      const returnUrl = request.nextUrl.searchParams.get("returnUrl");
      if (returnUrl && returnUrl.startsWith("/")) {
        url.pathname = returnUrl;
        url.search = ""; // Clear search params
      } else {
        url.pathname = "/";
      }

      return NextResponse.redirect(url);
    }

    return response;
  } catch (error) {
    console.error("Middleware critical error:", error);

    // In case of critical error, allow the request to continue
    // This prevents the middleware from breaking the entire application
    return NextResponse.next({
      request,
    });
  }
}

// Apply middleware to all routes except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
