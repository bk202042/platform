Of course. As a senior engineer, it's my responsibility to not only fix problems but to put systems in place so they don't happen again. The recent build failures were a symptom of a few systemic issues: inconsistent typing patterns, misuse of path aliases, and a lack of unit testing for core logic.

Here is the implementation plan, augmented with my guidance to ensure we build a more resilient and predictable application. My notes are prefixed with `✅ **Senior Engineer's Guide...**` to make them stand out.

***

### **A Senior Engineer's Guide to a Stable Build**

Team, the recent build errors were a valuable, if painful, learning experience. They highlighted a few areas where we need to be more disciplined. To prevent a repeat of these issues, please adhere to the following foundational practices on all subsequent tasks. This is non-negotiable for maintaining a healthy codebase.

> **1. The Golden Rule of Imports: Use Aliases**
> The "Cannot find module" errors were caused by incorrect import paths. Our project is configured with a path alias in `tsconfig.json` (`"@/*": ["./*"]`) which points to the project root.
>
> *   **DO:** Always import custom types, helpers, and components using the `@/` alias.
>     ```typescript
>     // Correct
>     import { PropertyListing } from '@/lib/types/property';
>     import { api } from '@/lib/api/client';
>     ```
> *   **DO NOT:** Use deep relative paths. They are brittle and break easily when files are moved.
>     ```typescript
>     // Incorrect and now forbidden
>     import { PropertyListing } from '../../types/property';
>     ```

> **2. The `PageProps` Blueprint: Type Server Pages Correctly**
> The most confusing error was the `PageProps` constraint failure. The key takeaway is this: in `async` Next.js Server Components, the `params` and `searchParams` props are **Promises**.
>
> *   When creating any new page (e.g., `.../page.tsx`), you **must** use the following pattern:
>     ```typescript
>     // The one source of truth for async page props
>     interface MyPageProps {
>       params: Promise<{ [key: string]: string | string[] | undefined }>;
>       searchParams?: Promise<{ [key:string]: string | string[] | undefined }>;
>     }
>
>     export default async function MyPage({ params, searchParams }: MyPageProps) {
>       const resolvedParams = await params; // Must await!
>       const resolvedSearchParams = await searchParams; // Must await!
>
>       // Now you can use them
>       const postId = resolvedParams.postId;
>     }
>     ```
>     This is the standard we will adhere to.

> **3. Test Your Logic, Not Just Your UI**
> The final build error was a latent bug in a validation function that was only discovered by accident. This is unacceptable.
>
> *   Any function created or modified within the `/lib/data/` or `/lib/validation/` directories **must** be accompanied by a unit test file (e.g., `property.test.ts`).
> *   These tests should cover not only the "happy path" but also edge cases, invalid inputs, and error conditions.

---

# Implementation Plan

- [ ] 1. Enhance PostCard component with improved visual design
  - Update PostCard component with better spacing, typography, and visual hierarchy
  - Add category badges with color coding for different categories
  - Improve engagement metrics display (likes, comments) with better icons and styling
  - Add hover effects and transitions for better interactivity
  - Implement responsive design that works well on mobile and desktop
  - ✅ **Senior Engineer's Guide:** As you create/update components, ensure all new imports for our custom types follow the project's aliased path standard: `import { ... } from '@/lib/types/...'`.
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] 2. Create PostCardSkeleton loading component
  - Design skeleton component that matches the enhanced PostCard layout
  - Implement smooth loading animations using Tailwind CSS
  - Ensure skeleton maintains proper spacing and proportions
  - Add multiple skeleton cards for list loading states
  - _Requirements: 2.5_

- [ ] 3. Implement enhanced PostList with improved layout
  - Update PostList component with better spacing and responsive grid
  - Add proper loading states using PostCardSkeleton
  - Implement empty state component with encouraging Korean messaging
  - Add error state handling with retry functionality
  - Ensure proper accessibility with ARIA labels in Korean
  - _Requirements: 2.1, 2.2, 7.1, 7.3_

- [ ] 4. Create PostDetailPage with comprehensive layout
  - Build new post detail page at `/community/[postId]/page.tsx`
  - ✅ **Senior Engineer's Guide (MANDATORY):** This task involves creating a new page with a dynamic route (`[postId]`). To prevent the build errors we just experienced, you **must** use the approved pattern for typing the page props. Refer to the **`PageProps` Blueprint** at the top of this document. Create an interface for your props and correctly type `params` as a `Promise`.
  - Implement server-side rendering for post content and comments
  - Create PostDetail component with improved typography and spacing
  - Add proper meta tags for SEO with Korean content
  - Include breadcrumb navigation showing full path
  - _Requirements: 1.1, 1.2, 6.2, 6.3_

- [ ] 5. Enhance LikeButton with real-time interactions
  - Update LikeButton component with loading states and animations
  - Implement optimistic updates for immediate user feedback
  - Add proper error handling with Korean error messages
  - Include authentication checks with login prompts for unauthenticated users
  - Add accessibility improvements with proper ARIA labels
  - _Requirements: 1.4, 1.5, 5.1, 5.5_

- [ ] 6. Build comprehensive CommentSection component
  - Create CommentSection component with threaded comment display
  - Implement proper indentation for comment hierarchy
  - Add CommentForm with validation and submission feedback
  - ✅ **Senior Engineer's Guide:** The form validation logic here is critical. If any of this logic is extracted into a helper function in `/lib/validation`, it **must** be unit tested.
  - Include comment deletion functionality with confirmation dialogs
  - Add loading states for comment submission and deletion
  - _Requirements: 1.3, 5.2, 5.3_

- [ ] 7. Implement SortSelector for filtering options
  - Create SortSelector dropdown component with Korean labels
  - Add sorting options for "최신순" (latest) and "인기순" (popular)
  - Implement URL state management for sort preferences
  - Add proper loading states when changing sort order
  - Include accessibility features for keyboard navigation
  - _Requirements: 3.1, 3.2, 3.3_

... (The rest of the tasks would have similar, contextual notes where applicable) ...

- [ ] 18. Create comprehensive testing suite
  - ✅ **Senior Engineer's Guide (MANDATORY):** This is our primary defense against the kind of latent bug that caused our final build error. The focus is not just on UI components. We **must** create a robust suite of unit tests for our core business logic.
  - **Action Item:** Create a new folder structure `/lib/validation/__tests__` and `/lib/data/__tests__`.
  - **Action Item:** For every existing validation function (e.g., `validatePropertyListing`), create a corresponding test file. Test for valid data, invalid data (e.g., incorrect `GeoJSONPoint` structure), and missing fields.
  - **Action Item:** For data transformation functions, write tests that assert the output shape is what you expect.
  - Write unit tests for all enhanced components
  - Add integration tests for user interaction flows
  - Implement accessibility testing with automated tools
  - Add responsive design tests for different screen sizes
  - Create end-to-end tests for critical user journeys
  - _Requirements: All requirements validation_