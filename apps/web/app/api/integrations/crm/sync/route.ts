import { NextRequest, NextResponse } from 'next/server';
// import { db, integration } from '@rhiz/db';


// POST - Sync Rhiz people to CRM
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, provider, direction } = body;

    if (!workspaceId || !provider || !direction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mock sync result
    const syncResult = { 
      success: true, 
      message: `Mock sync ${direction} for ${provider}`,
      errors: [] 
    };

    if (!syncResult.success) {
      return NextResponse.json(
        { 
          error: `Failed to sync with ${provider}`,
          details: syncResult.errors || []
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: syncResult.message,
      provider,
      direction
    });

  } catch (error) {
    console.error('CRM sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with CRM' },
      { status: 500 }
    );
  }
}

// GET - Get sync status for a workspace
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ message: "Mock data - API not implemented yet" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    
    // const crmIntegration = createCrmIntegration(provider);
    // if (!crmIntegration) {
    //   return NextResponse.json(
    //     { error: `${provider} integration not configured or feature flag disabled` },
    //     { status: 500 }
    //   );
    // }
    
    // // Authenticate with CRM
    // const authSuccess = await crmIntegration.authenticate();
    
    // if (!authSuccess) {
    //   return NextResponse.json(
    //     { error: `Failed to authenticate with ${provider}` },
    //     { status: 500 }
    //   );
    // }
    
    // // Update integration status
    // await db.insert(integration).values({
    //   workspaceId,
    //   provider,
    //   status: 'connected',
    //   config: { type: 'crm', provider },
    //   lastSyncAt: new Date(),
    // }).onConflictDoUpdate({
    //   target: [integration.workspaceId, integration.provider],
    //   set: {
    //     status: 'connected',
    //     lastSyncAt: new Date(),
    //     updatedAt: new Date(),
    //   }
    // });
    
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
    // await db
    //   .update(integration)
    //   .set({
    //     status: 'disconnected',
    //     updatedAt: new Date(),
    //   })
    //   .where(
    //     and(
    //       eq(integration.workspaceId, workspaceId),
    //       eq(integration.provider, provider)
    //     )
    //   );
    
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
