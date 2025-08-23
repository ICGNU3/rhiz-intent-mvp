import { db } from './index';
import { person, goal, encounter, claim, suggestion, org } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const demoUserId = 'demo-user-123';

  // Create organizations
  const [acmeCorp] = await db.insert(org).values({
    name: 'Acme Corp',
    domain: 'acme.com',
  }).returning();

  const [techStartup] = await db.insert(org).values({
    name: 'TechStartup Inc',
    domain: 'techstartup.io',
  }).returning();

  // Create people
  const [sarah] = await db.insert(person).values({
    ownerId: demoUserId,
    fullName: 'Sarah Chen',
    primaryEmail: 'sarah.chen@acme.com',
    location: 'San Francisco, CA',
  }).returning();

  const [mike] = await db.insert(person).values({
    ownerId: demoUserId,
    fullName: 'Mike Rodriguez',
    primaryEmail: 'mike@techstartup.io',
    location: 'Austin, TX',
  }).returning();

  const [alex] = await db.insert(person).values({
    ownerId: demoUserId,
    fullName: 'Alex Johnson',
    primaryEmail: 'alex.johnson@venture.com',
    location: 'New York, NY',
  }).returning();

  // Create a goal
  const [raiseGoal] = await db.insert(goal).values({
    ownerId: demoUserId,
    kind: 'raise_seed',
    title: 'Raise $500K seed round',
    details: 'Looking for early-stage investors interested in B2B SaaS',
    status: 'active',
  }).returning();

  // Create an encounter
  const [meeting] = await db.insert(encounter).values({
    ownerId: demoUserId,
    kind: 'meeting',
    occurredAt: new Date('2024-01-15T10:00:00Z'),
    summary: 'Coffee meeting with Sarah to discuss potential collaboration',
    raw: {
      attendees: [sarah.id],
      location: 'Blue Bottle Coffee, SF',
      duration: 60,
    },
  }).returning();

  // Create claims about people
  await db.insert(claim).values([
    {
      ownerId: demoUserId,
      subjectType: 'person',
      subjectId: sarah.id,
      key: 'title',
      value: 'VP of Engineering',
      confidence: 90,
      source: 'calendar',
      lawfulBasis: 'legitimate_interest',
      provenance: { source: 'calendar_event', eventId: meeting.id },
    },
    {
      ownerId: demoUserId,
      subjectType: 'person',
      subjectId: sarah.id,
      key: 'company',
      value: 'Acme Corp',
      confidence: 95,
      source: 'calendar',
      lawfulBasis: 'legitimate_interest',
      provenance: { source: 'calendar_event', eventId: meeting.id },
    },
    {
      ownerId: demoUserId,
      subjectType: 'person',
      subjectId: mike.id,
      key: 'title',
      value: 'Founder & CEO',
      confidence: 85,
      source: 'manual',
      lawfulBasis: 'consent',
      provenance: { source: 'manual_entry' },
    },
    {
      ownerId: demoUserId,
      subjectType: 'person',
      subjectId: alex.id,
      key: 'title',
      value: 'Partner',
      confidence: 80,
      source: 'manual',
      lawfulBasis: 'consent',
      provenance: { source: 'manual_entry' },
    },
    {
      ownerId: demoUserId,
      subjectType: 'person',
      subjectId: alex.id,
      key: 'company',
      value: 'Venture Capital Partners',
      confidence: 85,
      source: 'manual',
      lawfulBasis: 'consent',
      provenance: { source: 'manual_entry' },
    },
  ]);

  // Create a suggestion
  await db.insert(suggestion).values({
    ownerId: demoUserId,
    kind: 'introduction',
    aId: mike.id,
    bId: alex.id,
    goalId: raiseGoal.id,
    score: 85,
    why: {
      reasons: [
        'Mike is a founder looking to raise funding',
        'Alex is a VC partner who invests in early-stage startups',
        'Both are in the tech ecosystem and could benefit from connection',
      ],
      mutualInterests: ['startups', 'fundraising', 'technology'],
    },
    draft: {
      preIntroPing: "Hey Mike, I think you'd really connect with Alex. He's a VC partner who's been investing in early-stage SaaS companies for the past 5 years. Would you be open to an intro?",
      doubleOptIntro: "Hi Alex, I'd like to introduce you to Mike Rodriguez, founder of TechStartup Inc. Mike is building an innovative B2B SaaS platform and is currently raising a seed round. I thought you two would have a great conversation given your investment focus.\n\nMike, Alex is a partner at Venture Capital Partners with deep experience in early-stage investments, particularly in the SaaS space.\n\nWould you both be open to connecting?",
    },
    state: 'proposed',
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Created ${demoUserId} with demo data`);
}

seed().catch(console.error);
