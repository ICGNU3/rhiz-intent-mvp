import { NextRequest, NextResponse } from 'next/server'
import { db, encounter, person, claim, personEncounter, eq, and } from '@rhiz/db'
import { getUserId } from '@/lib/auth-mock'
import { addJob, QUEUE_NAMES } from '@/lib/workers'
import { CalendarEvent } from '@/lib/types'
import ical from 'ical'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData()
    const calendarFile = formData.get('calendar') as File
    const workspaceId = formData.get('workspaceId') as string
    
    if (!calendarFile) {
      return NextResponse.json(
        { error: 'No calendar file provided' },
        { status: 400 }
      )
    }
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      )
    }
    
    try {
      // Parse calendar file content
      const calendarContent = await calendarFile.text();
      
      // Parse ICS content
      const parsedEvents = ical.parseICS(calendarContent);
      
      if (!parsedEvents || Object.keys(parsedEvents).length === 0) {
        return NextResponse.json(
          { error: 'No valid calendar events found' },
          { status: 400 }
        )
      }
      
      let processedEvents = 0;
      let peopleCreated = 0;
      let encountersCreated = 0;
      
      // Process each calendar event
      for (const [uid, event] of Object.entries(parsedEvents)) {
        if (event.type === 'VEVENT') {
          try {
            // Extract attendees from event
            const attendees = event.attendee?.map(att => ({
              email: att.value.replace('mailto:', ''),
              name: att.params?.CN || att.value.replace('mailto:', '').split('@')[0],
              responseStatus: att.params?.PARTSTAT || 'needsAction'
            })) || [];
            
            // Extract organizer
            const organizer = event.organizer ? {
              email: event.organizer.value.replace('mailto:', ''),
              name: event.organizer.params?.CN || event.organizer.value.replace('mailto:', '').split('@')[0]
            } : null;
            
            // Create calendar event object
            const calendarEvent: CalendarEvent = {
              id: event.uid || crypto.randomUUID(),
              title: event.summary || 'Untitled Event',
              description: event.description || '',
              startTime: event.start ? new Date(event.start) : new Date(),
              endTime: event.end ? new Date(event.end) : new Date(),
              attendees: attendees.map(att => ({
                email: att.email,
                name: att.name,
                responseStatus: att.responseStatus as any
              })),
              organizer: organizer || { email: 'unknown@example.com', name: 'Unknown' },
              location: event.location || '',
              source: 'ics'
            };
            
            // Create encounter record
            const [encounterRecord] = await db.insert(encounter).values({
              workspaceId,
              ownerId: userId,
              kind: 'meeting',
              summary: calendarEvent.title,
              occurredAt: calendarEvent.startTime,
              raw: {
                eventId: calendarEvent.id,
                title: calendarEvent.title,
                description: calendarEvent.description,
                attendees: calendarEvent.attendees,
                organizer: calendarEvent.organizer,
                location: calendarEvent.location,
                source: 'calendar_upload'
              }
            }).returning();
            
            encountersCreated++;
            
            // Process attendees
            for (const attendee of calendarEvent.attendees) {
              if (attendee.email) {
                // Find or create person
                let personRecordArray = await db
                  .select()
                  .from(person)
                  .where(
                    and(
                      eq(person.workspaceId, workspaceId),
                      eq(person.ownerId, userId),
                      eq(person.primaryEmail, attendee.email)
                    )
                  )
                  .limit(1);
                
                let personRecord;
                if (personRecordArray.length === 0) {
                  // Create new person
                  const [newPerson] = await db.insert(person).values({
                    workspaceId,
                    ownerId: userId,
                    fullName: attendee.name || attendee.email.split('@')[0],
                    primaryEmail: attendee.email,
                  }).returning();
                  personRecord = newPerson;
                  peopleCreated++;
                } else {
                  personRecord = personRecordArray[0];
                }
                
                // Create person-encounter relationship
                await db.insert(personEncounter).values({
                  personId: personRecord.id,
                  encounterId: encounterRecord.id,
                  role: attendee.email === calendarEvent.organizer.email ? 'organizer' : 'attendee',
                });
                
                // Create claims from attendee info
                if (attendee.name) {
                  await db.insert(claim).values({
                    workspaceId,
                    ownerId: userId,
                    subjectType: 'person',
                    subjectId: personRecord.id,
                    key: 'full_name',
                    value: attendee.name,
                    confidence: 95,
                    source: 'calendar',
                    lawfulBasis: 'legitimate_interest',
                    provenance: {
                      source: 'calendar_event',
                      eventId: calendarEvent.id,
                      attendeeEmail: attendee.email,
                    },
                  });
                }
                
                // Extract company from email domain
                const domain = attendee.email.split('@')[1];
                if (domain && !domain.includes('gmail.com') && !domain.includes('yahoo.com')) {
                  await db.insert(claim).values({
                    workspaceId,
                    ownerId: userId,
                    subjectType: 'person',
                    subjectId: personRecord.id,
                    key: 'company',
                    value: domain.split('.')[0].replace(/[^a-zA-Z]/g, ' ').trim(),
                    confidence: 70,
                    source: 'calendar',
                    lawfulBasis: 'legitimate_interest',
                    provenance: {
                      source: 'calendar_event',
                      eventId: calendarEvent.id,
                      attendeeEmail: attendee.email,
                      inferredFrom: 'email_domain',
                    },
                  });
                }
              }
            }
            
            // Queue for goal extraction
            await addJob(QUEUE_NAMES.EVENTS_INGESTED, {
              ownerId: userId,
              type: 'calendar',
              data: calendarEvent,
              source: 'calendar_upload',
              timestamp: new Date().toISOString(),
            });
            
            processedEvents++;
            
          } catch (eventError) {
            console.error('Error processing event:', eventError);
            // Continue with next event
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        events: processedEvents,
        peopleCreated,
        encountersCreated,
        message: `Successfully processed ${processedEvents} calendar events`,
      })
      
    } catch (dbError) {
      console.error('Database insert failed:', dbError);
      
      return NextResponse.json(
        { error: 'Failed to process calendar events' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Calendar ingestion failed:', error)
    return NextResponse.json(
      { error: 'Failed to process calendar file' },
      { status: 500 }
    )
  }
}
