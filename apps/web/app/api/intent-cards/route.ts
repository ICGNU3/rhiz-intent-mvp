import { NextResponse } from 'next/server'
import { db, goal, suggestion, person } from '@rhiz/db'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    // For demo purposes, use a fixed user ID
    const demoUserId = 'demo-user-123'
    
    // Get goals for the user
    const goals = await db
      .select()
      .from(goal)
      .where(eq(goal.ownerId, demoUserId))
      .orderBy(goal.createdAt);
    
    // Get suggestions for these goals
    const goalIds = goals.map(g => g.id);
    const suggestions = goalIds.length > 0 ? await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.ownerId, demoUserId))
      .orderBy(suggestion.score) : [];
    
    // Get people for context
    const people = await db
      .select()
      .from(person)
      .where(eq(person.ownerId, demoUserId));
    
    // Transform goals into intent cards
    const cards = goals.map(goal => {
      const goalSuggestions = suggestions.filter(s => s.goalId === goal.id);
      
      return {
        id: goal.id,
        kind: goal.kind,
        title: goal.title,
        description: goal.details || `Working on ${goal.kind.replace('_', ' ')}`,
        status: goal.status,
        createdAt: goal.createdAt,
        updatedAt: goal.createdAt, // Using createdAt as updatedAt for demo
        actions: goalSuggestions.slice(0, 2).map((suggestion, index) => ({
          id: `action-${suggestion.id}`,
          label: `Review Introduction (${suggestion.score}/100)`,
          description: `High-scoring match for your goal`,
          kind: 'suggestion' as const,
          data: { suggestionId: suggestion.id }
        })),
        insights: [
          {
            id: `insight-${goal.id}`,
            title: goalSuggestions.length > 0 ? 'New Opportunities' : 'Getting Started',
            description: goalSuggestions.length > 0 
              ? `${goalSuggestions.length} potential introductions found`
              : 'Add more people to your network to see suggestions',
            kind: goalSuggestions.length > 0 ? 'opportunity' as const : 'progress' as const,
            data: { suggestionCount: goalSuggestions.length }
          }
        ]
      };
    });
    
    return NextResponse.json({ cards });
    
  } catch (error) {
    console.error('Failed to fetch intent cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intent cards' },
      { status: 500 }
    );
  }
}
