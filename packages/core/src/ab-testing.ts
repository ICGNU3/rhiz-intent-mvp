import { z } from 'zod';

// A/B Test configuration
export const ABTestConfig = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    weight: z.number().min(0).max(1), // Traffic allocation
    config: z.record(z.any()),
  })),
  metrics: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date().optional(),
  isActive: z.boolean(),
});

export type ABTestConfig = z.infer<typeof ABTestConfig>;

// A/B Test result
export const ABTestResult = z.object({
  testId: z.string(),
  variantId: z.string(),
  userId: z.string(),
  timestamp: z.date(),
  metrics: z.record(z.number()),
  metadata: z.record(z.any()),
});

export type ABTestResult = z.infer<typeof ABTestResult>;

// A/B Testing framework for AI components
export class ABTestingFramework {
  private tests: Map<string, ABTestConfig> = new Map();
  private results: ABTestResult[] = [];

  constructor() {
    this.initializeDefaultTests();
  }

  private initializeDefaultTests() {
    // Voice extraction model test
    this.addTest({
      id: 'voice-extraction-models',
      name: 'Voice Extraction Model Comparison',
      description: 'Compare different AI models for voice note processing',
      variants: [
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          weight: 0.4,
          config: { model: 'gpt-4-turbo-preview', temperature: 0.1 }
        },
        {
          id: 'gpt-4',
          name: 'GPT-4',
          weight: 0.3,
          config: { model: 'gpt-4', temperature: 0.1 }
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          weight: 0.3,
          config: { model: 'gpt-3.5-turbo', temperature: 0.1 }
        }
      ],
      metrics: ['extraction_accuracy', 'processing_time', 'user_satisfaction'],
      startDate: new Date(),
      isActive: true,
    });

    // Introduction message style test
    this.addTest({
      id: 'intro-message-styles',
      name: 'Introduction Message Style Comparison',
      description: 'Compare different introduction message styles',
      variants: [
        {
          id: 'professional',
          name: 'Professional',
          weight: 0.33,
          config: { tone: 'professional', length: 'medium' }
        },
        {
          id: 'casual',
          name: 'Casual',
          weight: 0.33,
          config: { tone: 'casual', length: 'short' }
        },
        {
          id: 'enthusiastic',
          name: 'Enthusiastic',
          weight: 0.34,
          config: { tone: 'enthusiastic', length: 'medium' }
        }
      ],
      metrics: ['acceptance_rate', 'response_rate', 'meeting_scheduled_rate'],
      startDate: new Date(),
      isActive: true,
    });

    // Matching algorithm test
    this.addTest({
      id: 'matching-algorithms',
      name: 'Matching Algorithm Comparison',
      description: 'Compare different matching algorithms',
      variants: [
        {
          id: 'enhanced',
          name: 'Enhanced Algorithm',
          weight: 0.5,
          config: { 
            useEmbeddings: true, 
            useSemanticSimilarity: true,
            dynamicWeights: true 
          }
        },
        {
          id: 'baseline',
          name: 'Baseline Algorithm',
          weight: 0.5,
          config: { 
            useEmbeddings: false, 
            useSemanticSimilarity: false,
            dynamicWeights: false 
          }
        }
      ],
      metrics: ['suggestion_quality', 'goal_alignment', 'user_engagement'],
      startDate: new Date(),
      isActive: true,
    });
  }

  addTest(test: ABTestConfig): void {
    this.tests.set(test.id, test);
  }

  getVariant(testId: string, userId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || !test.isActive) return null;

    // Deterministic variant assignment based on user ID
    const hash = this.hashString(userId + testId);
    const random = hash / Math.pow(2, 32);
    
    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant.id;
      }
    }
    
    return test.variants[0].id; // Fallback
  }

  getVariantConfig(testId: string, variantId: string): any {
    const test = this.tests.get(testId);
    if (!test) return null;

    const variant = test.variants.find(v => v.id === variantId);
    return variant?.config || null;
  }

  recordResult(result: ABTestResult): void {
    this.results.push(result);
  }

  getTestResults(testId: string): ABTestResult[] {
    return this.results.filter(r => r.testId === testId);
  }

  getTestMetrics(testId: string): any {
    const test = this.tests.get(testId);
    if (!test) return null;

    const results = this.getTestResults(testId);
    const metrics: any = {};

    for (const variant of test.variants) {
      const variantResults = results.filter(r => r.variantId === variant.id);
      metrics[variant.id] = {};

      for (const metric of test.metrics) {
        const values = variantResults.map(r => r.metrics[metric]).filter(v => v !== undefined);
        if (values.length > 0) {
          metrics[variant.id][metric] = {
            mean: values.reduce((a, b) => a + b, 0) / values.length,
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
          };
        }
      }
    }

    return metrics;
  }

  isTestSignificant(testId: string, metric: string, confidenceLevel: number = 0.95): boolean {
    const metrics = this.getTestMetrics(testId);
    if (!metrics) return false;

    const variants = Object.keys(metrics);
    if (variants.length < 2) return false;

    // Simple t-test for significance
    const values1 = this.getMetricValues(testId, variants[0], metric);
    const values2 = this.getMetricValues(testId, variants[1], metric);

    if (values1.length < 10 || values2.length < 10) return false;

    const tStat = this.calculateTStatistic(values1, values2);
    const pValue = this.calculatePValue(tStat, values1.length + values2.length - 2);

    return pValue < (1 - confidenceLevel);
  }

  getWinningVariant(testId: string, metric: string): string | null {
    const metrics = this.getTestMetrics(testId);
    if (!metrics) return null;

    let bestVariant = null;
    let bestMean = -Infinity;

    for (const [variantId, variantMetrics] of Object.entries(metrics)) {
      const metricData = variantMetrics[metric];
      if (metricData && metricData.mean > bestMean) {
        bestMean = metricData.mean;
        bestVariant = variantId;
      }
    }

    return bestVariant;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getMetricValues(testId: string, variantId: string, metric: string): number[] {
    const results = this.getTestResults(testId);
    return results
      .filter(r => r.variantId === variantId)
      .map(r => r.metrics[metric])
      .filter(v => v !== undefined);
  }

  private calculateTStatistic(values1: number[], values2: number[]): number {
    const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
    const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
    
    const var1 = values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (values1.length - 1);
    const var2 = values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (values2.length - 1);
    
    const pooledVar = ((values1.length - 1) * var1 + (values2.length - 1) * var2) / (values1.length + values2.length - 2);
    const standardError = Math.sqrt(pooledVar * (1/values1.length + 1/values2.length));
    
    return (mean1 - mean2) / standardError;
  }

  private calculatePValue(tStat: number, degreesOfFreedom: number): number {
    // Simplified p-value calculation (in production, use a proper t-distribution library)
    const absT = Math.abs(tStat);
    if (absT > 3.291) return 0.001; // 99.9% confidence
    if (absT > 2.576) return 0.01;  // 99% confidence
    if (absT > 1.96) return 0.05;   // 95% confidence
    return 0.1; // Not significant
  }
}

// Global A/B testing instance
export const abTesting = new ABTestingFramework();

// Helper functions for AI components
export function getAIVariant(testId: string, userId: string): string | null {
  return abTesting.getVariant(testId, userId);
}

export function getAIConfig(testId: string, variantId: string): any {
  return abTesting.getVariantConfig(testId, variantId);
}

export function recordAIResult(testId: string, variantId: string, userId: string, metrics: Record<string, number>, metadata: Record<string, any> = {}): void {
  abTesting.recordResult({
    testId,
    variantId,
    userId,
    timestamp: new Date(),
    metrics,
    metadata,
  });
}
