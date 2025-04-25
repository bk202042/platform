# Supabase Database Integration Plan

This document outlines the minimal, KISS-aligned steps to add Supabase database integration to your Next.js project, following the vertical slice structure and core requirements.

---

## 1. Supabase Project & Database Setup

- **Create a Supabase project** via the Supabase dashboard.
- **Enable PostGIS extension** for geospatial queries.
- **Define schema**:
  - `property_types` enum: `('월세', '전세', '매매')`
  - `property_listings` table with fields:
    - `id` (UUID, PK)
    - `title` (text)
    - `description` (text)
    - `price` (numeric)
    - `property_type` (enum)
    - `bedrooms` (integer)
    - `bathrooms` (integer)
    - `square_footage` (numeric)
    - `location` (geography point)
    - `address` (text)
    - `features` (jsonb)
    - `created_at`, `updated_at` (timestamp)
- **Add indexes** for search performance:
  - property_type, price, bedrooms, bathrooms, location (spatial), full-text (title/description)
- **Set up Row Level Security (RLS)**:
  - Public read access
  - Owner-based writes (requires `created_by` column)
- **Add helper SQL functions** for geospatial queries.

---

## 2. Project Structure for Supabase Integration

Organize files for clarity and minimalism:

```
lib/
  db.ts
  data/
    property-listing.ts
.env.local
```

- `lib/db.ts`: Supabase client config (singleton, server-only)
- `lib/data/property-listing.ts`: Data Access Layer (DAL) for property listings
- `.env.local`: Store Supabase URL and anon/public key

---

## 3. Install Supabase Client

```sh
npm install @supabase/supabase-js
```

---

## 4. Configure Supabase Client

**lib/db.ts**
```typescript
import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

- Add the following to `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

---

## 5. Data Access Layer (DAL)

**lib/data/property-listing.ts**
```typescript
import 'server-only';
import { supabase } from '../db';

// Example: Fetch property listings with optional filters
export async function getPropertyListings(params) {
  // Compose query using Supabase client
  // Return data or throw error
}
```
- Export pure, minimal functions for CRUD/search.
- Use TypeScript interfaces inferred from the DB schema.

---

## 6. Next Steps (for context)

- Use DAL functions in API route handlers (`app/api/properties/route.ts`).
- Use DAL in Server Components for SSR/SSG.
- Use Supabase client in scripts for data loading.
- Add error handling and validation as needed.

---

## 7. KISS Principles

- Only add files needed for core DB access.
- No unnecessary wrappers, classes, or abstractions.
- Use functional, declarative code.
- Co-locate DAL logic by resource.
- Use environment variables for config.

---

## 8. Reference to Tasks

- All steps above are mapped to tasks 2, 3, and 4 in your `tasks/` directory.
- The plan aligns with your vertical slice structure and KISS philosophy.

---

**Summary Table**

| Step | File/Dir | Purpose |
|------|----------|---------|
| 1    | Supabase Dashboard | Create DB, schema, RLS |
| 2    | .env.local | Store Supabase URL/key |
| 3    | lib/db.ts | Supabase client config |
| 4    | lib/data/property-listing.ts | DAL for property listings |
| 5    | app/api/properties/route.ts | (Next step) API route using DAL |

---

**Ready to implement:**
Follow this plan to add Supabase database integration in a clean, minimal, and maintainable way.
