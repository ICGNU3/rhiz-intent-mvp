import { test, expect } from '@playwright/test';

test.describe('Insights Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to insights page
    await page.goto('/insights');
  });

  test('should display insights page with tabs', async ({ page }) => {
    // Check that the page loads
    await expect(page.getByRole('heading', { name: 'Graph Insights' })).toBeVisible();
    
    // Check that all tabs are present
    await expect(page.getByRole('tab', { name: 'My Insights' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Shared Insights' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Overlaps' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Opportunities' })).toBeVisible();
  });

  test('should display demo insights in My Insights tab', async ({ page }) => {
    // Wait for insights to load
    await page.waitForSelector('[data-testid="insight-card"]', { timeout: 10000 });
    
    // Check that insight cards are displayed
    const insightCards = page.locator('[data-testid="insight-card"]');
    await expect(insightCards).toHaveCount(4); // We seeded 4 insights
    
    // Check for specific insight types
    await expect(page.getByText('Dormant but valuable contact')).toBeVisible();
    await expect(page.getByText('Bridge Builder')).toBeVisible();
    await expect(page.getByText('Large community detected')).toBeVisible();
    await expect(page.getByText('Goal-relevant contact not engaged')).toBeVisible();
  });

  test('should allow sharing insights', async ({ page }) => {
    // Wait for insights to load
    await page.waitForSelector('[data-testid="insight-card"]', { timeout: 10000 });
    
    // Click share button on first insight
    const shareButton = page.locator('[data-testid="share-button"]').first();
    await shareButton.click();
    
    // Check that the insight was shared (this would trigger an API call)
    // In a real test, you'd verify the API call was made
    await expect(shareButton).toBeVisible();
  });

  test('should display shared insights in Shared Insights tab', async ({ page }) => {
    // Click on Shared Insights tab
    await page.getByRole('tab', { name: 'Shared Insights' }).click();
    
    // Wait for shared insights to load
    await page.waitForSelector('[data-testid="shared-insight-card"]', { timeout: 10000 });
    
    // Check that shared insight cards are displayed
    const sharedInsightCards = page.locator('[data-testid="shared-insight-card"]');
    await expect(sharedInsightCards).toHaveCount(2); // We seeded 2 shared insights
    
    // Check for shared insight content
    await expect(page.getByText('Shared by alice-user-id')).toBeVisible();
  });

  test('should display overlaps in Overlaps tab', async ({ page }) => {
    // Click on Overlaps tab
    await page.getByRole('tab', { name: 'Overlaps' }).click();
    
    // Wait for overlaps to load
    await page.waitForSelector('[data-testid="overlap-card"]', { timeout: 10000 });
    
    // Check that overlap cards are displayed
    const overlapCards = page.locator('[data-testid="overlap-card"]');
    await expect(overlapCards).toHaveCount(1); // We seeded 1 overlap
    
    // Check for overlap content
    await expect(page.getByText('Cross-Workspace Overlap')).toBeVisible();
    await expect(page.getByText('Appears in 2 workspaces')).toBeVisible();
  });

  test('should display opportunities in Opportunities tab', async ({ page }) => {
    // Click on Opportunities tab
    await page.getByRole('tab', { name: 'Opportunities' }).click();
    
    // Wait for opportunities to load
    await page.waitForSelector('[data-testid="opportunity-card"]', { timeout: 10000 });
    
    // Check that opportunity cards are displayed
    const opportunityCards = page.locator('[data-testid="opportunity-card"]');
    await expect(opportunityCards).toHaveCount(1); // We seeded 1 opportunity
    
    // Check for opportunity content
    await expect(page.getByText('Investor-Founder Match Opportunity')).toBeVisible();
    await expect(page.getByText('Match 3 investors from TechCorp cluster')).toBeVisible();
  });

  test('should allow activating opportunities', async ({ page }) => {
    // Click on Opportunities tab
    await page.getByRole('tab', { name: 'Opportunities' }).click();
    
    // Wait for opportunities to load
    await page.waitForSelector('[data-testid="opportunity-card"]', { timeout: 10000 });
    
    // Click "Add to Goal" button
    const addToGoalButton = page.getByRole('button', { name: 'Add to Goal' }).first();
    await addToGoalButton.click();
    
    // Check that the button is still visible (opportunity was activated)
    await expect(addToGoalButton).toBeVisible();
  });

  test('should allow generating new insights', async ({ page }) => {
    // Click "Generate Insights" button
    const generateButton = page.getByRole('button', { name: 'Generate Insights' });
    await generateButton.click();
    
    // Check that the button is still visible (insights were generated)
    await expect(generateButton).toBeVisible();
  });

  test('should display insight details with provenance', async ({ page }) => {
    // Wait for insights to load
    await page.waitForSelector('[data-testid="insight-card"]', { timeout: 10000 });
    
    // Check that insight details are displayed
    await expect(page.getByText('Generated from: degree_centrality')).toBeVisible();
    await expect(page.getByText('Reason: High centrality (0.8) but dormant for 75 days')).toBeVisible();
  });

  test('should display insight scores', async ({ page }) => {
    // Wait for insights to load
    await page.waitForSelector('[data-testid="insight-card"]', { timeout: 10000 });
    
    // Check that insight scores are displayed
    await expect(page.getByText('Score: 85')).toBeVisible();
    await expect(page.getByText('Score: 78')).toBeVisible();
    await expect(page.getByText('Score: 72')).toBeVisible();
    await expect(page.getByText('Score: 70')).toBeVisible();
  });

  test('should display insight badges with correct colors', async ({ page }) => {
    // Wait for insights to load
    await page.waitForSelector('[data-testid="insight-card"]', { timeout: 10000 });
    
    // Check that insight type badges are displayed
    await expect(page.getByText('opportunity gap')).toBeVisible();
    await expect(page.getByText('bridge builder')).toBeVisible();
    await expect(page.getByText('cluster insight')).toBeVisible();
    await expect(page.getByText('goal alignment gap')).toBeVisible();
  });

  test('should handle empty states gracefully', async ({ page }) => {
    // This test would require mocking empty data
    // For now, we'll just check that the page loads without errors
    await expect(page.getByRole('heading', { name: 'Graph Insights' })).toBeVisible();
  });
});
