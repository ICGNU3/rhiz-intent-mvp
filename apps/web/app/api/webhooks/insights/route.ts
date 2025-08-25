import { NextRequest, NextResponse } from 'next/server';
import { db, person, edge, claim, setUserContext } from '@rhiz/db';
import { eq, and, desc } from '@rhiz/db';

// Webhook endpoint to send insights back to CRM via Zapier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      workspaceId, 
      userId, 
      personId, 
      action 
    } = body;

    if (!workspaceId || !userId || !personId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Set user context for RLS
    await setUserContext(userId);

    switch (action) {
      case 'get.insights':
        return await getPersonInsights(workspaceId, userId, personId);
      
      case 'get.suggestions':
        return await getIntroductionSuggestions(workspaceId, userId, personId);
      
      default:
        return NextResponse.json(
          { error: 'Unsupported action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Insights webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getPersonInsights(workspaceId: string, userId: string, personId: string) {
  try {
    // Get person details
    const personResult = await db
      .select()
      .from(person)
      .where(
        and(
          eq(person.id, personId),
          eq(person.workspaceId, workspaceId),
          eq(person.ownerId, userId)
        )
      )
      .limit(1);

    if (personResult.length === 0) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    const personData = personResult[0];

    // Get claims (facts about the person)
    const claims = await db
      .select()
      .from(claim)
      .where(
        and(
          eq(claim.subjectType, 'person'),
          eq(claim.subjectId, personId),
          eq(claim.workspaceId, workspaceId)
        )
      )
      .orderBy(desc(claim.confidence));

    // Get relationship connections
    const connections = await db
      .select()
      .from(edge)
      .where(
        and(
          eq(edge.workspaceId, workspaceId),
          eq(edge.ownerId, userId),
          eq(edge.fromId, personId)
        )
      );

    // Calculate relationship strength
    const avgStrength = connections.length > 0 
      ? connections.reduce((sum, edge) => sum + edge.strength, 0) / connections.length 
      : 0;

    // Get top connections
    const topConnections = await db
      .select({
        personId: person.id,
        fullName: person.fullName,
        strength: edge.strength,
        type: edge.type,
      })
      .from(edge)
      .innerJoin(person, eq(edge.toId, person.id))
      .where(
        and(
          eq(edge.workspaceId, workspaceId),
          eq(edge.ownerId, userId),
          eq(edge.fromId, personId)
        )
      )
      .orderBy(desc(edge.strength))
      .limit(5);

    return NextResponse.json({
      success: true,
      insights: {
        person: {
          id: personData.id,
          fullName: personData.fullName,
          email: personData.primaryEmail,
          location: personData.location,
        },
        claims: claims.map(c => ({
          key: c.key,
          value: c.value,
          confidence: c.confidence / 100,
          source: c.source,
        })),
        relationships: {
          totalConnections: connections.length,
          averageStrength: avgStrength,
          topConnections: topConnections,
        },
        lastUpdated: personData.updatedAt,
      },
    });

  } catch (error) {
    console.error('Get insights error:', error);
    return NextResponse.json(
      { error: 'Failed to get insights' },
      { status: 500 }
    );
  }
}

async function getIntroductionSuggestions(workspaceId: string, userId: string, personId: string) {
  try {
    // This would integrate with your existing suggestion system
    // For now, return a mock response
    return NextResponse.json({
      success: true,
      suggestions: [
        {
          id: 'suggestion-1',
          targetPerson: {
            id: 'target-1',
            fullName: 'Jane Smith',
            company: 'TechCorp',
            role: 'CTO',
          },
          score: 0.85,
          reason: 'Both work in AI/ML and have mutual connections',
          strength: 8,
        },
        {
          id: 'suggestion-2',
          targetPerson: {
            id: 'target-2',
            fullName: 'Mike Johnson',
            company: 'StartupXYZ',
            role: 'Founder',
          },
          score: 0.72,
          reason: 'Shared interest in SaaS and growth',
          strength: 6,
        },
      ],
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}
