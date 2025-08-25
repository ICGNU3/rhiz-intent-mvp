import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { transcribeAudio, extractFromText, extractionSchemas } from '@/lib/ai';
import { generateSpeech } from '@/lib/elevenlabs';
import { InterviewAgent } from '@/lib/interview-agent';
import { logger } from '@/lib/logger';
import { db, encounter, person, claim, conversation, message } from '@rhiz/db';
import { getUserId } from '@/lib/auth-mock';
import { eq } from 'drizzle-orm';

// WebSocket server instance
let wss: WebSocketServer | null = null;

// Initialize WebSocket server
function initWebSocketServer() {
  if (wss) return wss;

  wss = new WebSocketServer({ noServer: true });
  
  wss.on('connection', (ws, request) => {
    logger.info('WebSocket client connected', { component: 'voice-stream' });
    
    let audioBuffer: Buffer[] = [];
    let isProcessing = false;
    let conversationId: string | null = null;
    let encounterId: string | null = null;
    let silenceTimer: NodeJS.Timeout | null = null;
    const SILENCE_THRESHOLD = 2000; // 2 seconds of silence triggers processing
    
    // Initialize Interview Agent for this conversation
    const interviewAgent = new InterviewAgent();

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'audio_chunk':
            // Accumulate audio chunks
            const chunk = Buffer.from(data.data, 'base64');
            audioBuffer.push(chunk);
            
            // Process when we have enough audio (e.g., every 2 seconds)
            if (audioBuffer.length >= 20 && !isProcessing) { // 20 chunks = ~2 seconds
              isProcessing = true;
              
              try {
                // Combine audio chunks
                const combinedAudio = Buffer.concat(audioBuffer);
                audioBuffer = []; // Reset buffer
                
                // Step 1: Real-time transcription
                const transcript = await transcribeAudio(combinedAudio.buffer.slice(combinedAudio.byteOffset, combinedAudio.byteOffset + combinedAudio.byteLength));
                
                // Send transcription back to client
                ws.send(JSON.stringify({
                  type: 'transcription',
                  text: transcript,
                  timestamp: Date.now()
                }));
                
                // Step 2: AI processing (only if we have meaningful content)
                if (transcript.trim().length > 10) {
                  // Process with interview agent
                  const interviewResponse = await interviewAgent.processUserInput(transcript);
                  
                  // Combine response with next question if available
                  let fullResponse = interviewResponse.response;
                  if (interviewResponse.nextQuestion && !interviewResponse.shouldEndInterview) {
                    fullResponse += ' ' + interviewResponse.nextQuestion;
                  }
                  
                  const aiResponse = {
                    text: fullResponse,
                    cards: null,
                    entities: interviewResponse.entities
                  };
                  
                  // Send AI response back to client
                  ws.send(JSON.stringify({
                    type: 'ai_response',
                    text: aiResponse.text,
                    cards: aiResponse.cards,
                    timestamp: Date.now()
                  }));
                  
                  // Step 3: Generate speech response
                  if (aiResponse.text) {
                    const audioResponse = await generateSpeech(aiResponse.text);
                    
                    // Send audio response back to client
                    ws.send(JSON.stringify({
                      type: 'audio_response',
                      audio: audioResponse.toString('base64'),
                      timestamp: Date.now()
                    }));
                  }
                  
                  // Step 4: Save to database (periodically)
                  if (!encounterId) {
                    encounterId = crypto.randomUUID();
                    await saveConversationToDatabase(encounterId, transcript, aiResponse);
                  } else {
                    await updateEntitiesToDatabase(encounterId, aiResponse.entities);
                  }
                }
                
              } catch (error) {
                logger.error('Error processing audio chunk', error as Error, { component: 'voice-stream' });
                ws.send(JSON.stringify({
                  type: 'error',
                  error: 'Failed to process audio',
                  timestamp: Date.now()
                }));
              } finally {
                isProcessing = false;
              }
            }
            break;
            
          case 'start_conversation':
            // Initialize conversation
            encounterId = crypto.randomUUID();
            interviewAgent.reset();
            audioBuffer = [];
            
            ws.send(JSON.stringify({
              type: 'conversation_started',
              encounterId,
              timestamp: Date.now()
            }));
            break;
            
          case 'end_conversation':
            // Finalize conversation
            if (encounterId) {
              const summary = await interviewAgent.getSummary();
              await finalizeConversation(encounterId, summary);
            }
            
            ws.send(JSON.stringify({
              type: 'conversation_ended',
              timestamp: Date.now()
            }));
            break;
            
          default:
            logger.warn('Unknown message type', { component: 'voice-stream', type: data.type });
        }
        
      } catch (error) {
        logger.error('Error processing WebSocket message', error as Error, { component: 'voice-stream' });
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Failed to process message',
          timestamp: Date.now()
        }));
      }
    });

    ws.on('close', () => {
      logger.info('WebSocket client disconnected', { component: 'voice-stream' });
      
      // Finalize conversation if needed
      if (encounterId) {
        (async () => {
          const summary = await interviewAgent.getSummary();
          await finalizeConversation(encounterId, summary);
        })().catch(error => {
          logger.error('Error finalizing conversation', error as Error, { component: 'voice-stream' });
        });
      }
    });

    ws.on('error', (error) => {
      logger.error('WebSocket error', error as Error, { component: 'voice-stream' });
    });
  });

  return wss;
}

