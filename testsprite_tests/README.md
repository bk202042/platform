# Community Post Tests

This directory contains tests for the community post functionality, focusing on authenticated users creating new posts.

## Test Structure

- `authenticated_community_post_test.js` - Main test file for testing authenticated user posting functionality
- `supabase_schema_test.js` - Tests for verifying the database schema
- `utils/supabase-helpers.js` - Helper functions for interacting with Supabase
- `playwright.config.js` - Playwright configuration

## Prerequisites

1. A running Supabase project with the required tables:
   - `cities`
   - `apartments`
   - `profiles`
   - `community_posts`
   - `community_likes`
   - `community_comments`

2. Environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Running the Tests

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Run the tests:
   ```bash
   npx playwright test --config=testsprite_tests/playwright.config.js
   ```

## Test Cases

### Authenticated Community Post Creation

1. **Authenticated user can create a new community post**
   - Signs in a test user
   - Navigates to the community page
   - Creates a new post with title, body, and category
   - Verifies the post appears in the UI
   - Verifies the post exists in the database

2. **User cannot create post without authentication**
   - Attempts to create a post without being signed in
   - Verifies authentication error is shown
   - Verifies submit button is disabled or login prompt is shown

3. **Form validation works correctly**
   - Tests validation for required fields
   - Tests validation for field length limits

### Supabase Schema Tests

1. **Community tables exist with correct structure**
   - Verifies all required tables exist
   - Checks that tables have the required columns

2. **Row Level Security policies are properly configured**
   - Verifies that unauthenticated users can read posts
   - Verifies that unauthenticated users cannot create posts

## Database Schema

The tests rely on the following database schema:

```sql
-- Cities table
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Apartments table
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city_id UUID NOT NULL REFERENCES cities(id),
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Community posts table
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES apartments(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Community likes table
CREATE TABLE community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Community comments table
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```
