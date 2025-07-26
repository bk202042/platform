# Playwright Testing Best Practices
---
description: Playwright e2e testing best practices
globs:
alwaysApply: false
---
## Core Principles
- Tests should be **reproducible** and deterministic
- Tests should simulate **actual user interactions** and behaviors
- Tests should be **maintainable** and follow a consistent pattern
- Tests should be **isolated** from each other to prevent interdependencies
- Tests should be **fast** and efficient to support rapid development cycles

## Project Structure
- Store all tests under the `tests/` folder
- Name test files according to the system component being tested (conceptual component, not React component)
- Example: `tests/authentication.spec.ts`, `tests/shopping-cart.spec.ts`
- Group related tests in subdirectories when appropriate: `tests/auth/login.spec.ts`, `tests/auth/signup.spec.ts`
- Create shared fixtures in `tests/fixtures/` directory
- Store test utilities and helpers in `tests/utils/` directory

## Locator Strategy (In Order of Preference)
1. **Role-based locators** (MOST PREFERRED)
   ```typescript
   // Examples:
   await page.getByRole('button', { name: 'Submit' }).click();
   await page.getByRole('heading', { name: 'Welcome' }).isVisible();
   await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
   ```

2. **Semantic locators**
   ```typescript
   await page.getByLabel('Password').fill('secret123');
   await page.getByPlaceholder('Enter your email').fill('user@example.com');
   await page.getByText('Terms and Conditions').click();
   ```

3. **Test-specific attributes** (ONLY when necessary)
   ```typescript
   // Only use when role-based and semantic locators won't work
   await page.getByTestId('submit-button').click();
   ```

4. **CSS selectors** (LEAST PREFERRED - use only as a last resort)
   ```typescript
   // Avoid when possible
   await page.locator('.submit-btn').click();
   ```

## Test Structure
- Use descriptive test names that explain the behavior being tested
- Follow the Arrange-Act-Assert (AAA) pattern:
  1. **Arrange**: Set up test data and conditions
  2. **Act**: Perform the action being tested
  3. **Assert**: Verify the expected outcome

```typescript
test('user can log in with valid credentials', async ({ page }) => {
  // Arrange
  await page.goto('/login');

  // Act
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();

  // Assert
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

## Fixtures and Test Data
- Use Playwright fixtures for reusable setup and teardown
- Create custom fixtures for common scenarios (authenticated user, populated cart, etc.)
- Use dynamic test data generation to avoid test interdependencies
- Consider using libraries like `@faker-js/faker` for generating realistic test data

```typescript
// Example custom fixture
const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText('Welcome back')).toBeVisible();
    await use(page);
  }
});

test('authenticated user can access profile', async ({ authenticatedPage }) => {
  await authenticatedPage.getByRole('link', { name: 'Profile' }).click();
  await expect(authenticatedPage.getByRole('heading', { name: 'Your Profile' })).toBeVisible();
});
```

## Waiting and Assertions
- Avoid arbitrary waits (`page.waitForTimeout()`) - they make tests flaky
- Use built-in auto-waiting mechanisms
- Use explicit waiting when necessary:
  ```typescript
  await page.waitForURL('/dashboard');
  await page.waitForSelector('[data-loaded="true"]');
  ```
- Use strong assertions that verify the actual state:
  ```typescript
  // Preferred
  await expect(page.getByText('Success')).toBeVisible();

  // Avoid
  await page.getByText('Success');  // No assertion
  ```

## Handling Flakiness
- Identify and eliminate sources of flakiness:
  - Network conditions
  - Animation timing
  - State persistence between tests
  - Resource loading
- Use retry mechanisms judiciously:
  ```typescript
  test.describe.configure({ retries: 2 });
  ```
- Add explicit logging for debugging flaky tests

## Visual Testing
- Use screenshot assertions for critical UI components
- Compare visual snapshots with tolerance for minor pixel differences
- Store baseline images in version control
- Consider visual regression testing for critical flows

```typescript
// Visual comparison example
await expect(page.getByTestId('pricing-table')).toHaveScreenshot('pricing-table.png', {
  maxDiffPixelRatio: 0.01
});
```

## Performance Testing
- Measure and assert on key performance metrics:
  ```typescript
  const timing = await page.evaluate(() => JSON.stringify(window.performance.timing));
  const metrics = JSON.parse(timing);
  expect(metrics.domComplete - metrics.domLoading).toBeLessThan(1000);
  ```
- Use Playwright's built-in performance tracing

## Accessibility Testing
- Include accessibility checks in your test suite
- Use Playwright's integration with axe-core:
  ```typescript
  const accessibilityScanResults = await page.accessibility.snapshot();
  expect(accessibilityScanResults.violations).toEqual([]);
  ```

## Mobile and Responsive Testing
- Test on multiple viewport sizes:
  ```typescript
  test('responsive layout', async ({ page }) => {
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId('mobile-menu')).toBeVisible();

    // Desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByTestId('desktop-menu')).toBeVisible();
  });
  ```
- Use device emulation for mobile testing:
  ```typescript
  const iPhone = devices['iPhone 13'];
  const browser = await playwright.webkit.launch();
  const context = await browser.newContext({
    ...iPhone
  });
  ```

## CI/CD Integration
- Run tests in CI/CD pipelines on every pull request
- Configure appropriate timeouts and retry strategies for CI environments
- Generate and publish test reports
- Consider parallel test execution for large test suites

## Common Anti-Patterns to Avoid
- **Flaky selectors**: Avoid using selectors that might change frequently
- **Hardcoded waits**: Never use arbitrary timeouts
- **Test interdependencies**: Each test should be able to run independently
- **Overlapping tests**: Don't test the same functionality multiple times
- **Excessive mocking**: Try to test real user flows when possible
- **Brittle assertions**: Don't assert on implementation details that might change

## Debugging Tips
- Use `page.pause()` to pause test execution and inspect the state
- Enable tracing for detailed execution logs:
  ```typescript
  await context.tracing.start({ screenshots: true, snapshots: true });
  // Test actions...
  await context.tracing.stop({ path: 'trace.zip' });
  ```
- Use `test.only()` to run a single test during development
- Add detailed comments for complex test scenarios

Remember: The goal of testing is to increase confidence in your application, not to achieve 100% coverage at the expense of maintainability
