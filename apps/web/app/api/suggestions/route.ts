import { NextRequest, NextResponse } from 'next/server';
import { db, suggestion, person, claim } from '@rhiz/db';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, use the demo user ID
    const ownerId = 'demo-user-id';
    
    // Get all suggestions for the owner
    const suggestions = await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.ownerId, ownerId))
      .orderBy(desc(suggestion.createdAt));
    
    // Get all people for person details
    const people = await db
      .select()
      .from(person)
      .where(eq(person.ownerId, ownerId));
    
    // Get all claims for person context
    const allClaims = await db
      .select()
      .from(claim)
      .where(
        and(
          eq(claim.ownerId, ownerId),
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
