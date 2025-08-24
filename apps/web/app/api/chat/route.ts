import { NextRequest } from 'next/server';
import { getUserId } from '@/lib/auth-mock';
import { Agent } from '@/lib/agent';
import { broadcastToWorkspace } from '../ws/route';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, stream = true, workspaceId = '550e8400-e29b-41d4-a716-446655440001' } = await request.json();
    
    // Get the last user message
    const lastUserMessage = messages
      .filter((m: any) => m.role === 'user')
      .pop()?.content;

    if (!lastUserMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const agent = new Agent();
    const context = { userId, workspaceId, messages };

    if (stream) {
      // Stream the response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const response = await agent.streamProcess(
              lastUserMessage, 
              context,
              (chunk) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
              }
            );

            // Send the final response with cards and metadata
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              done: true, 
              response: {
                text: response.text,
                cards: response.cards,
                metadata: response.metadata
              }
            })}\n\n`));

            // Broadcast real-time updates via WebSocket
            if (response.cards) {
              if (response.cards.people) {
                broadcastToWorkspace(workspaceId, {
                  type: 'people_updated',
                  people: response.cards.people,
                  updatedBy: userId
                }, userId);
              }

              if (response.cards.suggestions) {
                broadcastToWorkspace(workspaceId, {
                  type: 'suggestions_updated',
                  suggestions: response.cards.suggestions,
                  updatedBy: userId
                }, userId);
              }

              if (response.cards.goals) {
                broadcastToWorkspace(workspaceId, {
                  type: 'goals_updated',
                  goals: response.cards.goals,
                  updatedBy: userId
                }, userId);
              }
            }
            
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              error: 'Failed to process request' 
            })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const response = await agent.process(lastUserMessage, context);
      
      // Broadcast real-time updates via WebSocket
      if (response.cards) {
        broadcastToWorkspace(workspaceId, {
          type: 'agent_response',
          response: response.cards,
          updatedBy: userId
        }, userId);
      }
      
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}