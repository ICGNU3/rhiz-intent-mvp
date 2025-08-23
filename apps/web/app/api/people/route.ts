import { NextRequest, NextResponse } from 'next/server';
import { db, person, claim, encounter, personEncounter } from '@rhiz/db';
import { eq, and, desc } from 'drizzle-orm';

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
    
    // Get all people for the workspace
    const people = await db
      .select()
      .from(person)
      .where(eq(person.workspaceId, workspaceId))
      .orderBy(desc(person.createdAt));
    
    // Get claims for all people
    const allClaims = await db
      .select()
      .from(claim)
      .where(
        and(
          eq(claim.workspaceId, workspaceId),
          eq(claim.subjectType, 'person')
        )
      );
    
    // Get encounters for relationship strength calculation
    const encounters = await db
      .select()
      .from(encounter)
      .where(eq(encounter.workspaceId, workspaceId))
      .orderBy(desc(encounter.occurredAt));
    
    // Get person-encounter relationships
    const personEncounters = await db
      .select()
      .from(personEncounter)
      .where(
        encounters.length > 0 
          ? encounters.map(e => e.id).includes(personEncounter.encounterId)
          : false
      );
    
    // Build response with people and their data
    const peopleWithData = people.map(p => {
      const personClaims = allClaims.filter(c => c.subjectId === p.id);
      const personEncounterIds = personEncounters
        .filter(pe => pe.personId === p.id)
        .map(pe => pe.encounterId);
      
      const lastEncounter = encounters
        .filter(e => personEncounterIds.includes(e.id))
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];
      
      // Calculate relationship strength (simplified)
      const relationshipStrength = personEncounterIds.length > 0 ? 
        Math.min(10, personEncounterIds.length * 2 + 3) : 1;
      
      return {
        id: p.id,
        fullName: p.fullName,
        primaryEmail: p.primaryEmail,
        location: p.location,
        lastEncounter: lastEncounter?.occurredAt,
        relationshipStrength,
        ownerId: p.ownerId,
        claims: personClaims.map(c => ({
          key: c.key,
          value: c.value,
          confidence: c.confidence,
        })),
      };
    });
    
    return NextResponse.json({
      success: true,
      people: peopleWithData,
    });
    
  } catch (error) {
    console.error('Failed to fetch people:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch people' },
      { status: 500 }
    );
  }
}
