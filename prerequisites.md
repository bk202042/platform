## Database Create Migration (docs/database-create-migration.md)

---
description: Guidelines for writing Postgres migrations
globs: supabase/migrations/**/*.sql
alwaysApply: false
---

# Database: Create migration

You are a Postgres Expert who loves creating secure database schemas.

This project uses the migrations provided by the Supabase CLI.

## Creating a migration file

Given the context of the user's message, create a database migration file inside the folder `supabase/migrations/`.

The file MUST following this naming convention:

The file MUST be named in the format `YYYYMMDDHHmmss_short_description.sql` with proper casing for months, minutes, and seconds in UTC time:

1. `YYYY` - Four digits for the year (e.g., `2024`).
2. `MM` - Two digits for the month (01 to 12).
3. `DD` - Two digits for the day of the month (01 to 31).
4. `HH` - Two digits for the hour in 24-hour format (00 to 23).
5. `mm` - Two digits for the minute (00 to 59).
6. `ss` - Two digits for the second (00 to 59).
7. Add an appropriate description for the migration.

For example:

```
20240906123045_create_profiles.sql
```

## SQL Guidelines

Write Postgres-compatible SQL code for Supabase migration files that:

- Includes a header comment with metadata about the migration, such as the purpose, affected tables/columns, and any special considerations.
- Includes thorough comments explaining the purpose and expected behavior of each migration step.
- Write all SQL in lowercase.
- Add copious comments for any destructive SQL commands, including truncating, dropping, or column alterations.
- When creating a new table, you MUST enable Row Level Security (RLS) even if the table is intended for public access.
- When creating RLS Policies
  - Ensure the policies cover all relevant access scenarios (e.g. select, insert, update, delete) based on the table's purpose and data sensitivity.
  - If the table is intended for public access the policy can simply return `true`.
  - RLS Policies should be granular: one policy for `select`, one for `insert` etc) and for each supabase role (`anon` and `authenticated`). DO NOT combine Policies even if the functionality is the same for both roles.
  - Include comments explaining the rationale and intended behavior of each security policy

The generated SQL code should be production-ready, well-documented, and aligned with Supabase's best practices.

## Database Functions (docs/database-functions.md)

---
description: Guidelines for writing Supabase database functions
globs: **/*.sql
alwaysApply: false
---

# Database: Create functions

You're a Supabase Postgres expert in writing database functions. Generate **high-quality PostgreSQL functions** that adhere to the following best practices:

## General Guidelines

1. **Default to `SECURITY INVOKER`:**

   - Functions should run with the permissions of the user invoking the function, ensuring safer access control.
   - Use `SECURITY DEFINER` only when explicitly required and explain the rationale.

2. **Set the `search_path` Configuration Parameter:**

   - Always set `search_path` to an empty string (`set search_path = '';`).
   - This avoids unexpected behavior and security risks caused by resolving object references in untrusted or unintended schemas.
   - Use fully qualified names (e.g., `schema_name.table_name`) for all database objects referenced within the function.

## Best Practices

1. **Minimize Side Effects:**

   - Prefer functions that return results over those that modify data unless they serve a specific purpose (e.g., triggers).

2. **Use Explicit Typing:**

   - Clearly specify input and output types, avoiding ambiguous or loosely typed parameters.

3. **Default to Immutable or Stable Functions:**

   - Where possible, declare functions as `IMMUTABLE` or `STABLE` to allow better optimization by PostgreSQL. Use `VOLATILE` only if the function modifies data or has side effects.

4. **Triggers (if Applicable):**
   - If the function is used as a trigger, include a valid `CREATE TRIGGER` statement that attaches the function to the desired table and event (e.g., `BEFORE INSERT`).

## Example Templates

### Simple Function with `SECURITY INVOKER`

```sql
create or replace function my_schema.hello_world()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return 'hello world';
$$;
```

### Function with Parameters and Fully Qualified Object Names

```sql
create or replace function public.calculate_total_price(order_id bigint)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  total numeric;
begin
  select sum(price * quantity)
  into total
  from public.order_items
  where order_id = calculate_total_price.order_id;

  return total;
end;
$$;
```

### Function as a Trigger

```sql
create or replace function my_schema.update_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Update the "updated_at" column on row modification
  new.updated_at := now();
  return new;
end;
$$;

create trigger update_updated_at_trigger
before update on my_schema.my_table
for each row
execute function my_schema.update_updated_at();
```

### Function with Error Handling

```sql
create or replace function my_schema.safe_divide(numerator numeric, denominator numeric)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if denominator = 0 then
    raise exception 'Division by zero is not allowed';
  end if;

  return numerator / denominator;
end;
$$;
```

### Immutable Function for Better Optimization

```sql
create or replace function my_schema.full_name(first_name text, last_name text)
returns text
language sql
security invoker
set search_path = ''
immutable
as $$
  select first_name || ' ' || last_name;
$$;
```

## Database RLS Policies (docs/database-rls-policies.md)

---
description: Guidelines for writing Postgres Row Level Security policies
globs: **/*.sql
alwaysApply: false
---

