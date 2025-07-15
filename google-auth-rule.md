# Guide: Implementing Google Authentication with Supabase in Next.js

This document outlines the step-by-step process, key learnings, and troubleshooting steps for integrating Google OAuth with a Next.js application using Supabase.

---

## Part 1: Initial Configuration

### 1.1. Google Cloud Platform Setup

1.  **Create/Select a Project:** Navigate to the [Google Cloud Console](https://console.cloud.google.com/home/dashboard).
2.  **Configure OAuth Consent Screen:**
    *   Go to **APIs & Services > OAuth consent screen**.
    *   Under **Authorized domains**, add your Supabase project's domain (e.g., `[PROJECT_ID].supabase.co`).
    *   Add the necessary scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid`.
3.  **Create OAuth Credentials:**
    *   Go to **APIs & Services > Credentials**.
    *   Click **Create credentials > OAuth Client ID**.
    *   Select **Web application**.
    *   Add your site's URL to **Authorized JavaScript origins** (e.g., `http://localhost:3000` and your production URL).
    *   Add the callback URL from your Supabase dashboard to **Authorized redirect URLs**.
4.  **Store Credentials:** Copy the generated **Client ID** and **Client Secret**.

### 1.2. Supabase Dashboard Setup

1.  Navigate to **Authentication > Providers** in your Supabase project.
2.  Enable the **Google** provider.
3.  Paste the **Client ID** and **Client Secret** from the Google Cloud Console.
4.  Save the configuration.

### 1.3. Environment Variables

*   **Critical Lesson:** The entire authentication flow depends on the correct environment variables. Ensure your `.env.local` file contains the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project's API settings. An incorrect or missing variable is a common point of failure.

---

## Part 2: Frontend Implementation

### 2.1. Create a Reusable Google Sign-In Button

*   Create a client component (`'use client'`) for the button (e.g., `components/auth/GoogleSignInButton.tsx`).
*   Make the button's text dynamic by accepting `children` as a prop. This allows you to display "Sign in with Google" or "Sign up with Google" as needed.
*   The `onClick` handler should call `supabase.auth.signInWithOAuth`, specifying `'google'` as the provider and setting the `redirectTo` option to the correct callback URL (e.g., `${location.origin}/auth/callback`).

**Example (`GoogleSignInButton.tsx`):**
```tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface GoogleSignInButtonProps {
  children: React.ReactNode;
}

export default function GoogleSignInButton({ children }: GoogleSignInButtonProps) {
  const supabase = createClient();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Button
      onClick={handleSignIn}
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
        alt="Google logo"
        width={20}
        height={20}
      />
      <span>{children}</span>
    </Button>
  );
}
```

### 2.2. Integrate the Button into Auth Pages

*   Add the `GoogleSignInButton` to both `app/auth/sign-in/page.tsx` and `app/auth/sign-up/page.tsx`.
*   Pass the appropriate text as children (e.g., `<GoogleSignInButton>Sign in with Google</GoogleSignInButton>`).

---

## Part 3: Server-Side Logic & Middleware

### 3.1. Supabase SSR Client Configuration

*   **Key Learning:** The cookie handling logic for the Supabase SSR client is different for middleware and server components. Using the wrong pattern will break authentication.

*   **Server Components (`lib/supabase/server.ts`):** This client is used in Server Components, Route Handlers, and Server Actions. It requires `get`, `set`, and `remove` methods. The `createClient` function **must be `async`** because `cookies()` from `next/headers` is asynchronous.

    ```typescript
    // Correct implementation for lib/supabase/server.ts
    import "server-only";
    import { createServerClient, type CookieOptions } from "@supabase/ssr";
    import { cookies } from "next/headers";

    export async function createClient() {
      const cookieStore = await cookies(); // Must be awaited

      return createServerClient(
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
              } catch (error) { /* Ignore errors in Server Components */ }
            },
            remove(name: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value: "", ...options });
              } catch (error) { /* Ignore errors in Server Components */ }
            },
          },
        }
      );
    }
    ```

### 3.2. Middleware (`middleware.ts`)

*   **Key Learning:** The middleware is crucial for refreshing session cookies and protecting routes. Incorrect logic here leads to redirect loops or unauthorized access.

*   **Public vs. Protected Routes:** Explicitly define a list of public paths. The logic must correctly handle the root path (`/`) as a special case to avoid treating all paths as public.
*   **Redirect Logic:**
    1.  If a user is **not logged in** and tries to access a **protected route**, redirect them to the sign-in page.
    2.  If a user is **logged in** and tries to access the **sign-in/sign-up pages**, redirect them to the application's homepage.

    ```typescript
    // Correct logic for middleware.ts
    import { createServerClient } from '@supabase/ssr';
    import { NextResponse, type NextRequest } from 'next/server';

    export async function middleware(request: NextRequest) {
      // ... (Supabase client setup with getAll/setAll)

      const { data: { user } } = await supabase.auth.getUser();

      const publicPaths = ['/', '/search', '/properties', '/auth/sign-in', /* ... */];

      const isPublicPath = publicPaths.some((path) => {
        if (path === '/') {
          return request.nextUrl.pathname === '/';
        }
        return request.nextUrl.pathname.startsWith(path);
      });

      if (!user && !isPublicPath) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/sign-in';
        return NextResponse.redirect(url);
      }

      if (user && request.nextUrl.pathname.startsWith('/auth/sign-in')) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      return response;
    }
    ```

### 3.3. Callback Route (`app/auth/callback/route.ts`)

*   This route handles the final step of the OAuth flow, exchanging the code from Google for a user session. The implementation provided in the official Supabase documentation is robust and should be used.

---

## Part 4: Database Integration (Auto-Provisioning Profiles)

### 4.1. The Problem

*   Supabase `auth.users` is a private, protected table. To store public-facing profile information (like name, avatar), you need a separate `public.profiles` table.
*   Supabase does not automatically sync data from `auth.users` to `public.profiles`.

### 4.2. The Solution: Database Trigger

*   **Key Learning:** The most reliable way to sync user data is with a PostgreSQL function and trigger that fires after a new user is created.

*   **Function Logic:** The function should `INSERT` the new user's `id`, `email`, and metadata into the `public.profiles` table. It must correctly map the data from `new.raw_user_meta_data` to the columns in your `profiles` table (e.g., splitting `full_name` into `first_name` and `last_name`).
*   **Idempotency:** Make your migration script idempotent by using `DROP TRIGGER IF EXISTS` before the `CREATE TRIGGER` statement. This allows the migration to be run multiple times without errors.
*   **Security:** Always use `security definer` for the function and set a secure `search_path` (e.g., `set search_path = public`) to prevent potential vulnerabilities.

**Example Migration (`..._create_user_profile_on_signup.sql`):**
```sql
-- Drop the existing trigger if it exists to ensure idempotency.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the function to handle new user creation.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, avatar_url, role)
  values (
    new.id,
    new.email,
    split_part(new.raw_user_meta_data->>'full_name', ' ', 1),
    substring(new.raw_user_meta_data->>'full_name' from position(' ' in new.raw_user_meta_data->>'full_name') + 1),
    new.raw_user_meta_data->>'avatar_url',
    'user'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Recreate the trigger to execute the function after a new user is inserted.
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

---

## Part 5: Database Cleanup

*   **Key Learning:** Avoid redundant tables. We identified and removed a `public.users` table that was causing confusion with the `public.profiles` table.
*   **Process:**
    1.  **Audit:** Search the codebase to ensure the redundant table is not in use.
    2.  **Refactor:** Update any references to point to the correct table (e.g., in RLS policies).
    3.  **Drop:** Create a new migration file to safely `DROP` the redundant table.

---

## Part 6: UI/UX and Localization

*   For a polished user experience, ensure UI elements are consistent.
*   We translated the sign-in and sign-up pages to Korean to match the application's primary language, providing a seamless experience for users.
