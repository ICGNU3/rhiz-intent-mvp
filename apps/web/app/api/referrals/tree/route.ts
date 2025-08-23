import { NextRequest, NextResponse } from 'next/server';
import { db } from '@rhiz/db';
import { referralEdge } from '@rhiz/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const depth = parseInt(searchParams.get('depth') || '3');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the invite tree using recursive CTE
    const treeQuery = `
      WITH RECURSIVE invite_tree AS (
        -- Base case: direct invitees
        SELECT 
          inviter_id,
          invitee_id,
          1 as level,
          ARRAY[inviter_id] as path
        FROM referral_edge 
        WHERE inviter_id = $1
        
        UNION ALL
        
        -- Recursive case: invitees of invitees
        SELECT 
          re.inviter_id,
          re.invitee_id,
          it.level + 1,
          it.path || re.inviter_id
        FROM referral_edge re
        JOIN invite_tree it ON re.inviter_id = it.invitee_id
        WHERE it.level < $2
      )
      SELECT 
        level,
        inviter_id,
        invitee_id,
        path
      FROM invite_tree
      ORDER BY level, inviter_id;
    `;

    const treeResult = await db.execute(treeQuery, [userId, depth]);

    // Get aggregated stats
    const statsQuery = `
      WITH RECURSIVE invite_tree AS (
        SELECT 
          inviter_id,
          invitee_id,
          1 as level
        FROM referral_edge 
        WHERE inviter_id = $1
        
        UNION ALL
        
        SELECT 
          re.inviter_id,
          re.invitee_id,
          it.level + 1
        FROM referral_edge re
        JOIN invite_tree it ON re.inviter_id = it.invitee_id
        WHERE it.level < $2
      )
      SELECT 
        level,
        COUNT(DISTINCT invitee_id) as count
      FROM invite_tree
      GROUP BY level
      ORDER BY level;
    `;

    const statsResult = await db.execute(statsQuery, [userId, depth]);

    // Get total counts
    const totalQuery = `
      WITH RECURSIVE invite_tree AS (
        SELECT 
          inviter_id,
          invitee_id,
          1 as level
        FROM referral_edge 
        WHERE inviter_id = $1
        
        UNION ALL
        
        SELECT 
          re.inviter_id,
          re.invitee_id,
          it.level + 1
        FROM referral_edge re
        JOIN invite_tree it ON re.inviter_id = it.invitee_id
        WHERE it.level < $2
      )
      SELECT 
        COUNT(DISTINCT invitee_id) as total_invitees,
        COUNT(*) as total_edges
      FROM invite_tree;
    `;

    const totalResult = await db.execute(totalQuery, [userId, depth]);

    // Structure the response with privacy considerations
    const tree = treeResult.rows.map((row: any) => ({
      level: row.level,
      inviterId: row.inviter_id,
      inviteeId: row.invitee_id,
      // Only show full details for direct invitees (level 1)
      // For deeper levels, only show aggregated data
      isDirectInvitee: row.level === 1,
    }));

    const stats = statsResult.rows.map((row: any) => ({
      level: row.level,
      count: parseInt(row.count),
    }));

    const totals = totalResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        tree,
        stats,
        totals: {
          totalInvitees: parseInt(totals.total_invitees),
          totalEdges: parseInt(totals.total_edges),
        },
        privacy: {
          // Only show detailed info for direct invitees
          showDetails: (level: number) => level === 1,
          maxDepth: depth,
        },
      },
    });
  } catch (error) {
    console.error('Invite tree API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
