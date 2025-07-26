import { NextRequest, NextResponse } from "next/server";
import {
  testCommunityFunctionality,
  testAuthenticatedOperations,
} from "@/lib/test/community-test";
import { createClient } from "@/lib/supabase/server-api";

export async function GET(_request: NextRequest) {
  try {
    console.log("🧪 Starting Community Functionality Test...");

    // Run basic functionality tests
    const basicResults = await testCommunityFunctionality();

    // Get current user for authenticated tests
    const supabase = await createClient();
    const {
      data: claims,
      error: userError,
    } = await supabase.auth.getClaims();

    let authResults = null;
    if (claims && claims.claims && claims.claims.sub && !userError) {
      authResults = await testAuthenticatedOperations(claims.claims.sub);
    }

    // Test database connectivity with a simple query
    const { data: _dbTest, error: dbError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    const testSummary = {
      timestamp: new Date().toISOString(),
      basicTests: basicResults,
      authenticatedTests: authResults,
      databaseConnectivity: {
        connected: !dbError,
        error: dbError?.message,
      },
      currentUser: claims && claims.claims && claims.claims.sub
        ? {
            id: claims.claims.sub,
            email: claims.claims.email,
          }
        : null,
      recommendations: [] as string[],
    };

    // Generate recommendations based on test results
    if (!basicResults.postsReadable) {
      testSummary.recommendations.push(
        "Posts are not readable - check RLS policies"
      );
    }
    if (!basicResults.commentsReadable) {
      testSummary.recommendations.push(
        "Comments are not readable - check RLS policies"
      );
    }
    if (!basicResults.apartmentsReadable) {
      testSummary.recommendations.push(
        "Apartments are not readable - check RLS policies"
      );
    }
    if (basicResults.errors.length > 0) {
      testSummary.recommendations.push("Database errors detected - check logs");
    }
    if (!claims || !claims.claims || !claims.claims.sub) {
      testSummary.recommendations.push(
        "No authenticated user - test with authentication for full functionality"
      );
    }

    if (testSummary.recommendations.length === 0) {
      testSummary.recommendations.push(
        "✅ All tests passed! Community functionality appears to be working correctly."
      );
    }

    return NextResponse.json(testSummary, { status: 200 });
  } catch (error) {
    console.error("Community test API error:", error);
    return NextResponse.json(
      {
        error: "Community test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST endpoint to test post creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, body: postBody, category, apartmentId } = body;

    const supabase = await createClient();

    // Check authentication
    const {
      data: claims,
      error: userError,
    } = await supabase.auth.getClaims();

    if (userError || !claims || !claims.claims || !claims.claims.sub) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required for post creation test",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Test post creation
    const { data: post, error: postError } = await supabase
      .from("community_posts")
      .insert([
        {
          title: title || "Test Post",
          body:
            postBody || "This is a test post created by the community test API",
          category: category || "FREE",
          apartment_id: apartmentId || "apt1",
          user_id: claims.claims.sub,
          status: "published",
        },
      ])
      .select()
      .single();

    if (postError) {
      return NextResponse.json(
        {
          success: false,
          error: "Post creation failed",
          details: postError.message,
          user: { id: claims.claims.sub, email: claims.claims.email },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Test post created successfully",
        post: {
          id: post.id,
          title: post.title,
          category: post.category,
          apartment_id: post.apartment_id,
        },
        user: { id: claims.claims.sub, email: claims.claims.email },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Community POST test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Post creation test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
