import { NextRequest, NextResponse } from 'next/server';
// import { db, suggestion } from '@rhiz/db';
// import { eq, and, desc } from 'drizzle-orm';
// import { getUserId } from '@rhiz/shared';

export async function GET(request: NextRequest) {
  try {
    // Mock suggestions data
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
