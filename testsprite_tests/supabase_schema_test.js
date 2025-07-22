// @ts-check
import { test, expect } from '@playwright/test';
import { createTestClient } from './utils/supabase-helpers';

test.describe('Supabase Database Schema', () => {
  let supabase;

  test.beforeAll(async () => {
    supabase = createTestClient();
  });

  test('Community tables exist with correct structure', async () => {
    // Check cities table
    const { data: citiesInfo, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(1);

    expect(citiesError).toBeNull();
    expect(citiesInfo).toBeDefined();

    // Check apartments table
    const { data: apartmentsInfo, error: apartmentsError } = await supabase
      .from('apartments')
      .select('*')
      .limit(1);

    expect(apartmentsError).toBeNull();
    expect(apartmentsInfo).toBeDefined();

    // Check community_posts table
    const { data: postsInfo, error: postsError } = await supabase
      .rpc('get_table_definition', { table_name: 'community_posts' });

    expect(postsError).toBeNull();

    // Verify community_posts has required columns
    const requiredColumns = ['id', 'apartment_id', 'user_id', 'category', 'title', 'body', 'images', 'created_at'];
    if (postsInfo) {
      const columnNames = postsInfo.map(col => col.column_name);
      requiredColumns.forEach(col => {
        expect(columnNames).toContain(col);
      });
    }

    // Check community_likes table
    const { error: likesError } = await supabase
      .from('community_likes')
      .select('id')
      .limit(1);

    expect(likesError).toBeNull();

    // Check community_comments table
    const { error: commentsError } = await supabase
      .from('community_comments')
      .select('id')
      .limit(1);

    expect(commentsError).toBeNull();
  });

  test('Row Level Security policies are properly configured', async () => {
    // This test verifies that RLS policies are working correctly

    // Try to read posts without authentication (should work)
    const { error: readError } = await supabase
      .from('community_posts')
      .select('*')
      .limit(1);

    expect(readError).toBeNull();

    // Try to insert a post without authentication (should fail)
    const { error: insertError } = await supabase
      .from('community_posts')
      .insert([{
        apartment_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        category: 'QNA',
        body: 'Test post',
        user_id: '00000000-0000-0000-0000-000000000000' // Fake user ID
      }]);

    expect(insertError).not.toBeNull();
    expect(insertError.code).toBe('42501'); // Permission denied
  });
});
