import { NextRequest, NextResponse } from 'next/server';
import { db, goal, suggestion, person } from '@rhiz/db';
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
    
    // Get active goals for the workspace
    const goals = await db
      .select()
      .from(goal)
      .where(
        and(
          eq(goal.workspaceId, workspaceId),
          eq(goal.status, 'active')
        )
      )
      .orderBy(desc(goal.createdAt));
    
    // Get suggestions for each goal
    const allSuggestions = await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.workspaceId, workspaceId));
    
    // Get people for person details
    const people = await db
      .select()
      .from(person)
      .where(eq(person.workspaceId, workspaceId));
    
    // Build Intent Cards with enhanced format
    const intentCards = goals.map(goal => {
      const goalSuggestions = allSuggestions
        .filter(s => s.goalId === goal.id)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2); // Top 2 suggestions
      
      const suggestionsWithDetails = goalSuggestions.map(suggestion => {
        const personA = people.find(p => p.id === suggestion.aId);
        const personB = people.find(p => p.id === suggestion.bId);
        
        return {
          id: suggestion.id,
          personAName: personA?.fullName || 'Unknown',
          personBName: personB?.fullName || 'Unknown',
          score: suggestion.score,
          why: suggestion.why,
        };
      });
      
      // Generate insight based on suggestions
      const insight = {
        type: 'opportunity' as const,
        message: `Found ${suggestionsWithDetails.length} high-quality introduction opportunities for your "${goal.title}" goal. The top suggestion has a score of ${suggestionsWithDetails[0]?.score || 0}/100.`,
        confidence: Math.min(95, 70 + (suggestionsWithDetails.length * 10)),
      };
      
      return {
        id: goal.id,
        goalTitle: goal.title,
        goalKind: goal.kind,
        goalStatus: goal.status,
        suggestions: suggestionsWithDetails,
        insight,
      };
    });
    
    return NextResponse.json({
      success: true,
      cards: intentCards,
    });
    
  } catch (error) {
    console.error('Failed to fetch intent cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch intent cards' },
      { status: 500 }
    );
  }
}