# Database: Create RLS policies

You're a Supabase Postgres expert in writing row level security policies. Your purpose is to generate a policy with the constraints given by the user. You should first retrieve schema information to write policies for, usually the 'public' schema.

The output should use the following instructions:

- The generated SQL must be valid SQL.
- You can use only CREATE POLICY or ALTER POLICY queries, no other queries are allowed.
- Always use double apostrophe in SQL strings (eg. 'Night''s watch')
- You can add short explanations to your messages.
- The result should be a valid markdown. The SQL code should be wrapped in ``` (including sql language tag).
- Always use "auth.uid()" instead of "current_user".
- SELECT policies should always have USING but not WITH CHECK
- INSERT policies should always have USING but not WITH CHECK
- UPDATE policies should always have USING and most often have USING
- DELETE policies should always have USING but not WITH CHECK
- Don't use `FOR ALL`. Instead separate into 4 separate policies for select, insert, update, and delete.
- The policy name should be short but detailed text explaining the policy, enclosed in double quotes.
- Always put explanations as separate text. Never use inline SQL comments.
- If the user asks for something that's not related to SQL policies, explain to the user
  that you can only help with policies.
- Discourage `RESTRICTIVE` policies and encourage `PERMISSIVE` policies, and explain why.

The output should look like this:

```sql
CREATE POLICY "My descriptive policy." ON books FOR INSERT to authenticated USING ( (select auth.uid()) = author_id ) WITH ( true );
```

Since you are running in a Supabase environment, take note of these Supabase-specific additions below.

## Authenticated and unauthenticated roles

Supabase maps every request to one of the roles:

- `anon`: an unauthenticated request (the user is not logged in)
- `authenticated`: an authenticated request (the user is logged in)

These are actually [Postgres Roles](mdc:docs/guides/database/postgres/roles). You can use these roles within your Policies using the `TO` clause:

```sql
create policy "Profiles are viewable by everyone"
on profiles
for select
to authenticated, anon
using ( true );

-- OR

create policy "Public profiles are viewable only by authenticated users"
on profiles
for select
to authenticated
using ( true );
```

Note that `for ...` must be added after the table but before the roles. `to ...` must be added after `for ...`:

### Incorrect

```sql
create policy "Public profiles are viewable only by authenticated users"
on profiles
to authenticated
for select
using ( true );
```

### Correct

```sql
create policy "Public profiles are viewable only by authenticated users"
on profiles
for select
to authenticated
using ( true );
```

## Multiple operations

PostgreSQL policies do not support specifying multiple operations in a single FOR clause. You need to create separate policies for each operation.

### Incorrect

```sql
create policy "Profiles can be created and deleted by any user"
on profiles
for insert, delete -- cannot create a policy on multiple operators
to authenticated
with check ( true )
using ( true );
```

### Correct

```sql
create policy "Profiles can be created by any user"
on profiles
for insert
to authenticated
using ( true );

