# Requirements Document

## Introduction

The community feature currently has authentication issues that create friction when users attempt to create posts. Users face session desynchronization between the server and client, leading to hydration errors and failed actions even when they appear to be logged in. This feature will implement a proactive, context-aware authentication system that gracefully guides every user—guest, member, or newcomer—through the optimal path to posting, following a "Secure by Default, Frictionless by Design" philosophy.

## Requirements

### Requirement 1

**User Story:** As a user, I want a clear understanding of my authentication status when attempting to create a post, so that I know what action is required next.

#### Acceptance Criteria

1. WHEN a user clicks "Create Post" THEN the system SHALL proactively verify their authentication status before opening the post dialog
2. WHEN a user is authenticated THEN the system SHALL display the NewPostDialog component immediately
3. WHEN a user is not authenticated THEN the system SHALL display a "Login to Post" modal instead of the post creation form
4. WHEN a user's session is expired THEN the system SHALL show a specific "Session Expired" message in Korean
5. WHEN authentication status is being verified THEN the system SHALL display an appropriate loading indicator

### Requirement 2

**User Story:** As a guest user, I want to preserve my post draft when I need to sign up or log in, so that I don't lose my work.

#### Acceptance Criteria

1. WHEN a guest user starts writing a post THEN the system SHALL allow them to compose their content before requiring authentication
2. WHEN a guest user attempts to submit a post THEN the system SHALL save their draft to localStorage before redirecting to authentication
3. WHEN a user completes authentication after starting a post THEN the system SHALL restore their draft automatically
4. WHEN a draft is restored THEN the system SHALL notify the user that their previous work was recovered
5. WHEN a post is successfully submitted THEN the system SHALL clear the saved draft from localStorage

### Requirement 3

**User Story:** As a new user, I want email verification to be part of the posting flow, so that I can complete all necessary steps to become a contributor.

#### Acceptance Criteria

1. WHEN a user signs up to post content THEN the system SHALL require email verification before allowing post submission
2. WHEN a user has not verified their email THEN the system SHALL display a clear message explaining the verification requirement
3. WHEN a user attempts to post without email verification THEN the system SHALL show a specific Korean error message
4. WHEN a user completes email verification THEN the system SHALL automatically enable posting capabilities
5. WHEN email verification is pending THEN the system SHALL provide clear instructions on how to complete verification

### Requirement 4

**User Story:** As an authenticated user, I want secure, server-validated post submission, so that my posts are reliably created without client-side security bypasses.

#### Acceptance Criteria

1. WHEN a user submits a post THEN the system SHALL use a Next.js Server Action to validate authentication on the server
2. WHEN server validation passes THEN the system SHALL create the post and return success feedback
3. WHEN server validation fails due to authentication THEN the system SHALL return a specific error message about authentication
4. WHEN server validation fails due to other reasons THEN the system SHALL return appropriate validation error messages
5. WHEN a post is being submitted THEN the system SHALL show a loading state to prevent duplicate submissions

### Requirement 5

**User Story:** As a user, I want clear, specific error messages in Korean when authentication issues occur, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN a session expires THEN the system SHALL display "로그인 세션이 만료되었습니다. 다시 로그인해주세요." (Your session has expired. Please log in again to post.)
2. WHEN validation fails THEN the system SHALL display "아파트를 선택하고 게시글 내용을 작성해주세요." (Please select an apartment and write content for your post.)
3. WHEN a server error occurs THEN the system SHALL display "지금은 게시글을 등록할 수 없습니다. 잠시 후 다시 시도해주세요." (Could not submit your post at this time. Please try again later.)
4. WHEN email verification is required THEN the system SHALL display "이메일 인증 후 게시글을 작성할 수 있습니다." (Please verify your email before posting.)
5. WHEN errors occur THEN the system SHALL display them within the dialog, close to the submit button

### Requirement 6

**User Story:** As a developer, I want robust handling of edge cases in the authentication flow, so that users have a seamless experience even in unusual scenarios.

#### Acceptance Criteria

1. WHEN a user's token expires while writing a post THEN the system SHALL preserve their draft and prompt for re-authentication
2. WHEN a user attempts rapid posting THEN the system SHALL implement rate limiting (1 post per 60 seconds)
3. WHEN network errors occur during authentication THEN the system SHALL provide retry mechanisms
4. WHEN a user cancels authentication THEN the system SHALL return them to their previous state without losing data
5. WHEN authentication systems are temporarily unavailable THEN the system SHALL provide appropriate fallback behavior

### Requirement 7

**User Story:** As a product manager, I want to track authentication-related metrics for community posting, so that we can measure the success of the improved flow.

#### Acceptance Criteria

1. WHEN users attempt to create posts THEN the system SHALL track post success rate (successful posts / "Create Post" clicks)
2. WHEN guest users convert to members via posting THEN the system SHALL track this conversion path
3. WHEN spam posts are detected THEN the system SHALL track the reduction in spam compared to previous periods
4. WHEN authentication errors occur THEN the system SHALL log detailed information for analysis
5. WHEN users encounter authentication friction THEN the system SHALL capture relevant metrics to identify improvement areas
