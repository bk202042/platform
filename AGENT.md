# AGENT.md - Coding Guidelines for Platform Project

## Build Commands

- Dev server: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`
- Load data: `npm run load-data`

## Code Style Guidelines

- **TypeScript**: Strict typing required (see tsconfig.json)
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Error Handling**: Try-catch with specific error messages, use toast for user feedback
- **Imports**: Group imports by source (React, Next.js, libs, components)
- **UI Components**: Use shadcn/ui components from @/components/ui/
- **Form Validation**: Use zod with react-hook-form for form validation
- **Authentication**: Use Supabase with @supabase/ssr (NEVER @supabase/auth-helpers-nextjs)
- **API Calls**: Use fetch with proper error handling
- **CSS**: Use Tailwind classes for styling (v4)

## Architecture

- Next.js App Router with Server Components
- Supabase for backend/auth
- React Hook Form for forms
- Shadcn/UI component library
