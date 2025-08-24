import { NextRequest, NextResponse } from 'next/server';
import { addJob, QUEUE_NAMES } from '@rhiz/workers';
import { getUserId } from '@/lib/auth-mock';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      type, 
      crmType, 
      config, 
      workflowId, 
      testData, 
      olderThanDays 
    } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Request type is required' },
        { status: 400 }
      );
    }

    // Validate request based on type
    switch (type) {
      case 'create_crm_integration':
        if (!crmType || !config) {
          return NextResponse.json(
            { error: 'crmType and config are required for create_crm_integration' },
            { status: 400 }
          );
        }
        break;
      
      case 'create_insights_workflow':
        if (!config) {
          return NextResponse.json(
            { error: 'config is required for create_insights_workflow' },
            { status: 400 }
          );
        }
        break;
      
      case 'test_workflow':
        if (!workflowId) {
          return NextResponse.json(
            { error: 'workflowId is required for test_workflow' },
            { status: 400 }
          );
        }
        break;
      
      case 'cleanup_workflows':
        // olderThanDays is optional, defaults to 30
        break;
      
      default:
        return NextResponse.json(
          { error: `Unknown request type: ${type}` },
          { status: 400 }
        );
    }

    // Add job to n8n queue
    const job = await addJob(QUEUE_NAMES.N8N_CLEANUP, {
      type,
      crmType,
      config,
      workflowId,
      testData,
      olderThanDays
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: `n8n ${type} job queued successfully`
    });

  } catch (error) {
    console.error('n8n API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'health') {
      // Return n8n health status
      return NextResponse.json({
        success: true,
        status: 'healthy',
        message: 'n8n integration service is running'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'n8n integration API is available',
      endpoints: {
        'POST /api/integrations/n8n': 'Create n8n workflows',
        'GET /api/integrations/n8n?action=health': 'Check n8n health'
      }
    });

  } catch (error) {
    console.error('n8n API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
