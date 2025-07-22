# Design Document

## Overview

This design document outlines the implementation of an improved authentication flow for community post creation. The current system has issues with session desynchronization between server and client, leading to hydration errors and failed actions. The new design will create a proactive, context-aware authentication system that guides users through the optimal path to posting, following a "Secure by Default, Frictionless by Design" philosophy.

## Architecture

### Authentication Flow Architecture

The improved authentication flow for community posts will be built on these architectural principles:

1. **Proactive Verification**: Check authentication status before allowing post creation
2. **Draft Preservation**: Save post drafts during authentication transitions
3. **Multi-layered Security**: Combine client-side UX, server-side validation, and database-level rules
4. **Progressive Disclosure**: Show appropriate UI based on authentication state
5. **Graceful Error Handling**: Provide clear, actionable error messages in Korean

### User Journey Flow

```mermaid
graph TD
    A[User clicks "Create Post"] --> B{Is user session active & verified?}
    B -- Yes --> C[Display NewPostDialog component]
    B -- No / Expired Session --> D[Display "Login to Post" modal]

    D --> E{Choose Login/Sign Up}
    E -- Login --> F[User logs in]
    E -- Sign Up --> G[User signs up & verifies email]

    F --> C
    G --> C

    C --> H[User writes post & clicks "Submit"]
    H --> I{Server Action: Re-validate session & RLS}
    I -- Valid --> J[Post is created in DB]
    J --> K[Show "Success" toast & close dialog]
    I -- Invalid/Error --> L[Show specific error message on dialog]
    L --> C

    subgraph "Guest User Flow (Frictionless Onboarding)"
        A_guest[Guest user clicks "Create Post"] --> C_guest[Display NewPostDialog with a notice]
        C_guest -- User writes post & clicks "Submit" --> M[Save post draft to Local Storage]
        M --> D
    end
```

## Components and Interfaces

### Enhanced AuthGuard Component

**Component**: `EnhancedAuthGuard` (extends existing `AuthGuard`)

This component will wrap the post creation flow and proactively verify authentication:

```typescript
// Enhanced AuthGuard for post creation
interface EnhancedAuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  preserveContent?: boolean; // For draft preservation
  onAuthRequired?: () => void; // Callback when auth is required
}
```

Key features:
- Proactive session verification
- Loading state management
- Authentication error handling
- Optional content preservation

### Draft Preservation Service

**Service**: `PostDraftService`

This service will manage saving and restoring post drafts during authentication:

```typescript
interface PostDraft {
  title: string;
  content: string;
  category: string;
  apartmentId: string | null;
  images: string[]; // Base64 encoded or URLs
  timestamp: number;
}

interface PostDraftService {
  saveDraft(draft: PostDraft): void;
  getDraft(): PostDraft | null;
  clearDraft(): void;
  hasDraft(): boolean;
}
```

Implementation will use localStorage with proper encryption and expiration.

### Enhanced NewPostDialog Component

**Component**: `EnhancedNewPostDialog` (extends existing `NewPostDialog`)

This component will be enhanced to handle authentication states and draft preservation:

```typescript
interface EnhancedNewPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDraft?: PostDraft;
}
```

Key features:
- Authentication state awareness
- Draft loading and saving
- Specific error message display
- Loading state management

### Server Action for Post Creation

**Action**: `createCommunityPost`

This server action will handle secure post creation with authentication validation:

```typescript
interface CreatePostParams {
  title: string;
  content: string;
  category: string;
  apartmentId: string;
  images?: string[];
}

interface CreatePostResult {
  success: boolean;
  error?: {
    type: 'auth' | 'validation' | 'server';
    message: string;
  };
  post?: {
    id: string;
    slug: string;
  };
}
```

Implementation will use the validated action pattern with proper authentication checks.

## Data Flow and State Management

### Authentication Verification Flow

1. **Initial Click**:
   - User clicks "Create Post"
   - `EnhancedAuthGuard` checks authentication status
   - Shows appropriate UI based on status

2. **Guest User Flow**:
   - Allow post composition
   - Save draft on submission attempt
   - Redirect to authentication
   - Restore draft after authentication

3. **Authenticated User Flow**:
   - Show post dialog immediately
   - Verify email if needed
   - Submit directly to server action
   - Handle success/error states

4. **Error Recovery Flow**:
   - Detect authentication errors
   - Show specific error messages
   - Provide recovery options
   - Preserve user input during recovery

### State Management

The authentication flow will use React's Context API and hooks for state management:

```typescript
interface AuthFlowState {
  isAuthenticated: boolean;
  isVerified: boolean;
  isLoading: boolean;
  error: AuthError | null;
  hasDraft: boolean;
}

interface AuthFlowActions {
  checkAuth: () => Promise<boolean>;
  saveDraft: (draft: PostDraft) => void;
  loadDraft: () => PostDraft | null;
  clearDraft: () => void;
  showAuthModal: () => void;
}
```

