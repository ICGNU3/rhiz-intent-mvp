import { NextRequest, NextResponse } from 'next/server';
import { db, person, claim, encounter, personEncounter, setUserContext, eq, and, desc } from '@rhiz/db';
import { count } from 'drizzle-orm';
import { getUserId } from '@/lib/auth-mock';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { 
  calculateRelationshipMetrics, 
  findRhizomaticConnections, 
  generateCyberneticFeedback,
  DUNBAR_LAYERS
} from '@/lib/relationship-theory';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId') || '550e8400-e29b-41d4-a716-446655440001';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const layerFilter = searchParams.get('layer'); // Optional Dunbar layer filter
    const includeRhizomatic = searchParams.get('rhizomatic') === 'true';
    const includeFeedback = searchParams.get('feedback') === 'true';
    
    try {
      // Set user context for RLS
      await setUserContext(userId);
      
      // Query real people from database with enhanced data
      const peopleData = await db.select({
        id: person.id,
        fullName: person.fullName,
        primaryEmail: person.primaryEmail,
        location: person.location,
        createdAt: person.createdAt,
        updatedAt: person.updatedAt,
      })
      .from(person)
      .where(and(
        eq(person.workspaceId, workspaceId),
        eq(person.ownerId, userId)
      ))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(person.updatedAt));

      // Enhanced people data with theoretical framework
      const enhancedPeople = await Promise.all(
        peopleData.map(async (p) => {
          // Get claims
          const claims = await db.select()
            .from(claim)
            .where(and(
              eq(claim.subjectType, 'person'),
              eq(claim.subjectId, p.id),
              eq(claim.workspaceId, workspaceId)
            ))
            .orderBy(desc(claim.confidence));

          // Get encounter count and last encounter through junction table
          const encounterStats = await db.select()
            .from(personEncounter)
            .where(eq(personEncounter.personId, p.id));

          const lastEncounter = await db.select({
            encounter: encounter
          })
            .from(personEncounter)
            .innerJoin(encounter, eq(personEncounter.encounterId, encounter.id))
            .where(eq(personEncounter.personId, p.id))
            .orderBy(desc(encounter.createdAt))
            .limit(1);

          // Calculate enhanced relationship metrics
          const interactionCount = encounterStats.length;
          const daysSinceLastInteraction = lastEncounter[0] 
            ? Math.floor((Date.now() - new Date(lastEncounter[0].encounter.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : 365;

          const metrics = calculateRelationshipMetrics(
            interactionCount,
            daysSinceLastInteraction,
            7, // Default conversation quality
            6, // Default contextual relevance
            6  // Default mutual engagement
          );

          const basePerson = {
            id: p.id,
            fullName: p.fullName,
            primaryEmail: p.primaryEmail,
            location: p.location,
            lastEncounter: lastEncounter[0]?.encounter.createdAt || p.createdAt,
            relationshipStrength: metrics.strength,
            dunbarLayer: metrics.dunbarLayer,
            relationshipMetrics: metrics,
            claims: claims.map(c => ({
              key: c.key,
              value: c.value,
              confidence: c.confidence / 100
            }))
          };

          // Add rhizomatic connections if requested
          let rhizomaticConnections: any[] = [];
          if (includeRhizomatic) {
            rhizomaticConnections = findRhizomaticConnections(basePerson, peopleData);
          }

          // Add cybernetic feedback if requested
          let cyberneticFeedback = null;
          if (includeFeedback) {
            cyberneticFeedback = generateCyberneticFeedback(metrics, []);
          }

          return {
            ...basePerson,
            ...(includeRhizomatic && { rhizomaticConnections }),
            ...(includeFeedback && { cyberneticFeedback })
          };
        })
      );

      // Filter by Dunbar layer if requested
      let filteredPeople = enhancedPeople;
      if (layerFilter) {
        const targetLayer = parseInt(layerFilter);
        filteredPeople = enhancedPeople.filter(p => p.dunbarLayer.layer === targetLayer);
      }

      // Add layer statistics
      const layerStats = DUNBAR_LAYERS.map(layer => ({
        layer: layer.layer,
        name: layer.name,
        count: enhancedPeople.filter(p => p.dunbarLayer.layer === layer.layer).length,
        maxSize: layer.maxSize,
        description: layer.description
      }));

      return NextResponse.json({ 
        people: filteredPeople,
        layerStats,
        total: enhancedPeople.length
      });

    } catch (dbError) {
      console.error('Database query failed, using enhanced mock data:', dbError);
      
      // Enhanced mock data with theoretical framework
      const mockPeople = [
        {
          id: '1',
          fullName: 'Sarah Chen',
          primaryEmail: 'sarah.chen@techcorp.com',
          location: 'San Francisco, CA',
          lastEncounter: '2024-01-15',
          relationshipStrength: 8,
          dunbarLayer: DUNBAR_LAYERS[1], // Close
          relationshipMetrics: calculateRelationshipMetrics(12, 5, 8, 7, 8),
          claims: [
            { key: 'role', value: 'Senior Software Engineer', confidence: 0.95 },
            { key: 'company', value: 'TechCorp', confidence: 0.98 },
            { key: 'expertise', value: 'AI/ML, Full Stack Development', confidence: 0.9 },
            { key: 'interests', value: 'Startups, Product Development', confidence: 0.85 }
          ],
          ...(includeRhizomatic && { 
            rhizomaticConnections: [
              {
                type: 'intellectual',
                strength: 0.8,
                description: 'Shared interest in AI/ML and startups',
                sharedAttributes: ['AI/ML', 'Startups']
              }
            ]
          }),
          ...(includeFeedback && { 
            cyberneticFeedback: generateCyberneticFeedback(
              calculateRelationshipMetrics(12, 5, 8, 7, 8), 
              []
            )
          })
        },
        {
          id: '2', 
          fullName: 'Mike Rodriguez',
          primaryEmail: 'mike.rodriguez@startupxyz.com',
          location: 'Austin, TX',
          lastEncounter: '2024-01-10',
          relationshipStrength: 7,
          dunbarLayer: DUNBAR_LAYERS[2], // Meaningful
          relationshipMetrics: calculateRelationshipMetrics(8, 10, 7, 6, 7),
          claims: [
            { key: 'role', value: 'CTO', confidence: 0.98 },
            { key: 'company', value: 'StartupXYZ', confidence: 0.95 },
            { key: 'expertise', value: 'SaaS, Scaling, Team Building', confidence: 0.92 },
            { key: 'interests', value: 'SaaS, Growth, Leadership', confidence: 0.88 }
          ]
        },
        {
          id: '3',
          fullName: 'David Kim',
          primaryEmail: 'david.kim@venturecapital.com', 
          location: 'New York, NY',
          lastEncounter: '2024-01-05',
          relationshipStrength: 6,
          dunbarLayer: DUNBAR_LAYERS[3], // Stable
          relationshipMetrics: calculateRelationshipMetrics(4, 15, 6, 8, 5),
          claims: [
            { key: 'role', value: 'Partner', confidence: 0.98 },
            { key: 'company', value: 'Venture Capital', confidence: 0.95 },
            { key: 'expertise', value: 'Fintech, Growth, Investment', confidence: 0.9 },
            { key: 'interests', value: 'Fintech, Investment, Startups', confidence: 0.85 }
          ]
        }
      ];

      // Add rhizomatic and feedback data to mock if requested
      const enhancedMockPeople = mockPeople.map(person => {
        const result = { ...person };
        
        if (includeRhizomatic) {
          result.rhizomaticConnections = findRhizomaticConnections(person, mockPeople);
        }
        
        if (includeFeedback) {
          result.cyberneticFeedback = generateCyberneticFeedback(person.relationshipMetrics, []);
        }
        
        return result;
      });

      const layerStats = DUNBAR_LAYERS.map(layer => ({
        layer: layer.layer,
        name: layer.name,
        count: mockPeople.filter(p => p.dunbarLayer.layer === layer.layer).length,
        maxSize: layer.maxSize,
        description: layer.description
      }));

      return NextResponse.json({ 
        people: enhancedMockPeople,
        layerStats,
        total: mockPeople.length
      });
    }
    
  } catch (error) {
    console.error('Enhanced People API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}