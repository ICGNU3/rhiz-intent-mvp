import { NextRequest, NextResponse } from 'next/server';
import { db, person, claim, setUserContext } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';

// Webhook endpoint for CRM integrations via Zapier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      workspaceId, 
      userId, 
      action, 
      contact, 
      source 
    } = body;

    if (!workspaceId || !userId || !action || !contact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Set user context for RLS
    await setUserContext(userId);

    switch (action) {
      case 'contact.created':
      case 'contact.updated':
        return await handleContactSync(workspaceId, userId, contact, source);
      
      case 'contact.deleted':
        return await handleContactDeletion(workspaceId, userId, contact);
      
      default:
        return NextResponse.json(
          { error: 'Unsupported action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('CRM webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleContactSync(
  workspaceId: string, 
  userId: string, 
  contact: any, 
  source: string
) {
  try {
    // Find existing person by email
    const existingPerson = await db
      .select()
      .from(person)
      .where(
        and(
          eq(person.workspaceId, workspaceId),
          eq(person.ownerId, userId),
          eq(person.primaryEmail, contact.email)
        )
      )
      .limit(1);

    let personId: string;

    if (existingPerson.length > 0) {
      // Update existing person
      const [updatedPerson] = await db
        .update(person)
        .set({
          fullName: contact.fullName || contact.firstName + ' ' + contact.lastName,
          primaryEmail: contact.email,
          location: contact.location || contact.city,
          updatedAt: new Date(),
        })
        .where(eq(person.id, existingPerson[0].id))
        .returning();
      
      personId = updatedPerson.id;
    } else {
      // Create new person
      const [newPerson] = await db
        .insert(person)
        .values({
          workspaceId,
          ownerId: userId,
          fullName: contact.fullName || contact.firstName + ' ' + contact.lastName,
          primaryEmail: contact.email,
          location: contact.location || contact.city,
        })
        .returning();
      
      personId = newPerson.id;
    }

    // Add claims from CRM data
    if (contact.company) {
      await db.insert(claim).values({
        workspaceId,
        ownerId: userId,
        subjectType: 'person',
        subjectId: personId,
        key: 'company',
        value: contact.company,
        confidence: 95,
        source: source,
        lawfulBasis: 'legitimate_interest',
        provenance: {
          source: 'crm_webhook',
          crmContactId: contact.id,
          crmProvider: source,
        },
      });
    }

    if (contact.title) {
      await db.insert(claim).values({
        workspaceId,
        ownerId: userId,
        subjectType: 'person',
        subjectId: personId,
        key: 'role',
        value: contact.title,
        confidence: 95,
        source: source,
        lawfulBasis: 'legitimate_interest',
        provenance: {
          source: 'crm_webhook',
          crmContactId: contact.id,
          crmProvider: source,
        },
      });
    }

    return NextResponse.json({
      success: true,
      personId,
      action: existingPerson.length > 0 ? 'updated' : 'created',
    });

  } catch (error) {
    console.error('Contact sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync contact' },
      { status: 500 }
    );
  }
}

async function handleContactDeletion(
  workspaceId: string, 
  userId: string, 
  contact: any
) {
  try {
    // Find and delete person by email
    const deletedPerson = await db
      .delete(person)
      .where(
        and(
          eq(person.workspaceId, workspaceId),
          eq(person.ownerId, userId),
          eq(person.primaryEmail, contact.email)
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      deleted: deletedPerson.length > 0,
    });

  } catch (error) {
    console.error('Contact deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
