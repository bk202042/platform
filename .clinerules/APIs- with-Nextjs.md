---
trigger: model_decision
description: Guidelines for Building APIs with Next.js
---

Covers building APIs with Next.js: App Router, Route Handlers, HTTP methods, dynamic routing, middleware, and when to use a dedicated API layer.

**1. App Router vs. Pages Router**

- **Pages Router (Legacy):** `pages/api/*`, Node.js req/res objects, Express-like.
- **App Router (Default):** `app/**/route.ts` (or `.js`), uses Web Standard Request/Response APIs.
  - **Why switch?** Simplifies learning, better cross-tool knowledge reuse.

**2. Why & When to Build APIs with Next.js**

- **Public API for Multiple Clients:** Serve web, mobile, or third-party apps (e.g., `/api/users`).
- **Proxy to Existing Backend:** Hide/consolidate external microservices. Handle auth, transform data.
- **Webhooks & Integrations:** Handle callbacks (e.g., Stripe, GitHub).
- **Custom Authentication:** Manage sessions, tokens, cookies.
- **Note:** For internal Next.js data fetching, Server Components might suffice without a separate API.

**3. Creating APIs with Route Handlers**

- **Setup:** In `app/`, create `your-route-name/route.ts`. E.g., `app/api/users/route.ts` for `/api/users`.
- **Multiple HTTP Methods:** Export async functions for `GET`, `POST`, etc., from the same `route.ts` file.

  ```typescript
  // app/api/users/route.ts
  export async function GET(request: Request) {
    const users = [{ id: 1, name: "Alice" }];
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  export async function POST(request: Request) {
    const body = await request.json();
    const newUser = { id: Date.now(), name: body.name };
    return new Response(JSON.stringify(newUser), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }
  ```

**4. Working with Web APIs**

- Route Handlers receive a standard `Request` and must return a `Response`.
- **Query Parameters:**
  ```typescript
  // app/api/search/route.ts
  import { NextRequest } from "next/server";
  export function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get("query");
    return Response.json({ result: `Searched for: ${query}` });
  }
  ```
- **Headers & Cookies:** Use `next/headers` helpers (`cookies()`, `headers()`) or standard `request.headers`.
  ```typescript
  // app/api/auth/route.ts
  import { NextRequest } from "next/server";
  import { cookies, headers } from "next/headers";
  export async function GET(request: NextRequest) {
    const token = (await cookies()).get("token");
    const referer = (await headers()).get("referer");
    const userAgent = request.headers.get("user-agent");
    return Response.json({ token, referer, userAgent });
  }
  ```
  `NextRequest` and `NextResponse` extend Web APIs.

**5. Dynamic Routes**

- Use Dynamic Segments: `app/api/users/[id]/route.ts` for `/api/users/123`.
  ```typescript
  // app/api/users/[id]/route.ts
  export async function GET(
    request: Request,
    { params }: { params: { id: string } },
  ) {
    // const id = params.id; (Corrected from original Promise<{id: string}>)
    return Response.json({ id: params.id, name: `User ${params.id}` });
  }
  ```

**6. Next.js as a Proxy (BFF)**

- Route Handlers can authenticate, log, transform, then forward requests.
  ```typescript
  // app/api/external/route.ts
  export async function GET(request: Request) {
    const response = await fetch("https://example.com/api/data", {
      headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    });
    const data = await response.json();
    return Response.json({ ...data, source: "proxied-via-nextjs" });
  }
  ```

**7. Shared "Middleware" Logic**

- Create reusable wrapper functions for auth, logging, etc.
  ```typescript
  // lib/with-auth.ts
  type Handler = (req: Request, ctx?: any) => Promise<Response>;
  export function withAuth(handler: Handler): Handler {
    return async (req, ctx) => {
      const token = req.headers.get("Authorization")?.split(" ")[1]; // Example
      if (!token)
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      return handler(req, ctx);
    };
  }
  ```
  Usage: `export const GET = withAuth(protectedGetHandler);`

**8. Deployment Considerations**

- **Standard Node.js (`next start`):** Enables Route Handlers, Server Components, etc. No extra config.
- **SPA/Static Export (`output: 'export'`):** Generates static HTML/CSS/JS. Server-side code (APIs) won't run; host API separately.
  - `GET` Route Handlers without dynamic request data can be static.
- **Vercel:** Supports Next.js APIs, offers Firewall (rate-limiting), Cron Jobs.

**9. When to Skip API Endpoints**

- If data is only for your Next.js app, Server Components can fetch directly.
  ```typescript
  // app/users/page.tsx (Server Component)
  export default async function UsersPage() {
    const res = await fetch('https://api.example.com/users'); /* server-side fetch */
    const users = await res.json();
    return <ul>{users.map((user: any) => <li key={user.id}>{user.name}</li>)}</ul>;
  }
  ```

**10. Summary Steps**

1.  `npx create-next-app@latest`.
2.  Add Route Handlers in `app/` (e.g., `app/api/users/route.ts`).
3.  Export HTTP methods (`GET`, `POST`, etc.).
4.  Use Web Standard `Request` / `Response`.
5.  Build public API if needed for external clients or proxying.
6.  Fetch from client or use Server Components for internal data.
7.  Use shared wrappers for common logic.
8.  Deploy to Node.js env for server features; static export for SPAs.

**Conclusion:** Next.js App Router offers a modern, flexible way to build APIs using Web Platform standards.

**FAQ**

- **Server Actions?** Auto-generated POST API routes for mutations, called like JS functions. For public APIs + Server Actions, move core logic to a shared Data Access Layer.
- **TypeScript?** Yes, fully supported.
