import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export interface AuthResult {
  user: User | null;
  error: AuthError | null;
}

export interface AuthError {
  type: "network" | "expired" | "invalid" | "server";
  message: string;
  recoverable: boolean;
  retryCount: number;
}

/**
 * Server-side authentication verification with comprehensive error handling
 * @returns Promise<AuthResult> - Authentication result with user data or error
 */
export async function getServerAuth(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Server auth error:", error);

      // Categorize the error type
      let errorType: AuthError["type"] = "server";
      let recoverable = true;

      if (error.message.includes("JWT") || error.message.includes("token")) {
        errorType = "expired";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorType = "network";
      } else if (error.message.includes("invalid")) {
        errorType = "invalid";
        recoverable = false;
      }

      return {
        user: null,
        error: {
          type: errorType,
          message: error.message,
          recoverable,
          retryCount: 0,
        },
      };
    }

    return {
      user,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected server auth error:", error);

    return {
      user: null,
      error: {
        type: "server",
        message:
          error instanceof Error ? error.message : "Unknown server error",
        recoverable: true,
        retryCount: 0,
      },
    };
  }
}

/**
 * Validates user session and refreshes if necessary
 * @returns Promise<AuthResult> - Validated authentication result
 */
export async function validateAndRefreshSession(): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    // First try to get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session validation error:", sessionError);
      return {
        user: null,
        error: {
          type: "invalid",
          message: sessionError.message,
          recoverable: false,
          retryCount: 0,
        },
      };
    }

    if (!session) {
      return {
        user: null,
        error: {
          type: "expired",
          message: "No active session found",
          recoverable: true,
          retryCount: 0,
        },
      };
    }

    // Check if token is close to expiration (within 5 minutes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;

    if (expiresAt && expiresAt - now < fiveMinutes) {
      // Attempt to refresh the session
      const {
        data: { session: refreshedSession },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error("Session refresh error:", refreshError);
        return {
          user: null,
          error: {
            type: "expired",
            message: "Failed to refresh session",
            recoverable: true,
            retryCount: 0,
          },
        };
      }

      return {
        user: refreshedSession?.user || null,
        error: null,
      };
    }

    return {
      user: session.user,
      error: null,
    };
  } catch (error) {
    console.error("Session validation unexpected error:", error);

    return {
      user: null,
      error: {
        type: "server",
        message:
          error instanceof Error ? error.message : "Session validation failed",
        recoverable: true,
        retryCount: 0,
      },
    };
  }
}

/**
 * Checks if user has required permissions for a specific action
 * @param user - User object to check permissions for
 * @param action - Action to check permissions for
 * @returns boolean - Whether user has permission
 */
export function hasPermission(user: User | null, action: string): boolean {
  if (!user) return false;

  // Basic permission checks - can be extended based on user roles
  switch (action) {
    case "create_post":
    case "create_comment":
    case "like_post":
      return !!user.email_confirmed_at; // Require confirmed email
    case "delete_own_content":
      return !!user.id;
    case "admin_actions":
      // Check if user has admin role (would need to be stored in user metadata)
      return user.user_metadata?.role === "admin";
    default:
      return true; // Allow by default for unknown actions
  }
}

/**
 * Gets user profile data with error handling
 * @param userId - User ID to fetch profile for
 * @returns Promise<any> - User profile data or null
 */
export async function getUserProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return null;
  }
}

/**
 * Simple server-side user fetcher for initial user data
 * This replaces the removed getInitialUser function from AuthProvider
 * @returns Promise<User | null> - User data or null
 */
export async function getInitialUser(): Promise<User | null> {
  try {
    const authResult = await getServerAuth();
    return authResult.user;
  } catch (error) {
    console.error("Error getting initial user:", error);
    return null;
  }
}
