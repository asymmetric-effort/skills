---
name: pdv
description: Playwright-based post-deployment verification against live staging and production URLs
category: testing/e2e
tags: [playwright, post-deployment, verification, e2e, ci-cd, smoke-testing]
---

# Post-Deployment Verification (PDV)

## Purpose

Run Playwright-based post-deployment verification tests against live deployed URLs (staging or production). Verify that deployed applications are functioning correctly by checking visible content, JS console errors, screenshots, and user-facing behavior — serving as a CI/CD gate before promoting deployments.

## Prompt

Write or run post-deployment verification tests using Playwright. Follow these guidelines:

1. **Run against deployed URLs.** Tests target live staging or production URLs, not local dev servers. Accept the base URL as a parameter and never hardcode environment-specific URLs.
2. **Handle base path configuration.** Support applications deployed under sub-paths (e.g., `/app/`, `/v2/`). Configure Playwright's `baseURL` to include the base path. Use relative URLs in navigation calls.
3. **Scope selectors to page sections.** Never use unscoped selectors that match elements across the entire page. Always scope selectors to a specific section, component, or landmark:
   ```typescript
   // Bad: unscoped
   await page.locator('button').click();
   // Good: scoped to section
   await page.locator('[data-testid="checkout-form"] button').click();
   ```
4. **Verify visible content, not DOM state.** Assert on what users actually see. Use `toBeVisible()`, `toHaveText()`, and `toContainText()` instead of checking DOM attributes or internal state:
   ```typescript
   // Bad: DOM-only check
   expect(await page.locator('.status').getAttribute('data-loaded')).toBe('true');
   // Good: visible content check
   await expect(page.locator('.status')).toContainText('Ready');
   ```
5. **Check JavaScript console errors.** Listen for console errors and uncaught exceptions. Fail the test if unexpected JS errors appear on the page:
   ```typescript
   const errors: string[] = [];
   page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
   // ... navigate and interact ...
   expect(errors).toEqual([]);
   ```
6. **Capture screenshots on failure.** Configure Playwright to automatically capture screenshots when tests fail. Store screenshots as CI artifacts for debugging. Include a full-page screenshot and a targeted element screenshot when relevant.
7. **Support pixel/screenshot comparison.** When visual regression is important, use `toHaveScreenshot()` for pixel-level comparisons against baselines. Configure appropriate thresholds for acceptable visual differences.
8. **Add proper waits.** Never rely on fixed `sleep()` or `waitForTimeout()` calls. Use Playwright's built-in auto-waiting, `waitForLoadState()`, `waitForResponse()`, or `waitForSelector()`:
   ```typescript
   // Bad: fixed wait
   await page.waitForTimeout(3000);
   // Good: wait for specific condition
   await page.waitForLoadState('networkidle');
   await expect(page.locator('#dashboard')).toBeVisible();
   ```
9. **Use absolute URLs only for the base.** All navigation within tests should use relative paths. Only the initial base URL should be absolute. This ensures tests work across environments:
   ```typescript
   // Bad: absolute URL in test
   await page.goto('https://staging.example.com/dashboard');
   // Good: relative path with configured baseURL
   await page.goto('/dashboard');
   ```
10. **Support CI/CD gating.** Structure tests so they can serve as a deployment gate. Return clear pass/fail exit codes. Include a summary report with test names, durations, and failure details. Support JUnit XML output for CI integration.
11. **Prevent common pitfalls.** Explicitly guard against:
    - Unscoped selectors that match multiple elements
    - Absolute URLs in navigation (use relative + baseURL)
    - DOM-only assertions that miss visual regressions
    - Missing waits that cause flaky tests
    - Tests that depend on mutable production data

## Examples

**Basic PDV test structure:**
```typescript
import { test, expect } from '@playwright/test';

test('homepage loads and displays header', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header h1')).toContainText('Welcome');
  await expect(page.locator('[data-testid="nav"]')).toBeVisible();
});
```

**Console error check:**
```typescript
test('no JS errors on critical pages', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});
```

**CI/CD configuration (Playwright config):**
```typescript
export default defineConfig({
  use: {
    baseURL: process.env.DEPLOY_URL || 'https://staging.example.com',
    screenshot: 'only-on-failure',
  },
  reporter: [['junit', { outputFile: 'results.xml' }]],
});
```

**Running PDV as a deployment gate:**
```bash
DEPLOY_URL=https://staging.example.com npx playwright test --project=pdv
# Exit code 0 = safe to promote, non-zero = block deployment
```
