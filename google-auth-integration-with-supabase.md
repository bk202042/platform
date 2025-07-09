Here’s a clear, step-by-step plan to add Google Auth to your Next.js (App Router) + Supabase app, strictly following your coding philosophy and the latest official documentation (Context7, Supabase docs):

---

## 1. Research & Documentation

- **Research**: Gather all relevant, up-to-date information from Context7 MCP and Supabase docs about Google Auth integration.
- **Document**: Summarize findings, code snippets, and configuration steps in research.md (or update if it exists).

---

## 2. Google Cloud Console Setup

- **Create/Select Project**: Go to Google Cloud Console, create or select a project.
- **Configure OAuth Consent Screen**: Set up the consent screen, add privacy policy and terms links.
- **Create OAuth Credentials**:
  - Application type: Web application.
  - Add Authorized JavaScript origins (your site URL, e.g., http://localhost:3000 for local dev).
  - Add Authorized redirect URIs (from Supabase dashboard).
- **Copy Client ID and Secret**: Save these for Supabase configuration.

---

## 3. Supabase Dashboard Configuration

- **Enable Google Provider**: In Supabase dashboard, go to Authentication > Providers > Google.
- **Paste Client ID and Secret**: Enter the values from Google Cloud.
- **Save**: Confirm and save the provider settings.

---

## 4. Environment Variables

- **Check/Update**:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- **(If needed)**: Add any Google-specific env vars (rare, usually not needed for Supabase).

---

## 5. UI/UX Planning

- **Sign In Button**: Decide where the “Sign in with Google” button will appear (e.g., sign-in page).
- **Button Implementation**: Plan to use your own button (with supabase-js) or Google’s pre-built button (for One Tap, etc.).
- **Redirect Handling**: Plan for post-login redirect (e.g., to dashboard or previous page).

---

## 6. Client-Side Integration

- **Choose Method**:
  - Use supabase-js’s signInWithOAuth({ provider: 'google' }) for a simple redirect flow.
  - (Optional) For advanced use, consider Google’s pre-built button and handle tokens manually.
- **Session Handling**: Plan how to handle the returned session (store, check auth state, etc.).

---

## 7. Server-Side Considerations

- **SSR/SSG**: Ensure correct use of @supabase/ssr for server-side session handling.
- **API Routes**: No direct changes needed unless you want to restrict access to authenticated users.

---

## 8. Testing

- **Local Testing**: Ensure localhost is in Google’s allowed origins.
- **Production Testing**: Add production URL to Google Cloud and Supabase settings.

---

## 9. Documentation & Code Quality

- **Update research.md**: Document every step, code snippet, and config.
- **Follow Coding Rules**: KISS, clean code, functional patterns, no classes, etc.

---

## 10. Pre-Implementation Checklist

- [ ] All research documented in research.md
- [ ] Google Cloud project and OAuth credentials ready
- [ ] Supabase provider configured
- [ ] Env vars set
- [ ] UI/UX flow mapped
- [ ] Integration approach chosen (supabase-js or Google button)
- [ ] Testing plan in place

---
