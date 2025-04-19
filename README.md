# Vietnam Property Platform

A property listing platform designed for Korean expatriates in Vietnam.

## Features

- [Next.js](https://nextjs.org) with App Router
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Tailwind CSS v4.1.4](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components
- [Supabase](https://supabase.com/) for backend services
- Feature-based project structure
- Dark mode support
- Performance-optimized

## Getting Started

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project follows a feature-based structure with the Next.js App Router:

```
/app
  /(main)                     # Route group for main public pages
    /layout.tsx               # Layout for main pages
    /page.tsx                 # Home page
    /properties               # Properties feature
      /[id]                   # Property detail page
        /_components          # Property detail components
          /PropertyDetail.tsx
          /PropertyGallery.tsx
        /page.tsx
      /page.tsx               # Properties listing page
    /search                   # Search feature
      /_components            # Search-specific components
        /SearchForm.tsx
        /SearchResults.tsx
      /page.tsx
  /api                        # API routes
    /properties               # Properties API
      /[id]                   # Property by ID
        /route.ts
      /search                 # Search endpoint
        /route.ts
      /route.ts               # List properties
/components                   # Shared components
  /ui                         # UI primitives
    /button.tsx
    /card.tsx
    /input.tsx
    /select.tsx
  /layout                     # Layout components
    /Container.tsx
  /providers                  # Context providers
    /PropertyDataProvider.tsx
/lib                          # Shared utilities
  /data                       # Data Access Layer
    /property.ts              # Property data functions
  /supabase                   # Supabase client
    /client.ts
    /server.ts
  /utils.ts                   # Utility functions
/types                        # TypeScript types
  /property.ts
  /supabase.ts
```

## Core Features

1. **Property Search**: Search for properties by various criteria including location, price, and property type.
2. **Property Listings**: Browse all available properties with filtering options.
3. **Property Details**: View detailed information about a specific property.

## Technology Stack

- **Frontend**: Next.js with App Router, React, Tailwind CSS v4.1.4, shadcn/ui
- **Backend**: Supabase (PostgreSQL, PostGIS, Authentication)
- **Styling**: Tailwind CSS v4.1.4 with zinc color theme

## Data Access Layer

The project uses a data access layer to abstract database operations:

- `lib/data/property.ts`: Functions for property data operations
- API routes use the data access layer instead of direct database access

## API Routes

- `GET /api/properties`: List properties with filtering options
- `GET /api/properties/[id]`: Get a specific property by ID
- `PATCH /api/properties/[id]`: Update a property
- `DELETE /api/properties/[id]/delete`: Delete a property

## Project Philosophy

- **Simplicity**: Focus on core features only (search, list, detail)
- **Performance**: Optimize for speed throughout development
- **Minimal Dependencies**: Use built-in Next.js capabilities whenever possible

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
