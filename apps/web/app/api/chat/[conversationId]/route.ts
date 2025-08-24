import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/useUser';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const user = await requireUser();
    const { conversationId } = params;
    
    // Mock conversation data - in real implementation, query database
    const mockMessages = [
      {
        id: 'msg-1',
        conversationId,
        senderType: 'user',
        senderId: 'user-1',
        text: "I'm raising a seed round",
        data: null,
        createdAt: new Date(Date.now() - 60000)
      },
      {
        id: 'msg-2',
        conversationId,
        senderType: 'agent',
        senderId: null,
        text: "I've set a goal for you: Raise seed round. I'll help you track progress and find relevant connections.",
        data: {
          goals: [{
            id: 'mock-goal-raise_seed',
            kind: 'raise_seed',
            title: 'Raise seed round',
            status: 'active'
          }]
        },
        createdAt: new Date(Date.now() - 30000)
      },
      {
        id: 'msg-3',
        conversationId,
        senderType: 'user',
        senderId: 'user-1',
        text: "Who should I talk to?",
        data: null,
        createdAt: new Date(Date.now() - 15000)
      },
      {
        id: 'msg-4',
        conversationId,
        senderType: 'agent',
        senderId: null,
        text: "Here are some people in your network who might be relevant:",
        data: {
          people: [
            {
              id: 'mock-sarah-chen',
              name: 'Sarah Chen',
              role: 'CTO',
              company: 'Stripe',
              lastEncounter: '2 days ago',
              actions: [
                {
                  label: 'Open',
                  action: 'open_person',
                  data: { personId: 'mock-sarah-chen' }
                },
                {
                  label: 'Add note',
                  action: 'add_note',
                  data: { personId: 'mock-sarah-chen' }
                },
                {
                  label: 'Intro with...',
                  action: 'intro_with',
                  data: { personId: 'mock-sarah-chen' }
                }
              ]
            },
            {
              id: 'mock-michael-rodriguez',
              name: 'Michael Rodriguez',
              role: 'Senior Engineer',
              company: 'Netflix',
              lastEncounter: '1 week ago',
              actions: [
                {
                  label: 'Open',
                  action: 'open_person',
                  data: { personId: 'mock-michael-rodriguez' }
                },
                {
                  label: 'Add note',
                  action: 'add_note',
                  data: { personId: 'mock-michael-rodriguez' }
                },
                {
                  label: 'Intro with...',
                  action: 'intro_with',
                  data: { personId: 'mock-michael-rodriguez' }
                }
              ]
            }
          ]
        },
        createdAt: new Date(Date.now() - 10000)
      }
    ];
    
    return NextResponse.json({
      success: true,
      conversationId,
      messages: mockMessages
    });
    
  } catch (error) {
    console.error('Chat conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to load conversation' },
      { status: 500 }
    );
  }
}
