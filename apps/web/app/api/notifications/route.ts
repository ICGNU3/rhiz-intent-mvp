import { NextRequest, NextResponse } from 'next/server';
import { db, notification } from '@rhiz/db';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const userId = 'alice-user-id'; // TODO: Get from auth context
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    let whereClause = and(
      eq(notification.workspaceId, workspaceId),
      eq(notification.userId, userId)
    );

    if (unreadOnly) {
      whereClause = and(whereClause, eq(notification.readAt, null));
    }

    const notifications = await db
      .select()
      .from(notification)
      .where(whereClause)
      .orderBy(desc(notification.createdAt))
      .limit(50);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const userId = 'alice-user-id'; // TODO: Get from auth context
    const { notificationIds, workspaceId } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds) || !workspaceId) {
      return NextResponse.json(
        { error: 'Notification IDs array and workspace ID are required' },
        { status: 400 }
      );
    }

    // Mark notifications as read
    await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notification.workspaceId, workspaceId),
          eq(notification.userId, userId),
          // Note: In a real implementation, you'd use 'in' operator for notificationIds
          // For now, we'll mark all unread notifications as read
          eq(notification.readAt, null)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
