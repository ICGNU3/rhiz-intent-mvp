import { test, expect } from '@playwright/test';

test.describe('Intent Cards', () => {
  test('should display seeded Intent Cards on home page', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is correct
    await expect(page.locator('h1')).toContainText('Welcome to Rhiz');
    
    // Check that Intent Cards section exists
    await expect(page.locator('h2')).toContainText('Your Intent Cards');
    
    // Wait for Intent Cards to load (they should be visible after seeding)
    await page.waitForSelector('[data-testid="intent-card"]', { timeout: 10000 });
    
    // Check that at least one Intent Card is displayed
    const intentCards = page.locator('[data-testid="intent-card"]');
    await expect(intentCards).toHaveCount(1);
    
    // Check that the Intent Card shows the seeded goal
    await expect(page.locator('[data-testid="intent-card"]')).toContainText('Raise $2M Seed Round');
    
    // Check that the goal kind is displayed
    await expect(page.locator('[data-testid="intent-card"]')).toContainText('Raise Seed');
    
    // Check that suggestions are displayed
    await expect(page.locator('h4')).toContainText('Top Suggestions');
    
    // Check that at least one suggestion is shown
    const suggestions = page.locator('[data-testid="suggestion"]');
    await expect(suggestions).toHaveCount(2); // Top 2 suggestions
    
    // Check that the first suggestion shows the correct people
    await expect(suggestions.first()).toContainText('Sarah Chen');
    await expect(suggestions.first()).toContainText('Michael Rodriguez');
    
    // Check that insight is displayed
    await expect(page.locator('h4')).toContainText('Insight');
    
    // Check that the insight has a confidence score
    await expect(page.locator('[data-testid="insight"]')).toContainText('% confidence');
  });
  
  test('should show loading state while fetching Intent Cards', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Check that loading state is shown initially
    await expect(page.locator('text=Loading intent cards...')).toBeVisible();
    
    // Wait for Intent Cards to load
    await page.waitForSelector('[data-testid="intent-card"]', { timeout: 10000 });
    
    // Check that loading state is no longer visible
    await expect(page.locator('text=Loading intent cards...')).not.toBeVisible();
  });
  
  test('should display correct suggestion scores', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for Intent Cards to load
    await page.waitForSelector('[data-testid="intent-card"]', { timeout: 10000 });
    
    // Check that suggestion scores are displayed
    const scoreBadges = page.locator('[data-testid="suggestion-score"]');
    await expect(scoreBadges).toHaveCount(2);
    
    // Check that scores are numbers between 0-100
    for (let i = 0; i < 2; i++) {
      const scoreText = await scoreBadges.nth(i).textContent();
      const score = parseInt(scoreText || '0');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
  
  test('should show mutual interests in suggestions', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for Intent Cards to load
    await page.waitForSelector('[data-testid="intent-card"]', { timeout: 10000 });
    
    // Check that mutual interests are displayed
    await expect(page.locator('[data-testid="suggestion"]')).toContainText('startups');
    await expect(page.locator('[data-testid="suggestion"]')).toContainText('product management');
  });
  
  test('should have working View Details button', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for Intent Cards to load
    await page.waitForSelector('[data-testid="intent-card"]', { timeout: 10000 });
    
    // Check that View Details button exists
    const viewDetailsButton = page.locator('button:has-text("View Details")');
    await expect(viewDetailsButton).toBeVisible();
    
    // Click the View Details button
    await viewDetailsButton.first().click();
    
    // Should navigate to a details page (implementation dependent)
    // For now, just check that the button is clickable
    await expect(viewDetailsButton.first()).toBeEnabled();
  });
});