create policy "Profiles can be deleted by any user"
on profiles
for delete
to authenticated
using ( true );
```

## Helper functions

Supabase provides some helper functions that make it easier to write Policies.

### `auth.uid()`

Returns the ID of the user making the request.

### `auth.jwt()`

Returns the JWT of the user making the request. Anything that you store in the user's `raw_app_meta_data` column or the `raw_user_meta_data` column will be accessible using this function. It's important to know the distinction between these two:

- `raw_user_meta_data` - can be updated by the authenticated user using the `supabase.auth.update()` function. It is not a good place to store authorization data.
- `raw_app_meta_data` - cannot be updated by the user, so it's a good place to store authorization data.

The `auth.jwt()` function is extremely versatile. For example, if you store some team data inside `app_metadata`, you can use it to determine whether a particular user belongs to a team. For example, if this was an array of IDs:

```sql
create policy "User is in team"
on my_table
to authenticated
using ( team_id in (select auth.jwt() -> 'app_metadata' -> 'teams'));
```

### MFA

The `auth.jwt()` function can be used to check for [Multi-Factor Authentication](mdc:docs/guides/auth/auth-mfa#enforce-rules-for-mfa-logins). For example, you could restrict a user from updating their profile unless they have at least 2 levels of authentication (Assurance Level 2):

```sql
create policy "Restrict updates."
on profiles
as restrictive
for update
to authenticated using (
  (select auth.jwt()->>'aal') = 'aal2'
);
```

## RLS performance recommendations

Every authorization system has an impact on performance. While row level security is powerful, the performance impact is important to keep in mind. This is especially true for queries that scan every row in a table - like many `select` operations, including those using limit, offset, and ordering.

Based on a series of [tests](mdc:https:/github.com/GaryAustin1/RLS-Performance), we have a few recommendations for RLS:

### Add indexes

Make sure you've added [indexes](mdc:docs/guides/database/postgres/indexes) on any columns used within the Policies which are not already indexed (or primary keys). For a Policy like this:

```sql
create policy "Users can access their own records" on test_table
to authenticated
using ( (select auth.uid()) = user_id );
```

You can add an index like:

```sql
create index userid
on test_table
using btree (user_id);
```

### Call functions with `select`

You can use `select` statement to improve policies that use functions. For example, instead of this:

```sql
create policy "Users can access their own records" on test_table
to authenticated
using ( auth.uid() = user_id );
```

You can do:

```sql
create policy "Users can access their own records" on test_table
to authenticated
using ( (select auth.uid()) = user_id );
```

This method works well for JWT functions like `auth.uid()` and `auth.jwt()` as well as `security definer` Functions. Wrapping the function causes an `initPlan` to be run by the Postgres optimizer, which allows it to "cache" the results per-statement, rather than calling the function on each row.

Caution: You can only use this technique if the results of the query or function do not change based on the row data.

### Minimize joins

You can often rewrite your Policies to avoid joins between the source and the target table. Instead, try to organize your policy to fetch all the relevant data from the target table into an array or set, then you can use an `IN` or `ANY` operation in your filter.

For example, this is an example of a slow policy which joins the source `test_table` to the target `team_user`:

```sql
create policy "Users can access records belonging to their teams" on test_table
to authenticated
using (
  (select auth.uid()) in (
    select user_id
    from team_user
    where team_user.team_id = team_id -- joins to the source "test_table.team_id"
  )
);
```

We can rewrite this to avoid this join, and instead select the filter criteria into a set:

```sql
create policy "Users can access records belonging to their teams" on test_table
to authenticated
using (
  team_id in (
    select team_id
    from team_user
    where user_id = (select auth.uid()) -- no join
  )
);
```

### Specify roles in your policies

Always use the Role of inside your policies, specified by the `TO` operator. For example, instead of this query:

```sql
create policy "Users can access their own records" on rls_test
using ( auth.uid() = user_id );
```

Use:

```sql
create policy "Users can access their own records" on rls_test
to authenticated
using ( (select auth.uid()) = user_id );
```

This prevents the policy `( (select auth.uid()) = user_id )` from running for any `anon` users, since the execution stops at the `to authenticated` step.

## Edge Functions (docs/edge-functions.md)

---
description: Coding rules for Supabase Edge Functions
globs: supabase/functions/**/*.ts
alwaysApply: false
---

# Writing Supabase Edge Functions

You're an expert in writing TypeScript and Deno JavaScript runtime. Generate **high-quality Supabase Edge Functions** that adhere to the following best practices:

## Guidelines

1. Try to use Web APIs and Deno’s core APIs instead of external dependencies (eg: use fetch instead of Axios, use WebSockets API instead of node-ws)
2. If you are reusing utility methods between Edge Functions, add them to `supabase/functions/_shared` and import using a relative path. Do NOT have cross dependencies between Edge Functions.
3. Do NOT use bare specifiers when importing dependecnies. If you need to use an external dependency, make sure it's prefixed with either `npm:` or `jsr:`. For example, `@supabase/supabase-js` should be written as `npm:@supabase/supabase-js`.
4. For external imports, always define a version. For example, `npm:@express` should be written as `npm:express@4.18.2`.
5. For external dependencies, importing via `npm:` and `jsr:` is preferred. Minimize the use of imports from @`deno.land/x` , `esm.sh` and @`unpkg.com` . If you have a package from one of those CDNs, you can replace the CDN hostname with `npm:` specifier.
6. You can also use Node built-in APIs. You will need to import them using `node:` specifier. For example, to import Node process: `import process from "node:process". Use Node APIs when you find gaps in Deno APIs.
7. Do NOT use `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"`. Instead use the built-in `Deno.serve`.
8. Following environment variables (ie. secrets) are pre-populated in both local and hosted Supabase environments. Users don't need to manually set them:
	* SUPABASE_URL
	* SUPABASE_ANON_KEY
	* SUPABASE_SERVICE_ROLE_KEY
	* SUPABASE_DB_URL
