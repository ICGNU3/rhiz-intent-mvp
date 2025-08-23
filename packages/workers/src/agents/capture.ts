import { Job } from 'bullmq';
import { db, person, encounter, personEncounter, claim, eventLog } from '@rhiz/db';
import { addJob, QUEUE_NAMES } from '../queue';
import { CalendarEvent, VoiceExtraction } from '@rhiz/core';

interface CaptureJob {
  ownerId: string;
  type: 'calendar' | 'voice';
  data: CalendarEvent | VoiceExtraction;
  source: string;
  timestamp: string;
}

export async function captureHandler(job: Job<CaptureJob>) {
  const { ownerId, type, data, source, timestamp } = job.data;
  
  console.log(`CaptureAgent processing ${type} data for ${ownerId}`);
  
  try {
    if (type === 'calendar') {
      await processCalendarEvent(ownerId, data as CalendarEvent, source, timestamp);
    } else if (type === 'voice') {
      await processVoiceNote(ownerId, data as VoiceExtraction, source, timestamp);
    }
    
    // Log successful capture
    await db.insert(eventLog).values({
      ownerId,
      event: 'data_captured',
      entityType: type,
      metadata: {
        source,
        timestamp,
        processed: true,
      },
    });
    
    console.log(`CaptureAgent completed for ${ownerId}`);
    
  } catch (error) {
    console.error('CaptureAgent failed:', error);
    
    // Log error
    await db.insert(eventLog).values({
      ownerId,
      event: 'capture_error',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp,
      },
    });
    
    throw error;
  }
}

async function processCalendarEvent(
  ownerId: string,
  event: CalendarEvent,
  source: string,
  timestamp: string
) {
  // Create encounter
  const [encounterRecord] = await db.insert(encounter).values({
    ownerId,
    kind: 'meeting',
    occurredAt: event.startTime,
    summary: event.title,
    raw: {
      eventId: event.id,
      description: event.description,
      location: event.location,
      attendees: event.attendees,
      organizer: event.organizer,
      source: event.source,
    },
  }).returning();
  
  // Process attendees
  for (const attendee of event.attendees) {
    if (attendee.email) {
      // Find or create person
      let personRecord = await db
        .select()
        .from(person)
        .where(({ and, eq }) => 
          and(
            eq(person.ownerId, ownerId),
            eq(person.primaryEmail, attendee.email)
          )
        )
        .limit(1);
      
      if (personRecord.length === 0) {
        // Create new person
        [personRecord] = await db.insert(person).values({
          ownerId,
          fullName: attendee.name || attendee.email.split('@')[0],
          primaryEmail: attendee.email,
        }).returning();
      }
      
      // Create person-encounter relationship
      await db.insert(personEncounter).values({
        personId: personRecord[0].id,
        encounterId: encounterRecord.id,
        role: attendee.email === event.organizer.email ? 'organizer' : 'attendee',
      });
      
      // Create claims from attendee info
      if (attendee.name) {
        await db.insert(claim).values({
          ownerId,
          subjectType: 'person',
          subjectId: personRecord[0].id,
          key: 'full_name',
          value: attendee.name,
          confidence: 95,
          source: 'calendar',
          lawfulBasis: 'legitimate_interest',
          provenance: {
            source: 'calendar_event',
            eventId: event.id,
            attendeeEmail: attendee.email,
          },
        });
      }
      
      // Extract company from email domain
      const domain = attendee.email.split('@')[1];
      if (domain && !domain.includes('gmail.com') && !domain.includes('yahoo.com')) {
        await db.insert(claim).values({
          ownerId,
          subjectType: 'person',
          subjectId: personRecord[0].id,
          key: 'company',
          value: domain.split('.')[0].replace(/[^a-zA-Z]/g, ' ').trim(),
          confidence: 70,
          source: 'calendar',
          lawfulBasis: 'legitimate_interest',
          provenance: {
            source: 'calendar_event',
            eventId: event.id,
            attendeeEmail: attendee.email,
            inferredFrom: 'email_domain',
          },
        });
      }
      
      // Trigger enrichment for this person
      await addJob(QUEUE_NAMES.ENRICH, {
        ownerId,
        personId: personRecord[0].id,
        email: attendee.email,
        name: attendee.name,
        reason: 'calendar_attendee',
      });
    }
  }
}

async function processVoiceNote(
  ownerId: string,
  extraction: VoiceExtraction,
  source: string,
  timestamp: string
) {
  // Create encounter for voice note
  const [encounterRecord] = await db.insert(encounter).values({
    ownerId,
    kind: 'voice_note',
    occurredAt: new Date(timestamp),
    summary: 'Voice note captured',
    raw: {
      entities: extraction.entities,
      needs: extraction.needs,
      offers: extraction.offers,
      explicitGoals: extraction.explicitGoals,
      source,
    },
  }).returning();
  
  // Process entities
  for (const entity of extraction.entities) {
    if (entity.type === 'person' && entity.confidence > 70) {
      // Find or create person
      let personRecord = await db
        .select()
        .from(person)
        .where(({ and, eq }) => 
          and(
            eq(person.ownerId, ownerId),
            eq(person.fullName, entity.name)
          )
        )
        .limit(1);
      
      if (personRecord.length === 0) {
        // Create new person
        [personRecord] = await db.insert(person).values({
          ownerId,
          fullName: entity.name,
        }).returning();
      }
      
      // Create person-encounter relationship
      await db.insert(personEncounter).values({
        personId: personRecord[0].id,
        encounterId: encounterRecord.id,
        role: 'mentioned',
      });
      
      // Create claims from voice note context
      if (extraction.needs.length > 0) {
        await db.insert(claim).values({
          ownerId,
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
        });
      }
      
      if (extraction.offers.length > 0) {
        await db.insert(claim).values({
          ownerId,
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
        });
      }
    } else if (entity.type === 'company' && entity.confidence > 70) {
      // Create claim for company
      await db.insert(claim).values({
        ownerId,
        subjectType: 'org',
        subjectId: 'unknown', // Would need org table integration
        key: 'company',
        value: entity.name,
        confidence: entity.confidence,
        source: 'voice',
        lawfulBasis: 'legitimate_interest',
        provenance: {
          source: 'voice_note',
          encounterId: encounterRecord.id,
          entityName: entity.name,
        },
      });
    }
  }
}
