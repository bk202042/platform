---
trigger: model_decision
description: Guidelines for writing Next.js apps with Supabase Auth
globs: "**/*.ts, **/*.tsx, **/*.js, **/*.jsx"
---

# Bootstrap Next.js app with Supabase Auth
## Overview
1. Install @supabase/supabase-js and @supabase/ssr packages.
2. Set up environment variables.
3. Write utility functions with `createClient` (browser and server).
4. Hook up middleware to refresh auth tokens.

## 🚨 CRITICAL AI INSTRUCTIONS: Supabase SSR & Cookies 🚨

**Key Mandates:**
1.  **MUST use `@supabase/ssr` package.**
2.  **Cookie Handler for `createServerClient` MUST ONLY use `getAll` and `setAll` methods.** Implementations vary by context (see Server Client & Middleware examples below).
    ```typescript
    // ✅ CORRECT STRUCTURE for createServerClient's `cookies` option
    {
      cookies: {
        getAll() { /* ... implementation per context ... */ },
        setAll(cookiesToSet) { /* ... implementation per context ... */ }
      }
    }
    ```
3.  **MUST NEVER use `get`, `set`, or `remove` methods in the cookie handler passed to `createServerClient`.**
    ```typescript
    // ❌ DEPRECATED - BREAKS APP: Individual cookie methods in handler
    {
      cookies: {
        get() {/*...*/},    // ❌ NO
        set() {/*...*/},    // ❌ NO
        remove() {/*...*/}  // ❌ NO
      }
    }
    ```
4.  **MUST NEVER import from or use `@supabase/auth-helpers-nextjs`.**
    ```typescript
    // ❌ DEPRECATED - BREAKS APP: @supabase/auth-helpers-nextjs
    import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'  // ❌ NO
    import { createClientComponentClient } from '@supabase/auth-helpers-nextjs' // ❌ NO
    ```

## CORRECT BROWSER CLIENT IMPLEMENTATION
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## CORRECT SERVER CLIENT IMPLEMENTATION
(For Server Components, Route Handlers, Server Actions)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies() // `cookies()` is not async; original `await cookies()` was incorrect.

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

## CORRECT MIDDLEWARE IMPLEMENTATION
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // The following line `request.cookies.set(name, value)` is from the original prompt.
          // Note: `request.cookies` (ReadonlyRequestCookies) doesn't typically have a `set` method,
          // and this call omits `options`. Adhere to this specific instruction.
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))

          supabaseResponse = NextResponse.next({ // Re-create response to apply cookies
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser() // MUST NOT be removed.

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return `supabaseResponse`. If creating a new response:
  // 1. Pass `request`: `NextResponse.next({ request })`
  // 2. Copy cookies: `newResp.cookies.setAll(supabaseResponse.cookies.getAll())`
  // 3. Modify `newResp` (avoid cookie changes), then return `newResp`.
  // Failure can break sessions.

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## AI MODEL VERIFICATION & RESPONSE GUIDE

**Verification Checklist (Before Generating Code):**
1.  Using `@supabase/ssr`? (Else STOP & FIX)
2.  Cookie handler for `createServerClient` uses ONLY `getAll` and `setAll` methods? (Else STOP & FIX)
3.  NO `get`, `set`, or `remove` methods in cookie handler object? (Else STOP & FIX)
4.  NO imports from `@supabase/auth-helpers-nextjs`? (Else STOP & FIX)

**Consequences of Incorrect Implementation:**
Using deprecated patterns (`get/set/remove` in handler structure, `auth-helpers-nextjs`) will:
1.  Break production app.
2.  Fail session state.
3.  Cause auth loops.
4.  Risk security vulnerabilities.

**AI Response Rules:**
1.  ONLY use code from this guide.
2.  NEVER suggest deprecated approaches.
3.  ALWAYS use the specified `getAll`/`setAll` cookie handler structure.
4.  VERIFY response against these rules. **No exceptions.*
