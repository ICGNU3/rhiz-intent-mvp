import { NextRequest, NextResponse } from 'next/server';
import { db, suggestion, person, claim } from '@rhiz/db';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const goalId = searchParams.get('goalId');
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }
    
    // Build where clause
    let whereClause = eq(suggestion.workspaceId, workspaceId);
    if (goalId) {
      whereClause = and(eq(suggestion.workspaceId, workspaceId), eq(suggestion.goalId, goalId));
    }
    
    // Get suggestions for the workspace
    const suggestions = await db
      .select()
      .from(suggestion)
      .where(whereClause)
      .orderBy(desc(suggestion.createdAt));
    
    // Get all people for person details
    const people = await db
      .select()
      .from(person)
      .where(eq(person.workspaceId, workspaceId));
    
    // Get all claims for person context
    const allClaims = await db
      .select()
      .from(claim)
      .where(
        and(
          eq(claim.workspaceId, workspaceId),
          eq(claim.subjectType, 'person')
        )
      );
    
    // Build response with suggestions and person details
    const suggestionsWithDetails = suggestions.map(s => {
      const personA = people.find(p => p.id === s.aId);
      const personB = people.find(p => p.id === s.bId);
      
      const claimsA = allClaims.filter(c => c.subjectId === s.aId);
      const claimsB = allClaims.filter(c => c.subjectId === s.bId);
      
      return {
        id: s.id,
        kind: s.kind,
        score: s.score,
        state: s.state,
        createdAt: s.createdAt,
        ownerId: s.ownerId,
        personA: personA ? {
          name: personA.fullName,
          title: claimsA.find(c => c.key === 'title')?.value,
          company: claimsA.find(c => c.key === 'company')?.value,
        } : null,
        personB: personB ? {
          name: personB.fullName,
          title: claimsB.find(c => c.key === 'title')?.value,
          company: claimsB.find(c => c.key === 'company')?.value,
        } : null,
        why: s.why,
        draft: s.draft,
      };
    });
    
    return NextResponse.json({
      success: true,
      suggestions: suggestionsWithDetails,
    });
    
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
