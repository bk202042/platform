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