9. To set other environment variables (ie. secrets) users can put them in a env file and run the `supabase secrets set --env-file path/to/env-file`
10. A single Edge Function can handle multiple routes. It is recommended to use a library like Express or Hono to handle the routes as it's easier for developer to understand and maintain. Each route must be prefixed with `/function-name` so they are routed correctly.
11. File write operations are ONLY permitted on `/tmp` directory. You can use either Deno or Node File APIs.
12. Use `EdgeRuntime.waitUntil(promise)` static method to run long-running tasks in the background without blocking response to a request. Do NOT assume it is available in the request / execution context.

## Example Templates

### Simple Hello World Function

```tsx
interface reqPayload {
	name: string;
}

console.info('server started');

Deno.serve(async (req: Request) => {
	const { name }: reqPayload = await req.json();
	const data = {
		message: `Hello ${name} from foo!`,
	};

	return new Response(
		JSON.stringify(data),
		{ headers: { 'Content-Type': 'application/json', 'Connection': 'keep-alive' }}
		);
});

```

### Example Function using Node built-in API

```tsx
import { randomBytes } from "node:crypto";
import { createServer } from "node:process";
import process from "node:process";

const generateRandomString = (length) => {
    const buffer = randomBytes(length);
    return buffer.toString('hex');
};

const randomString = generateRandomString(10);
console.log(randomString);

const server = createServer((req, res) => {
    const message = `Hello`;
    res.end(message);
});

server.listen(9999);
```

### Using npm packages in Functions

```tsx
import express from "npm:express@4.18.2";

const app = express();

app.get(/(.*)/, (req, res) => {
    res.send("Welcome to Supabase");
});

app.listen(8000);
```

### Generate embeddings using built-in @Supabase.ai API

```tsx
const model = new Supabase.ai.Session('gte-small');

Deno.serve(async (req: Request) => {
	const params = new URL(req.url).searchParams;
	const input = params.get('text');
	const output = await model.run(input, { mean_pool: true, normalize: true });
	return new Response(
		JSON.stringify(
			output,
		),
		{
			headers: {
				'Content-Type': 'application/json',
				'Connection': 'keep-alive'
			},
		},
	);
});

```

## Next.js Supabase Auth (docs/nextjs-supabase-auth.md)

---
description: uidelines for writing Next.js apps with Supabase Auth
globs: **/*.ts, **/*.tsx, **/*.js, **/*.jsx
alwaysApply: false
---

# Bootstrap Next.js app with Supabase Auth

## Overview of implementing Supabase Auth SSR

1. Install @supabase/supabase-js and @supabase/ssr packages.
2. Set up environment variables.
3. Write two utility functions with `createClient` functions to create a browser client and a server client.
4. Hook up middleware to refresh auth tokens

## 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨

As an AI language model, you MUST NOT generate any of the following code patterns, as they are DEPRECATED and will BREAK the application:

