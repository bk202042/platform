// Authentication Debug Utilities
// Use these functions to diagnose authentication issues

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createApiClient } from "@/lib/supabase/server-api";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export async function debugServerAuth() {
  console.log("🔍 Debugging Server Authentication...");

  try {
    const supabase = await createServerClient();

    // Check if we can get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("Server User:", user ? `${user.id} (${user.email})` : "null");
    console.log("Server User Error:", userError);

    // Check if we can get the session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    console.log(
      "Server Session:",
      session ? `Valid session for ${session.user.email}` : "null"
    );
    console.log("Server Session Error:", sessionError);

    // Test auth.uid() function
    const { data: authUid, error: authUidError } = await supabase
      .rpc("get_auth_uid")
      .single();
    console.log("Server auth.uid():", authUid);
    console.log("Server auth.uid() Error:", authUidError);

    return {
      user,
      session,
      authUid,
      errors: { userError, sessionError, authUidError },
    };
  } catch (error) {
    console.error("Server Auth Debug Error:", error);
    return { error };
  }
}

export async function debugApiAuth() {
  console.log("🔍 Debugging API Authentication...");

  try {
    const supabase = await createApiClient();

    // Check if we can get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("API User:", user ? `${user.id} (${user.email})` : "null");
    console.log("API User Error:", userError);

    // Check if we can get the session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    console.log(
      "API Session:",
      session ? `Valid session for ${session.user.email}` : "null"
    );
    console.log("API Session Error:", sessionError);

    return {
      user,
      session,
      errors: { userError, sessionError },
    };
  } catch (error) {
    console.error("API Auth Debug Error:", error);
    return { error };
  }
}

export function debugBrowserAuth() {
  console.log("🔍 Debugging Browser Authentication...");

  const supabase = createBrowserClient();

  // This should be called from the client side
  return new Promise((resolve) => {
    supabase.auth.getUser().then(({ data: { user }, error: userError }) => {
      console.log(
        "Browser User:",
        user ? `${user.id} (${user.email})` : "null"
      );
      console.log("Browser User Error:", userError);

      supabase.auth
        .getSession()
        .then(({ data: { session }, error: sessionError }) => {
          console.log(
            "Browser Session:",
            session ? `Valid session for ${session.user.email}` : "null"
          );
          console.log("Browser Session Error:", sessionError);

          resolve({
            user,
            session,
            errors: { userError, sessionError },
          });
        });
    });
  });
}

export async function debugDatabaseConnection() {
  console.log("🔍 Debugging Database Connection...");

  try {
    const supabase = await createServerClient();

    // Test basic database connectivity
    const { data: _testData, error: testError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    console.log("Database Connection Test:", testError ? "FAILED" : "SUCCESS");
    console.log("Database Error:", testError);

    // Test RLS policies
    const { data: postsData, error: postsError } = await supabase
      .from("community_posts")
      .select("id, user_id, status")
      .limit(5);

    console.log("Posts Query Test:", postsError ? "FAILED" : "SUCCESS");
    console.log("Posts Data Count:", postsData?.length || 0);
    console.log("Posts Error:", postsError);

    return {
      databaseConnected: !testError,
      postsAccessible: !postsError,
      postsCount: postsData?.length || 0,
      errors: { testError, postsError },
    };
  } catch (error) {
    console.error("Database Debug Error:", error);
    return { error };
  }
}

// Helper function to create auth.uid() RPC function if it doesn't exist
export async function createAuthUidFunction() {
  const supabase = await createServerClient();

  const { error } = await supabase.rpc("create_auth_uid_function");

  if (error) {
    console.error("Failed to create auth.uid() function:", error);
  } else {
    console.log("✅ auth.uid() function created successfully");
  }

  return !error;
}
