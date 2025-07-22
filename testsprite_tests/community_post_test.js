// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Community Post Creation Test', () => {
  // Test user credentials
  const TEST_EMAIL = 'test@example.com';
  const TEST_PASSWORD = 'testpassword123';

  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Check if we need to sign in
    const isSignedIn = await page.evaluate(() => {
      return localStorage.getItem('supabase.auth.token') !== null;
    });

    if (!isSignedIn) {
      // Navigate to sign in page
      await page.goto('/auth/sign-in');

      // Fill in the sign in form
      await page.getByLabel('Email').fill(TEST_EMAIL);
      await page.getByLabel('Password').fill(TEST_PASSWORD);

      // Submit the form
      await page.getByRole('button', { name: /로그인|Sign in/i }).click();

      // Wait for navigation to complete
      await page.waitForURL('/**');
    }
  });

  test('Authenticated user can create a new community post', async ({ page }) => {
    // Navigate to community page
    await page.goto('/community');

    // Click on the "New Post" button
    await page.getByRole('button', { name: /새 글 작성|New Post/i }).click();

    // Wait for the dialog to appear
    await page.waitForSelector('div[role="dialog"]');

    // Select city (Ho Chi Minh City)
    await page.getByText('도시를 선택하세요').click();
    await page.getByRole('option', { name: 'Ho Chi Minh City' }).click();

    // Select apartment (Vinhomes Central Park)
    await page.getByText('아파트를 선택하세요').click();
    await page.getByRole('option', { name: 'Vinhomes Central Park' }).click();

    // Select category (QNA)
    await page.getByText('질문/답변').click();

    // Fill in the title
    await page.getByLabel('제목').fill('Test Community Post');

    // Fill in the body
    await page.getByLabel('본문').fill('This is a test post created by automated testing.');

    // Submit the form
    await page.getByRole('button', { name: /등록하기|Submit/i }).click();

    // Wait for the success toast notification
    await page.waitForSelector('div[role="status"]', {
      state: 'visible',
      timeout: 5000
    });

    // Verify the post was created successfully
    const successToast = await page.getByText(/success|성공/i);
    await expect(successToast).toBeVisible();

    // Verify the post appears in the post list
    await page.waitForSelector('div.post-card, article');
    const postTitle = await page.getByText('Test Community Post').first();
    await expect(postTitle).toBeVisible();

    // Click on the post to view details
    await postTitle.click();

    // Verify post detail page shows the correct content
    await page.waitForURL('**/community/**');
    await expect(page.getByText('Test Community Post')).toBeVisible();
    await expect(page.getByText('This is a test post created by automated testing.')).toBeVisible();
  });
});
