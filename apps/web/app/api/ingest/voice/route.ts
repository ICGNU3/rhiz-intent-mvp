import { NextRequest, NextResponse } from 'next/server'
import { db, encounter, person, claim } from '@rhiz/db'
import { ModelRouter } from '@rhiz/core'
import { addJob, QUEUE_NAMES } from '@rhiz/workers'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }
    
    // For demo purposes, use a fixed user ID
    const demoUserId = 'demo-user-123'
    
    // Convert audio file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    
    // Initialize model router
    const modelRouter = new ModelRouter()
    
    // Transcribe audio
    const transcript = await modelRouter.transcribeAudio(audioBuffer)
    
    // Extract structured data from transcript
    const extraction = await modelRouter.extractFromVoiceNote(transcript)
    
    // Create encounter record
    const [encounterRecord] = await db.insert(encounter).values({
      ownerId: demoUserId,
      kind: 'voice_note',
      occurredAt: new Date(),
      summary: 'Voice note captured',
      raw: {
        transcript,
        extraction,
        fileName: audioFile.name,
        fileSize: audioFile.size,
      },
    }).returning()
    
    // Process entities from extraction
    for (const entity of extraction.entities) {
      if (entity.type === 'person' && entity.confidence > 70) {
        // Find or create person
        let personRecord = await db
          .select()
          .from(person)
          .where(({ and, eq }) => 
            and(
              eq(person.ownerId, demoUserId),
              eq(person.fullName, entity.name)
            )
          )
          .limit(1)
        
        if (personRecord.length === 0) {
          [personRecord] = await db.insert(person).values({
            ownerId: demoUserId,
            fullName: entity.name,
          }).returning()
        }
        
        // Create claims from voice note context
        if (extraction.needs.length > 0) {
          await db.insert(claim).values({
            ownerId: demoUserId,
            subjectType: 'person',
            subjectId: personRecord[0].id,
            key: 'needs',
            value: extraction.needs.map(n => n.description).join('; '),
            confidence: Math.max(...extraction.needs.map(n => n.confidence)),
            source: 'voice',
            lawfulBasis: 'legitimate_interest',
            provenance: {
              source: 'voice_note',
              encounterId: encounterRecord.id,
              entityName: entity.name,
            },
          })
        }
        
        if (extraction.offers.length > 0) {
          await db.insert(claim).values({
            ownerId: demoUserId,
            subjectType: 'person',
            subjectId: personRecord[0].id,
            key: 'offers',
            value: extraction.offers.map(o => o.description).join('; '),
            confidence: Math.max(...extraction.offers.map(o => o.confidence)),
            source: 'voice',
            lawfulBasis: 'legitimate_interest',
            provenance: {
              source: 'voice_note',
              encounterId: encounterRecord.id,
              entityName: entity.name,
            },
          })
        }
      }
    }
    
    // Queue processing jobs
    await addJob(QUEUE_NAMES.EVENTS_INGESTED, {
      ownerId: demoUserId,
      type: 'voice',
      data: extraction,
      source: 'web_upload',
      timestamp: new Date().toISOString(),
    })
    
    await addJob(QUEUE_NAMES.INGEST_VOICE, {
      ownerId: demoUserId,
      type: 'voice',
      data: extraction,
      source: 'web_upload',
      timestamp: new Date().toISOString(),
    })
    
    return NextResponse.json({
      success: true,
      encounterId: encounterRecord.id,
      transcript,
      entities: extraction.entities.length,
      goals: extraction.explicitGoals.length,
    })
    
  } catch (error) {
    console.error('Voice ingestion failed:', error)
    return NextResponse.json(
      { error: 'Failed to process voice note' },
      { status: 500 }
    )
  }
}
