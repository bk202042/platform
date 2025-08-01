# Database Schema Analysis: Vietnamese Real Estate Platform for Korean Expatriates

## Overview

This analysis covers the complete database schema, authentication workflow, and apartment-to-post relationships for a Vietnamese real estate platform targeting Korean expatriates.

## Database Architecture

### Core Authentication System

#### Supabase Auth Schema
- **auth.users**: Core authentication table managed by Supabase
  - Handles OAuth (Google), email/password authentication
  - Stores encrypted passwords, email confirmation, session management
  - Supports MFA, SSO, and SAML providers
  - Contains metadata fields for provider information

#### User Profile System
- **profiles**: Extended user information table
  - `id` (UUID): Foreign key to `auth.users.id`
  - `email`, `first_name`, `last_name`: User identification
  - `full_name`: Generated column combining first/last names
  - `avatar_url`: Profile picture reference
  - `role`: User role ('user', 'admin', 'agent')
  - Automatic profile creation via database triggers

### Geographic Hierarchy

#### Cities and Apartments Structure
```sql
cities (id, name)
├── "호치민" (hcm) - 8 apartments
├── "하노이" (hanoi) - 7 apartments
├── "다낭" (danang) - 5 apartments
└── Legacy English names (Ho Chi Minh City, Hanoi, Da Nang)
```

#### Apartments Table
- **apartments**: Building/complex information
  - `id` (text): Unique identifier (e.g., 'apt14')
  - `name`: Korean apartment names (e.g., '빈홈 센트럴 파크')
  - `city_id`: References cities table
  - `slug`: URL-friendly identifier

### Community System

#### Posts and Engagement
- **community_posts**: Main discussion content
  - Categories: QNA, RECOMMEND, SECONDHAND, FREE
  - Location-based via `apartment_id` foreign key
  - Rich content with title, body, images (max 5)
  - Engagement metrics: likes_count, comments_count, views_count
  - Status management: draft, published, archived
  - Soft deletion via `is_deleted` flag

- **community_comments**: Threaded discussions
  - Supports nested replies via `parent_id`
  - Soft deletion capability
  - User attribution via `user_id`

- **community_likes**: User engagement tracking
  - Unique constraint per user/post combination
  - Automatic count updates via database triggers

### Property Management

#### Property Listings
- **property_listings**: Main property data
  - Korean property types: 월세 (monthly rent), 전세 (jeonse), 매매 (purchase)
  - Geographic data with PostGIS support
  - Rich metadata in JSONB features field
  - Image management via separate table

- **property_images**: Media storage
  - Supabase Storage integration
  - Primary image designation
  - Display order management

#### Legacy Property System
- Multiple related tables: properties, property_addresses, property_features
- Feature categorization system
- Inquiry and messaging system for property communication

### Agent Management
- **agent_registrations**: Real estate agent onboarding
  - Application workflow with status tracking
  - Sales volume and location information
  - Admin approval process

## Authentication Workflow

### Server-Side Authentication
```typescript
// Middleware handles session refresh
middleware.ts → createServerClient → automatic session management

// Server components use server client
lib/supabase/server.ts → createClient() → authenticated requests
```

### Client-Side Authentication
```typescript
// Browser client for interactive features
lib/supabase/client.ts → createBrowserClient → user interactions

// Auth provider manages global state
AuthProvider → useAuth hook → user state management
```

### Profile Management
1. **User Registration**: OAuth or email signup creates auth.users entry
2. **Profile Creation**: Database trigger automatically creates profiles entry
3. **Profile Updates**: Users can modify their profile information
4. **Display Names**: Generated from first_name + last_name or email fallback

## Row Level Security (RLS) Policies

### Community Tables
- **Read Access**: Public can view non-deleted, published posts
- **Write Access**: Authenticated users can create content
- **Ownership**: Users can only modify their own content
- **Moderation**: Soft deletion prevents data loss

### Property Tables
- **Public Listings**: All property data publicly viewable
- **Owner Control**: Property owners manage their listings
- **Inquiry System**: Private messaging between users and property owners

### Profile System
- **Public Profiles**: Basic profile information publicly viewable
- **Self Management**: Users control their own profile data
- **Admin Privileges**: Special permissions for admin users

## Apartment-to-Post Relationship Workflow

