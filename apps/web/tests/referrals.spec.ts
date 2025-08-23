import { test, expect } from '@playwright/test';

test.describe('Referrals Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API responses for testing
    await page.route('/api/referrals', async (route) => {
      const postData = route.postDataJSON();
      
      if (postData.action === 'create') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            referralCode: {
              id: 'test-code-id',
              code: 'TEST123',
              creatorId: 'current-user-id',
              maxUses: 10,
              used: 0,
              rewardType: 'upgrade',
              rewardValue: 30,
              createdAt: new Date().toISOString(),
              expiresAt: null,
            },
          }),
        });
      }
    });

    await page.route('/api/referrals/tree*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            tree: [
              {
                level: 1,
                inviterId: 'current-user-id',
                inviteeId: 'user-1',
                isDirectInvitee: true,
              },
              {
                level: 1,
                inviterId: 'current-user-id',
                inviteeId: 'user-2',
                isDirectInvitee: true,
              },
              {
                level: 2,
                inviterId: 'user-1',
                inviteeId: 'user-3',
                isDirectInvitee: false,
              },
            ],
            stats: [
              { level: 1, count: 2 },
              { level: 2, count: 1 },
            ],
            totals: {
              totalInvitees: 3,
              totalEdges: 3,
            },
            privacy: {
              showDetails: (level: number) => level === 1,
              maxDepth: 3,
            },
          },
        }),
      });
    });

    await page.goto('/referrals');
  });

  test('should display referral page with all components', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Referrals & Invites' })).toBeVisible();
    await expect(page.getByText('Grow your network and earn rewards by inviting others to Rhiz')).toBeVisible();

    // Check referral link section
    await expect(page.getByText('Your Referral Link')).toBeVisible();
    await expect(page.getByText('Share this link with friends and colleagues to earn rewards')).toBeVisible();

    // Check stats cards
    await expect(page.getByText('Total Invites')).toBeVisible();
    await expect(page.getByText('Successful Signups')).toBeVisible();
    await expect(page.getByText('Earned Rewards')).toBeVisible();
    await expect(page.getByText('Conversion Rate')).toBeVisible();

    // Check invite tree section
    await expect(page.getByText('Your Invite Tree')).toBeVisible();
    await expect(page.getByText('Visual representation of your network growth')).toBeVisible();

    // Check recent activity section
    await expect(page.getByText('Recent Activity')).toBeVisible();
    await expect(page.getByText('Latest invites and signups from your network')).toBeVisible();
  });

  test('should generate and display referral link', async ({ page }) => {
    // Wait for the referral link to be generated
    await expect(page.getByRole('textbox')).toHaveValue(/http:\/\/localhost:\d+\/signup\?ref=TEST123/);
    
    // Check referral code badge
    await expect(page.getByText('Code: TEST123')).toBeVisible();
  });

  test('should copy referral link to clipboard', async ({ page }) => {
    // Mock clipboard API
    await page.addInitScript(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: async (text: string) => {
            (window as any).clipboardText = text;
            return Promise.resolve();
          },
        },
      });
    });

    // Click copy button
    await page.getByRole('button', { name: /copy/i }).click();

    // Check toast notification
    await expect(page.getByText('Copied!')).toBeVisible();
    await expect(page.getByText('Referral link copied to clipboard')).toBeVisible();
  });

  test('should share referral link', async ({ page }) => {
    // Mock Web Share API
    await page.addInitScript(() => {
      Object.assign(navigator, {
        share: async (data: any) => {
          (window as any).sharedData = data;
          return Promise.resolve();
        },
      });
    });

    // Click share button
    await page.getByRole('button', { name: /share/i }).click();

    // Verify share was called with correct data
    const sharedData = await page.evaluate(() => (window as any).sharedData);
    expect(sharedData.title).toBe('Join me on Rhiz');
    expect(sharedData.text).toContain('I\'m using Rhiz to build better relationships');
    expect(sharedData.url).toContain('/signup?ref=TEST123');
  });

  test('should display invite tree visualization', async ({ page }) => {
    // Check tree stats
    await expect(page.getByText('Level 1 Invites:')).toBeVisible();
    await expect(page.getByText('2')).toBeVisible(); // Level 1 count
    
    await expect(page.getByText('Level 2 Invites:')).toBeVisible();
    await expect(page.getByText('1')).toBeVisible(); // Level 2 count
  });

  test('should display recent activity', async ({ page }) => {
    // Check activity items
    await expect(page.getByText('Direct Invite')).toBeVisible();
    await expect(page.getByText('Level 2 Invite')).toBeVisible();
    
    // Check user IDs (truncated)
    await expect(page.getByText(/User ID: user-1\.\.\./)).toBeVisible();
    await expect(page.getByText(/User ID: user-2\.\.\./)).toBeVisible();
  });

  test('should display correct stats', async ({ page }) => {
    // Check total invites
    await expect(page.getByText('3')).toBeVisible(); // Total invitees
    
    // Check conversion rate (should be 100% in mock data)
    await expect(page.getByText('100%')).toBeVisible();
  });

  test('should show user tier specific messaging', async ({ page }) => {
    // Check Root Alpha user messaging
    await expect(page.getByText('10 invites remaining')).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Mock slow API response
    await page.route('/api/referrals/tree*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { tree: [], stats: [], totals: { totalInvitees: 0, totalEdges: 0 } },
        }),
      });
    });

    // Reload page to trigger loading state
    await page.reload();
    
    // Check loading message
    await expect(page.getByText('Loading referral data...')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/referrals', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Reload page to trigger error
    await page.reload();
    
    // Check error toast
    await expect(page.getByText('Error')).toBeVisible();
    await expect(page.getByText('Failed to load referral data')).toBeVisible();
  });
});

