# Google Authentication with Supabase and Next.js

This document outlines the steps to integrate Google Authentication into the existing Next.js application using Supabase.

## 1. Configuration

### Google Cloud Platform
- **Project:** A Google Cloud project must be set up.
- **OAuth Consent Screen:**
    - Authorized Domain: `[YOUR_SUPABASE_PROJECT_ID].supabase.co`
    - Scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
- **Credentials:**
    - Type: OAuth Client ID for a Web application.
    - Authorized JavaScript origins: `http://localhost:3000` and production URL.
    - Authorized redirect URLs: The callback URL from the Supabase dashboard.
- **Output:** Client ID and Client Secret.

### Supabase
- **Provider:** Enable the Google provider in the Supabase dashboard.
- **Credentials:** Add the Client ID and Client Secret from GCP.

## 2. Application Implementation Plan

### a. Create a Sign-In UI
- A new component will be created, `components/auth/GoogleSignInButton.tsx`.
- This component will contain a button that, when clicked, initiates the Google sign-in process.

### b. Implement Client-Side Logic
- The `onClick` event of the sign-in button will trigger the `handleSignIn` function.
- The `handleSignIn` function will use the client-side Supabase instance.
- It will call `supabase.auth.signInWithOAuth` with the following configuration:
  ```typescript
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  });
  ```

### c. Handle the OAuth Callback
- The existing route handler at `app/auth/callback/route.ts` will manage the server-side part of the flow.
- It will exchange the authorization code for a user session using `supabase.auth.exchangeCodeForSession(code)`.
- Upon success, it redirects the user to the application's home page.

### d. Integrate the Sign-In Button
- The `GoogleSignInButton` will be added to the sign-in page at `app/auth/sign-in/page.tsx`.
