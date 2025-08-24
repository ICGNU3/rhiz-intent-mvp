import { NextRequest, NextResponse } from 'next/server';
import { db, person, goal, encounter, claim, edge } from '@rhiz/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getUserId } from '@/lib/auth-mock';
import { generateGraphInsights, rankSuggestions } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, type = 'general' } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Fetch relevant data based on insight type
    let insights = [];

    try {
      switch (type) {
        case 'network_gaps': {
          // Analyze network for gaps
          const [goals, people, edges] = await Promise.all([
            db.select().from(goal).where(
              and(
                eq(goal.workspaceId, workspaceId),
                eq(goal.status, 'active')
              )
            ).limit(10),
            
            db.select().from(person).where(
              eq(person.workspaceId, workspaceId)
            ).limit(100),
            
            db.select().from(edge).where(
              eq(edge.workspaceId, workspaceId)
            ).limit(200),
          ]);

          // Generate AI insights about network gaps
          const graphData = {
            nodes: people.map(p => ({
              id: p.id,
              name: p.fullName,
              email: p.primaryEmail,
            })),
            edges: edges.map(e => ({
              from: e.fromId,
              to: e.toId,
              type: e.type,
              strength: e.strength,
            })),
          };

          insights = await generateGraphInsights(graphData, goals);
          break;
        }

        case 'dormant_ties': {
          // Find relationships that haven't been active recently
          const recentEncounters = await db
            .select({
              personId: sql`pe.person_id`,
              lastContact: sql`MAX(e.occurred_at)`,
            })
            .from(encounter)
            .innerJoin(
              sql`person_encounter pe ON pe.encounter_id = encounter.id`
            )
            .where(eq(encounter.workspaceId, workspaceId))
            .groupBy(sql`pe.person_id`)
            .having(sql`MAX(e.occurred_at) < NOW() - INTERVAL '30 days'`)
            .limit(20);

          insights = recentEncounters.map(r => ({
            type: 'dormant_tie',
            title: 'Reconnection Opportunity',
            description: `Haven't connected recently - consider reaching out`,
            personId: r.personId,
            score: 75,
            metadata: {
              lastContact: r.lastContact,
              daysSince: Math.floor((Date.now() - new Date(r.lastContact).getTime()) / (1000 * 60 * 60 * 24)),
            },
          }));
          break;
        }

        case 'introduction_opportunities': {
          // Find potential valuable introductions
          const [people, claims] = await Promise.all([
            db.select().from(person).where(
              eq(person.workspaceId, workspaceId)
            ).limit(50),
            
            db.select().from(claim).where(
              and(
                eq(claim.workspaceId, workspaceId),
                sql`claim.key IN ('expertise', 'interests', 'goals')`
              )
            ).limit(200),
          ]);

          // Group claims by person
          const personClaims = {};
          claims.forEach(c => {
            if (!personClaims[c.subjectId]) {
              personClaims[c.subjectId] = [];
            }
            personClaims[c.subjectId].push(c);
          });

          // Find people with overlapping interests
          const introOpportunities = [];
          for (let i = 0; i < people.length; i++) {
            for (let j = i + 1; j < people.length; j++) {
              const person1Claims = personClaims[people[i].id] || [];
              const person2Claims = personClaims[people[j].id] || [];
              
              const overlap = person1Claims.filter(c1 =>
                person2Claims.some(c2 => 
                  c1.key === c2.key && 
                  c1.value.toLowerCase().includes(c2.value.toLowerCase())
                )
              );
              
              if (overlap.length > 0) {
                introOpportunities.push({
                  type: 'introduction',
                  title: `Connect ${people[i].fullName} with ${people[j].fullName}`,
                  description: `Shared interests in: ${overlap.map(o => o.value).join(', ')}`,
                  score: Math.min(95, 60 + (overlap.length * 10)),
                  metadata: {
                    person1Id: people[i].id,
                    person2Id: people[j].id,
                    commonInterests: overlap.map(o => o.value),
                  },
                });
              }
            }
          }
          
          insights = introOpportunities.slice(0, 10);
          break;
        }

        default: {
          // General insights combining multiple types
          const [activeGoals, recentEncounters] = await Promise.all([
            db.select().from(goal).where(
              and(
                eq(goal.workspaceId, workspaceId),
                eq(goal.status, 'active')
              )
            ).limit(5),
            
            db.select().from(encounter).where(
              eq(encounter.workspaceId, workspaceId)
            ).orderBy(desc(encounter.occurredAt)).limit(10),
          ]);

          // Generate mixed insights
          insights = [
            ...activeGoals.map(g => ({
              type: 'goal_reminder',
              title: `Active Goal: ${g.title}`,
              description: g.details || 'Consider next steps for this goal',
              goalId: g.id,
              score: 80,
            })),
            ...recentEncounters.slice(0, 3).map(e => ({
              type: 'follow_up',
              title: 'Follow-up Opportunity',
              description: e.description || 'Consider following up on recent conversation',
              encounterId: e.id,
              score: 70,
            })),
          ];
        }
      }

      // Rank insights using AI if available
      const userContext = {
        hasActiveGoals: true,
        recentActivity: 'high',
        networkSize: 'medium',
      };
      
      const rankedInsights = await rankSuggestions(insights, userContext);

      return NextResponse.json({
        success: true,
        insights: rankedInsights,
        metadata: {
          type,
          count: rankedInsights.length,
          generated: new Date().toISOString(),
        },
      });

    } catch (dbError) {
      console.log('Database query failed, returning mock insights:', dbError);
      
      // Return mock AI-generated insights
      return NextResponse.json({
        success: true,
        insights: [
          {
            type: 'network_gap',
            title: 'Expand Your Engineering Network',
            description: 'Your network lacks senior engineers. Consider attending tech meetups or reaching out to engineering leaders.',
            score: 85,
            aiGenerated: true,
          },
          {
            type: 'introduction',
            title: 'Strategic Introduction Opportunity',
            description: 'Based on your goals, connecting with investors in the fintech space could accelerate your fundraising.',
            score: 92,
            aiGenerated: true,
          },
          {
            type: 'dormant_tie',
            title: 'Reactivate Valuable Connection',
            description: 'You haven\'t connected with your previous advisors in 60+ days. They could provide valuable guidance.',
            score: 78,
            aiGenerated: true,
          },
        ],
        metadata: {
          type,
          count: 3,
          generated: new Date().toISOString(),
          demo: true,
        },
      });
    }

  } catch (error) {
    console.error('AI insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}