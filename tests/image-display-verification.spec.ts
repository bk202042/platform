import { test, expect } from '@playwright/test';

test.describe('Community Post Image Display Verification', () => {
  test('should verify that uploaded images are visible in post detail page', async ({ page }) => {
    // Navigate to the community page
    await page.goto('http://localhost:3000/community');
    
    // Wait for the page to load
    await expect(page.getByRole('heading', { name: '동네생활' })).toBeVisible();
    
    // Find and click on the "사진 업로드 테스트" post
    const photoTestPost = page.getByRole('button', { name: '게시글: 사진 업로드 테스트' });
    await expect(photoTestPost).toBeVisible();
    await photoTestPost.click();
    
    // Wait for navigation to post detail page
    await page.waitForURL('**/community/**');
    await expect(page.getByRole('heading', { name: '사진 업로드 테스트' })).toBeVisible();
    
    // Verify the post title and basic information
    await expect(page.locator('article').getByText('dearjm04')).toBeVisible();
    await expect(page.locator('article').getByText('호치민 · Masteri Thao Dien')).toBeVisible();
    
    // Critical test: Check for presence of images in the post content
    // The post should contain uploaded images if the feature is working correctly
    const postContent = page.locator('article').first();
    
    // Look for image elements within the post content
    const images = postContent.locator('img').filter({ 
      hasNot: page.locator('[data-testid="user-avatar"], [alt="User Avatar"]') 
    });
    
    // This test will currently fail if images are not displaying
    // When the bug is fixed, images should be visible
    const imageCount = await images.count();
    
    if (imageCount === 0) {
      console.log('❌ NO IMAGES FOUND: The image display issue is confirmed.');
      console.log('Expected: Uploaded images should be visible in the post content');
      console.log('Actual: No images found in post content area');
      
      // For now, we'll expect this to fail until the bug is fixed
      expect(imageCount, 'Images should be visible in the post content when the bug is fixed').toBeGreaterThan(0);
    } else {
      console.log(`✅ IMAGES FOUND: ${imageCount} image(s) are now visible in the post`);
      
      // Verify images are properly loaded
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        await expect(image).toBeVisible();
        
        // Check that the image has a valid src attribute
        const src = await image.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).not.toBe('');
        
        // Verify the image actually loads (not broken)
        const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
    
    // Additional verification: Check for any error messages or broken image placeholders
    const errorMessages = page.locator('text=이미지를 불러올 수 없습니다');
    await expect(errorMessages).toHaveCount(0);
    
    // Verify that the post is not showing "No content" if images should be present
    const postText = await postContent.textContent();
    if (imageCount === 0) {
      // If no images are found, this suggests the bug is still present
      console.log('Post content text:', postText);
    }
  });
  
  test('should verify community list page shows posts correctly', async ({ page }) => {
    // Navigate to community page
    await page.goto('http://localhost:3000/community');
    
    // Verify page loads correctly
    await expect(page.getByRole('heading', { name: '동네생활' })).toBeVisible();
    
    // Verify the test post is visible in the list
    const testPost = page.getByRole('button', { name: '게시글: 사진 업로드 테스트' });
    await expect(testPost).toBeVisible();
    
    // Verify post metadata is displayed
    await expect(testPost.locator('text=Q&A')).toBeVisible();
    await expect(testPost.locator('text=호치민 Masteri Thao Dien')).toBeVisible();
    await expect(testPost.locator('text=dearjm04')).toBeVisible();
  });
});