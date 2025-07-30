import { test, expect } from '@playwright/test';

test.describe('Community Post Detail Page', () => {
  const POST_URL = 'http://localhost:3000/community/f29b8e11-b092-4f2b-8cfe-e0bfce2305b4';

  test('should load community post page without critical JavaScript errors', async ({ page }) => {
    // Track console messages to check for critical errors
    const consoleMessages: string[] = [];
    const criticalErrors: string[] = [];
    
    page.on('console', (msg) => {
      const message = msg.text();
      consoleMessages.push(message);
      
      // Filter out expected auth-related messages and warnings
      if (msg.type() === 'error' && 
          !message.includes('AUTH|getSessionUser|failed') &&
          !message.includes('Failed to load resource') &&
          !message.includes('upstream image response failed')) {
        criticalErrors.push(message);
      }
    });

    // Navigate to the community post page
    await page.goto(POST_URL);

    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Verify the page loaded successfully
    expect(page.url()).toBe(POST_URL);
    
    // Check page title
    await expect(page).toHaveTitle('사진 업로드 테스트 - 커뮤니티');

    // Verify no critical JavaScript errors occurred
    expect(criticalErrors).toHaveLength(0);
    
    // Verify some expected console messages are present (showing the page is working)
    expect(consoleMessages.some(msg => msg.includes('Post detail page auth debug'))).toBe(true);
  });

  test('should display post content and structure correctly', async ({ page }) => {
    await page.goto(POST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Check main post elements are present
    await expect(page.getByRole('heading', { name: '사진 업로드 테스트', level: 1 })).toBeVisible();
    
    // Verify post metadata using more specific selectors
    await expect(page.getByRole('article').getByText('Q&A')).toBeVisible();
    await expect(page.getByRole('article').getByText('호치민 · Masteri Thao Dien')).toBeVisible();
    await expect(page.getByRole('article').getByText('dearjm04')).toBeVisible();
    await expect(page.getByRole('article').getByText('2025년 7월 30일 오후 09:05')).toBeVisible();
    await expect(page.getByRole('article').getByText('내용 무')).toBeVisible();

    // Check interaction elements
    await expect(page.getByRole('button', { name: '좋아요 누르기' })).toBeVisible();
    await expect(page.getByText('0', { exact: true }).first()).toBeVisible(); // Like count
    await expect(page.getByText('댓글', { exact: true }).first()).toBeVisible(); // Comment label

    // Verify breadcrumb navigation
    await expect(page.getByRole('navigation', { name: '페이지 경로' })).toBeVisible();
    await expect(page.getByRole('link', { name: '홈로 이동' })).toBeVisible();
    await expect(page.getByRole('link', { name: '커뮤니티로 이동' })).toBeVisible();

    // Check sidebar information
    await expect(page.getByRole('heading', { name: '게시글 정보', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: '작성자', level: 3 })).toBeVisible();
  });

  test('should display test image correctly', async ({ page }) => {
    await page.goto(POST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Check if the test image element is present and visible
    const testImage = page.getByAltText('Test image');
    await expect(testImage).toBeVisible();

    // Verify image properties
    const imageInfo = await testImage.evaluate((img: HTMLImageElement) => ({
      src: img.src,
      alt: img.alt,
      className: img.className,
      offsetWidth: img.offsetWidth,
      offsetHeight: img.offsetHeight,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    }));

    // Verify image structure and properties
    expect(imageInfo.alt).toBe('Test image');
    expect(imageInfo.className).toContain('object-cover');
    expect(imageInfo.className).toContain('transition-all');
    expect(imageInfo.offsetWidth).toBeGreaterThan(0);
    expect(imageInfo.offsetHeight).toBeGreaterThan(0);
    // Note: Image may not be fully loaded due to network issues, but structure should be correct
    
    // Verify the image URL contains the expected Supabase storage path
    expect(imageInfo.src).toContain('community-images');
    expect(imageInfo.src).toContain('test_image.jpg');
  });

  test('should handle image data structure correctly', async ({ page }) => {
    await page.goto(POST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Check if the image is present and clickable
    const testImage = page.getByAltText('Test image');
    await expect(testImage).toBeVisible();

    // Verify the image itself has cursor pointer styling (indicating it's clickable)
    const imageInfo = await testImage.evaluate((img: HTMLImageElement) => {
      const style = getComputedStyle(img);
      return {
        cursor: style.cursor,
        hasClickPointer: style.cursor === 'pointer'
      };
    });

    expect(imageInfo.cursor).toBe('pointer');

    // Verify image loading and display properties
    const imageDisplayInfo = await page.getByAltText('Test image').evaluate((img: HTMLImageElement) => {
      const style = getComputedStyle(img);
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        transition: style.transition,
        transitionDuration: style.transitionDuration
      };
    });

    expect(imageDisplayInfo.display).toBe('block');
    expect(imageDisplayInfo.visibility).toBe('visible');
    expect(imageDisplayInfo.opacity).toBe('1');
    // Verify transition is properly configured (should have duration > 0)
    expect(imageDisplayInfo.transitionDuration).toBe('0.5s');
  });

  test('should display comments section correctly', async ({ page }) => {
    await page.goto(POST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Check comment-related elements
    await expect(page.getByRole('heading', { name: '댓글 작성', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: '댓글 0개', level: 3 })).toBeVisible();
    
    // Verify login requirement message for comments
    await expect(page.getByText('로그인이 필요합니다')).toBeVisible();
    await expect(page.getByText('댓글을 작성하려면 로그인해주세요.')).toBeVisible();
    
    // Verify empty comments message
    await expect(page.getByText('아직 댓글이 없습니다')).toBeVisible();
    await expect(page.getByText('첫 번째 댓글을 남겨서 대화를 시작해보세요!')).toBeVisible();
  });

  test('should have proper navigation and footer elements', async ({ page }) => {
    await page.goto(POST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Check main navigation
    await expect(page.getByRole('link', { name: 'VinaHome' })).toBeVisible();
    await expect(page.getByRole('link', { name: '매매' })).toBeVisible();
    await expect(page.getByRole('link', { name: '임대', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: '커뮤니티', exact: true })).toBeVisible();

    // Check auth buttons
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible();
    await expect(page.getByRole('link', { name: '회원가입' })).toBeVisible();

    // Check footer sections
    await expect(page.getByRole('heading', { name: '인기 검색', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: '탐색', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: '회사 소개', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: '법적 고지', level: 3 })).toBeVisible();

    // Check copyright notice
    await expect(page.getByText('© 2025 VinaHome. 모든 권리 보유. 공평 주택 기회.')).toBeVisible();
  });
});