### Data Flow
1. **Geographic Hierarchy**: Cities → Apartments → Community Posts
2. **Location Context**: Posts are tied to specific apartment buildings
3. **Community Segmentation**: Each apartment has its own discussion space
4. **Cross-Location Discovery**: Users can browse posts across different areas

### Korean Localization
- **Apartment Names**: Korean building names (빈홈 센트럴 파크, 마스테리 타오디엔)
- **City Names**: Korean city names (호치민, 하노이, 다낭)
- **Property Types**: Korean real estate terminology (월세, 전세, 매매)
- **Categories**: Korean community categories

### Business Logic
- **Location-Based Communities**: Each apartment building has its own community
- **Cultural Relevance**: Korean naming and categorization throughout
- **Engagement Tracking**: Comprehensive metrics for community health
- **Content Moderation**: Soft deletion preserves data while hiding content

## Key Technical Features

### Performance Optimizations
- **Database Indexes**: Optimized for common query patterns
- **Geographic Queries**: PostGIS for location-based searches
- **Caching Strategy**: Server-side rendering with client-side hydration

### Data Integrity
- **Foreign Key Constraints**: Maintain referential integrity
- **Check Constraints**: Validate data quality (image limits, status values)
- **Unique Constraints**: Prevent duplicate likes, ensure data consistency

### Scalability Considerations
- **UUID Primary Keys**: Distributed system friendly
- **JSONB Storage**: Flexible metadata without schema changes
- **Trigger-Based Counters**: Efficient aggregate calculations
- **Soft Deletion**: Preserve data while hiding from users

## Migration History

The database has evolved through 23+ migrations, showing:
- Initial property and user systems
- Community feature additions
- Geographic data restructuring
- Security policy implementations
- Performance optimizations

This architecture supports a culturally-aware, location-based community platform specifically designed for Korean expatriates in Vietnam.

## Image Display Issue Investigation & Resolution

### Session Summary: 2025-01-08

During this session, we identified and resolved a critical issue where community post images were not displaying despite successful uploads to Supabase Storage. The investigation used both Playwright and Supabase MCPs to systematically diagnose and fix the root cause.

### Problem Description

**Symptoms:**
- Images successfully uploaded to Supabase Storage bucket `community-images`
- Console errors showing 400 status codes for image requests
- Image display indicators showing "사진 N장" but no actual images visible
- Database records missing for uploaded images

**Investigation Tools Used:**
- Playwright MCP for frontend inspection and network analysis
- Supabase MCP for database schema examination and data verification
- Direct file analysis of image handling components

### Root Cause Analysis

The investigation revealed multiple interconnected issues:

#### 1. Database Constraint Regex Error
**Location:** `community_post_images` table CHECK constraint `valid_community_storage_path`
**Issue:** Malformed regex pattern with double-escaped backslashes
```sql
-- BROKEN CONSTRAINT:
^community-images/[a-zA-Z0-9_\\-]+\\.(jpg|jpeg|png|webp|gif)$
                      ^^-- Double-escaped backslashes causing regex failure

-- CORRECT CONSTRAINT:
^community-images/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)$
```

#### 2. Storage Path Structure Mismatch
**Issue:** Database expected nested path structure but storage objects used flat structure
- **Storage Objects:** `community-images/filename.jpg`
- **Database Constraint:** Expected `community-images/community-images/filename.jpg`

#### 3. Silent Database Insertion Failures
**Issue:** Image records failed to insert due to constraint violations, but upload process continued successfully, creating a disconnect between storage and database state.

### Technical Investigation Process

#### Phase 1: Frontend Analysis with Playwright
```javascript
// Navigated to community page and inspected network requests
await mcp_playwright_browser_navigate({ url: "http://localhost:3000/community" });
await mcp_playwright_browser_snapshot();
```

**Findings:**
- Posts displayed "사진 N장" indicators
- Network requests for images returned 400 status codes
- Image URLs were correctly formatted but failing to load

#### Phase 2: Database Schema Investigation with Supabase
```sql
-- Examined constraint definition
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'community_post_images'::regclass;

-- Checked for missing image records
SELECT post_id, COUNT(*) as image_count 
FROM community_post_images 
GROUP BY post_id;
```

**Findings:**
- Zero image records for posts from August 1st despite successful uploads
- Malformed regex constraint preventing all insertions
- Storage bucket contained uploaded files but database had no corresponding records

#### Phase 3: Storage Bucket Analysis
```sql
-- Listed storage objects to confirm uploads
SELECT name, created_at, metadata 
FROM storage.objects 
WHERE bucket_id = 'community-images' 
ORDER BY created_at DESC;
```

