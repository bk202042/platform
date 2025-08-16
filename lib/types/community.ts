import { CommunityCategory } from "../validation/community";

// Enhanced Post Image interface for separate image management
export interface PostImage {
  id: string;
  post_id: string;
  storage_path: string;
  display_order: number;
  alt_text?: string;
  metadata: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
    original_name?: string;
  };
  created_at: string;
  public_url?: string; // Generated public URL for frontend display
}

// Image upload data for creating new images
export interface CreatePostImageData {
  storage_path: string;
  display_order: number;
  alt_text?: string;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
    original_name?: string;
  };
}

// Image upload result from Supabase storage
export interface ImageUploadResult {
  storage_path: string;
  public_url: string;
  metadata: {
    width?: number;
    height?: number;
    size: number;
    format: string;
    original_name: string;
  };
}

// Enhanced Post interface with separate image management
export interface Post {
  id: string;
  apartment_id: string;
  user_id: string;
  category: CommunityCategory;
  title?: string;
  body: string;
  images: PostImage[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  status: "draft" | "published" | "archived";
  view_count: number;
  last_activity_at: string;
  is_deleted: boolean;
  isLiked?: boolean;
  user?: {
    name: string;
    avatar_url?: string;
  };
  apartments?: {
    id: string;
    name: string;
    city_id: string;
    cities?: {
      name: string;
    };
  };
}

// User profile interface for community features
export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

// Comment interface
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
  user?: {
    name: string;
    avatar_url?: string;
  };
  children?: Comment[];
}

// Image reordering data
export interface ImageReorderData {
  id: string;
  display_order: number;
}

// Image validation result
export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

// Dropzone configuration for community images
export interface CommunityImageDropzoneConfig {
  maxFiles: number;
  maxFileSize: number;
  acceptedTypes: string[];
  bucket: string;
  folder: string;
}

// Enhanced error types for better error handling
export interface EnhancedError extends Error {
  code?: string;
  category?: ErrorCategory;
  details?: string;
  context?: string;
  operation?: string;
  user_id?: string;
  apartment_id?: string;
  timestamp?: string;
}

export type ErrorCategory = 
  | 'FOREIGN_KEY_VIOLATION'
  | 'NULL_VIOLATION' 
  | 'UNIQUE_VIOLATION'
  | 'RLS_VIOLATION'
  | 'CONNECTION_ERROR'
  | 'INSUFFICIENT_PRIVILEGE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_DB_ERROR';

// Action result with enhanced error information
export interface ActionResult {
  error?: string;
  errorCode?: string;
  timestamp?: string;
  data?: Post | null;
}

// ============================================================================
// USER POST MANAGEMENT TYPES
// ============================================================================

// User post analytics interface
export interface UserPostAnalytics {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  postsByStatus: {
    draft: number;
    published: number;
    archived: number;
  };
  postsByCategory: Record<string, number>;
  engagementTrend: EngagementTrendPoint[];
  averageEngagement: number;
}

// Engagement trend data point
export interface EngagementTrendPoint {
  date: string;
  likes: number;
  comments: number;
  views: number;
  total: number;
}

// Post engagement metrics for individual posts
export interface PostEngagementMetrics {
  post: {
    id: string;
    likesCount: number;
    commentsCount: number;
    viewCount: number;
    createdAt: string;
    lastActivityAt: string;
  };
  metrics: {
    totalEngagement: number;
    engagementRate: number;
    daysSinceCreated: number;
  };
  recentLikes: RecentLike[];
  recentComments: RecentComment[];
}

// Recent like information
export interface RecentLike {
  created_at: string;
  profiles: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  } | null;
}

// Recent comment information
export interface RecentComment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  } | null;
}

// User post with management metadata
export interface UserPost extends Post {
  canEdit: boolean;
  canDelete: boolean;
  engagementRate?: number;
  lastEngagement?: string;
}

// Post update data interface
export interface PostUpdateData {
  title?: string;
  body?: string;
  category?: CommunityCategory;
  status?: "draft" | "published" | "archived";
  apartment_id?: string;
}

// User post query parameters
export interface UserPostQueryParams {
  userId: string;
  status?: "draft" | "published" | "archived" | "all";
  category?: CommunityCategory;
  sort?: "latest" | "popular" | "engagement";
  limit?: number;
  offset?: number;
}

// Post draft interface
export interface PostDraft {
  id: string;
  title?: string;
  body: string;
  category: CommunityCategory;
  apartment_id: string;
  created_at: string;
  updated_at: string;
  apartments?: {
    name: string;
    city_id: string;
    cities?: {
      name: string;
    };
  };
}

// Batch operation result
export interface BatchOperationResult {
  success: boolean;
  updatedCount: number;
  errors: string[];
  updatedPosts?: {
    id: string;
    status: string;
    updated_at: string;
  }[];
}

// Post management action types
export type PostManagementAction = 
  | "edit"
  | "delete" 
  | "publish"
  | "archive"
  | "draft"
  | "view_analytics";

// Post status transition
export interface PostStatusTransition {
  from: "draft" | "published" | "archived";
  to: "draft" | "published" | "archived";
  allowed: boolean;
  requiresConfirmation?: boolean;
  warningMessage?: string;
}

// User post permissions
export interface PostPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  canViewAnalytics: boolean;
  reasons?: string[];
}

// Post summary for dashboard
export interface PostSummary {
  id: string;
  title?: string;
  category: CommunityCategory;
  status: "draft" | "published" | "archived";
  apartment_name: string;
  city_name: string;
  likes_count: number;
  comments_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

// User engagement summary
export interface UserEngagementSummary {
  totalEngagement: number;
  weeklyEngagement: number;
  monthlyEngagement: number;
  topPerformingPost: {
    id: string;
    title?: string;
    totalEngagement: number;
  } | null;
  engagementByCategory: Record<string, number>;
  recentActivity: {
    likes: number;
    comments: number;
    views: number;
  };
}
