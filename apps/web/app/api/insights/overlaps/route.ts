import { NextRequest, NextResponse } from 'next/server';
// import { db, crossWorkspaceOverlap } from '@rhiz/db';
// import { crossWorkspaceOverlapSchema } from '@rhiz/db/schema';

export async function GET(request: NextRequest) {
  try {
    // Return mock data for now
    const overlaps = [
      {
        id: '1',
        person: 'Sarah Chen',
        personId: 'person-1',
        overlapType: 'email',
        confidence: 90,
        status: 'active',
        detectedAt: '2024-01-15T10:30:00Z',
        workspaces: [
          { id: 'workspace-1', name: 'TechCorp Team' },
          { id: 'workspace-2', name: 'StartupXYZ' }
        ]
      },
      {
        id: '2',
        person: 'Mike Rodriguez',
        personId: 'person-2',
        overlapType: 'phone',
        confidence: 85,
        status: 'active',
        detectedAt: '2024-01-14T14:20:00Z',
        workspaces: [
          { id: 'workspace-1', name: 'TechCorp Team' },
          { id: 'workspace-3', name: 'Venture Capital' },
          { id: 'workspace-4', name: 'Design Studio' }
        ]
      },
      {
        id: '3',
        person: 'David Kim',
        personId: 'person-3',
        overlapType: 'linkedin',
        confidence: 78,
        status: 'active',
        detectedAt: '2024-01-13T09:15:00Z',
        workspaces: [
          { id: 'workspace-2', name: 'StartupXYZ' },
          { id: 'workspace-3', name: 'Venture Capital' }
        ]
      }
    ];

    return NextResponse.json({ overlaps });
  } catch (error) {
    console.error('Overlaps API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overlaps' },
      { status: 500 }
    );
  }
}
