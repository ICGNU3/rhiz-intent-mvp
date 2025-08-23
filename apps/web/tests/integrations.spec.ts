import { test, expect } from '@playwright/test'

test.describe('Integrations Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the integrations page
    await page.goto('/settings/integrations')
  })

  test('should display integration cards', async ({ page }) => {
    // Check that all integration cards are present
    await expect(page.getByText('Slack')).toBeVisible()
    await expect(page.getByText('Google Calendar')).toBeVisible()
    await expect(page.getByText('CRM Sync')).toBeVisible()
  })

  test('should show connection status badges', async ({ page }) => {
    // Check that status badges are displayed
    await expect(page.getByText('Connected')).toBeVisible()
    await expect(page.getByText('Disconnected')).toBeVisible()
  })

  test('should display integration descriptions', async ({ page }) => {
    // Check that descriptions are present
    await expect(page.getByText('Get notifications and manage introductions directly in Slack')).toBeVisible()
    await expect(page.getByText('Import calendar events and attendees automatically')).toBeVisible()
    await expect(page.getByText('Sync contacts with HubSpot or Salesforce')).toBeVisible()
  })

  test('should show sync information for connected integrations', async ({ page }) => {
    // Check that sync information is displayed for connected integrations
    await expect(page.getByText('Last sync:')).toBeVisible()
    await expect(page.getByText('Connected users:')).toBeVisible()
    await expect(page.getByText('Events imported:')).toBeVisible()
  })

  test('should have connect buttons for disconnected integrations', async ({ page }) => {
    // Check that connect buttons are present for disconnected integrations
    await expect(page.getByRole('button', { name: 'Connect HubSpot' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Connect Salesforce' })).toBeVisible()
  })

  test('should have action buttons for connected integrations', async ({ page }) => {
    // Check that action buttons are present for connected integrations
    await expect(page.getByRole('button', { name: 'Open Slack' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sync Now' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible()
  })

  test('should handle connect button clicks', async ({ page }) => {
    // Test clicking connect buttons (they should not cause errors)
    await page.getByRole('button', { name: 'Connect HubSpot' }).click()
    
    // Should show an alert or handle the click gracefully
    // In this case, it shows an alert with "HubSpot integration coming soon!"
    // We can't easily test the alert in Playwright, but we can ensure no errors occur
  })

  test('should display loading state', async ({ page }) => {
    // Reload the page to see loading state
    await page.reload()
    
    // Should show loading spinner briefly
    await expect(page.locator('.animate-spin')).toBeVisible()
  })

  test('should have proper navigation structure', async ({ page }) => {
    // Check page title and structure
    await expect(page.getByRole('heading', { name: 'Integrations' })).toBeVisible()
    await expect(page.getByText('Connect your tools to enhance Rhiz with real-time data')).toBeVisible()
  })

  test('should display help text at bottom', async ({ page }) => {
    // Check that help text is present
    await expect(page.getByText('Need help with integrations?')).toBeVisible()
    await expect(page.getByText('integration documentation')).toBeVisible()
  })

  test('should handle sync button clicks', async ({ page }) => {
    // Test clicking sync buttons
    const syncButton = page.getByRole('button', { name: 'Sync Now' }).first()
    await syncButton.click()
    
    // Should handle the click without errors
    // In a real app, this would trigger an API call
  })

  test('should display integration icons', async ({ page }) => {
    // Check that integration icons are present
    await expect(page.locator('[data-testid="slack-icon"]')).toBeVisible()
    await expect(page.locator('[data-testid="calendar-icon"]')).toBeVisible()
    await expect(page.locator('[data-testid="database-icon"]')).toBeVisible()
  })

  test('should be responsive', async ({ page }) => {
    // Test responsive design
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Should still display all cards
    await expect(page.getByText('Slack')).toBeVisible()
    await expect(page.getByText('Google Calendar')).toBeVisible()
    await expect(page.getByText('CRM Sync')).toBeVisible()
  })
})
