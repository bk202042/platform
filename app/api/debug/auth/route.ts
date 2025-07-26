import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-api";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authentication status
    const {
      data: claims,
      error: userError,
    } = await supabase.auth.getClaims();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // Test auth.uid() function
    const { data: authUidData, error: authUidError } =
      await supabase.rpc("get_auth_uid");

    // Test RLS context
    const { data: rlsContext, error: rlsError } =
      await supabase.rpc("debug_rls_context");

    // Test profile existence if user is authenticated
    let profileCheck = null;
    if (claims && claims.claims && claims.claims.sub) {
      const { data: profileData, error: profileError } = await supabase.rpc(
        "check_profile_exists",
        { p_user_id: claims.claims.sub }
      );
      profileCheck = { data: profileData, error: profileError };
    }

    // Test basic database connectivity
    const { data: _dbTest, error: dbError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    // Test community posts access
    const { data: postsTest, error: postsError } = await supabase
      .from("community_posts")
      .select("id, user_id, status, created_at")
      .limit(5);

    const debugInfo = {
      timestamp: new Date().toISOString(),
      authentication: {
        user: claims && claims.claims && claims.claims.sub
          ? {
              id: claims.claims.sub,
              email: claims.claims.email,
              created_at: claims.claims.created_at,
            }
          : null,
        userError,
        session: session
          ? {
              user_id: session.user.id,
              expires_at: session.expires_at,
            }
          : null,
        sessionError,
        authUid: authUidData,
        authUidError,
      },
      database: {
        connectivity: {
          success: !dbError,
          error: dbError,
        },
        rlsContext: {
          data: rlsContext,
          error: rlsError,
        },
        profileCheck,
        postsAccess: {
          success: !postsError,
          count: postsTest?.length || 0,
          error: postsError,
          sampleData: postsTest?.slice(0, 2), // Only show first 2 for privacy
        },
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? "Set"
          : "Missing",
      },
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error("Debug API Error:", error);
    return NextResponse.json(
      {
        error: "Debug API failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apartmentId, category, title, body: postBody } = body;

    const supabase = await createClient();

    // Get current user
    const {
      data: claims,
      error: userError,
    } = await supabase.auth.getClaims();

    if (userError || !claims || !claims.claims || !claims.claims.sub) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          userError,
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Test post creation using the debug function
    const { data: testResult, error: testError } = await supabase.rpc(
      "test_post_creation",
      {
        p_apartment_id: apartmentId,
        p_category: category,
        p_title: title,
        p_body: postBody,
        p_user_id: claims.claims.sub,
      }
    );

    return NextResponse.json(
      {
        testResult,
        testError,
        user: {
          id: claims.claims.sub,
          email: claims.claims.email,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Debug POST API Error:", error);
    return NextResponse.json(
      {
        error: "Debug POST API failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
