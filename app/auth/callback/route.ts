import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Return empty response if code is missing
  if (!code) {
    return new Response(null, { status: 400 });
  }

  // Create response object for redirect
  const response = NextResponse.redirect(new URL("/", requestUrl.origin));

  // Create Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.headers
            .get("cookie")
            ?.split("; ")
            .find((row) => row.startsWith(`${name}=`))
            ?.split("=")?.[1];
        },
        set(name, value, options) {
          // Set cookies on the NextResponse object directly
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          // Delete cookies on the NextResponse object directly
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    },
  );

  // Exchange the code for a session
  await supabase.auth.exchangeCodeForSession(code);

  // Return the response with the updated cookies
  return response;
}
