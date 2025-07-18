import { createClient } from "./server";
import { getServerAuth } from "@/lib/auth/server";
import { SupabaseClient, User } from "@supabase/supabase-js";

export interface AuthenticatedClientResult {
  client: SupabaseClient | null;
  user: User | null;
  error: string | null;
}

/**
 * Creates an authenticated Supabase client for server-side operations
 * Ensures the user is authenticated before returning the client
 * @returns Promise<AuthenticatedClientResult> - Client with authentication status
 */
export async function createAuthenticatedClient(): Promise<AuthenticatedClientResult> {
  try {
    const authResult = await getServerAuth();

    if (authResult.error || !authResult.user) {
      return {
        client: null,
        user: null,
        error: authResult.error?.message || "User not authenticated",
      };
    }

    const client = await createClient();

    return {
      client,
      user: authResult.user,
      error: null,
    };
  } catch (error) {
    console.error("Error creating authenticated client:", error);

    return {
      client: null,
      user: null,
      error: error instanceof Error ? error.message : "Failed to create authenticated client",
    };
  }
}

/**
 * Executes a database operation with authentication verification
 * @param operation - Function that takes a Supabase client and user
 * @returns Promise<T> - Result of the operation
 */
export async function withAuth<T>(
  operation: (client: SupabaseClient, user: User) => Promise<T>,
): Promise<T> {
  const { client, user, error } = await createAuthenticatedClient();

  if (error || !client || !user) {
    throw new Error(error || "Authentication required");
  }

  return await operation(client, user);
}

/**
 * Retry mechanism for operations that might fail due to token expiration
 * @param operation - Operation to retry
 * @param maxRetries - Maximum number of retries
 * @returns Promise<T> - Result of the operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      // Only retry on authentication-related errors
      if (
        attempt < maxRetries &&
        (lastError.message.includes("JWT") ||
          lastError.message.includes("token") ||
          lastError.message.includes("expired"))
      ) {
        console.warn(
          `Authentication operation failed, retrying... (${attempt + 1}/${maxRetries})`,
        );
        // Wait a bit before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1)),
        );
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error("Operation failed after retries");
}

/**
 * Validates that a user can perform a specific action
 * @param userId - User ID to validate
 * @param action - Action to validate
 * @param resourceId - Optional resource ID for resource-specific permissions
 * @returns Promise<boolean> - Whether the action is allowed
 */
export async function validateUserAction(
  userId: string,
  action: string,
  resourceId?: string,
): Promise<boolean> {
  try {
    const { client, user, error } = await createAuthenticatedClient();

    if (error || !client || !user || user.id !== userId) {
      return false;
    }

    // Basic action validation
    switch (action) {
      case "create_post":
      case "create_comment":
        return !!user.email_confirmed_at;

      case "edit_post":
      case "delete_post":
        if (!resourceId) return false;

        // Check if user owns the resource
        const { data: post } = await client
          .from("community_posts")
          .select("user_id")
          .eq("id", resourceId)
          .single();

        return post?.user_id === userId;

      case "edit_comment":
      case "delete_comment":
        if (!resourceId) return false;

        // Check if user owns the comment
        const { data: comment } = await client
          .from("community_comments")
          .select("user_id")
          .eq("id", resourceId)
          .single();

        return comment?.user_id === userId;

      default:
        return true;
    }
  } catch (error) {
    console.error("Error validating user action:", error);
    return false;
  }
}
