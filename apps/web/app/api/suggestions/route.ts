import { NextRequest, NextResponse } from 'next/server';
import { db, suggestion, person, goal } from '@rhiz/db';
import { and } from 'drizzle-orm';
import { eq, desc } from '@rhiz/db';
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
        // Fetch suggestions with person and goal data
        const suggestionsData = await db
          .select({
            id: suggestion.id,
            aId: suggestion.aId,
            bId: suggestion.bId,
            goalId: suggestion.goalId,
            score: suggestion.score,
            state: suggestion.state,
            why: suggestion.why,
            createdAt: suggestion.createdAt,
          })
          .from(suggestion)
          .where(eq(suggestion.workspaceId, workspaceId))
          .orderBy(desc(suggestion.score))
          .limit(10);
        
        // Enrich suggestions with person and goal data
        const enrichedSuggestions = await Promise.all(
          suggestionsData.map(async (s) => {
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
            
            // Get goal data
            const [goalData] = s.goalId ? await db
              .select({
                title: goal.title,
                kind: goal.kind,
              })
              .from(goal)
              .where(eq(goal.id, s.goalId))
              .limit(1) : [null];
            
            return {
              id: s.id,
              kind: 'introduction',
              score: s.score,
              state: s.state,
              createdAt: s.createdAt.toISOString(),
              personA: {
                name: personAData?.fullName || 'Unknown',
                title: 'Contact',
                company: personAData?.location?.split(',')[0] || 'Unknown',
              },
              personB: {
                name: personBData?.fullName || 'Unknown',
                title: 'Contact',
                company: personBData?.location?.split(',')[0] || 'Unknown',
              },
              why: s.why || {
                mutualInterests: ['Networking', 'Collaboration'],
                recency: 0.7,
                frequency: 0.6,
                affiliation: 0.8,
                goalAlignment: 0.9
              },
              draft: {
                preIntroPing: `Hi ${personAData?.fullName || 'there'}! I think you'd really enjoy connecting with ${personBData?.fullName || 'this person'}.`,
                doubleOptIntro: `Hi ${personAData?.fullName || 'there'} and ${personBData?.fullName || 'there'}! I wanted to connect you both.`
              }
            };
          })
        );
        
        return NextResponse.json({ suggestions: enrichedSuggestions });
      }
    } catch (dbError) {
      console.log('Database query failed, falling back to mock data:', dbError);
    }
    
    // Fallback to mock data if database fails
    const mockSuggestions = [
      {
        id: '1',
        kind: 'introduction',
        score: 92,
        state: 'proposed',
        createdAt: '2024-01-15T10:30:00Z',
        personA: {
          name: 'Sarah Chen',
          title: 'Senior Software Engineer',
          company: 'TechCorp'
        },
        personB: {
          name: 'Mike Rodriguez',
          title: 'CTO',
          company: 'StartupXYZ'
        },
        why: {
          mutualInterests: ['AI/ML', 'Startups', 'Product Development', 'SaaS'],
          recency: 0.8,
          frequency: 0.7,
          affiliation: 0.9,
          goalAlignment: 0.95
        },
        draft: {
          preIntroPing: "Hi Sarah! I think you'd really enjoy connecting with Mike. He's been building some interesting AI-powered SaaS solutions and I know you're passionate about that space.",
          doubleOptIntro: "Hi Sarah and Mike! I wanted to connect you both. Sarah is a brilliant engineer working on AI/ML at TechCorp, and Mike is a CTO who's been scaling SaaS startups. I think you'd have a lot to discuss about the future of AI in SaaS products."
        }
      },
      {
        id: '2',
        kind: 'introduction',
        score: 88,
        state: 'proposed',
        createdAt: '2024-01-14T14:20:00Z',
        personA: {
          name: 'David Kim',
          title: 'Partner',
          company: 'Venture Capital'
        },
        personB: {
          name: 'Emily Johnson',
          title: 'UX Designer',
          company: 'Design Studio'
        },
        why: {
          mutualInterests: ['Design', 'User Experience', 'Innovation', 'Startups'],
          recency: 0.6,
          frequency: 0.8,
          affiliation: 0.85,
          goalAlignment: 0.88
        },
        draft: {
          preIntroPing: "Hi David! I'd love to introduce you to Emily, a talented UX designer who's been working on some innovative design solutions. I think she'd be a great fit for your portfolio companies.",
          doubleOptIntro: "Hi David and Emily! David is a VC partner focused on design-driven startups, and Emily is a UX designer who's been pushing the boundaries of user experience. I think you'd have some fascinating discussions about the future of design in tech."
        }
      },
      {
        id: '3',
        kind: 'introduction',
        score: 85,
        state: 'accepted',
        createdAt: '2024-01-13T09:15:00Z',
        personA: {
          name: 'Alex Thompson',
          title: 'Product Manager',
          company: 'GrowthCo'
        },
        personB: {
          name: 'Lisa Wang',
          title: 'Marketing Director',
          company: 'ScaleUp'
        },
        why: {
          mutualInterests: ['Growth', 'Marketing', 'Product Strategy', 'Analytics'],
          recency: 0.7,
          frequency: 0.6,
          affiliation: 0.8,
          goalAlignment: 0.9
        },
        draft: {
          preIntroPing: "Hi Alex! I think you'd really benefit from connecting with Lisa. She's been doing some amazing work with growth marketing and I know you're focused on product-led growth.",
          doubleOptIntro: "Hi Alex and Lisa! Alex is a PM focused on product-led growth, and Lisa is a marketing director who's been scaling growth strategies. I think you'd have some great insights to share about growth tactics."
        }
      }
    ];

    return NextResponse.json({ suggestions: mockSuggestions });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
