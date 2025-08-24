import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, from, subject, text } = await request.json();
    
    if (!token || !from || !text) {
      return NextResponse.json(
        { error: 'Token, from, and text are required' },
        { status: 400 }
      );
    }
    
    // Mock processing - in real implementation:
    // 1. Validate token
    // 2. Find associated person and conversation
    // 3. Create Message from sender_type='contact'
    // 4. Run agent loop with capture_note | clarify
    // 5. Store Claims for that Person
    
    const mockMessage = {
      id: `msg-${Date.now()}-contact`,
      conversationId: 'mock-conversation-1',
      senderType: 'contact',
      senderId: from,
      text,
      data: null,
      createdAt: new Date()
    };
    
    // Mock agent response
    const mockAgentResponse = {
      text: "I've captured your response and will share it with the team. Thanks for getting back to us!",
      data: {
        people: [{
          id: 'mock-contact-1',
          name: from.split('@')[0],
          role: 'Contact',
          company: 'External',
          lastEncounter: 'Just now',
          actions: [
            {
              label: 'Add note',
              action: 'add_note',
              data: { personId: 'mock-contact-1' }
            }
          ]
        }]
      }
    };
    
    return NextResponse.json({
      success: true,
      message: mockMessage,
      agentResponse: mockAgentResponse
    });
    
  } catch (error) {
    console.error('Inbound email error:', error);
    return NextResponse.json(
      { error: 'Failed to process inbound email' },
      { status: 500 }
    );
  }
}
