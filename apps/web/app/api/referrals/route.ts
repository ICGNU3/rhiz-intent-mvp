import { NextRequest, NextResponse } from 'next/server';
import { db } from '@rhiz/db';
import { referralCode, referralEdge, growthEvent } from '@rhiz/db/schema';
import { eq, and, isNull, lt } from 'drizzle-orm';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Schema for creating referral codes
const createReferralCodeSchema = z.object({
  maxUses: z.number().optional(),
  rewardType: z.enum(['credit', 'upgrade', 'invite']).default('upgrade'),
  rewardValue: z.number().optional(),
  expiresAt: z.string().optional(), // ISO date string
});

// Schema for redeeming referral codes
const redeemReferralCodeSchema = z.object({
  code: z.string().min(1),
  inviteeId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create') {
      return await createReferralCode(data);
    } else if (action === 'redeem') {
      return await redeemReferralCode(data);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Referral API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createReferralCode(data: any) {
  try {
    const validatedData = createReferralCodeSchema.parse(data);
    
    // Get current user ID from headers (you'll need to implement auth)
    const userId = 'current-user-id'; // TODO: Get from auth context
    
    // Generate unique referral code
    const code = nanoid(8).toUpperCase();
    
    // Create referral code
    const [newReferralCode] = await db.insert(referralCode).values({
      code,
      creatorId: userId,
      maxUses: validatedData.maxUses,
      rewardType: validatedData.rewardType,
      rewardValue: validatedData.rewardValue,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
    }).returning();

    // Track growth event
    await db.insert(growthEvent).values({
      userId,
      type: 'invite_sent',
      meta: { code, rewardType: validatedData.rewardType },
    });

    return NextResponse.json({
      success: true,
      referralCode: newReferralCode,
    });
  } catch (error) {
    console.error('Create referral code error:', error);
    return NextResponse.json({ error: 'Failed to create referral code' }, { status: 400 });
  }
}

async function redeemReferralCode(data: any) {
  try {
    const validatedData = redeemReferralCodeSchema.parse(data);
    
    // Find the referral code
    const [codeRecord] = await db.select()
      .from(referralCode)
      .where(
        and(
          eq(referralCode.code, validatedData.code),
          isNull(referralCode.expiresAt) || lt(referralCode.expiresAt, new Date()),
          referralCode.maxUses === null || referralCode.used < referralCode.maxUses
        )
      );

    if (!codeRecord) {
      return NextResponse.json({ error: 'Invalid or expired referral code' }, { status: 400 });
    }

    // Check if code has reached max uses
    if (codeRecord.maxUses && codeRecord.used >= codeRecord.maxUses) {
      return NextResponse.json({ error: 'Referral code has reached maximum uses' }, { status: 400 });
    }

    // Check if code has expired
    if (codeRecord.expiresAt && new Date() > codeRecord.expiresAt) {
      return NextResponse.json({ error: 'Referral code has expired' }, { status: 400 });
    }

    // Check if invitee already used a referral code
    const existingEdge = await db.select()
      .from(referralEdge)
      .where(eq(referralEdge.inviteeId, validatedData.inviteeId))
      .limit(1);

    if (existingEdge.length > 0) {
      return NextResponse.json({ error: 'User has already used a referral code' }, { status: 400 });
    }

    // Create referral edge
    const [newEdge] = await db.insert(referralEdge).values({
      inviterId: codeRecord.creatorId,
      inviteeId: validatedData.inviteeId,
      referralCodeId: codeRecord.id,
    }).returning();

    // Update referral code usage
    await db.update(referralCode)
      .set({ used: codeRecord.used + 1 })
      .where(eq(referralCode.id, codeRecord.id));

    // Track growth events
    await db.insert(growthEvent).values([
      {
        userId: codeRecord.creatorId,
        type: 'invite_redeemed',
        meta: { code: codeRecord.code, inviteeId: validatedData.inviteeId },
      },
      {
        userId: validatedData.inviteeId,
        type: 'signup',
        meta: { referredBy: codeRecord.creatorId, code: codeRecord.code },
      },
    ]);

    // Apply rewards based on reward type
    const rewards = await applyRewards(codeRecord, validatedData.inviteeId);

    return NextResponse.json({
      success: true,
      referralEdge: newEdge,
      rewards,
    });
  } catch (error) {
    console.error('Redeem referral code error:', error);
    return NextResponse.json({ error: 'Failed to redeem referral code' }, { status: 400 });
  }
}

async function applyRewards(codeRecord: any, inviteeId: string) {
  const rewards = {
    inviter: null as any,
    invitee: null as any,
  };

  // Apply rewards to inviter
  switch (codeRecord.rewardType) {
    case 'credit':
      // TODO: Implement credit system
      rewards.inviter = { type: 'credit', amount: codeRecord.rewardValue || 100 };
      break;
    case 'upgrade':
      // TODO: Implement upgrade system
      rewards.inviter = { type: 'upgrade', duration: codeRecord.rewardValue || 30 };
      break;
    case 'invite':
      // TODO: Implement invite quota system
      rewards.inviter = { type: 'invite', count: codeRecord.rewardValue || 1 };
      break;
  }

  // Apply signup bonus to invitee
  rewards.invitee = { type: 'signup_bonus', description: 'Welcome bonus for using referral code' };

  return rewards;
}