## Error Handling Strategy

### Authentication Error Types

1. **Session Expired**: User was logged in but token expired
2. **Not Authenticated**: User never logged in
3. **Email Not Verified**: User logged in but email not verified
4. **Server Error**: Authentication service unavailable
5. **Network Error**: Connection issues during authentication

### Error Messages (Korean)

All error messages will be displayed in Korean for the target audience:

- Session Expired: "로그인 세션이 만료되었습니다. 다시 로그인해주세요."
- Not Authenticated: "게시글을 작성하려면 로그인이 필요합니다."
- Email Not Verified: "이메일 인증 후 게시글을 작성할 수 있습니다."
- Server Error: "지금은 게시글을 등록할 수 없습니다. 잠시 후 다시 시도해주세요."
- Validation Error: "아파트를 선택하고 게시글 내용을 작성해주세요."

### Error Recovery Mechanisms

- **Automatic Retry**: For transient network issues
- **Re-authentication**: For expired sessions
- **Email Verification Prompt**: For unverified emails
- **Draft Preservation**: For all error types to prevent data loss

## Security Considerations

### Authentication Security

- **Token Validation**: Proper validation of authentication tokens
- **CSRF Protection**: Protection against cross-site request forgery
- **Rate Limiting**: Prevention of rapid-fire post creation
- **Input Validation**: Server-side validation of all user inputs

### Data Protection

- **Draft Encryption**: Secure storage of post drafts
- **Minimal Storage**: Store only necessary data in localStorage
- **Expiration**: Auto-expire drafts after a reasonable period
- **Sanitization**: Proper sanitization of restored draft content

## Performance Optimizations

### Loading Optimization

- **Skeleton Loading**: Show loading skeletons during authentication checks
- **Lazy Loading**: Load authentication components only when needed
- **Prefetching**: Prefetch authentication resources on hover
- **Caching**: Cache authentication status appropriately

### Draft Management Optimization

- **Throttled Saving**: Save drafts with throttling to prevent excessive writes
- **Compression**: Compress draft data before storage
- **Chunking**: Split large drafts into manageable chunks
- **Background Processing**: Process drafts in background when possible

## Testing Strategy

### Unit Testing

- **Authentication Guard**: Test all authentication state scenarios
- **Draft Service**: Test draft saving, loading, and clearing
- **Error Handling**: Test all error scenarios and messages
- **Form Validation**: Test all validation rules

### Integration Testing

- **Authentication Flow**: Test complete authentication workflows
- **Draft Preservation**: Test draft saving and restoration
- **Server Actions**: Test server-side validation and processing
- **Error Recovery**: Test error handling and recovery flows

### End-to-End Testing

- **Guest User Journey**: Test guest user posting flow
- **Authenticated User Journey**: Test authenticated user posting flow
- **Email Verification**: Test email verification requirements
- **Error Scenarios**: Test common error scenarios and recovery

## Implementation Plan

The implementation will be divided into phases to ensure smooth integration:

### Phase 1: Core Authentication Flow

- Implement `EnhancedAuthGuard` component
- Create authentication state verification logic
- Add authentication modal for unauthenticated users
- Implement basic error handling

### Phase 2: Draft Preservation

- Implement `PostDraftService`
- Add draft saving on authentication redirect
- Create draft restoration after authentication
- Add draft expiration and cleanup

### Phase 3: Server-Side Validation

- Enhance server actions with authentication validation
- Implement proper error handling and messages
- Add rate limiting for post creation
- Ensure proper Row Level Security enforcement

### Phase 4: UI Enhancements

- Improve loading states and indicators
- Enhance error messages and presentation
- Add success feedback and animations
- Optimize mobile experience

## Metrics and Monitoring

### Key Performance Indicators

- **Post Success Rate**: (Successful posts / "Create Post" clicks)
- **Guest-to-Member Conversion**: Users who sign up during post creation
- **Authentication Error Rate**: Frequency of authentication errors
- **Draft Utilization**: Percentage of drafts that get submitted after authentication
- **Time-to-Post**: Time from initial click to successful post creation

### Monitoring Implementation

- **Client-Side Logging**: Track user interactions and errors
- **Server-Side Logging**: Monitor authentication validations
- **Performance Metrics**: Track loading times and response times
- **Error Tracking**: Categorize and track error frequencies

## Conclusion

This design creates a seamless, secure authentication flow for community post creation that balances security with user experience. By proactively verifying authentication, preserving user drafts, and providing clear guidance, the system will increase post submission success rates while maintaining security. The multi-layered approach ensures that authentication is handled consistently at all levels of the application.
