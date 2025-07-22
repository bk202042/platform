// @ts-check
import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for testing
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createTestClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Creates a test user or signs in an existing one
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('@supabase/supabase-js').User>}
 */
export async function createOrSignInTestUser(supabase, email, password) {
  // Try to sign in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  // If user exists, return the user
  if (signInData?.user) {
    return signInData.user;
  }

  // If user doesn't exist, create a new one
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    throw new Error(`Failed to create test user: ${signUpError.message}`);
  }

  if (!signUpData?.user) {
    throw new Error('Failed to create test user: No user returned');
  }

  // Create a profile for the user
  await supabase.from('profiles').insert({
    id: signUpData.user.id,
    first_name: 'Test',
    last_name: 'User'
  });

  return signUpData.user;
}

/**
 * Cleans up test data
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 */
export async function cleanupTestData(supabase, userId) {
  // Delete test posts
  const { data: posts } = await supabase
    .from('community_posts')
    .select('id')
    .eq('user_id', userId);

  if (posts && posts.length > 0) {
    const postIds = posts.map(post => post.id);

    // Delete likes
    await supabase
      .from('community_likes')
      .delete()
      .in('post_id', postIds);

    // Delete comments
    await supabase
      .from('community_comments')
      .delete()
      .in('post_id', postIds);

    // Delete posts
    await supabase
      .from('community_posts')
      .delete()
      .in('id', postIds);
  }
}

/**
 * Verifies a post exists in the database
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object} postData
 * @returns {Promise<boolean>}
 */
export async function verifyPostExists(supabase, { title, body, userId }) {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('title', title)
    .eq('body', body)
    .eq('user_id', userId)
    .single();

  return !!data && !error;
}