```typescript
// ❌ NEVER GENERATE THIS CODE - IT WILL BREAK THE APPLICATION
{
  cookies: {
    get(name: string) {                 // ❌ BREAKS APPLICATION
      return cookieStore.get(name)      // ❌ BREAKS APPLICATION
    },                                  // ❌ BREAKS APPLICATION
    set(name: string, value: string) {  // ❌ BREAKS APPLICATION
      cookieStore.set(name, value)      // ❌ BREAKS APPLICATION
    },                                  // ❌ BREAKS APPLICATION
    remove(name: string) {              // ❌ BREAKS APPLICATION
      cookieStore.remove(name)          // ❌ BREAKS APPLICATION
    }                                   // ❌ BREAKS APPLICATION
  }
}

// ❌ NEVER USE auth-helpers-nextjs - IT WILL BREAK THE APPLICATION
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'  // ❌ BREAKS APPLICATION
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'  // ❌ BREAKS APPLICATION
```

Instead, you MUST ALWAYS generate ONLY this pattern:

```typescript
// ✅ ALWAYS GENERATE THIS EXACT PATTERN
{
  cookies: {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      const response = NextResponse.next({
        request,
      })

      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      return response
    }
  }
}
```

## ABSOLUTE REQUIREMENTS FOR AI CODE GENERATION

1. You MUST use `@supabase/ssr`
2. You MUST use ONLY `getAll` and `setAll`
3. You MUST NEVER use `get`, `set`, or `remove`
4. You MUST NEVER import from `@supabase/auth-helpers-nextjs`

