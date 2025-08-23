import { NextRequest, NextResponse } from 'next/server';
import { db } from '@rhiz/db';
import { person, claim, goal, edge } from '@rhiz/db/schema';
import { eq, and, or, like, ilike, desc, sql, inArray } from 'drizzle-orm';
import { auth } from '@clerk/nextjs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    // Get user's workspace
    const workspace = await db.query.workspace.findFirst({
      where: (workspace, { eq }) => eq(workspace.ownerId, userId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    // Parse intent from query
    const intent = parseIntent(query);
    
    // Search people
    const people = await searchPeople(query, workspace.id);
    
    // Search goals
    const goals = await searchGoals(query, workspace.id);
    
    // Search claims/tags
    const claims = await searchClaims(query, workspace.id);

    // Get related edges for people
    const personIds = people.map(p => p.id);
    const edges = personIds.length > 0 ? await db
      .select()
      .from(edge)
      .where(
        and(
          eq(edge.workspaceId, workspace.id),
          or(
            inArray(edge.fromId, personIds),
            inArray(edge.toId, personIds)
          )
        )
      ) : [];

    // Build results with relevance scores
    const results = {
      people: people.map(p => ({
        ...p,
        relevance: calculateRelevance(p, query, intent),
        connections: edges.filter(e => e.fromId === p.id || e.toId === p.id).length,
      })),
      goals: goals.map(g => ({
        ...g,
        relevance: calculateRelevance(g, query, intent),
      })),
      tags: claims
        .filter(c => c.key === 'tag')
        .map(c => ({
          tag: c.value,
          count: claims.filter(claim => 
            claim.key === 'tag' && claim.value === c.value
          ).length,
          relevance: calculateRelevance({ value: c.value }, query, intent),
        }))
        .filter((tag, index, arr) => 
          arr.findIndex(t => t.tag === tag.tag) === index
        ),
    };

    // Sort by relevance
    results.people.sort((a, b) => b.relevance - a.relevance);
    results.goals.sort((a, b) => b.relevance - a.relevance);
    results.tags.sort((a, b) => b.relevance - a.relevance);

    return NextResponse.json(results);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function searchPeople(query: string, workspaceId: string) {
  const searchTerm = `%${query}%`;
  
  return await db
    .select()
    .from(person)
    .where(
      and(
        eq(person.workspaceId, workspaceId),
        or(
          ilike(person.fullName, searchTerm),
          ilike(person.location || '', searchTerm),
          ilike(person.primaryEmail || '', searchTerm)
        )
      )
    );
}

async function searchGoals(query: string, workspaceId: string) {
  const searchTerm = `%${query}%`;
  
  return await db
    .select()
    .from(goal)
    .where(
      and(
        eq(goal.workspaceId, workspaceId),
        or(
          ilike(goal.title, searchTerm),
          ilike(goal.details || '', searchTerm),
          ilike(goal.kind, searchTerm)
        )
      )
    );
}

async function searchClaims(query: string, workspaceId: string) {
  const searchTerm = `%${query}%`;
  
  return await db
    .select()
    .from(claim)
    .where(
      and(
        eq(claim.workspaceId, workspaceId),
        or(
          ilike(claim.value, searchTerm),
          ilike(claim.key, searchTerm)
        )
      )
    );
}

function parseIntent(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('hire') || lowerQuery.includes('engineer') || lowerQuery.includes('developer')) {
    return 'hiring';
  }
  
  if (lowerQuery.includes('investor') || lowerQuery.includes('funding') || lowerQuery.includes('raise')) {
    return 'fundraising';
  }
  
  if (lowerQuery.includes('intro') || lowerQuery.includes('connect') || lowerQuery.includes('meet')) {
    return 'introduction';
  }
  
  if (lowerQuery.includes('la') || lowerQuery.includes('san francisco') || lowerQuery.includes('new york')) {
    return 'location';
  }
  
  return 'general';
}

function calculateRelevance(item: any, query: string, intent: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  
  // Exact matches get highest score
  if (item.fullName?.toLowerCase().includes(lowerQuery)) score += 10;
  if (item.title?.toLowerCase().includes(lowerQuery)) score += 10;
  if (item.value?.toLowerCase().includes(lowerQuery)) score += 10;
  
  // Partial matches
  if (item.fullName?.toLowerCase().includes(lowerQuery.split(' ')[0])) score += 5;
  if (item.location?.toLowerCase().includes(lowerQuery)) score += 8;
  if (item.kind?.toLowerCase().includes(lowerQuery)) score += 6;
  
  // Intent-based scoring
  if (intent === 'hiring' && item.kind === 'hire_engineer') score += 5;
  if (intent === 'fundraising' && item.kind === 'raise_seed') score += 5;
  if (intent === 'location' && item.location) score += 3;
  
  // Recency bonus
  if (item.createdAt) {
    const daysSinceCreation = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 30) score += 2;
  }
  
  return Math.min(score, 100);
}
