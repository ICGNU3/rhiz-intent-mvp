import { NextRequest } from 'next/server';
import { getUserId } from '@/lib/auth-mock';
import { Agent } from '@/lib/agent';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, stream = true } = await request.json();
    
    // Get the last user message
    const lastUserMessage = messages
      .filter((m: any) => m.role === 'user')
      .pop()?.content;

    if (!lastUserMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const agent = new Agent();
    const context = { userId, messages };

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