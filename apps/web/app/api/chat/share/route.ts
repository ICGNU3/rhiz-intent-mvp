import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/useUser';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { personId, purpose, questions } = await request.json();
    
    if (!personId || !purpose) {
      return NextResponse.json(
        { error: 'Person ID and purpose are required' },
        { status: 400 }
      );
    }
    
    // Mock person data
    const mockPerson = {
      id: personId,
      name: 'Sarah Chen',
      email: 'sarah.chen@stripe.com',
      role: 'CTO',
      company: 'Stripe'
    };
    
    // Generate tokenized reply address
    const token = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const replyToAddress = `rhiz-${token}@rhiz.app`;
    
    // Generate email draft
    const emailDraft = {
      to: mockPerson.email,
      subject: `Rhiz - ${purpose}`,
      body: `Hi ${mockPerson.name},

Israel asked me to check in so I can help find useful introductions. 

What are your top priorities right now? Are you hiring, raising, or looking for customers? Anything off-limits?

I'll help connect you with relevant people in our network.

Best,
Rhiz

---
Reply to this email to continue the conversation. Your response will be shared with Israel.`
    };
    
    return NextResponse.json({
      success: true,
      person: mockPerson,
      emailDraft,
      replyToAddress,
      token
    });
    
  } catch (error) {
    console.error('Chat share error:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}
