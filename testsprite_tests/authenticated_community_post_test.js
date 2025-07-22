// @ts-check
import { test, expect } from '@playwright/test';
import { createTestClient, createOrSignInTestUser, cleanupTestData, verifyPostExists } from './utils/supabase-helpers';

test.describe('Authenticated Community Post Creation', () => {
  // Test user credentials
  const TEST_EMAIL = 'test-community@example.com';
  const TEST_PASSWORD = 'TestPassword123!';

  // Test post data
  const TEST_POST = {
    title: 'Automated Test Post',
    body: 'This is a test post created by the automated testing system. 자동화된 테스트 시스템에서 작성된 테스트 게시물입니다.',
    category: 'QNA'
  };

  let supabase;
  let testUser;

  test.beforeAll(async () => {
    // Create Supabase client
    supabase = createTestClient();

    // Create or sign in test user
    testUser = await createOrSignInTestUser(supabase, TEST_EMAIL, TEST_PASSWORD);

    // Clean up any existing test data
    await cleanupTestData(supabase, testUser.id);
  });

  test.afterAll(async () => {
    // Clean up test data
    await cleanupTestData(supabase, testUser.id);
  });

  test('Authenticated user can create a new community post and it persists in the database', async ({ page }) => {
    // Step 1: Sign in the user
    await page.goto('/auth/sign-in');

    await page.getByLabel(/Email|이메일/).fill(TEST_EMAIL);
    await page.getByLabel(/Password|비밀번호/).fill(TEST_PASSWORD);

    await page.getByRole('button', { name: /Sign in|로그인/ }).click();

    // Wait for successful login
    await page.waitForURL('/**');

    // Step 2: Navigate to community page
    await page.goto('/community');

    // Step 3: Open new post dialog
    await page.getByRole('button', { name: /New Post|새 글 작성/ }).click();

    // Wait for dialog to appear
    await page.waitForSelector('div[role="dialog"]');

    // Step 4: Fill in the post form
    // Select city
    await page.getByText(/Select city|도시를 선택하세요/).click();
    await page.getByRole('option', { name: 'Ho Chi Minh City' }).click();

    // Select apartment
    await page.getByText(/Select apartment|아파트를 선택하세요/).click();
    await page.getByRole('option', { name: 'Vinhomes Central Park' }).click();

    // Select category (QNA)
    await page.getByText(/질문\/답변|Q&A/).click();

    // Fill title
    await page.getByLabel(/Title|제목/).fill(TEST_POST.title);

    // Fill body
    await page.getByLabel(/Body|본문/).fill(TEST_POST.body);

    // Step 5: Submit the form
    await page.getByRole('button', { name: /Submit|등록하기/ }).click();

    // Step 6: Verify success toast appears
    await page.waitForSelector('div[role="status"]', {
      state: 'visible',
      timeout: 5000
    });

    // Step 7: Verify post appears in the list
    await page.waitForSelector('div.post-card, article');
    const postTitle = await page.getByText(TEST_POST.title).first();
    await expect(postTitle).toBeVisible();

    // Step 8: Click on the post to view details
    await postTitle.click();

    // Step 9: Verify post detail page shows the correct content
    await page.waitForURL('**/community/**');
    await expect(page.getByText(TEST_POST.title)).toBeVisible();
    await expect(page.getByText(TEST_POST.body)).toBeVisible();

    // Step 10: Verify post exists in the database
    const postExists = await verifyPostExists(supabase, {
      title: TEST_POST.title,
      body: TEST_POST.body,
      userId: testUser.id
    });

    expect(postExists).toBeTruthy();
  });

  test('User cannot create post without authentication', async ({ page }) => {
    // Sign out if signed in
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('supabase.auth.token');
    });
    await page.reload();

    // Navigate to community page
    await page.goto('/community');

    // Click on new post button
    await page.getByRole('button', { name: /New Post|새 글 작성/ }).click();

    // Wait for dialog
    await page.waitForSelector('div[role="dialog"]');

    // Verify authentication error is shown
    const errorMessage = await page.getByText(/Authentication required|로그인이 필요합니다/);
    await expect(errorMessage).toBeVisible();

    // Verify submit button is disabled or login prompt is shown
    const submitButton = page.getByRole('button', { name: /Submit|등록하기/ });
    const isDisabled = await submitButton.isDisabled();

    // Either the button should be disabled or a login prompt should be visible
    expect(isDisabled || await page.getByText(/Sign in|로그인/).isVisible()).toBeTruthy();
  });

  test('Form validation works correctly', async ({ page }) => {
    // Sign in
    await page.goto('/auth/sign-in');
    await page.getByLabel(/Email|이메일/).fill(TEST_EMAIL);
    await page.getByLabel(/Password|비밀번호/).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /Sign in|로그인/ }).click();
    await page.waitForURL('/**');

    // Navigate to community page
    await page.goto('/community');

    // Open new post dialog
    await page.getByRole('button', { name: /New Post|새 글 작성/ }).click();
    await page.waitForSelector('div[role="dialog"]');

    // Select city
    await page.getByText(/Select city|도시를 선택하세요/).click();
    await page.getByRole('option', { name: 'Ho Chi Minh City' }).click();

    // Try to submit without required fields
    await page.getByRole('button', { name: /Submit|등록하기/ }).click();

    // Verify validation errors appear
    const errorMessages = await page.locator('div.text-red-600, div.text-red-500').all();
    expect(errorMessages.length).toBeGreaterThan(0);

    // Fill in apartment
    await page.getByText(/Select apartment|아파트를 선택하세요/).click();
    await page.getByRole('option', { name: 'Vinhomes Central Park' }).click();

    // Fill in body with too many characters (over 2000)
    const longText = 'A'.repeat(2001);
    await page.getByLabel(/Body|본문/).fill(longText);

    // Try to submit again
    await page.getByRole('button', { name: /Submit|등록하기/ }).click();

    // Verify validation error for body length
    const bodyError = await page.getByText(/2000자 이내여야 합니다|must be at most 2000 characters/);
    await expect(bodyError).toBeVisible();
  });
});
