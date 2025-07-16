# Technology Stack & Development Guide

## Core Technologies

### Frontend Stack
- **Next.js 15.3.1** - React framework with App Router, SSR/SSG
- **React 19.0.0** - Component-based UI library
- **TypeScript 5.8.3** - Type-safe JavaScript with strict mode
- **Tailwind CSS 4.1.4** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library (New York style)

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication with Google OAuth
- **Supabase Storage** - File storage for property images

### Key Libraries
- **Zod** - Schema validation and type inference
- **React Hook Form** - Form handling with validation
- **Lucide React** - Icon library
- **Resend** - Transactional email service
- **Sonner** - Toast notifications

## Project Configuration

### Path Aliases
```typescript
"@/*": ["./*"]  // Root-level imports
```

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- Additional Supabase service keys for server-side operations

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run load-data    # Load property data (custom script)
```

### Database
```bash
# Supabase CLI commands (if using local development)
supabase start       # Start local Supabase
supabase db reset    # Reset local database
supabase db push     # Push migrations to remote
```

## Code Standards

### TypeScript
- Strict mode enabled
- Use proper typing for all functions and components
- Leverage Zod schemas for runtime validation

### React Patterns
- Server Components by default
- Client Components only when needed (use "use client" directive)
- Proper error boundaries and loading states

### Styling
- Tailwind CSS utility classes
- CSS variables for theming
- Responsive design (mobile-first)
- Korean font support (Noto Sans KR)

### Database
- Use Row Level Security (RLS) policies
- Proper foreign key relationships
- UUID primary keys
- Timestamp tracking (created_at, updated_at)
