import { describe, it, expect } from 'vitest';
import { featuresForPair, baseConnectionScore, explainWhy } from '../matching';

describe('Matching Functions', () => {
  describe('featuresForPair', () => {
    it('should calculate features for a pair of people', () => {
      const personA = {
        id: 'person-1',
        fullName: 'Sarah Chen',
        location: 'San Francisco, CA',
      };
      
      const personB = {
        id: 'person-2',
        fullName: 'Michael Rodriguez',
        location: 'New York, NY',
      };
      
      const encounters = [
        {
          id: 'encounter-1',
          occurredAt: new Date('2024-01-15T10:00:00Z'),
          summary: 'Meeting with Sarah',
        },
        {
          id: 'encounter-2',
          occurredAt: new Date('2024-01-20T14:00:00Z'),
          summary: 'Call with Michael',
        },
      ];
      
      const claims = [
        { subjectId: 'person-1', key: 'title', value: 'VP of Product' },
        { subjectId: 'person-1', key: 'company', value: 'TechCorp' },
        { subjectId: 'person-2', key: 'title', value: 'Managing Partner' },
        { subjectId: 'person-2', key: 'company', value: 'StartupHub' },
      ];
      
      const edges = [
        { aId: 'person-1', bId: 'person-2', kind: 'professional', strength: 6 },
      ];
      
      const features = featuresForPair(personA, personB, encounters, claims, edges);
      
      expect(features).toEqual({
        recency: expect.any(Number),
        frequency: expect.any(Number),
        affiliation: expect.any(Number),
        mutualInterests: expect.any(Array),
        goalAlignment: expect.any(Number),
        locationProximity: expect.any(Number),
        networkOverlap: expect.any(Number),
      });
      
      expect(features.recency).toBeGreaterThan(0);
      expect(features.frequency).toBeGreaterThan(0);
      expect(features.affiliation).toBeGreaterThan(0);
      expect(Array.isArray(features.mutualInterests)).toBe(true);
    });
    
    it('should handle empty data gracefully', () => {
      const personA = { id: 'person-1', fullName: 'Test A' };
      const personB = { id: 'person-2', fullName: 'Test B' };
      
      const features = featuresForPair(personA, personB, [], [], []);
      
      expect(features.recency).toBe(0);
      expect(features.frequency).toBe(0);
      expect(features.affiliation).toBe(0);
      expect(features.mutualInterests).toEqual([]);
    });
  });
  
  describe('baseConnectionScore', () => {
    it('should calculate a score between 0 and 100', () => {
      const features = {
        recency: 8,
        frequency: 6,
        affiliation: 7,
        mutualInterests: ['startups', 'product management'],
        goalAlignment: 9,
        locationProximity: 5,
        networkOverlap: 6,
      };
      
      const score = baseConnectionScore(features);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(typeof score).toBe('number');
    });
    
    it('should return higher scores for better matches', () => {
      const goodFeatures = {
        recency: 9,
        frequency: 8,
        affiliation: 9,
        mutualInterests: ['startups', 'venture capital', 'product management'],
        goalAlignment: 9,
        locationProximity: 8,
        networkOverlap: 8,
      };
      
      const poorFeatures = {
        recency: 2,
        frequency: 1,
        affiliation: 2,
        mutualInterests: [],
        goalAlignment: 1,
        locationProximity: 1,
        networkOverlap: 1,
      };
      
      const goodScore = baseConnectionScore(goodFeatures);
      const poorScore = baseConnectionScore(poorFeatures);
      
      expect(goodScore).toBeGreaterThan(poorScore);
    });
  });
  
  describe('explainWhy', () => {
    it('should generate explanation for a match', () => {
      const features = {
        recency: 8,
        frequency: 6,
        affiliation: 7,
        mutualInterests: ['startups', 'product management', 'venture capital'],
        goalAlignment: 9,
        locationProximity: 5,
        networkOverlap: 6,
      };
      
      const explanation = explainWhy(features);
      
      expect(explanation).toEqual({
        mutualInterests: ['startups', 'product management', 'venture capital'],
        recency: 8,
        frequency: 6,
        affiliation: 7,
        goalAlignment: 9,
      });
    });
    
    it('should handle empty mutual interests', () => {
      const features = {
        recency: 5,
        frequency: 3,
        affiliation: 4,
        mutualInterests: [],
        goalAlignment: 6,
        locationProximity: 3,
        networkOverlap: 4,
      };
      
      const explanation = explainWhy(features);
      
      expect(explanation.mutualInterests).toEqual([]);
      expect(explanation.recency).toBe(5);
    });
  });
});
