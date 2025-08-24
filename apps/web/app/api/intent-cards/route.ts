import { NextRequest, NextResponse } from 'next/server';
import { db, goal, suggestion, person, eq, and, desc } from '@rhiz/db';
import { getUserId } from '@/lib/auth-mock';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId');
    
    // Try to fetch real data from database
    try {
      if (workspaceId) {
        // Fetch active goals with their suggestions
        const activeGoals = await db
          .select({
            id: goal.id,
            title: goal.title,
            kind: goal.kind,
            status: goal.status,
          })
          .from(goal)
          .where(
            and(
              eq(goal.workspaceId, workspaceId),
              eq(goal.status, 'active')
            )
          )
          .limit(5);
        
        // For each goal, fetch suggestions
        const cards = await Promise.all(
          activeGoals.map(async (g) => {
            const goalSuggestions = await db
              .select({
                id: suggestion.id,
                aId: suggestion.aId,
                bId: suggestion.bId,
                score: suggestion.score,
                state: suggestion.state,
                why: suggestion.why,
              })
              .from(suggestion)
              .where(
                and(
                  eq(suggestion.goalId, g.id),
                  eq(suggestion.state, 'proposed')
                )
              )
              .orderBy(desc(suggestion.score))
              .limit(3);
            
            // Enrich suggestions with person data
            const enrichedSuggestions = await Promise.all(
              goalSuggestions.map(async (s) => {
                // Get person A data
                const [personAData] = await db
                  .select({
                    fullName: person.fullName,
                    primaryEmail: person.primaryEmail,
                    location: person.location,
                  })
                  .from(person)
                  .where(eq(person.id, s.aId))
                  .limit(1);
                
                // Get person B data
                const [personBData] = await db
                  .select({
                    fullName: person.fullName,
                    primaryEmail: person.primaryEmail,
                    location: person.location,
                  })
                  .from(person)
                  .where(eq(person.id, s.bId))
                  .limit(1);
                
                return {
                  ...s,
                  personAName: personAData?.fullName || 'Unknown',
                  personAEmail: personAData?.primaryEmail,
                  personALocation: personAData?.location,
                  personBName: personBData?.fullName || 'Unknown',
                  personBEmail: personBData?.primaryEmail,
                  personBLocation: personBData?.location,
                };
              })
            );
            
            return {
              id: g.id,
              goalTitle: g.title,
              goalKind: g.kind,
              goalStatus: g.status,
              suggestions: enrichedSuggestions,
              insight: {
                type: 'opportunity',
                message: `${enrichedSuggestions.length} potential connections identified`,
                confidence: 0.8,
              },
            };
          })
        );
        
        return NextResponse.json({ cards });
      }
    } catch (dbError) {
      console.log('Database query failed, falling back to mock data:', dbError);
    }
    
    // Fallback to mock data if database fails
    const mockCards = [
      {
        id: '1',
        goalTitle: 'Find Technical Co-founder',
        goalKind: 'recruitment',
        goalStatus: 'active',
        suggestions: [
          {
            id: 's1',
            personName: 'Sarah Chen',
            title: 'Senior Software Engineer',
            company: 'TechCorp',
            score: 0.92,
            why: {
              mutualInterests: ['AI/ML', 'Startups', 'Product Development'],
              recency: 0.8,
              frequency: 0.7,
              affiliation: 0.9,
              goalAlignment: 0.95
            }
          },
          {
            id: 's2',
            personName: 'Mike Rodriguez',
            title: 'CTO',
            company: 'StartupXYZ',
            score: 0.88,
            why: {
              mutualInterests: ['SaaS', 'Scaling', 'Team Building'],
              recency: 0.6,
              frequency: 0.8,
              affiliation: 0.85,
              goalAlignment: 0.9
            }
          }
        ],
        insight: {
          type: 'opportunity',
          message: 'High concentration of technical talent in your network',
          confidence: 0.85
        }
      },
      {
        id: '2',
        goalTitle: 'Secure Series A Funding',
        goalKind: 'fundraising',
        goalStatus: 'active',
        suggestions: [
          {
            id: 's3',
            personName: 'David Kim',
            title: 'Partner',
            company: 'Venture Capital',
            score: 0.95,
            why: {
              mutualInterests: ['Fintech', 'Growth', 'Investment'],
              recency: 0.9,
              frequency: 0.6,
              affiliation: 0.8,
              goalAlignment: 0.98
            }
          }
        ],
        insight: {
          type: 'network_gap',
          message: 'Limited connections to Series A investors',
          confidence: 0.75
        }
      }
    ];

    return NextResponse.json({ cards: mockCards });
  } catch (error) {
    console.error('Intent cards API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, goalId, action, suggestionId } = body;

    if (!workspaceId || !goalId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle different actions on intent cards
    if (action === 'accept' && suggestionId) {
      // TODO: Update suggestion state in database
      // await db.update(suggestion)
      //   .set({ state: 'accepted', updatedAt: new Date() })
      //   .where(eq(suggestion.id, suggestionId));
      
      return NextResponse.json({
        success: true,
        message: 'Suggestion accepted',
      });
    }
    
    if (action === 'reject' && suggestionId) {
      // TODO: Update suggestion state in database
      // await db.update(suggestion)
      //   .set({ state: 'rejected', updatedAt: new Date() })
      //   .where(eq(suggestion.id, suggestionId));
      
      return NextResponse.json({
        success: true,
        message: 'Suggestion rejected',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Intent cards action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
