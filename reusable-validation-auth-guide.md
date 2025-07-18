**Reusable Next.js Server Action Helpers (Validation & Auth)**

This guide helps create higher-order functions to wrap Server Actions, ensuring data validation with Zod and user authentication.

**Objective:**
Keep Server Actions DRY, type-safe, and focused on business logic.

**Core Files:**
1.  `lib/action-helpers.ts` (or similar name)
2.  `lib/schemas.ts` (for Zod schemas, or define alongside actions)
3.  Your authentication setup (e.g., `lib/auth.ts`)

---

**Step 1: Setup Dependencies**

Ensure you have:
*   `next`
*   `react`
*   `zod`
*   Your chosen authentication library (e.g., NextAuth.js, Lucia Auth, Clerk, custom)

```bash
pnpm add zod
# pnpm add <your-auth-library>
```

---

**Step 2: Create Action Helper File (`lib/action-helpers.ts`)**

```typescript
// lib/action-helpers.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { headers } from "next/headers"; // For server-side session retrieval

// --- PLACEHOLDER: AUTHENTICATION ---
// Replace with your actual User type and auth retrieval function
// Example using a hypothetical `auth.ts` and User type
import { type User, getSessionUser } from "./auth"; // ADJUST THIS
// --- END PLACEHOLDER ---

/**
 * Standard state for actions, compatible with useActionState.
 */
export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // Allows for additional custom fields
};

/**
 * Core logic for a validated action.
 */
type ValidatedActionFunction<S extends z.ZodType<any, any>, R extends ActionState> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<R>;

/**
 * Wraps an action with Zod schema validation.
 */
export function validatedAction<S extends z.ZodType<any, any>, R extends ActionState>(
  schema: S,
  action: ValidatedActionFunction<S, R>
) {
  return async (prevState: R, formData: FormData): Promise<R> => {
    const parsedForm = Object.fromEntries(formData.entries());
    const result = schema.safeParse(parsedForm);

    if (!result.success) {
      return { error: result.error.errors[0].message } as R;
    }
    return action(result.data, formData);
  };
}

/**
 * Core logic for a validated action requiring an authenticated user.
 */
type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, R extends ActionState> = (
  data: z.infer<S>,
  formData: FormData,
  user: User // Your User type
) => Promise<R>;

/**
 * Wraps an action with authentication and Zod schema validation.
 */
export function validatedActionWithUser<S extends z.ZodType<any, any>, R extends ActionState>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, R>
) {
  return async (prevState: R, formData: FormData): Promise<R> => {
    // --- PLACEHOLDER: AUTHENTICATION CHECK ---
    // Adapt to your auth library. Example:
    const user = await getSessionUser({ headers: await headers() }); // ADJUST THIS
    if (!user) {
      // Option 1: Throw an error (caught by error.tsx or Next.js default)
      // throw new Error("User not authenticated.");
      // Option 2: Return an error state
      return { error: "User not authenticated." } as R;
    }
    // --- END PLACEHOLDER ---

    const parsedForm = Object.fromEntries(formData.entries());
    const result = schema.safeParse(parsedForm);

    if (!result.success) {
      return { error: result.error.errors[0].message } as R;
    }
    return action(result.data, formData, user);
  };
}
```
**Note for AI:** The `// --- PLACEHOLDER ---` sections in `lib/action-helpers.ts` are critical. The `User` type and `getSessionUser` function must be replaced with the project's actual authentication implementation.

---

**Step 3: Define Zod Schemas (e.g., `lib/schemas.ts`)**

```typescript
// lib/schemas.ts
import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().max(200, "Bio too long.").optional(),
});

export const PostSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z.string().min(10, "Content is too short."),
});
```

---

**Step 4: Implement Server Actions (e.g., `app/actions.ts`)**

```typescript
// app/actions.ts
"use server";

import { redirect } from "next/navigation";
import { validatedAction, validatedActionWithUser, type ActionState } from "@/lib/action-helpers"; // Adjust path
import { UpdateProfileSchema, PostSchema } from "@/lib/schemas"; // Adjust path
// import { db } from "@/lib/db"; // Your DB client
// import { type User } from "@/lib/auth"; // Your User type

// Example 1: Public action (validation only)
export const submitContactForm = validatedAction(
  PostSchema, // Using PostSchema as an example
  async (data): Promise<ActionState> => {
    // data is typed: { title: string, content: string }
    console.log("Contact form data:", data);
    // try {
    //   await sendEmail(data); // Your logic
    //   return { success: "Message sent!" };
    // } catch (e) {
    //   return { error: "Failed to send message." };
    // }
    return { success: "Data received: " + data.title };
  }
);

// Example 2: Authenticated action (auth + validation)
export const updateProfile = validatedActionWithUser(
  UpdateProfileSchema,
  async (data, formData, user): Promise<ActionState> => {
    // data is typed: { name: string, bio?: string }
    // user is your authenticated User object
    console.log(`User ${user.id} updating profile with:`, data);
    // try {
    //   await db.user.update({ where: { id: user.id }, data: { name: data.name, bio: data.bio } });
    //   return { success: "Profile updated!" };
    // } catch (e) {
    //   return { error: "Failed to update profile." };
    // }
    return { success: `Profile for ${user.id} would be updated with name: ${data.name}` };
  }
);
```

---

**Step 5: Use in Frontend Components**

```tsx
// Example: app/some-page/page.tsx
"use client";

import { useActionState } from "react";
import { updateProfile, type ActionState } from "@/app/actions"; // Adjust path

const initialState: ActionState = { error: undefined, success: undefined };

export default function SomePage() {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" defaultValue="Test User" />
      </div>
      <div>
        <label htmlFor="bio">Bio:</label>
        <textarea id="bio" name="bio" defaultValue="Test bio" />
      </div>

      {state.error && <p style={{ color: "red" }}>Error: {state.error}</p>}
      {state.success && <p style={{ color: "green" }}>Success: {state.success}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Update Profile"}
      </button>
    </form>
  );
}
```

---

**Step 6: Key Considerations for AI & Developer**

1.  **Authentication Logic:**
    *   The `User` type import and `getSessionUser` (or equivalent function to get the authenticated user) in `lib/action-helpers.ts` **MUST** be adapted to the specific authentication library and setup used in the project.
    *   Ensure the auth retrieval function works server-side and correctly uses `headers()` if needed (common for App Router).
2.  **Error Handling in `validatedActionWithUser`:**
    *   Decide if unauthenticated access should `throw new Error()` (handled by `error.tsx`) or return an `ActionState` object with an error message (handled by `useActionState`). The example shows returning an error state.
3.  **Action Return Types:**
    *   Actions should return a promise resolving to `ActionState` or a compatible type. This allows `useActionState` to manage pending status and results.
    *   You can extend `ActionState` for specific actions if they need to return more data beyond `error` and `success`.
4.  **Server-Side Logic:**
    *   Remember to include any database interactions, API calls, or other server-side logic within the core action functions.

This guide provides a solid foundation. Adapt the placeholder sections, especially authentication, to fit the project's specific stack.
