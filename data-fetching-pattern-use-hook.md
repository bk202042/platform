**Core Principles & Setup:**

1.  **Keep Data Fetching Logic on the Server:**
    *   **Why:** This is fundamental. The actual `fetch` call or database query should reside in a Server Component or a server-side utility function called by a Server Component. This leverages server-side capabilities, security (credentials aren't exposed to the client), and can reduce client-side bundle size.
    *   **How:**
        ```typescript
        // lib/data.ts (server-only or used by Server Components)
        import { cache } from 'react';

        export const getTodos = cache(async () => {
          const res = await fetch('https://jsonplaceholder.typicode.com/todos');
          if (!res.ok) throw new Error('Failed to fetch todos');
          return res.json() as Promise<Todo[]>; // Ensure it returns a Promise
        });
        ```

2.  **Pass Promises, Not Resolved Data, to Client Components:**
    *   **Why:** The `use()` hook is designed to "unwrap" a promise. If you `await` the data in the Server Component and pass the resolved data, the Client Component won't suspend, and you lose the streaming/suspense benefits.
    *   **How:**
        ```typescript
        // app/page.tsx (Server Component)
        import { getTodos } from '@/lib/data';
        import TodosListClient from '@/components/TodosListClient'; // Client Component
        import { Suspense } from 'react';

        export default function HomePage() {
          const todosPromise = getTodos(); // Pass the promise itself
          return (
            <div>
              <h1>My Todos</h1>
              <Suspense fallback={<p>Loading todos...</p>}>
                <TodosListClient todosPromise={todosPromise} />
              </Suspense>
            </div>
          );
        }
        ```

3.  **Embrace `React.Suspense`:**
    *   **Why:** `Suspense` is crucial for a good user experience. It allows you to show fallback UI (like a loading spinner or skeleton) while the Client Component is suspended waiting for the promise (passed to `use()`) to resolve.
    *   **How:** Wrap the Client Component that uses the `use(promise)` hook with a `<Suspense>` boundary.

**Performance & User Experience:**

4.  **Granular `Suspense` Boundaries:**
    *   **Why:** Instead of one large `Suspense` boundary for the whole page, use smaller, more targeted boundaries around individual components that depend on different data. This allows parts of your UI to render and become interactive progressively as their data arrives, rather than the entire page being blocked by the slowest fetch.
    *   **How:** If you have multiple independent data fetches, wrap each corresponding Client Component in its own `Suspense`.

5.  **Use `React.cache` for Server-Side Data Fetching Functions:**
    *   **Why:** If the same promise (from the same data fetching function with the same arguments) is requested multiple times during a single server render pass (e.g., in different Server Components or passed to multiple Client Components), `cache` will memoize the result, preventing redundant database queries or API calls.
    *   **How:** Wrap your server-side data fetching function with `React.cache`. (As shown in point 1).

6.  **Streaming for Optimal Perceived Performance:**
    *   **Why:** This pattern, combined with `Suspense`, enables streaming. The server can send the initial HTML shell (including static parts and `Suspense` fallbacks) immediately. Then, as data for suspended components becomes available, it's streamed to the client, and React hydrates those parts.
    *   **How:** This is largely handled by Next.js and React when you use Server Components, `Suspense`, and pass promises to Client Components using `use()`.

**Error Handling:**

7.  **Use `ErrorBoundary` Components:**
    *   **Why:** If the promise passed to `use()` rejects, it will throw, and this error needs to be caught. `ErrorBoundary` components are the React way to gracefully handle rendering errors in their child component tree.
    *   **How:** Wrap your Client Component (or a group of them) with an `ErrorBoundary`.
        ```typescript
        // In your Server Component
        import ErrorBoundary from '@/components/ErrorBoundary'; // Your custom ErrorBoundary
        // ...
        <ErrorBoundary fallback={<p>Oops! Something went wrong loading todos.</p>}>
          <Suspense fallback={<p>Loading todos...</p>}>
            <TodosListClient todosPromise={todosPromise} />
          </Suspense>
        </ErrorBoundary>
        ```

**Data Management & Component Design:**

8.  **`use()` is for Reading Initial Data, Not for Mutations or Re-fetching:**
    *   **Why:** The `use()` hook is primarily for consuming a promise during the initial render or when a promise is passed as a new prop. It doesn't have built-in mechanisms for re-fetching data based on user interactions or invalidating cache like SWR or React Query.
    *   **How:**
        *   For mutations (create, update, delete): Use Server Actions.
        *   For client-side re-fetching or more complex caching/synchronization: Consider traditional client-side data fetching libraries (SWR, React Query) *within* your Client Components, or use Server Actions with `router.refresh()` or `startTransition` for updates.

9.  **Consider Context for Widely Shared Promises (Carefully):**
    *   **Why:** If a promise needs to be accessed by many deeply nested Client Components, passing it down via props can become cumbersome (prop drilling).
    *   **How:** You can create a Context on the server, provide the promise in a Server Component, and then Client Components can consume this Context and pass the promise to `use()`.
        *   **Caution:** Ensure the Context provider itself doesn't cause unnecessary re-renders. This approach is best when the promise itself is stable for the lifetime of that part of the tree.

10. **Type Safety with TypeScript:**
    *   **Why:** Improves developer experience, catches errors early, and makes your code more maintainable.
    *   **How:** Define clear types for the promise you're passing and the data it resolves to.
        ```typescript
        // lib/types.ts
        export interface Todo {
          userId: number;
          id: number;
          title: string;
          completed: boolean;
        }

        // components/TodosListClient.tsx
        'use client';
        import { use } from 'react';
        import type { Todo } from '@/lib/types';

        interface TodosListClientProps {
          todosPromise: Promise<Todo[]>;
        }

        export default function TodosListClient({ todosPromise }: TodosListClientProps) {
          const todos: Todo[] = use(todosPromise);
          // ...
        }
        ```

**When to Consider Alternatives:**

11. **Purely Client-Side Fetches:**
    *   If the data is only needed on the client and doesn't benefit from server pre-fetching or SSR (e.g., user-specific settings loaded after login, real-time updates), traditional client-side fetching with `useEffect` or libraries like SWR/React Query might be simpler and more appropriate.

12. **Very Simple Static Data:**
    *   If the data is truly static and known at build time, you might not even need this pattern; consider `getStaticProps` (in the `pages` router) or simply importing JSON/JS data directly if using the `app` router and the data can be part of the bundle.

By following these best practices, you can build performant, resilient, and user-friendly applications with Next.js and React's new data fetching capabilities.