async function saveConversationToDatabase(
  encounterId: string, 
  transcript: string, 
  aiResponse: any
): Promise<void> {
  try {
    const userId = await getUserId();
    if (!userId) return;

    // Create encounter record
    await db.insert(encounter).values({
      workspaceId: 'default', // TODO: Get from context
      ownerId: userId,
      kind: 'voice_conversation',
      summary: transcript.substring(0, 100) + '...',
      occurredAt: new Date(),
      raw: { transcript }, // Store full transcript in raw field
    });

    // Extract and save people mentioned
    const extractedPeople = await extractFromText(
      transcript,
      extractionSchemas.people,
      'Extract all people mentioned in this conversation.'
    );

    // TODO: Fix database insertion for extracted people
    // if (extractedPeople?.people) {
    //   for (const personData of extractedPeople.people) {
    //     const personId = crypto.randomUUID();
    //     
    //     await db.insert(person).values({
    //       id: personId,
    //       workspaceId: 'default',
    //       ownerId: userId,
    //       fullName: personData.fullName,
    //       primaryEmail: personData.email || null,
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     });

    //     // Add claims about the person
    //     if (personData.role) {
    //       await db.insert(claim).values({
    //         id: crypto.randomUUID(),
    //         workspaceId: 'default',
    //         ownerId: userId,
    //         subjectType: 'person',
    //         subjectId: personId,
    //         key: 'role',
    //         value: personData.role,
    //         confidence: 85,
    //         source: 'voice_conversation',
    //         lawfulBasis: 'legitimate_interest',
    //         observedAt: new Date(),
    //       });
    //     }
    //   }
    // }

  } catch (error) {
    logger.error('Error saving conversation to database', error as Error, { component: 'voice-stream' });
  }
}

async function updateEntitiesToDatabase(
  encounterId: string,
  entities: any
): Promise<void> {
  try {
    // Update entities in database
    logger.info('Updating entities in database', { 
      component: 'voice-stream',
      encounterId,
      entitiesCount: Object.keys(entities).length 
    });
  } catch (error) {
    logger.error('Error updating conversation in database', error as Error, { component: 'voice-stream' });
  }
}

async function finalizeConversation(encounterId: string, conversationContext: string): Promise<void> {
  try {
    logger.info('Finalizing conversation', { 
      component: 'voice-stream',
      encounterId,
      contextLength: conversationContext.length 
    });
    
    // Here you could:
    // 1. Generate a summary of the conversation
    // 2. Extract key insights and opportunities
    // 3. Create follow-up tasks
    // 4. Update the encounter with final metadata
    
  } catch (error) {
    logger.error('Error finalizing conversation', error as Error, { component: 'voice-stream' });
  }
}

// HTTP handler for WebSocket upgrade
export async function GET(request: NextRequest) {
  try {
    const wss = initWebSocketServer();
    
    // Handle WebSocket upgrade
    if (request.headers.get('upgrade') === 'websocket') {
      // This would typically be handled by a WebSocket server
      // For Next.js, we might need to use a different approach
      return new Response('WebSocket upgrade not supported in this environment', { status: 400 });
    }
    
    return new Response('WebSocket endpoint', { status: 200 });
  } catch (error) {
    logger.error('WebSocket handler error', error as Error, { component: 'voice-stream' });
    return new Response('Internal server error', { status: 500 });
  }
}

// For development, we'll use a different approach with Socket.IO or similar
export async function POST(request: NextRequest) {
  try {
    const { audioData, type } = await request.json();
    
    if (type === 'audio_chunk') {
      // Process audio chunk directly
      const audioBuffer = Buffer.from(audioData, 'base64');
      const transcript = await transcribeAudio(audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength));
      
      // For POST, we'll create a temporary interview agent
      const tempAgent = new InterviewAgent();
      const interviewResponse = await tempAgent.processUserInput(transcript);
      
      let fullResponse = interviewResponse.response;
      if (interviewResponse.nextQuestion && !interviewResponse.shouldEndInterview) {
        fullResponse += ' ' + interviewResponse.nextQuestion;
      }
      
      const audioResponse = await generateSpeech(fullResponse);
      
      return Response.json({
        type: 'response',
        transcript,
        aiResponse: fullResponse,
        entities: interviewResponse.entities,
        audioResponse: audioResponse.toString('base64')
      });
    }
    
    return Response.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    logger.error('Voice stream POST error', error as Error, { component: 'voice-stream' });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