## CORRECT BROWSER CLIENT IMPLEMENTATION

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ANON_KEY!
  )
}
```

## CORRECT SERVER CLIENT IMPLEMENTATION

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ANON_KEY!,
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
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

## CORRECT MIDDLEWARE IMPLEMENTATION

```typescript
import { createServerClient from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## AI MODEL VERIFICATION STEPS

Before generating any code, you MUST verify:

1. Are you using ONLY `getAll` and `setAll`? If not, STOP and FIX.
2. Are you importing from `@supabase/ssr`? If not, STOP and FIX.
3. Do you see ANY instance of `get`, `set`, or `remove`? If yes, STOP and FIX.
4. Are you importing from `auth-helpers-nextjs`? If yes, STOP and FIX.

## CONSEQUENCES OF INCORRECT IMPLEMENTATION

If you generate code using:
- Individual cookie methods (`get`/`set`/`remove`)
- `auth-helpers-nextjs` package

The implementation will:
1. Break in production
2. Fail to maintain session state
3. Cause authentication loops
4. Result in security vulnerabilities

## AI MODEL RESPONSE TEMPLATE

When asked about Supabase Auth SSR implementation, you MUST:
1. ONLY use code from this guide
2. NEVER suggest deprecated approaches
3. ALWAYS use the exact cookie handling shown above
4. VERIFY your response against the patterns shown here

Remember: There are NO EXCEPTIONS to these rules.

## Project Structure Rule (docs/project structure rule.md)

# Next.js Project Structure Best Practices (App Router)

* **Sources:**
    * Video: ["This Folder Structure Makes Me 100% More Productive"](https://www.youtube.com/watch?v=xyxrB2Aa7KE)
    * Guide: "Building APIs with Next.js" (by Lee Robinson)
* **Diagrams (Conceptual - see video for visual examples):** Focus on separating by feature vs. type.

## Core Principle: Organize by Feature (Vertical Slicing), Not by Type

Avoid organizing code purely by its *type* (e.g., `components/`, `actions.ts`, `utils/`). This becomes unmanageable as applications grow.

**The recommended approach is to organize code primarily by *feature* or *domain*.** Group files related to a specific piece of functionality (UI, logic, data, API) together.

## Recommended Structure & Guidelines:

1.  **`app/` Directory (App Router Core):**
    * Central place for UI routes, layouts, and *co-located API routes*.
    * **Route Groups (`(groupName)`)**:
        * **Purpose:** Organize UI routes logically *without affecting the URL path*. Group app sections (e.g., `(main)` for public, `(auth)` for auth, `(admin)` for admin).
        * **Benefits:** Apply specific layouts (`layout.tsx`), loading states (`loading.tsx`), or error boundaries (`error.tsx`) to entire sections. Create multiple root layouts if needed.
    * **Feature/Route Folders:** Within `app` or a route group, create folders for specific UI features or pages (e.g., `app/(main)/settings`, `app/(main)/free-tutorials`, `app/(admin)/courses`).

2.  **Co-location within UI Feature Folders (`app/...`):**
    * **Standard UI Files:** `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` as per conventions.
    * **Feature-Specific Components (`_components/`)**:
        * **Use Private Folders:** Prefix with `_` to prevent routing.
        * Place components *only* used within that specific UI feature/route segment here (e.g., `app/(main)/settings/_components/SettingsForm.tsx`). Keeps UI logic close.
    * **Feature-Specific Client Logic/Hooks (`_lib/`, `_hooks/`, `_utils/`)**:
        * Use private folders for hooks or utilities specific *only* to this UI feature's client-side needs.
    * **Server Actions (`actions.ts`)**:
        * Place `actions.ts` files containing Server Actions directly within the UI route folder they primarily serve (e.g., `app/(main)/settings/actions.ts` for `updateUserSettings`). Server Actions are tightly coupled to UI interactions for mutations.
        * **Important:** Core business logic called by Server Actions should ideally reside in the Data Access Layer (see point 5) for reusability with API Routes if needed.

3.  **API Routes (`app/api/...` Recommended):**
    * **Placement:** While `route.ts` files *can* be anywhere, consolidating API endpoints under a dedicated `app/api/` directory often improves clarity, especially for public-facing or shared APIs. Organize *within* `app/api/` by feature/resource.
        * **Example:** `app/api/users/route.ts`, `app/api/users/[id]/route.ts`, `app/api/courses/route.ts`, `app/api/webhooks/stripe/route.ts`.
    * **Route Handlers (`route.ts`)**:
        * Use `route.ts` (or `.js`) files to define API endpoints.
        * Export named functions for HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, etc.) from the *same file*.
        * **Web Standards:** Use standard `Request` and `Response` objects (or `NextRequest`/`NextResponse` for Next.js extensions like easy cookie/header access or URL manipulation).
        * **Dynamic Routes:** Use dynamic segments (`[paramName]`) in folder names (e.g., `app/api/users/[id]/route.ts`). Access parameters via the second argument: `({ params }: { params: { id: string } })`.
    * **Interaction with DAL:** Route Handlers should primarily handle HTTP request/response logic (parsing body/params, setting status/headers) and then call functions from the Data Access Layer (point 5) to perform the actual data operations.
    * **Use Cases:** Building public APIs (for web/mobile/third-parties), proxying backend services (BFF pattern), handling webhooks, implementing custom authentication flows.

4.  **Shared UI Components (`components/` at Root or `src/components/`):**
    * **Purpose:** For *truly* reusable, generic UI primitives or layout elements used across *multiple unrelated features*.
    * **Examples:** Base `Button`, `Card`, `Dialog`, `Input`, `Avatar`, `Skeleton`, global `Header`/`Footer` (if not tied to a specific Route Group layout).
    * **Organization:** Subdivide as needed (`components/ui/`, `components/layout/`).
    * **Avoid Dumping:** If a component belongs to a single feature, co-locate it (`_components`).

5.  **Data Access Layer (DAL) (`lib/data/` or `src/lib/data/`):**
    * **Purpose:** Centralize *all* interactions with your data sources (database, external APIs). Crucial for consistency and maintainability.
    * **Organization:** Group functions by the *data resource* or *domain* (e.g., `lib/data/user.ts` containing `getUserById`, `updateUserEmail`, etc.; `lib/data/course.ts` containing `getCourses`, `getCourseBySlug`).
    * **Separation:** Keep data logic *out* of UI components and API Route Handlers. Both Server Components and Route Handlers should call functions from the DAL.
    * **Use `server-only`:** Mark *all* files in the DAL with `import server-only`;` at the top. This guarantees they only run on the server, protecting

## Supabase Database Setup (docs/supabase_setup.md)

# Supabase Database Setup

This document explains the database setup for the Trulia Clone project using Supabase.

## Overview

The project uses Supabase for database, authentication, and storage. We've implemented a direct approach using the Supabase client for database operations, which provides better compatibility and reliability compared to using an ORM.

## Database Connection

The database connection is established using the Supabase client in `lib/dal/db.ts`. This file exports:

1. `supabaseClient` - For client-side operations (using anon key)
2. `supabaseAdmin` - For server-side operations (using service role key)
3. Helper functions

## Package.json

```json
{
  "name": "platform",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "list": "node scripts/dev.js list",
    "generate": "node scripts/dev.js generate",
    "parse-prd": "node scripts/dev.js parse-prd"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "15.3.0",
    "@anthropic-ai/sdk": "^0.39.
