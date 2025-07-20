# Community Feature Test Plan

## Overview
This test plan covers the Community Board feature for VinaHome platform, testing all functionality described in the PRD including apartment-based posts, categories, likes, comments, and user interactions.

## Test Environment
- **URL**: http://localhost:3000/community
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Test Categories

### 1. Authentication & Access Control Tests

#### 1.1 Guest User Access
- **Test**: Verify guest users can view community posts
- **Steps**:
  1. Navigate to `/community` without logging in
  2. Verify posts are visible
  3. Verify like/comment buttons are disabled or show login prompts
- **Expected**: Posts visible, interaction buttons disabled

#### 1.2 Authenticated User Access
- **Test**: Verify authenticated users can interact with posts
- **Steps**:
  1. Log in to the application
  2. Navigate to `/community`
  3. Verify like/comment buttons are enabled
  4. Verify "New Post" button is visible
- **Expected**: All interaction buttons enabled

### 2. Community Main Page Tests

#### 2.1 Page Loading
- **Test**: Verify community page loads correctly
- **Steps**:
  1. Navigate to `/community`
  2. Check page title and layout
  3. Verify apartment selector is present
  4. Verify category filter is present
  5. Verify post list is displayed
- **Expected**: Page loads with all components visible

#### 2.2 Apartment Selection
- **Test**: Verify apartment filtering works
- **Steps**:
  1. Select a city from dropdown
  2. Select an apartment from the filtered list
  3. Verify posts are filtered by selected apartment
- **Expected**: Posts filtered correctly by apartment

#### 2.3 Category Filtering
- **Test**: Verify category filtering works
- **Steps**:
  1. Select different categories (묻고 답하기, 동네 업소 추천, 중고거리, 자유글)
  2. Verify posts are filtered by category
- **Expected**: Posts filtered correctly by category

#### 2.4 Post Sorting
- **Test**: Verify post sorting (popular vs latest)
- **Steps**:
  1. Switch between "인기글" and "최신글" tabs
  2. Verify popular posts show 7-day likes-based sorting
  3. Verify latest posts show chronological sorting
- **Expected**: Correct sorting applied

### 3. Post Creation Tests

#### 3.1 New Post Dialog
- **Test**: Verify new post creation dialog
- **Steps**:
  1. Click "새 글 작성" button
  2. Verify dialog opens with form fields
  3. Verify required fields (apartment, category, body)
  4. Verify optional fields (title, images)
- **Expected**: Dialog opens with correct form structure

#### 3.2 Post Creation Validation
- **Test**: Verify form validation works
- **Steps**:
  1. Try to submit empty form
  2. Try to submit without apartment selection
  3. Try to submit without category selection
  4. Try to submit without body content
  5. Try to upload more than 5 images
- **Expected**: Appropriate validation errors shown

#### 3.3 Successful Post Creation
- **Test**: Verify successful post creation
- **Steps**:
  1. Fill all required fields
  2. Add optional title and images
  3. Submit form
  4. Verify post appears in list
- **Expected**: Post created and visible in list

### 4. Post Detail Tests

#### 4.1 Post Detail Page
- **Test**: Verify post detail page loads
- **Steps**:
  1. Click on a post from the list
  2. Verify post detail page loads
  3. Verify all post content is displayed
  4. Verify images are displayed correctly
- **Expected**: Post detail page loads with all content

#### 4.2 Like Functionality
- **Test**: Verify like/unlike functionality
- **Steps**:
  1. Click like button on a post
  2. Verify like count increases
  3. Verify button shows liked state
  4. Click again to unlike
  5. Verify like count decreases
- **Expected**: Like functionality works correctly

### 5. Comment Tests

#### 5.1 Comment Display
- **Test**: Verify comments are displayed
- **Steps**:
  1. Navigate to a post with comments
  2. Verify comments are shown
  3. Verify comment author and timestamp
- **Expected**: Comments displayed correctly

#### 5.2 Comment Creation
- **Test**: Verify comment creation
- **Steps**:
  1. Type a comment in the comment form
  2. Submit comment
  3. Verify comment appears in list
- **Expected**: Comment created and displayed

#### 5.3 Comment Deletion
- **Test**: Verify comment deletion (own comments)
- **Steps**:
  1. Create a comment
  2. Click delete button on own comment
  3. Verify comment is removed
- **Expected**: Own comments can be deleted

### 6. Mobile Responsiveness Tests

#### 6.1 Mobile Layout
- **Test**: Verify mobile-friendly layout
- **Steps**:
  1. Resize browser to mobile width
  2. Verify all elements are properly sized
  3. Verify touch interactions work
- **Expected**: Mobile-friendly layout

### 7. Error Handling Tests

#### 7.1 Network Errors
- **Test**: Verify error handling for network issues
- **Steps**:
  1. Simulate network disconnect
  2. Try to create post or comment
  3. Verify appropriate error message
- **Expected**: User-friendly error messages

#### 7.2 Authentication Errors
- **Test**: Verify authentication error handling
- **Steps**:
  1. Let session expire
  2. Try to perform authenticated action
  3. Verify redirect to login
- **Expected**: Proper authentication error handling

### 8. Performance Tests

#### 8.1 Page Load Performance
- **Test**: Verify page loads within acceptable time
- **Steps**:
  1. Measure initial page load time
  2. Measure post list load time
  3. Measure image load time
- **Expected**: Page loads within 3 seconds

#### 8.2 Infinite Scroll (if implemented)
- **Test**: Verify infinite scroll performance
- **Steps**:
  1. Scroll through many posts
  2. Verify smooth loading
  3. Verify no memory leaks
- **Expected**: Smooth infinite scroll

## Test Data Requirements

### Sample Posts
- Posts in each category (묻고 답하기, 동네 업소 추천, 중고거리, 자유글)
- Posts with and without images
- Posts with different like counts
- Posts with comments

### Sample Users
- Guest user (not logged in)
- Regular authenticated user
- User with existing posts and comments

### Sample Apartments
- Multiple apartments in different cities
- Apartments with varying post counts

## Success Criteria

### Functional Requirements
- ✅ All CRUD operations work correctly
- ✅ Authentication and authorization work properly
- ✅ Filtering and sorting work as expected
- ✅ Like and comment functionality works
- ✅ Mobile responsiveness is maintained

### Performance Requirements
- ✅ Page load time < 3 seconds
- ✅ Image upload works smoothly
- ✅ No memory leaks during extended use

### User Experience Requirements
- ✅ All error messages are in Korean
- ✅ Loading states are properly displayed
- ✅ Navigation is intuitive
- ✅ Forms provide clear validation feedback

## Test Execution

### Manual Testing
1. Execute each test case manually
2. Document any bugs or issues found
3. Verify fixes for reported issues

### Automated Testing (Future)
- Unit tests for data functions
- Integration tests for API endpoints
- E2E tests for critical user flows

## Bug Reporting Template

```
**Bug Title**: [Brief description]

**Severity**: [Critical/High/Medium/Low]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]

**Actual Result**: [What actually happened]

**Environment**: [Browser, OS, etc.]

**Screenshots**: [If applicable]
```

## Test Completion Checklist

- [ ] All authentication tests passed
- [ ] All main page functionality tests passed
- [ ] All post creation tests passed
- [ ] All post detail tests passed
- [ ] All comment tests passed
- [ ] All mobile responsiveness tests passed
- [ ] All error handling tests passed
- [ ] All performance tests passed
- [ ] All bugs documented and reported
- [ ] Test results documented
