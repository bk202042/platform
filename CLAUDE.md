# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# important

## 1. Keep It Simple
Always choose the simplest, most lightweight solution that fully meets the requirements.

## 2. Design for Performance (Without Premature Optimization)
Consider performance from the start, but never at the cost of clarity or maintainability.

## 3. Write Clean, Maintainable Code
Prioritize readability, consistency, and clarity. Apply clean code principles and proven design patterns.

## 4. Make Minimal, Targeted Changes
Keep code changes as small and isolated as possible. Only touch what’s necessary.

## 5. Fix the Root Cause—Always
Never apply temporary fixes. Always diagnose and solve the underlying problem.

## 6. Never Compromise on Quality
Don’t cut corners. Don’t be lazy. Act like a senior engineer at all times.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Common Development Commands

### Build and Development
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `tsx scripts/load-property-data.ts` - Load property data script

### Testing
- No test framework currently configured - check with user before assuming test approach

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS v4.1.4 (zinc color theme)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: Supabase (PostgreSQL, PostGIS, Authentication)
- **Database**: Feature-rich with Vietnamese locations, apartments, communities
- **Fonts**: Noto Sans KR for Korean language support

### Project Structure
- **Feature-based organization** under `/app` with route groups
- **Shared components** in `/components` organized by domain (ui, layout, auth, property, community)
- **Data access layer** in `/lib/data/` - always use these functions instead of direct database queries
- **Supabase clients** in `/lib/supabase/` (server.ts for SSR, client.ts for client-side)
- **Type definitions** in `/lib/types/` (property.ts, community.ts, database.ts)
- **Validation schemas** in `/lib/validation/` using Zod

### Core Features
1. **Property Platform**: Search, listings, details for Vietnamese properties targeted at Korean expatriates
2. **Community System**: Location-based posts with comments, likes, image uploads
3. **Authentication**: Supabase Auth with Google OAuth
4. **Vietnamese Locations**: Cities (Hanoi, Ho Chi Minh, Da Nang) with apartment data

### Data Access Patterns
- **Always use data access functions** from `/lib/data/` - never write direct database queries
- **Server-side**: Use `createClient()` for authenticated operations, `createAnonClient()` for public data
- **Client-side**: Import from `/lib/supabase/client.ts`
- **Caching**: Property listings cached for 1 minute, details for 5 minutes using `unstable_cache`

### Image Management
- **Property images**: Stored in 'platform' bucket, processed with public URLs
- **Community images**: Stored in 'community-images' bucket with validation, metadata extraction
- **Upload patterns**: Use established upload hooks and validation functions

### Authentication Flow
- **Middleware**: `/middleware.ts` handles session refresh for all routes
- **Auth helpers**: Use functions from `/lib/auth/server.ts`
- **Protected routes**: Wrap with `AuthGuard` component or check auth in server components

### Database Schema Key Points
- **Properties**: `property_listings` table with separate `property_images` table
- **Community**: `community_posts`, `community_comments`, `community_likes`, `community_post_images`
- **Locations**: `cities` and `apartments` tables with proper relationships
- **Users**: `profiles` table linked to Supabase auth.users

### Component Patterns
- **Server Components**: Default for data fetching, use data access layer
- **Client Components**: Suffixed with `.client.tsx`, handle interactivity
- **Lazy Loading**: Use `LazyLoad` component from `/components/common/`
- **Error Boundaries**: Implement for user-facing error handling

### Styling Guidelines
- **Tailwind CSS v4.1.4**: Latest version with zinc color palette
- **Component variants**: Use `class-variance-authority` for component variants
- **Responsive**: Mobile-first approach with proper breakpoints

### Key Development Notes
- **Korean language support**: UI text primarily in Korean, metadata extraction for Korean content
- **Vietnamese location data**: Comprehensive apartment/city data for major Vietnamese cities
- **Performance**: Optimized with caching, lazy loading, and proper image handling
- **Security**: RLS policies on all tables, proper authentication checks
