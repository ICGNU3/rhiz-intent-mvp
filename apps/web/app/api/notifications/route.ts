import { NextRequest, NextResponse } from 'next/server';
import { db, notification } from '@rhiz/db';
import { eq, and, desc } from 'drizzle-orm';
import { getUserId } from '@/lib/auth-mock';

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId') || '550e8400-e29b-41d4-a716-446655440001';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    try {
      // Query real notifications from database
      const notificationsData = await db
        .select({
          id: notification.id,
          action: notification.action,
          entityType: notification.entityType,
          entityId: notification.entityId,
          metadata: notification.metadata,
          createdAt: notification.createdAt,
          readAt: notification.readAt,
        })
        .from(notification)
        .where(
          and(
            eq(notification.workspaceId, workspaceId),
            eq(notification.userId, userId)
          )
        )
        .orderBy(desc(notification.createdAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json({ notifications: notificationsData });
    } catch (dbError) {
      console.log('Database query failed, falling back to mock data:', dbError);
      
      // Fallback to mock data
      const mockNotifications = [
        {
          id: '1',
          action: 'new_suggestion',
          entityType: 'suggestion',
          entityId: 'suggestion-1',
          metadata: {
            title: 'New introduction opportunity',
            description: 'Sarah Chen and Mike Rodriguez might be a great match',
            score: 85
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          readAt: null
        },
        {
          id: '2',
          action: 'goal_reminder',
          entityType: 'goal',
          entityId: 'goal-1',
          metadata: {
            title: 'Follow up reminder',
            description: 'Don\'t forget to follow up with David Kim about the funding opportunity',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // Tomorrow
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          readAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // Read 30 minutes ago
        },
        {
          id: '3',
          action: 'voice_note_processed',
          entityType: 'encounter',
          entityId: 'encounter-1',
          metadata: {
            title: 'Voice note processed',
            description: 'Your recent voice note has been analyzed and 3 new people were identified',
            peopleCount: 3,
            insightsCount: 2
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          readAt: null
        }
      ];

      return NextResponse.json({ notifications: mockNotifications });
    }
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const userId = 'demo-user-123'; // await requireUser();
    const { notificationIds } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Notification IDs array is required' },
        { status: 400 }
      );
    }

    // For demo purposes, use hardcoded workspace
    const demoWorkspaceId = '550e8400-e29b-41d4-a716-446655440001';
    const workspaceId = demoWorkspaceId;

    // Mark notifications as read
    // await db
    //   .update(notification)
    //   .set({ readAt: new Date() })
    //   .where(
    //     and(
    //       eq(notification.workspaceId, workspaceId),
    //       eq(notification.userId, userId),
    //       // Note: In a real implementation, you'd use 'in' operator for notificationIds
    //       // For now, we'll mark all unread notifications as read
    //       eq(notification.readAt, null)
    //     )
    //   );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
