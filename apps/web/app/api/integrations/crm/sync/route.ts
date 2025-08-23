import { NextRequest, NextResponse } from 'next/server';
import { createCrmIntegration } from '@rhiz/integrations';
import { db, integration } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';

// POST - Sync Rhiz people to CRM
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const provider = searchParams.get('provider') as 'hubspot' | 'salesforce';
    const direction = searchParams.get('direction') || 'to_crm'; // 'to_crm' or 'from_crm'
    
    if (!workspaceId || !provider) {
      return NextResponse.json(
        { error: 'Workspace ID and provider are required' },
        { status: 400 }
      );
    }
    
    if (!['hubspot', 'salesforce'].includes(provider)) {
      return NextResponse.json(
        { error: 'Provider must be either "hubspot" or "salesforce"' },
        { status: 400 }
      );
    }
    
    const crmIntegration = createCrmIntegration(provider);
    if (!crmIntegration) {
      return NextResponse.json(
        { error: `${provider} integration not configured or feature flag disabled` },
        { status: 500 }
      );
    }
    
    // Check if integration is connected
    const isConnected = await crmIntegration.isConnected(workspaceId);
    if (!isConnected) {
      return NextResponse.json(
        { error: `${provider} not connected for this workspace` },
        { status: 400 }
      );
    }
    
    let syncResult;
    
    if (direction === 'to_crm') {
      // Sync Rhiz people to CRM
      syncResult = await crmIntegration.syncToCrm(workspaceId);
    } else {
      // Sync CRM contacts to Rhiz
      syncResult = await crmIntegration.syncFromCrm(workspaceId);
    }
    
    if (!syncResult.success) {
      return NextResponse.json(
        { 
          error: `Failed to sync with ${provider}`,
          details: syncResult.errors 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced with ${provider}`,
      data: syncResult
    });
    
  } catch (error) {
    console.error('Error syncing with CRM:', error);
    return NextResponse.json(
      { error: 'Failed to sync with CRM' },
      { status: 500 }
    );
  }
}

// GET - Get sync status for a workspace
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const provider = searchParams.get('provider') as 'hubspot' | 'salesforce';
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }
    
    // Get integration status
    const integrationRecord = await db
      .select()
      .from(integration)
      .where(
        and(
          eq(integration.workspaceId, workspaceId),
          eq(integration.provider, provider || 'hubspot')
        )
      )
      .limit(1);
    
    if (integrationRecord.length === 0) {
      return NextResponse.json({
        connected: false,
        message: `${provider || 'CRM'} not connected`
      });
    }
    
    return NextResponse.json({
      connected: integrationRecord[0].status === 'connected',
      lastSyncAt: integrationRecord[0].lastSyncAt,
      status: integrationRecord[0].status,
      config: integrationRecord[0].config
    });
    
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}

// PUT - Connect CRM integration
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const provider = searchParams.get('provider') as 'hubspot' | 'salesforce';
    
    if (!workspaceId || !provider) {
      return NextResponse.json(
        { error: 'Workspace ID and provider are required' },
        { status: 400 }
      );
    }
    
    if (!['hubspot', 'salesforce'].includes(provider)) {
      return NextResponse.json(
        { error: 'Provider must be either "hubspot" or "salesforce"' },
        { status: 400 }
      );
    }
    
    const crmIntegration = createCrmIntegration(provider);
    if (!crmIntegration) {
      return NextResponse.json(
        { error: `${provider} integration not configured or feature flag disabled` },
        { status: 500 }
      );
    }
    
    // Authenticate with CRM
    const authSuccess = await crmIntegration.authenticate();
    
    if (!authSuccess) {
      return NextResponse.json(
        { error: `Failed to authenticate with ${provider}` },
        { status: 500 }
      );
    }
    
    // Update integration status
    await db.insert(integration).values({
      workspaceId,
      provider,
      status: 'connected',
      config: { type: 'crm', provider },
      lastSyncAt: new Date(),
    }).onConflictDoUpdate({
      target: [integration.workspaceId, integration.provider],
      set: {
        status: 'connected',
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `${provider} connected successfully`
    });
    
  } catch (error) {
    console.error('Error connecting CRM:', error);
    return NextResponse.json(
      { error: 'Failed to connect CRM' },
      { status: 500 }
    );
  }
}

// DELETE - Disconnect CRM integration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const provider = searchParams.get('provider') as 'hubspot' | 'salesforce';
    
    if (!workspaceId || !provider) {
      return NextResponse.json(
        { error: 'Workspace ID and provider are required' },
        { status: 400 }
      );
    }
    
    // Update integration status
    await db
      .update(integration)
      .set({
        status: 'disconnected',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(integration.workspaceId, workspaceId),
          eq(integration.provider, provider)
        )
      );
    
    return NextResponse.json({
      success: true,
      message: `${provider} disconnected successfully`
    });
    
  } catch (error) {
    console.error('Error disconnecting CRM:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect CRM' },
      { status: 500 }
    );
  }
}
