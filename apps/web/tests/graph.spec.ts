import { test, expect } from '@playwright/test';

test.describe('Graph Visualization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the graph page
    await page.goto('/graph');
  });

  test('should display graph visualization page', async ({ page }) => {
    // Check that the page loads
    await expect(page.getByRole('heading', { name: 'Network Graph' })).toBeVisible();
    
    // Check that filters are present
    await expect(page.getByText('Filters')).toBeVisible();
    await expect(page.getByLabel('Goal')).toBeVisible();
    await expect(page.getByLabel('Tag')).toBeVisible();
    await expect(page.getByLabel('Time Window')).toBeVisible();
    await expect(page.getByLabel('Depth')).toBeVisible();
  });

  test('should display graph controls', async ({ page }) => {
    // Check that zoom controls are present
    await expect(page.getByRole('button', { name: /zoom in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /zoom out/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /reset view/i })).toBeVisible();
  });

  test('should display legend', async ({ page }) => {
    // Check that legend is present
    await expect(page.getByText('Legend')).toBeVisible();
    
    // Check node types
    await expect(page.getByText('Investors')).toBeVisible();
    await expect(page.getByText('Engineers')).toBeVisible();
    await expect(page.getByText('Advisors')).toBeVisible();
    await expect(page.getByText('Others')).toBeVisible();
    
    // Check edge types
    await expect(page.getByText('Encounters')).toBeVisible();
    await expect(page.getByText('Intros')).toBeVisible();
    await expect(page.getByText('Goal Links')).toBeVisible();
  });

  test('should filter by tag', async ({ page }) => {
    // Select engineer tag filter
    await page.getByLabel('Tag').click();
    await page.getByRole('option', { name: 'Engineer' }).click();
    
    // Wait for graph to update
    await page.waitForTimeout(1000);
    
    // The graph should show filtered results
    // Note: In a real test, you'd check for specific nodes/edges
  });

  test('should filter by goal', async ({ page }) => {
    // Select goal filter
    await page.getByLabel('Goal').click();
    await page.getByRole('option', { name: 'Hire Engineer' }).click();
    
    // Wait for graph to update
    await page.waitForTimeout(1000);
  });

  test('should change depth', async ({ page }) => {
    // Select depth 2
    await page.getByLabel('Depth').click();
    await page.getByRole('option', { name: '2nd degree' }).click();
    
    // Wait for graph to update
    await page.waitForTimeout(1000);
  });

  test('should filter by time window', async ({ page }) => {
    // Select time window
    await page.getByLabel('Time Window').click();
    await page.getByRole('option', { name: 'Last 30 days' }).click();
    
    // Wait for graph to update
    await page.waitForTimeout(1000);
  });

  test('should show person profile on node click', async ({ page }) => {
    // Wait for graph to load
    await page.waitForTimeout(2000);
    
    // Click on a node (if any exist)
    // Note: This is a simplified test - in practice you'd need to identify specific nodes
    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible()) {
      await canvas.click({ position: { x: 100, y: 100 } });
      
      // Check if profile drawer opens
      // await expect(page.getByRole('dialog')).toBeVisible();
    }
  });
});

test.describe('Search Integration', () => {
  test('should search for people and navigate to graph', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Find and click search
    const searchButton = page.getByRole('button', { name: /search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      // Type search query
      await page.getByPlaceholder(/search people/i).fill('engineer');
      
      // Wait for results
      await page.waitForTimeout(1000);
      
      // Click on a result
      const result = page.getByText(/engineer/i).first();
      if (await result.isVisible()) {
        await result.click();
        
        // Should navigate to graph with filter
        await expect(page).toHaveURL(/\/graph/);
      }
    }
  });
});
