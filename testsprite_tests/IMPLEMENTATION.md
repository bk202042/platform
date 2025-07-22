# Community Post Test Implementation

## Overview

This test suite verifies that authenticated users can create new posts in the community section. The tests cover both the UI interaction and database validation to ensure the entire flow works correctly.

## Implementation Details

### 1. Database Schema

The tests rely on the following Supabase tables:

- `cities` - Stores city information
- `apartments` - Stores apartment information with references to cities
- `profiles` - Stores user profile information
- `community_posts` - Stores community posts
- `community_likes` - Stores post likes
- `community_comments` - Stores post comments

The schema includes proper foreign key relationships and Row Level Security (RLS) policies to ensure data integrity and security.

### 2. UI Components

The tests interact with the following UI components:

- `EnhancedNewPostDialog.tsx` - The dialog for creating new posts
- `NewPostDialog.tsx` - The underlying dialog component
- `AuthGuard.tsx` - Component that protects routes requiring authentication

### 3. Test Approach

The tests follow this approach:

1. **Setup**: Create a test user in Supabase or use an existing one
2. **Authentication**: Sign in the user through the UI
3. **Navigation**: Navigate to the community page
4. **Interaction**: Open the new post dialog and fill in the form
5. **Submission**: Submit the form and verify success
6. **Verification**: Verify the post appears in the UI and exists in the database
7. **Cleanup**: Remove test data after tests complete

### 4. Test Cases

The test suite includes the following test cases:

- **Authenticated user can create a new community post**
- **User cannot create post without authentication**
- **Form validation works correctly**
- **Database schema is correctly configured**
- **RLS policies are properly enforced**

### 5. Helper Functions

The test suite includes helper functions for:

- Creating a Supabase client for testing
- Creating or signing in test users
- Cleaning up test data
- Verifying posts exist in the database

## Running the Tests

To run the tests:

1. Install dependencies:
   ```bash
   cd testsprite_tests
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Run the tests:
   ```bash
   npm test
   ```

## Test Results

The tests generate HTML reports showing:

- Test pass/fail status
- Screenshots of failures
- Test execution time
- Detailed logs

## Troubleshooting

If tests fail, check:

1. Supabase environment variables are correctly set
2. The database schema matches the expected structure
3. The application is running on the expected port
4. Authentication is properly configured
