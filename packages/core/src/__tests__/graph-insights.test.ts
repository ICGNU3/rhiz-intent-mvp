import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GraphInsightAgent } from '../graph/insights';
import { GraphMetricsEngine } from '../graph/metrics';

// Mock the database
vi.mock('@rhiz/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    query: {
      workspace: {
        findFirst: vi.fn()
      }
    }
  },
  person: {},
  claim: {},
  goal: {},
  graphMetrics: {},
  graphInsight: {},
  eq: vi.fn(),
  and: vi.fn(),
  inArray: vi.fn(),
  sql: vi.fn(),
  desc: vi.fn(),
  gte: vi.fn(),
  lt: vi.fn()
}));

describe('GraphInsightAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateInsights', () => {
    it('should generate insights for a workspace', async () => {
      // Mock GraphMetricsEngine
      vi.mocked(GraphMetricsEngine.computeAllMetrics).mockResolvedValue({
        degreeCentrality: new Map(),
        betweennessCentrality: new Map(),
        communities: [],
        edgeFreshness: new Map()
      });

      // Mock database queries
      const mockDb = await import('@rhiz/db');
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([])
        })
      } as any);

      vi.mocked(mockDb.db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue([])
      } as any);

      vi.mocked(mockDb.db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue([])
      } as any);

      const insights = await GraphInsightAgent.generateInsights('workspace-1', 'user-1');

      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(GraphMetricsEngine.computeAllMetrics).toHaveBeenCalledWith('workspace-1', 'user-1');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(GraphMetricsEngine.computeAllMetrics).mockRejectedValue(new Error('Database error'));

      await expect(
        GraphInsightAgent.generateInsights('workspace-1', 'user-1')
      ).rejects.toThrow('Database error');
    });
  });

  describe('getInsights', () => {
    it('should return insights for a workspace', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          type: 'opportunity_gap',
          title: 'Dormant but valuable contact',
          detail: 'Test insight',
          score: 85,
          state: 'active'
        }
      ];

      const mockDb = await import('@rhiz/db');
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockInsights)
            })
          })
        })
      } as any);

      const insights = await GraphInsightAgent.getInsights('workspace-1', 10);

      expect(insights).toEqual(mockInsights);
    });
  });

  describe('getPersonInsights', () => {
    it('should return insights for a specific person', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          type: 'bridge_builder',
          title: 'Bridge Builder',
          detail: 'Test insight',
          personId: 'person-1',
          score: 78,
          state: 'active'
        }
      ];

      const mockDb = await import('@rhiz/db');
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockInsights)
          })
        })
      } as any);

      const insights = await GraphInsightAgent.getPersonInsights('workspace-1', 'person-1');

      expect(insights).toEqual(mockInsights);
    });
  });
});
