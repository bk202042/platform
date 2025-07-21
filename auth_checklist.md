Here is a **step-by-step checklist** to diagnose and resolve why authenticated users cannot post or comment in the community page or posts:

---

## 🟢 **Session & Authentication Debug Checklist**

### 1. **Check Supabase Session on Both Server and Client**

- **Server:**
  - Add a debug log in your API route (e.g., `app/api/community/posts/route.ts` or `app/api/community/posts/[postId]/comments/route.ts`):
    ```ts
    const { data: { user } } = await supabase.auth.getUser();
    console.log('SERVER user:', user);
    ```
- **Client:**
  - In your React component (e.g., `CommunityPageClient`, `CommentSection`), log the `currentUserId` prop:
    ```js
    useEffect(() => {
      console.log('CLIENT currentUserId:', currentUserId);
    }, [currentUserId]);
    ```
- **Expected:**
  - Both logs should show the same user ID when logged in.
  - If either is `null`, there is a session desync.

---

### 2. **Check Supabase Session Cookie**

- **Browser:**
  - Open DevTools → Application → Cookies.
  - Look for a cookie named `sb-<projectref>-auth-token` or similar.
  - **If missing or expired:**
    - The user will be treated as logged out.
    - Try logging out and logging in again.

---

### 3. **Check Email Confirmation**

- **API Route:**
  - Log the user object and check for `email_confirmed_at`:
    ```ts
    console.log('user.email_confirmed_at:', user?.email_confirmed_at);
    ```
- **Supabase Dashboard:**
  - Go to Auth → Users → Check the user’s email status.
- **Expected:**
  - `email_confirmed_at` should be a valid timestamp.
  - If not, the user cannot post/comment.

---

### 4. **Check RLS (Row Level Security) Policy Enforcement**

- **Supabase Dashboard:**
  - Go to Database → Table Editor → `community_posts` and `community_comments`.
  - Click "RLS" and review the policies:
    - Insert: `auth.uid() = user_id`
- **Test:**
  - Try inserting a row manually as the user via the SQL editor using the same session token.
  - If it fails, the policy is blocking the action.

---

### 5. **Check for Hydration Errors in React**

- **Console:**
  - Look for errors like "Hydration failed" or "Minified React error #185".
- **Fix:**
  - Ensure the user state is passed from server to client as a prop, and not re-fetched on the client in a way that could cause a mismatch.
  - Use the same method (`supabase.auth.getUser()`) on both server and client, and ensure cookies are present.

---

### 6. **Check API Error Responses**

- **Network Tab:**
  - When posting/commenting, inspect the API response.
  - Look for:
    - 401 Unauthorized: Session/cookie issue.
    - 403 Forbidden: RLS or permission issue.
    - 400 Bad Request: Validation issue.
    - 500 Server Error: Unexpected error.
- **Log the error message:**
  - Update your error handling to display/log the full error message from the API.

---

### 7. **Check Middleware and Session Refresh Logic**

- **Middleware:**
  - Ensure your `middleware.ts` and `lib/supabase/middleware.ts` are not interfering with cookies or session refresh.
  - The session should be refreshed if close to expiry (see `lib/auth/server.ts`).

---

### 8. **Test with a Fresh User**

- **Create a new user:**
  - Register, confirm email, and try posting/commenting.
  - If it works, the issue may be with specific user accounts or stale sessions.

---

## 🟢 **If All Else Fails**

- **Check Supabase Logs:**
  - Go to Supabase Dashboard → Logs → Database.
  - Look for RLS policy failures or auth errors when trying to post/comment.
- **Check for Multiple Supabase Projects:**
  - Ensure your frontend and backend are using the same Supabase project and keys.

---

## 🟢 **Summary Table**

| Step                        | What to Check                        | Expected Result                |
|-----------------------------|--------------------------------------|-------------------------------|
| Server session              | `user` object in API route           | Not null, correct user        |
| Client session              | `currentUserId` prop                 | Not null, matches server      |
| Supabase cookie             | Present, not expired                 | Exists in browser             |
| Email confirmed             | `email_confirmed_at`                 | Valid timestamp               |
| RLS policy                  | Insert allowed for user              | Insert succeeds               |
| Hydration errors            | React console                        | No hydration errors           |
| API error responses         | Network tab                          | 200 OK, or clear error        |
| Middleware/session refresh  | No cookie/session issues              | Session stays valid           |

---

**If you follow this checklist and provide the results for each step, we can pinpoint exactly where the failure is occurring and resolve it efficiently.**
Let me know if you want a script or code snippet for any of these checks!
