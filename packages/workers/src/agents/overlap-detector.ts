import { db } from '@rhiz/db';
import { person, claim, crossWorkspaceOverlap, workspace } from '@rhiz/db/schema';
import { eq, and, inArray, sql, or } from 'drizzle-orm';

export interface OverlapInsight {
  type: 'cross_workspace_overlap';
  person: string;
  workspaces: string[];
  recommendation: string;
  confidence: number;
}

export class OverlapDetector {
  /**
   * Detect overlaps across all workspaces
   */
  static async detectOverlaps() {
    try {
      console.log('Starting cross-workspace overlap detection...');

      // Get all workspaces
      const workspaces = await db
        .select()
        .from(workspace);

      const overlaps: OverlapInsight[] = [];

      // For each pair of workspaces, check for overlaps
      for (let i = 0; i < workspaces.length; i++) {
        for (let j = i + 1; j < workspaces.length; j++) {
          const workspace1 = workspaces[i];
          const workspace2 = workspaces[j];

          // Skip if workspaces belong to different organizations (simple check)
          if (!this.sameOrganization(workspace1, workspace2)) {
            continue;
          }

          const workspaceOverlaps = await this.findWorkspaceOverlaps(workspace1.id, workspace2.id);
          overlaps.push(...workspaceOverlaps);
        }
      }

      // Store overlaps in database
      await this.storeOverlaps(overlaps);

      console.log(`Detected ${overlaps.length} cross-workspace overlaps`);
      return overlaps;
    } catch (error) {
      console.error('Failed to detect overlaps:', error);
      throw error;
    }
  }

  /**
   * Find overlaps between two specific workspaces
   */
  private static async findWorkspaceOverlaps(workspace1Id: string, workspace2Id: string): Promise<OverlapInsight[]> {
    const overlaps: OverlapInsight[] = [];

    // Get people from both workspaces
    const people1 = await db
      .select()
      .from(person)
      .where(eq(person.workspaceId, workspace1Id));

    const people2 = await db
      .select()
      .from(person)
      .where(eq(person.workspaceId, workspace2Id));

    // Get claims for email matching
    const claims1 = await db
      .select()
      .from(claim)
      .where(
        and(
          eq(claim.workspaceId, workspace1Id),
          eq(claim.subjectType, 'person'),
          eq(claim.key, 'email')
        )
      );

    const claims2 = await db
      .select()
      .from(claim)
      .where(
        and(
          eq(claim.workspaceId, workspace2Id),
          eq(claim.subjectType, 'person'),
          eq(claim.key, 'email')
        )
      );

    // Find email overlaps
    const emailOverlaps = this.findEmailOverlaps(people1, people2, claims1, claims2);
    overlaps.push(...emailOverlaps);

    // Find name overlaps (less reliable but still useful)
    const nameOverlaps = this.findNameOverlaps(people1, people2);
    overlaps.push(...nameOverlaps);

    return overlaps;
  }

  /**
   * Find overlaps based on email addresses
   */
  private static findEmailOverlaps(
    people1: any[],
    people2: any[],
    claims1: any[],
    claims2: any[]
  ): OverlapInsight[] {
    const overlaps: OverlapInsight[] = [];
    const emailMap1 = new Map<string, any>();
    const emailMap2 = new Map<string, any>();

    // Build email maps
    for (const claim of claims1) {
      emailMap1.set(claim.value.toLowerCase(), claim);
    }
    for (const claim of claims2) {
      emailMap2.set(claim.value.toLowerCase(), claim);
    }

    // Find matching emails
    for (const [email, claim1] of emailMap1) {
      if (emailMap2.has(email)) {
        const claim2 = emailMap2.get(email);
        const person1 = people1.find(p => p.id === claim1.subjectId);
        const person2 = people2.find(p => p.id === claim2.subjectId);

        if (person1 && person2) {
          overlaps.push({
            type: 'cross_workspace_overlap',
            person: person1.fullName,
            workspaces: [person1.workspaceId, person2.workspaceId],
            recommendation: 'Sync notes to avoid duplicate outreach',
            confidence: 95
          });
        }
      }
    }

    return overlaps;
  }

  /**
   * Find overlaps based on name similarity
   */
  private static findNameOverlaps(people1: any[], people2: any[]): OverlapInsight[] {
    const overlaps: OverlapInsight[] = [];

    for (const person1 of people1) {
      for (const person2 of people2) {
        if (this.namesMatch(person1.fullName, person2.fullName)) {
          overlaps.push({
            type: 'cross_workspace_overlap',
            person: person1.fullName,
            workspaces: [person1.workspaceId, person2.workspaceId],
            recommendation: 'Verify if same person and sync notes',
            confidence: 70
          });
        }
      }
    }

    return overlaps;
  }

  /**
   * Check if two names likely refer to the same person
   */
  private static namesMatch(name1: string, name2: string): boolean {
    const normalize = (name: string) => 
      name.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .trim()
        .split(/\s+/)
        .sort()
        .join(' ');

    const normalized1 = normalize(name1);
    const normalized2 = normalize(name2);

    // Exact match
    if (normalized1 === normalized2) {
      return true;
    }

    // Check for partial matches (e.g., "John Smith" vs "John A. Smith")
    const words1 = normalized1.split(' ');
    const words2 = normalized2.split(' ');

    if (words1.length >= 2 && words2.length >= 2) {
      // Check if first and last names match
      if (words1[0] === words2[0] && words1[words1.length - 1] === words2[words2.length - 1]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if two workspaces belong to the same organization
   */
  private static sameOrganization(workspace1: any, workspace2: any): boolean {
    // Simple heuristic: check if owner IDs share a domain
    // In production, you'd have an organization table
    const domain1 = workspace1.ownerId.split('@')[1];
    const domain2 = workspace2.ownerId.split('@')[1];
    
    return domain1 === domain2;
  }

  /**
   * Store overlaps in database
   */
  private static async storeOverlaps(overlaps: OverlapInsight[]) {
    // Delete existing overlaps
    await db.delete(crossWorkspaceOverlap);

    if (overlaps.length > 0) {
      const overlapValues = overlaps.map(overlap => ({
        personId: overlap.person, // In production, you'd store the actual person ID
        workspaces: overlap.workspaces,
        overlapType: 'email', // or 'name'
        confidence: overlap.confidence,
        state: 'active'
      }));

      await db.insert(crossWorkspaceOverlap).values(overlapValues);
    }
  }

  /**
   * Get overlaps for a specific workspace
   */
  static async getWorkspaceOverlaps(workspaceId: string) {
    return await db
      .select()
      .from(crossWorkspaceOverlap)
      .where(
        sql`${crossWorkspaceOverlap.workspaces} @> ${JSON.stringify([workspaceId])}`
      );
  }

  /**
   * Get all overlaps
   */
  static async getAllOverlaps() {
    return await db
      .select()
      .from(crossWorkspaceOverlap)
      .where(eq(crossWorkspaceOverlap.state, 'active'));
  }
}
