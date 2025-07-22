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
