---
**AI Code Assistant Instructions: Reusable Next.js Server Actions Pattern with Validation & Authentication**

**Goal:**
Implement a reusable pattern for Next.js Server Actions that incorporates data validation (using Zod) and user authentication (using a placeholder for your specific auth library, e.g., `better-auth` as in the example) in a DRY (Don't Repeat Yourself) manner. This involves creating higher-order functions (action helpers) that wrap the core server action logic.

**Core Idea:**
Instead of repeating validation and authentication logic in every server action, we'll create two main helper functions:
1.  `validatedAction`: Wraps an action, validates its input `FormData` against a Zod schema, and provides the parsed data to the action.
2.  `validatedActionWithUser`: Extends `validatedAction` by also ensuring a user is authenticated before proceeding. It provides the parsed data and the authenticated user object to the action.

**File Structure Suggestion:**
Create a helper file, for example: `lib/action-helpers.ts`

**Step 1: Create `lib/action-helpers.ts`**

This file will contain the types and helper functions.

```typescript
// lib/action-helpers.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "better-auth"; // Placeholder: Replace with your actual User type from your auth library
import { z } from "zod";
import { auth } from "./auth"; // Placeholder: Replace with your actual auth setup
import { headers } from "next/headers";

/**
 * Represents the state of an action, including optional error and success messages.
 * This is compatible with React's useActionState hook.
 */
export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // Allows for additional custom fields in the state
};

/**
 * A function type for the core logic of a validated action (without user context).
 * @template S - Zod schema type (e.g., z.ZodObject<...>)
 * @template T - Return type of the action (should extend ActionState or be compatible)
 * @param data - Parsed and validated data from the Zod schema
 * @param formData - The original FormData object (in case it's needed for raw access)
 * @returns Promise resolving to T
 */
type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

/**
 * Wraps a server action with Zod schema validation.
 * If validation fails, it returns an object with an `error` message.
 *
 * @template S - Zod schema type.
 * @template T - Return type of the wrapped action.
 * @param schema - The Zod schema to validate the FormData against.
 * @param action - The core server action logic to execute if validation passes.
 * @returns An async function compatible with Next.js Server Actions, taking prevState and FormData.
 */
export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    // Convert FormData to a plain object for Zod parsing
    const formEntries = Object.fromEntries(formData.entries());
    const result = schema.safeParse(formEntries);

    if (!result.success) {
      // If validation fails, return the first validation error message.
      // You might want to format all errors if needed.
      return { error: result.error.errors[0].message } as T;
    }

    // If validation succeeds, execute the original action with the parsed data.
    return action(result.data, formData);
  };
}

/**
 * A function type for the core logic of a validated action that also requires an authenticated user.
 * @template S - Zod schema type.
 * @template T - Return type of the action.
 * @param data - Parsed and validated data from the Zod schema.
 * @param formData - The original FormData object.
 * @param user - The authenticated user object.
 * @returns Promise resolving to T.
 */
type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User // Placeholder: User type from your auth library
) => Promise<T>;

/**
 * Wraps a server action with user authentication and Zod schema validation.
 * Throws an error if the user is not authenticated.
 * If validation fails, it returns an object with an `error` message.
 *
 * @template S - Zod schema type.
 * @template T - Return type of the wrapped action.
 * @param schema - The Zod schema to validate the FormData against.
 * @param action - The core server action logic to execute if auth and validation pass.
 * @returns An async function compatible with Next.js Server Actions, taking prevState and FormData.
 */
export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    // --- Authentication Check ---
    // Placeholder: Adapt this to your authentication library
    const session = await auth.api.getSession({
      headers: await headers(), // Required for server-side session retrieval in Server Actions/Route Handlers
    });
    const user = session?.user;

    if (!user) {
      // If you prefer to return an error message instead of throwing:
      // return { error: "User is not authenticated" } as T;
      // However, throwing an error might be more appropriate for unauthenticated access to protected actions.
      // This error will be caught by Next.js and can be handled with an error.tsx boundary.
      throw new Error("User is not authenticated");
    }
    // --- End Authentication Check ---

    // Convert FormData to a plain object for Zod parsing
    const formEntries = Object.fromEntries(formData.entries());
    const result = schema.safeParse(formEntries);

    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    // If auth and validation succeed, execute the original action.
    return action(result.data, formData, user);
  };
}

// ---
// Note: The `better-auth` and `./auth` imports are placeholders.
// You'll need to replace them with your actual authentication library imports and setup.
// The `User` type should also come from your authentication library.
// ---
```

**Step 2: Define Zod Schemas (e.g., `lib/types.ts` or alongside actions)**

```typescript
// Example: lib/types.ts
import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const DemoSchema = z.object({
  foo: z.string(),
  bar: z.number().optional(),
});
```

**Step 3: Implement Server Actions using the Helpers (e.g., `app/actions.ts`)**

```typescript
// app/actions.ts
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { validatedAction, validatedActionWithUser, ActionState } from "@/lib/action-helpers"; // Adjust path
import { LoginSchema, SignUpSchema, DemoSchema } from "@/lib/types"; // Adjust path
import { auth } from "@/lib/auth"; // Placeholder: your auth setup

// Example 1: Action with validation only (e.g., public sign-up)
export const signUpEmail = validatedAction(SignUpSchema, async (data): Promise<ActionState> => {
  // 'data' is now typed and validated: { name: string, email: string, password: string }
  try {
    // Your sign-up logic here, e.g., call auth.api.signUpEmail
    console.log("Signing up with data:", data);
    // await auth.api.signUpEmail({ email: data.email, password: data.password, name: data.name });
    // On success:
  } catch (error) {
    console.error("Sign-up error:", error);
    return { error: error instanceof Error ? error.message : "Sign-up failed" };
  }
  redirect("/dashboard"); // Or return { success: "Account created!" };
});

// Example 2: Action with validation only (e.g., public login)
export const loginEmail = validatedAction(LoginSchema, async (data): Promise<ActionState> => {
  // 'data' is typed: { email: string, password: string }
  try {
    // Your login logic here
    console.log("Logging in with data:", data);
    // await auth.api.signInEmail({ email: data.email, password: data.password });
  } catch (error) {
    console.error("Login error:", error);
    return { error: error instanceof Error ? error.message : "Login failed" };
  }
  redirect("/dashboard");
});

// Example 3: Action requiring authentication and validation
export const authedAction = validatedActionWithUser(DemoSchema, async (data, formData, user): Promise<ActionState> => {
  // 'data' is typed: { foo: string, bar?: number }
  // 'user' is the authenticated user object (e.g., from better-auth)
  console.log(`User ${user.email} is performing an authed action with data:`, data);
  // Your action logic that requires an authenticated user
  return { success: "Authenticated action successful! Foo: " + data.foo };
});
```

**Step 4: Use in Frontend Components with `useActionState`**

```tsx
// Example: app/signup/page.tsx
"use client";

import { useActionState } from "react";
import { signUpEmail, ActionState } from "@/app/actions"; // Adjust path

const initialState: ActionState = {
  error: undefined,
  success: undefined,
};

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUpEmail, initialState);

  return (
    <form action={formAction}>
      <h2>Sign Up</h2>
      <div>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" required />
      </div>
      <div>
 знаменит-em-label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />
      </div>

      {state?.error && <p style={{ color: "red" }}>Error: {state.error}</p>}
      {state?.success && <p style={{ color: "green" }}>Success: {state.success}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Signing Up..." : "Sign Up"}
      </button>
    </form>
  );
}
```

**Key Considerations & Customization for the AI:**

1.  **Authentication Library:**
    *   The `User` type import (`import { User } from "better-auth";`) is a placeholder. Replace it with the actual User type from the project's authentication library.
    *   The authentication logic (`await auth.api.getSession(...)`) is specific to `better-auth`. Adapt this to the project's actual authentication mechanism (e.g., NextAuth.js, Clerk, Lucia Auth, custom solution). The goal is to reliably get the current user session/object on the server.
2.  **Zod Usage:** The pattern uses Zod. If a different validation library is preferred (e.g., Yup, Valibot), the `schema.safeParse` and error extraction logic will need to be adapted.
3.  **Error Handling in `validatedActionWithUser`:**
    *   Currently, if a user is not authenticated in `validatedActionWithUser`, it `throws new Error(...)`. This will typically be caught by Next.js and can be handled by an `error.tsx` boundary in the app router.
    *   Alternatively, you might want to return an error object like `{ error: "User is not authenticated" } as T;` to handle it directly in the `useActionState`'s `state` on the client, similar to validation errors. Choose the approach that best fits the application's error handling strategy.
4.  **Error Message Formatting:** The current implementation returns only the first Zod validation error (`result.error.errors[0].message`). You might want to modify this to return all errors or format them differently.
5.  **`ActionState` Flexibility:** The `[key: string]: any;` in `ActionState` allows returning custom data fields beyond just `error` and `success`. This is useful if an action needs to return specific data to the client upon completion (even if it's not a redirect).

**Benefits of this Pattern:**
*   **DRY:** Avoids repeating validation and authentication boilerplate in every server action.
*   **Type Safety:** Ensures that the `data` passed to the core action logic is correctly typed and validated. The `user` object in `validatedActionWithUser` is also guaranteed to be present.
*   **Clarity:** Separates concerns, making server actions cleaner and focused on their specific business logic.
*   **Maintainability:** Easier to update validation or authentication logic in one central place.

---

