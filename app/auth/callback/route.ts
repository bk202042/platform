import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    console.log('AUTH_CALLBACK|code:', code, 'origin:', origin);
    
    // Check for returnUrl first, then fallback to next, then default to '/'
    let next = searchParams.get("returnUrl") ?? searchParams.get("next") ?? "/";

    if (!next.startsWith("/")) {
      // if "next" is not a relative URL, use the default
      next = "/";
    }

    if (code) {
      const supabase = await createClient();
      console.log('AUTH_CALLBACK|exchanging_code_for_session');
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        console.log('AUTH_CALLBACK|success|redirecting_to:', next);
        const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === "development";
        if (isLocalEnv) {
          // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      } else {
        console.error('AUTH_CALLBACK|exchange_error:', error);
      }
    } else {
      console.log('AUTH_CALLBACK|no_code_provided');
    }

    // return the user to an error page with instructions
    console.log('AUTH_CALLBACK|redirecting_to_error');
    return NextResponse.redirect(`${origin}/auth/error`);
  } catch (error) {
    console.error('AUTH_CALLBACK|unexpected_error:', error);
    return NextResponse.redirect(`${request.url.split('?')[0].replace('/auth/callback', '/auth/error')}`);
  }
}
