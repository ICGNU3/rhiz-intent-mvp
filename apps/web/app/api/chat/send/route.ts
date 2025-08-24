import { NextRequest, NextResponse } from 'next/server';
import { Agent } from '@/lib/agent';
import { requireUser, getUserId } from '@/lib/useUser';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const userId = getUserId();
    
    const { conversationId, text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Mock workspace and conversation for now
    const workspaceId = 'mock-workspace-1';
    const actualConversationId = conversationId || 'mock-conversation-1';
    
    // Initialize agent
    const agent = new Agent();
    
    // Process user input
    const response = await agent.process(text, {
      workspaceId,
      userId,
      conversationId: actualConversationId
    });
    
    // Mock message storage - in real implementation, save to database
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      conversationId: actualConversationId,
      senderType: 'user',
      senderId: userId,
      text,
      data: null,
      createdAt: new Date()
    };
    
    const agentMessage = {
      id: `msg-${Date.now()}-agent`,
      conversationId: actualConversationId,
      senderType: 'agent',
      senderId: null,
      text: response.text,
      data: response.cards,
      createdAt: new Date()
    };
    
    return NextResponse.json({
      success: true,
      userMessage,
      agentMessage,
      response
    });
    
  } catch (error) {
    console.error('Chat send error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
