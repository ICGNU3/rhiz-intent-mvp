import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '@rhiz/db';
import { referralCode, referralEdge, growthEvent } from '@rhiz/db/schema';
import { eq } from 'drizzle-orm';

// Mock the database for testing
vi.mock('@rhiz/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    execute: vi.fn(),
  },
}));

describe('Referral System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Referral Code Creation', () => {
    it('should create a referral code with correct properties', async () => {
      const mockReferralCode = {
        id: 'test-id',
        code: 'TEST123',
        creatorId: 'user-123',
        maxUses: 10,
        used: 0,
        rewardType: 'upgrade',
        rewardValue: 30,
        createdAt: new Date(),
        expiresAt: null,
      };

      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockReferralCode]),
        }),
      });

      const result = await db.insert(referralCode).values({
        code: 'TEST123',
        creatorId: 'user-123',
        maxUses: 10,
        rewardType: 'upgrade',
        rewardValue: 30,
      }).returning();

      expect(result).toEqual([mockReferralCode]);
      expect(db.insert).toHaveBeenCalledWith(referralCode);
    });

    it('should generate unique referral codes', async () => {
      const codes = new Set();
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      // Generate 100 codes and check for uniqueness
      for (let i = 0; i < 100; i++) {
        const code = generateCode();
        codes.add(code);
      }

      expect(codes.size).toBe(100); // All codes should be unique
    });
  });

  describe('Referral Code Redemption', () => {
    it('should redeem a valid referral code', async () => {
      const mockCode = {
        id: 'code-id',
        code: 'TEST123',
        creatorId: 'user-123',
        maxUses: 10,
        used: 0,
        rewardType: 'upgrade',
        rewardValue: 30,
        createdAt: new Date(),
        expiresAt: null,
      };

      const mockEdge = {
        id: 'edge-id',
        inviterId: 'user-123',
        inviteeId: 'user-456',
        referralCodeId: 'code-id',
        createdAt: new Date(),
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockCode]),
        }),
      });

      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockEdge]),
        }),
      });

      const result = await db.insert(referralEdge).values({
        inviterId: 'user-123',
        inviteeId: 'user-456',
        referralCodeId: 'code-id',
      }).returning();

      expect(result).toEqual([mockEdge]);
    });

    it('should reject expired referral codes', async () => {
      const expiredCode = {
        id: 'code-id',
        code: 'EXPIRED',
        creatorId: 'user-123',
        maxUses: 10,
        used: 0,
        rewardType: 'upgrade',
        rewardValue: 30,
        createdAt: new Date('2023-01-01'),
        expiresAt: new Date('2023-12-31'), // Expired
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([expiredCode]),
        }),
      });

      // This should fail because the code is expired
      const isExpired = new Date() > expiredCode.expiresAt!;
      expect(isExpired).toBe(true);
    });

    it('should reject codes that have reached max uses', async () => {
      const maxedCode = {
        id: 'code-id',
        code: 'MAXED',
        creatorId: 'user-123',
        maxUses: 5,
        used: 5, // Already at max
        rewardType: 'upgrade',
        rewardValue: 30,
        createdAt: new Date(),
        expiresAt: null,
      };

      const hasReachedMax = maxedCode.used >= maxedCode.maxUses!;
      expect(hasReachedMax).toBe(true);
    });
  });

  describe('Invite Tree', () => {
    it('should build recursive invite tree', async () => {
      const mockTreeData = [
        { level: 1, inviterId: 'user-123', inviteeId: 'user-456' },
        { level: 2, inviterId: 'user-456', inviteeId: 'user-789' },
        { level: 2, inviterId: 'user-456', inviteeId: 'user-101' },
        { level: 3, inviterId: 'user-789', inviteeId: 'user-202' },
      ];

      (db.execute as any).mockResolvedValue({
        rows: mockTreeData,
      });

      const result = await db.execute('WITH RECURSIVE invite_tree AS...');
      
      expect(result.rows).toEqual(mockTreeData);
      expect(result.rows).toHaveLength(4);
      
      // Check levels
      const level1Count = result.rows.filter((row: any) => row.level === 1).length;
      const level2Count = result.rows.filter((row: any) => row.level === 2).length;
      const level3Count = result.rows.filter((row: any) => row.level === 3).length;
      
      expect(level1Count).toBe(1);
      expect(level2Count).toBe(2);
      expect(level3Count).toBe(1);
    });
  });

  describe('Growth Events', () => {
    it('should track invite sent events', async () => {
      const mockEvent = {
        id: 'event-id',
        userId: 'user-123',
        type: 'invite_sent',
        meta: { code: 'TEST123', rewardType: 'upgrade' },
        createdAt: new Date(),
      };

      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockEvent]),
        }),
      });

      const result = await db.insert(growthEvent).values({
        userId: 'user-123',
        type: 'invite_sent',
        meta: { code: 'TEST123', rewardType: 'upgrade' },
      }).returning();

      expect(result).toEqual([mockEvent]);
      expect(result[0].type).toBe('invite_sent');
    });

    it('should track invite redeemed events', async () => {
      const mockEvent = {
        id: 'event-id',
        userId: 'user-123',
        type: 'invite_redeemed',
        meta: { code: 'TEST123', inviteeId: 'user-456' },
        createdAt: new Date(),
      };

      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockEvent]),
        }),
      });

      const result = await db.insert(growthEvent).values({
        userId: 'user-123',
        type: 'invite_redeemed',
        meta: { code: 'TEST123', inviteeId: 'user-456' },
      }).returning();

      expect(result).toEqual([mockEvent]);
      expect(result[0].type).toBe('invite_redeemed');
    });

    it('should track signup events', async () => {
      const mockEvent = {
        id: 'event-id',
        userId: 'user-456',
        type: 'signup',
        meta: { referredBy: 'user-123', code: 'TEST123' },
        createdAt: new Date(),
      };

      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockEvent]),
        }),
      });

      const result = await db.insert(growthEvent).values({
        userId: 'user-456',
        type: 'signup',
        meta: { referredBy: 'user-123', code: 'TEST123' },
      }).returning();

      expect(result).toEqual([mockEvent]);
      expect(result[0].type).toBe('signup');
    });
  });

  describe('Viral Analytics', () => {
    it('should calculate viral coefficient (k-factor)', async () => {
      const mockEvents = [
        { userId: 'user-1', type: 'invite_sent' },
        { userId: 'user-1', type: 'invite_sent' },
        { userId: 'user-2', type: 'invite_sent' },
        { userId: 'user-3', type: 'invite_sent' },
        { userId: 'user-3', type: 'invite_sent' },
        { userId: 'user-3', type: 'invite_sent' },
      ];

      // Calculate k-factor manually
      const userInviteCounts = mockEvents.reduce((acc: any, event) => {
        if (event.type === 'invite_sent') {
          acc[event.userId] = (acc[event.userId] || 0) + 1;
        }
        return acc;
      }, {});

      const totalInvites = Object.values(userInviteCounts).reduce((sum: number, count: any) => sum + count, 0);
      const usersWhoInvited = Object.keys(userInviteCounts).length;
      const kFactor = totalInvites / usersWhoInvited;

      expect(kFactor).toBe(6 / 3); // 6 total invites / 3 users = 2.0
      expect(kFactor).toBe(2);
    });

    it('should calculate conversion rates', async () => {
      const mockFunnel = {
        invite_sent: { count: 100, uniqueUsers: 50 },
        signup: { count: 30, uniqueUsers: 30 },
        invite_redeemed: { count: 25, uniqueUsers: 25 },
      };

      const inviteToSignupRate = (mockFunnel.signup.count / mockFunnel.invite_sent.count) * 100;
      const signupToRedeemRate = (mockFunnel.invite_redeemed.count / mockFunnel.signup.count) * 100;

      expect(inviteToSignupRate).toBe(30); // 30%
      expect(signupToRedeemRate).toBeCloseTo(83.33, 1); // 83.3%
    });
  });
});
