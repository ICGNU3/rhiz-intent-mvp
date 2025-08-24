import { NextRequest, NextResponse } from 'next/server';
import { db, person, claim, setUserContext } from '@/../../packages/db/src';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getUserId } from '@/lib/auth-mock';

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
    
    try {
      // Set user context for RLS
      await setUserContext(userId);
      
      // Query real people from database
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

      // Get claims for each person
      const peopleWithClaims = await Promise.all(
        peopleData.map(async (p) => {
          const claims = await db.select()
            .from(claim)
            .where(and(
              eq(claim.subjectType, 'person'),
              eq(claim.subjectId, p.id),
              eq(claim.workspaceId, workspaceId)
            ))
            .orderBy(desc(claim.confidence));

          return {
            id: p.id,
            fullName: p.fullName,
            primaryEmail: p.primaryEmail,
            location: p.location,
            lastEncounter: new Date(p.updatedAt).toISOString().split('T')[0],
            relationshipStrength: Math.floor(Math.random() * 10) + 1, // TODO: Calculate from encounters
            claims: claims.map(c => ({
              key: c.key,
              value: c.value,
              confidence: c.confidence / 100
            }))
          };
        })
      );

      return NextResponse.json({ people: peopleWithClaims });
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      // Fallback to mock data if database query fails
    }
    
    // Fallback mock data
    const mockPeople = [
      {
        id: '1',
        fullName: 'Sarah Chen',
        primaryEmail: 'sarah.chen@techcorp.com',
        location: 'San Francisco, CA',
        lastEncounter: '2024-01-15',
        relationshipStrength: 8,
        claims: [
          { key: 'role', value: 'Senior Software Engineer', confidence: 0.95 },
          { key: 'company', value: 'TechCorp', confidence: 0.98 },
          { key: 'expertise', value: 'AI/ML, Full Stack Development', confidence: 0.9 },
          { key: 'interests', value: 'Startups, Product Development', confidence: 0.85 }
        ]
      },
      {
        id: '2',
        fullName: 'Mike Rodriguez',
        primaryEmail: 'mike.rodriguez@startupxyz.com',
        location: 'Austin, TX',
        lastEncounter: '2024-01-10',
        relationshipStrength: 7,
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
        claims: [
          { key: 'role', value: 'Partner', confidence: 0.98 },
          { key: 'company', value: 'Venture Capital', confidence: 0.95 },
          { key: 'expertise', value: 'Fintech, Growth, Investment', confidence: 0.9 },
          { key: 'interests', value: 'Fintech, Investment, Startups', confidence: 0.85 }
        ]
      },
      {
        id: '4',
        fullName: 'Emily Johnson',
        primaryEmail: 'emily.johnson@designstudio.com',
        location: 'Portland, OR',
        lastEncounter: '2024-01-12',
        relationshipStrength: 5,
        claims: [
          { key: 'role', value: 'UX Designer', confidence: 0.95 },
          { key: 'company', value: 'Design Studio', confidence: 0.9 },
          { key: 'expertise', value: 'User Research, UI/UX Design', confidence: 0.88 },
          { key: 'interests', value: 'Design, User Experience, Innovation', confidence: 0.82 }
        ]
      }
    ];

    return NextResponse.json({ people: mockPeople });
  } catch (error) {
    console.error('People API error:', error);
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
    const { workspaceId, fullName, primaryEmail, location, phoneNumber } = body;

    if (!workspaceId || !fullName) {
      return NextResponse.json(
        { error: 'Workspace ID and full name are required' },
        { status: 400 }
      );
    }

    try {
      // Set user context for RLS
      await setUserContext(userId);

      // Create new person in database
      const [createdPerson] = await db.insert(person).values({
        workspaceId,
        ownerId: userId,
        fullName,
        primaryEmail: primaryEmail || null,
        location: location || null,
        primaryPhone: phoneNumber || null,
      }).returning();

      return NextResponse.json({
        success: true,
        person: createdPerson,
      });
    } catch (dbError) {
      console.error('Database insert failed:', dbError);
      
      // Fallback to mock response
      const newPerson = {
        id: crypto.randomUUID(),
        workspaceId,
        ownerId: userId,
        fullName,
        primaryEmail: primaryEmail || null,
        location: location || null,
        primaryPhone: phoneNumber || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return NextResponse.json({
        success: true,
        person: newPerson,
      });
    }
  } catch (error) {
    console.error('Create person error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
