import { NextRequest, NextResponse } from 'next/server';
import { db, encounter, person, claim } from '@rhiz/db';
import { getUserId } from '@/lib/auth-mock';
import { transcribeAudio, extractFromText, extractionSchemas } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const workspaceId = formData.get('workspaceId') as string;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }
    
    // Convert audio file to buffer
    const audioBuffer = await audioFile.arrayBuffer();
    
    // Step 1: Transcribe audio
    const transcript = await transcribeAudio(audioBuffer);
    
    // Step 2: Extract people mentioned
    const extractedPeople = await extractFromText(
      transcript,
      extractionSchemas.people,
      'Extract all people mentioned in this conversation with their roles and context.'
    );
    
    // Step 3: Extract insights
    const extractedInsights = await extractFromText(
      transcript,
      extractionSchemas.insights,
      'Extract actionable insights, opportunities, and follow-ups from this conversation.'
    );
    
    // Step 4: Extract relationships
    const extractedRelationships = await extractFromText(
      transcript,
      extractionSchemas.relationships,
      'Identify relationships between people mentioned in this conversation.'
    );
    
    // Create encounter record
    const newEncounter = {
      id: crypto.randomUUID(),
      workspaceId,
      ownerId: userId,
      kind: 'voice_note' as const,
      title: `Voice Note - ${new Date().toLocaleDateString()}`,
      description: extractedInsights?.insights[0]?.description || 'Voice note captured',
      occurredAt: new Date(),
      transcript,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      // Save to database
      await db.insert(encounter).values(newEncounter);
      
      // Create person records for extracted people
      if (extractedPeople?.people) {
        for (const extractedPerson of extractedPeople.people) {
          const newPerson = {
            id: crypto.randomUUID(),
            workspaceId,
            ownerId: userId,
            fullName: extractedPerson.fullName,
            primaryEmail: extractedPerson.email || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          try {
            await db.insert(person).values(newPerson);
            
            // Add claims about the person
            if (extractedPerson.role) {
              await db.insert(claim).values({
                id: crypto.randomUUID(),
                workspaceId,
                ownerId: userId,
                subjectType: 'person',
                subjectId: newPerson.id,
                key: 'role',
                value: extractedPerson.role,
                confidence: 85,
                source: 'voice',
                lawfulBasis: 'legitimate_interest',
                observedAt: new Date(),
              });
            }
            
            if (extractedPerson.company) {
              await db.insert(claim).values({
                id: crypto.randomUUID(),
                workspaceId,
                ownerId: userId,
                subjectType: 'person',
                subjectId: newPerson.id,
                key: 'company',
                value: extractedPerson.company,
                confidence: 85,
                source: 'voice',
                lawfulBasis: 'legitimate_interest',
                observedAt: new Date(),
              });
            }
          } catch (dbError) {
            console.log('Could not save person:', dbError);
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Voice note processed with AI',
        encounterId: newEncounter.id,
        transcript,
        extracted: {
          people: extractedPeople?.people || [],
          insights: extractedInsights?.insights || [],
          relationships: extractedRelationships?.relationships || [],
        },
      });
    } catch (dbError) {
      console.log('Database operation failed, returning extracted data:', dbError);
      
      // Still return the AI-processed data even if DB fails
      return NextResponse.json({
        success: true,
        message: 'Voice note processed (demo mode)',
        encounterId: newEncounter.id,
        transcript,
        extracted: {
          people: extractedPeople?.people || [],
          insights: extractedInsights?.insights || [],
          relationships: extractedRelationships?.relationships || [],
        },
      });
    }
    
  } catch (error) {
    console.error('Voice processing failed:', error);
    return NextResponse.json(
      { error: 'Failed to process voice note' },
      { status: 500 }
    );
  }
}