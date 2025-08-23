import { NextRequest, NextResponse } from 'next/server';
import { db } from '@rhiz/db';
import { growthEvent } from '@rhiz/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d
    const userId = searchParams.get('userId'); // Optional: filter by specific user

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Build base query with optional user filter
    const userFilter = userId ? sql`AND user_id = ${userId}` : sql``;

    // Get funnel data: invites → signups → activated users
    const funnelQuery = sql`
      WITH event_counts AS (
        SELECT 
          type,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM growth_event 
        WHERE created_at >= ${startDate}
        ${userFilter}
        GROUP BY type
      )
      SELECT 
        type,
        count,
        unique_users
      FROM event_counts
      ORDER BY 
        CASE type 
          WHEN 'invite_sent' THEN 1
          WHEN 'signup' THEN 2
          WHEN 'invite_redeemed' THEN 3
          WHEN 'share_clicked' THEN 4
          ELSE 5
        END;
    `;

    const funnelResult = await db.execute(funnelQuery);

    // Get viral coefficient (k-factor) - average invites per user
    const viralCoefficientQuery = sql`
      WITH user_invites AS (
        SELECT 
          user_id,
          COUNT(*) as invite_count
        FROM growth_event 
        WHERE type = 'invite_sent' 
        AND created_at >= ${startDate}
        ${userFilter}
        GROUP BY user_id
      )
      SELECT 
        AVG(invite_count) as avg_invites_per_user,
        COUNT(*) as users_who_invited,
        SUM(invite_count) as total_invites
      FROM user_invites;
    `;

    const viralResult = await db.execute(viralCoefficientQuery);

    // Get weekly active users trend
    const wauQuery = sql`
      WITH weekly_users AS (
        SELECT 
          DATE_TRUNC('week', created_at) as week,
          COUNT(DISTINCT user_id) as active_users
        FROM growth_event 
        WHERE created_at >= ${startDate}
        ${userFilter}
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY week
      )
      SELECT 
        week,
        active_users,
        LAG(active_users) OVER (ORDER BY week) as prev_week_users
      FROM weekly_users;
    `;

    const wauResult = await db.execute(wauQuery);

    // Get cohort analysis
    const cohortQuery = sql`
      WITH user_cohorts AS (
        SELECT 
          user_id,
          MIN(created_at) as first_event,
          DATE_TRUNC('week', MIN(created_at)) as cohort_week,
          COUNT(*) as total_events
        FROM growth_event 
        WHERE created_at >= ${startDate}
        ${userFilter}
        GROUP BY user_id
      ),
      cohort_stats AS (
        SELECT 
          cohort_week,
          COUNT(*) as cohort_size,
          AVG(total_events) as avg_events_per_user
        FROM user_cohorts
        GROUP BY cohort_week
        ORDER BY cohort_week
      )
      SELECT 
        cohort_week,
        cohort_size,
        avg_events_per_user
      FROM cohort_stats;
    `;

    const cohortResult = await db.execute(cohortQuery);

    // Get top referrers
    const topReferrersQuery = sql`
      SELECT 
        user_id,
        COUNT(*) as invite_count,
        COUNT(DISTINCT meta->>'code') as unique_codes
      FROM growth_event 
      WHERE type = 'invite_sent' 
      AND created_at >= ${startDate}
      ${userFilter}
      GROUP BY user_id
      ORDER BY invite_count DESC
      LIMIT 10;
    `;

    const topReferrersResult = await db.execute(topReferrersQuery);

    // Calculate conversion rates
    const funnel = funnelResult.rows.reduce((acc: any, row: any) => {
      acc[row.type] = {
        count: parseInt(row.count),
        uniqueUsers: parseInt(row.unique_users),
      };
      return acc;
    }, {});

    const viralData = viralResult.rows[0];
    const kFactor = parseFloat(viralData.avg_invites_per_user) || 0;

    // Calculate conversion rates
    const conversionRates = {
      inviteToSignup: funnel.signup?.count && funnel['invite_sent']?.count 
        ? (funnel.signup.count / funnel['invite_sent'].count * 100).toFixed(2)
        : 0,
      signupToRedeem: funnel['invite_redeemed']?.count && funnel.signup?.count
        ? (funnel['invite_redeemed'].count / funnel.signup.count * 100).toFixed(2)
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        
        // Funnel data
        funnel,
        conversionRates,
        
        // Viral metrics
        viralCoefficient: {
          kFactor: kFactor.toFixed(2),
          avgInvitesPerUser: parseFloat(viralData.avg_invites_per_user) || 0,
          usersWhoInvited: parseInt(viralData.users_who_invited) || 0,
          totalInvites: parseInt(viralData.total_invites) || 0,
        },
        
        // Weekly active users
        wau: wauResult.rows.map((row: any) => ({
          week: row.week,
          activeUsers: parseInt(row.active_users),
          prevWeekUsers: parseInt(row.prev_week_users) || 0,
          growth: row.prev_week_users 
            ? ((row.active_users - row.prev_week_users) / row.prev_week_users * 100).toFixed(2)
            : 0,
        })),
        
        // Cohort analysis
        cohorts: cohortResult.rows.map((row: any) => ({
          cohortWeek: row.cohort_week,
          cohortSize: parseInt(row.cohort_size),
          avgEventsPerUser: parseFloat(row.avg_events_per_user) || 0,
        })),
        
        // Top referrers
        topReferrers: topReferrersResult.rows.map((row: any) => ({
          userId: row.user_id,
          inviteCount: parseInt(row.invite_count),
          uniqueCodes: parseInt(row.unique_codes),
        })),
        
        // Summary metrics
        summary: {
          totalEvents: Object.values(funnel).reduce((sum: number, event: any) => sum + event.count, 0),
          totalUsers: new Set(Object.values(funnel).map((event: any) => event.uniqueUsers)).size,
          viralStatus: kFactor > 1 ? 'viral' : kFactor > 0.5 ? 'growing' : 'needs_improvement',
        },
      },
    });
  } catch (error) {
    console.error('Growth analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
