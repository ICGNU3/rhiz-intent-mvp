import { NextRequest, NextResponse } from 'next/server';
import { createGoogleCalendarIntegration } from '@rhiz/integrations';
import { db, integration } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';

// GET - Generate OAuth URL for Google Calendar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }
    
    const googleCalendar = createGoogleCalendarIntegration();
    if (!googleCalendar) {
      return NextResponse.json(
        { error: 'Google Calendar integration not configured' },
        { status: 500 }
      );
    }
    
    // Generate OAuth URL
    const authUrl = googleCalendar.generateAuthUrl(workspaceId);
    
    return NextResponse.json({
      authUrl,
      message: 'Redirect user to this URL to authorize Google Calendar access'
    });
    
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate OAuth URL' },
      { status: 500 }
    );
  }
}

// POST - Handle OAuth callback and import calendar data
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This should be the workspaceId
    const workspaceId = searchParams.get('workspaceId') || state;
    
    if (!code || !workspaceId) {
      return NextResponse.json(
        { error: 'Authorization code and workspace ID are required' },
        { status: 400 }
      );
    }
    
    const googleCalendar = createGoogleCalendarIntegration();
    if (!googleCalendar) {
      return NextResponse.json(
        { error: 'Google Calendar integration not configured' },
        { status: 500 }
      );
    }
    
    // Exchange code for tokens
    const tokenSuccess = await googleCalendar.exchangeCodeForTokens(code, workspaceId);
    
    if (!tokenSuccess) {
      return NextResponse.json(
        { error: 'Failed to exchange authorization code for tokens' },
        { status: 500 }
      );
    }
    
    // Import calendar events
    const importResult = await googleCalendar.importCalendarEvents(workspaceId, 30); // Last 30 days
    
    if (!importResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to import calendar events',
          details: importResult.error 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Google Calendar connected and data imported successfully',
      data: {
        eventsProcessed: importResult.eventsProcessed,
        peopleCreated: importResult.peopleCreated,
        encountersCreated: importResult.encountersCreated,
      }
    });
    
  } catch (error) {
    console.error('Error importing Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to import Google Calendar data' },
      { status: 500 }
    );
  }
}

// PUT - Manually trigger calendar import for connected workspace
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const daysBack = parseInt(searchParams.get('daysBack') || '30');
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }
    
    const googleCalendar = createGoogleCalendarIntegration();
    if (!googleCalendar) {
      return NextResponse.json(
        { error: 'Google Calendar integration not configured' },
        { status: 500 }
      );
    }
    
    // Check if integration is connected
    const isConnected = await googleCalendar.isConnected(workspaceId);
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Google Calendar not connected for this workspace' },
        { status: 400 }
      );
    }
    
    // Import calendar events
    const importResult = await googleCalendar.importCalendarEvents(workspaceId, daysBack);
    
    if (!importResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to import calendar events',
          details: importResult.error 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Calendar data imported successfully',
      data: {
        eventsProcessed: importResult.eventsProcessed,
        peopleCreated: importResult.peopleCreated,
        encountersCreated: importResult.encountersCreated,
      }
    });
    
  } catch (error) {
    console.error('Error importing calendar data:', error);
    return NextResponse.json(
      { error: 'Failed to import calendar data' },
      { status: 500 }
    );
  }
}

// DELETE - Disconnect Google Calendar integration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }
    
    const googleCalendar = createGoogleCalendarIntegration();
    if (!googleCalendar) {
      return NextResponse.json(
        { error: 'Google Calendar integration not configured' },
        { status: 500 }
      );
    }
    
    // Disconnect integration
    const disconnectSuccess = await googleCalendar.disconnect(workspaceId);
    
    if (!disconnectSuccess) {
      return NextResponse.json(
        { error: 'Failed to disconnect Google Calendar integration' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Google Calendar integration disconnected successfully'
    });
    
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar integration' },
      { status: 500 }
    );
  }
}