test.describe('Growth Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the growth analytics API
    await page.route('/api/analytics/growth*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            period: '7d',
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
            funnel: {
              invite_sent: { count: 100, uniqueUsers: 50 },
              signup: { count: 30, uniqueUsers: 30 },
              invite_redeemed: { count: 25, uniqueUsers: 25 },
            },
            conversionRates: {
              inviteToSignup: '30.00',
              signupToRedeem: '83.33',
            },
            viralCoefficient: {
              kFactor: '2.00',
              avgInvitesPerUser: 2.0,
              usersWhoInvited: 25,
              totalInvites: 100,
            },
            wau: [
              {
                week: new Date().toISOString(),
                activeUsers: 150,
                prevWeekUsers: 120,
                growth: '25.00',
              },
            ],
            cohorts: [
              {
                cohortWeek: new Date().toISOString(),
                cohortSize: 30,
                avgEventsPerUser: 5.2,
              },
            ],
            topReferrers: [
              {
                userId: 'user-123',
                inviteCount: 10,
                uniqueCodes: 1,
              },
            ],
            summary: {
              totalEvents: 300,
              totalUsers: 150,
              viralStatus: 'viral',
            },
          },
        }),
      });
    });

    await page.goto('/analytics/growth');
  });

  test('should display growth analytics dashboard', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Growth Analytics' })).toBeVisible();
    await expect(page.getByText('Track viral growth, user acquisition, and referral performance')).toBeVisible();

    // Check summary metrics
    await expect(page.getByText('Total Events')).toBeVisible();
    await expect(page.getByText('300')).toBeVisible();
    
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('150')).toBeVisible();
    
    await expect(page.getByText('Viral Coefficient')).toBeVisible();
    await expect(page.getByText('2.00')).toBeVisible();
    
    await expect(page.getByText('Viral Status')).toBeVisible();
    await expect(page.getByText('viral')).toBeVisible();
  });

  test('should display funnel chart', async ({ page }) => {
    await expect(page.getByText('Acquisition Funnel')).toBeVisible();
    await expect(page.getByText('User journey from invite to signup to activation')).toBeVisible();
    
    // Check conversion rates
    await expect(page.getByText('Invite → Signup:')).toBeVisible();
    await expect(page.getByText('30.00%')).toBeVisible();
    
    await expect(page.getByText('Signup → Redeem:')).toBeVisible();
    await expect(page.getByText('83.33%')).toBeVisible();
  });

  test('should display weekly active users chart', async ({ page }) => {
    await expect(page.getByText('Weekly Active Users')).toBeVisible();
    await expect(page.getByText('User activity trends over time')).toBeVisible();
  });

  test('should display cohort analysis', async ({ page }) => {
    await expect(page.getByText('Cohort Analysis')).toBeVisible();
    await expect(page.getByText('User retention and engagement by signup week')).toBeVisible();
  });

  test('should display top referrers', async ({ page }) => {
    await expect(page.getByText('Top Referrers')).toBeVisible();
    await expect(page.getByText('Users generating the most invites')).toBeVisible();
    
    // Check referrer data
    await expect(page.getByText('user-123...')).toBeVisible();
    await expect(page.getByText('10')).toBeVisible(); // invite count
  });

  test('should allow period selection', async ({ page }) => {
    // Check period selector
    await expect(page.getByRole('combobox')).toBeVisible();
    
    // Change period
    await page.getByRole('combobox').click();
    await page.getByText('Last 30 days').click();
    
    // Verify API was called with new period
    // (This would be verified by checking the route was called with correct params)
  });
});
