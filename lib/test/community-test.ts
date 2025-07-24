// Community Database Test
// This file tests the community functionality after the database fixes

import { createClient } from "@/lib/supabase/server-api";

export async function testCommunityFunctionality() {
  console.log("🧪 Testing Community Functionality...");

  const supabase = await createClient();
  const results = {
    postsReadable: false,
    commentsReadable: false,
    likesReadable: false,
    apartmentsReadable: false,
    citiesReadable: false,
    authFunctionWorks: false,
    errors: [] as string[],
  };

  try {
    // Test 1: Read posts
    const { data: posts, error: postsError } = await supabase
      .from("community_posts")
      .select("id, title, user_id, apartment_id, category, status")
      .eq("status", "published")
      .eq("is_deleted", false)
      .limit(5);

    if (postsError) {
      results.errors.push(`Posts read error: ${postsError.message}`);
    } else {
      results.postsReadable = true;
      console.log(`✅ Posts readable: ${posts?.length || 0} posts found`);
    }

    // Test 2: Read comments
    const { data: comments, error: commentsError } = await supabase
      .from("community_comments")
      .select("id, post_id, user_id, content")
      .eq("is_deleted", false)
      .limit(5);

    if (commentsError) {
      results.errors.push(`Comments read error: ${commentsError.message}`);
    } else {
      results.commentsReadable = true;
      console.log(
        `✅ Comments readable: ${comments?.length || 0} comments found`
      );
    }

    // Test 3: Read likes
    const { data: likes, error: likesError } = await supabase
      .from("community_likes")
      .select("id, post_id, user_id")
      .limit(5);

    if (likesError) {
      results.errors.push(`Likes read error: ${likesError.message}`);
    } else {
      results.likesReadable = true;
      console.log(`✅ Likes readable: ${likes?.length || 0} likes found`);
    }

    // Test 4: Read apartments
    const { data: apartments, error: apartmentsError } = await supabase
      .from("apartments")
      .select("id, name, city_id")
      .limit(5);

    if (apartmentsError) {
      results.errors.push(`Apartments read error: ${apartmentsError.message}`);
    } else {
      results.apartmentsReadable = true;
      console.log(
        `✅ Apartments readable: ${apartments?.length || 0} apartments found`
      );
    }

    // Test 5: Read cities
    const { data: cities, error: citiesError } = await supabase
      .from("cities")
      .select("id, name")
      .limit(5);

    if (citiesError) {
      results.errors.push(`Cities read error: ${citiesError.message}`);
    } else {
      results.citiesReadable = true;
      console.log(`✅ Cities readable: ${cities?.length || 0} cities found`);
    }

    // Test 6: Test auth function
    const { data: authUid, error: authError } =
      await supabase.rpc("get_auth_uid");

    if (authError) {
      results.errors.push(`Auth function error: ${authError.message}`);
    } else {
      results.authFunctionWorks = true;
      console.log(
        `✅ Auth function works: ${authUid || "null (expected for non-authenticated context)"}`
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Test execution error: ${errorMessage}`);
    console.error("❌ Test execution failed:", error);
  }

  // Summary
  const successCount = Object.values(results).filter((v) => v === true).length;
  const totalTests = 6;

  console.log(`\n📊 Test Results: ${successCount}/${totalTests} tests passed`);

  if (results.errors.length > 0) {
    console.log("❌ Errors found:");
    results.errors.forEach((error) => console.log(`  - ${error}`));
  }

  return results;
}

// Test function for authenticated operations (to be called from API route)
export async function testAuthenticatedOperations(userId: string) {
  console.log("🔐 Testing Authenticated Operations...");

  const supabase = await createClient();
  const results = {
    profileExists: false,
    canCreatePost: false,
    canCreateComment: false,
    canCreateLike: false,
    errors: [] as string[],
  };

  try {
    // Test 1: Check if profile exists
    const { data: profile, error: profileError } = await supabase.rpc(
      "check_profile_exists",
      { p_user_id: userId }
    );

    if (profileError) {
      results.errors.push(`Profile check error: ${profileError.message}`);
    } else if (profile && profile.length > 0) {
      results.profileExists = profile[0].profile_exists;
      console.log(`✅ Profile exists: ${profile[0].email || "No email"}`);
    }

    // Note: The following tests would require actual authentication context
    // which is not available in this test environment
    console.log(
      "ℹ️  Post/Comment/Like creation tests require authenticated context"
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Auth test execution error: ${errorMessage}`);
    console.error("❌ Auth test execution failed:", error);
  }

  return results;
}
