# Project Structure & Organization

## Root Directory Structure

```
platform/
├── app/                    # Next.js App Router pages and API routes
├── components/             # Reusable React components
├── lib/                    # Shared utilities and business logic
├── supabase/              # Database migrations and configuration
├── docs/                  # Project documentation
├── public/                # Static assets
└── .kiro/                 # Kiro AI assistant configuration
```

## App Directory (`app/`)

### Route Organization

- `app/(main)/` - Main application routes with shared layout
- `app/auth/` - Authentication pages (sign-in, sign-up, callbacks)
- `app/admin/` - Admin dashboard and management
- `app/community/` - Community forum pages
- `app/api/` - API route handlers

### API Routes Structure

```
app/api/
├── community/             # Community forum endpoints
│   ├── posts/            # Post CRUD operations
│   └── apartments/       # Apartment data
├── properties/           # Property listing endpoints
├── agents/              # Agent registration
└── auth/                # Authentication callbacks
```

### Page Components

- Each route has its own `page.tsx`
- Shared layouts in `layout.tsx`
- Error handling with `error.tsx`
- Loading states with `loading.tsx`
- Not found pages with `not-found.tsx`

## Components Directory (`components/`)

### Component Categories

```
components/
├── ui/                   # shadcn/ui base components
├── layout/              # Header, Footer, Navigation
├── community/           # Forum-specific components
├── property/            # Property listing components
├── auth/                # Authentication components
├── sections/            # Homepage sections
└── providers/           # Context providers
```

### Naming Conventions

- PascalCase for component files
- Descriptive names indicating purpose
- Co-located styles and tests when needed
- Client components marked with `.client.tsx` suffix

## Library Directory (`lib/`)

### Core Modules

```
lib/
├── data/                # Data access layer
│   ├── property.ts      # Property-related queries
│   ├── community.ts     # Community forum queries
│   └── agent.ts         # Agent management queries
├── supabase/            # Supabase client configurations
│   ├── client.ts        # Browser client
│   ├── server.ts        # Server client with auth
│   └── server-api.ts    # API route client
├── types/               # TypeScript type definitions
├── validation/          # Zod schemas for validation
└── utils.ts             # Shared utility functions
```

### Data Access Patterns

- Centralized data fetching functions
- Proper error handling and type safety
- Caching strategies with Next.js
- Separation of client and server operations

## Database Structure (`supabase/`)

### Migration Files

- Timestamped SQL migration files
- Incremental schema changes
- Proper foreign key relationships
- Row Level Security (RLS) policies

### Key Tables

- `property_listings` - Main property data
- `property_images` - Property photos
- `community_posts` - Forum posts
- `community_comments` - Post comments
- `apartments` - Location/building data
- `agent_registrations` - Agent applications

## File Naming Conventions

### Pages and Components

- `PascalCase.tsx` for React components
- `kebab-case` for route segments
- `[param]` for dynamic routes
- `_components/` for route-specific components

### Utilities and Data

- `camelCase.ts` for utility files
- `kebab-case.ts` for configuration files
- Descriptive names indicating purpose

## Import Patterns

### Path Resolution

```typescript
import { Component } from "@/components/ui/component";
import { getData } from "@/lib/data/property";
import { createClient } from "@/lib/supabase/client";
```

### Import Organization

1. React and Next.js imports
2. Third-party library imports
3. Internal component imports
4. Type imports (with `type` keyword)
5. Relative imports last

## Code Organization Principles

### Separation of Concerns

- UI components focus on presentation
- Data layer handles business logic
- API routes manage server operations
- Types ensure consistency across layers

### Feature-Based Organization

- Related components grouped together
- Shared utilities in common locations
- Clear boundaries between features
- Minimal cross-feature dependencies

### Scalability Considerations

- Modular architecture for easy extension
- Clear interfaces between layers
- Consistent patterns across features
- Documentation for complex logic
