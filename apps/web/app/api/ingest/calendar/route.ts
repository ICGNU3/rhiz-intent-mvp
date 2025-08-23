import { NextRequest, NextResponse } from 'next/server'
import { db, encounter, person, claim } from '@rhiz/db'
import { addJob, QUEUE_NAMES } from '@rhiz/workers'
import { CalendarEvent } from '@rhiz/core'
import { parseICS } from 'ics'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const calendarFile = formData.get('calendar') as File
    
    if (!calendarFile) {
      return NextResponse.json(
        { error: 'No calendar file provided' },
        { status: 400 }
      )
    }
    
    // For demo purposes, use a fixed user ID
    const demoUserId = 'demo-user-123'
    
    // Read the ICS file content
    const icsContent = await calendarFile.text()
    
    // Parse ICS content
    const events = parseICS(icsContent)
    
    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: 'No events found in calendar file' },
        { status: 400 }
      )
    }
    
    let processedEvents = 0
    
    // Process each event
    for (const event of events) {
      if (!event.start || !event.summary) continue
      
      // Extract attendees from description or attendees field
      const attendees: Array<{ email: string; name?: string; responseStatus: string }> = []
      
      if (event.attendees) {
        for (const attendee of event.attendees) {
          attendees.push({
            email: attendee.email || '',
            name: attendee.name,
            responseStatus: 'accepted', // Default for ICS files
          })
        }
      }
      
      // Create calendar event object
      const calendarEvent: CalendarEvent = {
        id: event.uid || `event-${Date.now()}-${Math.random()}`,
        title: event.summary,
        description: event.description,
        startTime: new Date(event.start),
        endTime: event.end ? new Date(event.end) : new Date(event.start.getTime() + 60 * 60 * 1000), // Default 1 hour
        attendees,
        organizer: {
          email: event.organizer?.email || 'unknown@example.com',
          name: event.organizer?.name,
        },
        location: event.location,
        source: 'ics',
      }
      
      // Create encounter record
      const [encounterRecord] = await db.insert(encounter).values({
        ownerId: demoUserId,
        kind: 'meeting',
        occurredAt: calendarEvent.startTime,
        summary: calendarEvent.title,
        raw: {
          eventId: calendarEvent.id,
          description: calendarEvent.description,
          location: calendarEvent.location,
          attendees: calendarEvent.attendees,
          organizer: calendarEvent.organizer,
          source: calendarEvent.source,
        },
      }).returning()
      
      // Process attendees
      for (const attendee of calendarEvent.attendees) {
        if (attendee.email) {
          // Find or create person
          let personRecord = await db
            .select()
            .from(person)
            .where(({ and, eq }) => 
              and(
                eq(person.ownerId, demoUserId),
                eq(person.primaryEmail, attendee.email)
              )
            )
            .limit(1)
          
          if (personRecord.length === 0) {
            // Create new person
            [personRecord] = await db.insert(person).values({
              ownerId: demoUserId,
              fullName: attendee.name || attendee.email.split('@')[0],
              primaryEmail: attendee.email,
            }).returning()
          }
          
          // Create claims from attendee info
          if (attendee.name) {
            await db.insert(claim).values({
              ownerId: demoUserId,
              subjectType: 'person',
              subjectId: personRecord[0].id,
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
            })
          }
          
          // Extract company from email domain
          const domain = attendee.email.split('@')[1]
          if (domain && !domain.includes('gmail.com') && !domain.includes('yahoo.com')) {
            await db.insert(claim).values({
              ownerId: demoUserId,
              subjectType: 'person',
              subjectId: personRecord[0].id,
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
            })
          }
        }
      }
      
      processedEvents++
    }
    
    // Queue processing jobs
    await addJob(QUEUE_NAMES.EVENTS_INGESTED, {
      ownerId: demoUserId,
      type: 'calendar',
      data: { events: processedEvents },
      source: 'web_upload',
      timestamp: new Date().toISOString(),
    })
    
    await addJob(QUEUE_NAMES.INGEST_CALENDAR, {
      ownerId: demoUserId,
      type: 'calendar',
      data: { events: processedEvents },
      source: 'web_upload',
      timestamp: new Date().toISOString(),
    })
    
    return NextResponse.json({
      success: true,
      events: processedEvents,
      message: `Successfully processed ${processedEvents} calendar events`,
    })
    
  } catch (error) {
    console.error('Calendar ingestion failed:', error)
    return NextResponse.json(
      { error: 'Failed to process calendar file' },
      { status: 500 }
    )
  }
}