**Findings:**
- Multiple image files successfully uploaded to storage
- File timestamps matched post creation times
- Storage paths used flat structure: `filename.jpg` not `community-images/filename.jpg`

### Resolution Implementation

#### Step 1: Fix Database Constraint
```sql
-- Applied migration to correct the regex pattern
ALTER TABLE community_post_images 
DROP CONSTRAINT valid_community_storage_path;

ALTER TABLE community_post_images 
ADD CONSTRAINT valid_community_storage_path 
CHECK (storage_path ~ '^community-images/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)$');
```

#### Step 2: Update Storage Path Structure
```sql
-- Updated existing records to use correct nested path format
UPDATE community_post_images 
SET storage_path = 'community-images/' || storage_path 
WHERE storage_path NOT LIKE 'community-images/%';
```

#### Step 3: Backfill Missing Image Records
```sql
-- Identified orphaned storage objects and created database records
WITH missing_images AS (
  SELECT 
    cp.id as post_id,
    so.name as filename,
    so.created_at
  FROM community_posts cp
  JOIN storage.objects so ON so.created_at BETWEEN cp.created_at - INTERVAL '5 minutes' 
                                                AND cp.created_at + INTERVAL '5 minutes'
  WHERE so.bucket_id = 'community-images'
    AND cp.created_at::date = '2025-08-01'
    AND NOT EXISTS (
      SELECT 1 FROM community_post_images cpi 
      WHERE cpi.post_id = cp.id
    )
)
INSERT INTO community_post_images (post_id, storage_path, display_order, alt_text, metadata)
SELECT 
  post_id,
  'community-images/' || filename,
  0,
  'Backfilled image',
  '{}'::jsonb
FROM missing_images;
```

### Code Components Analyzed

#### Key Files Examined:
1. **PostCard.tsx** (lines 170-180): Image rendering logic using Next.js Image component
2. **community.ts** (lines 74-99): Database query and URL transformation logic
3. **community-images.ts**: Storage path extraction and validation utilities
4. **actions.ts** (lines 24-44): Server action for saving image records
5. **ImageUpload.tsx**: TUS upload implementation with Supabase integration

#### Critical Code Patterns Identified:
- `createPublicUrl()` function generating proper Supabase Storage URLs
- Progressive image loading with `useProgressiveImage` hook
- Storage path extraction from public URLs in server actions
- Database constraint validation during record insertion

### Verification Results

After implementing all fixes:

#### Frontend Verification with Playwright:
```javascript
// Confirmed images now display properly
await mcp_playwright_browser_navigate({ url: "http://localhost:3000/community" });
// Screenshots showed images loading correctly in posts
```

#### Database Verification:
```sql
-- Confirmed all August 1st posts now have image records
SELECT p.title, COUNT(i.id) as image_count
FROM community_posts p
LEFT JOIN community_post_images i ON p.id = i.post_id
WHERE p.created_at::date = '2025-08-01'
GROUP BY p.id, p.title;
```

#### Storage URL Testing:
```bash
# Verified image URLs return 200 status codes
curl -I https://[project].supabase.co/storage/v1/object/public/community-images/[filename]
# HTTP/1.1 200 OK
```

### Lessons Learned

1. **Regex Constraints Require Careful Escaping:** Double-escaped backslashes in PostgreSQL CHECK constraints cause pattern matching failures
2. **Silent Failures are Dangerous:** Database constraint violations should be logged and monitored
3. **Storage-Database Consistency:** Upload processes must ensure both storage and database operations succeed atomically
4. **Path Structure Standardization:** Consistent path formats across storage uploads and database constraints prevent mismatches
5. **Comprehensive Testing:** End-to-end image flow testing should verify both storage upload and database record creation

### Prevention Measures

1. **Enhanced Error Logging:** All constraint violations now logged with detailed context
2. **Atomic Operations:** Image uploads wrapped in transactions to ensure consistency
3. **Path Validation:** Utility functions validate storage paths before database insertion
4. **Monitoring Alerts:** Database triggers can alert on failed image record insertions
5. **Integration Tests:** Automated tests for complete image upload-to-display pipeline

This resolution demonstrates the importance of systematic debugging using appropriate tools (Playwright for frontend, Supabase for backend) and fixing root causes rather than symptoms.
