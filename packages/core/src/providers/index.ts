import { EnrichmentProvider, EnrichmentData } from '../types';

export interface EnrichmentProviderInterface {
  name: EnrichmentProvider;
  enrich(personId: string, email?: string, name?: string): Promise<EnrichmentData>;
  isAvailable(): boolean;
}

export class NullEnrichmentProvider implements EnrichmentProviderInterface {
  name: EnrichmentProvider = 'null';
  
  async enrich(personId: string, email?: string, name?: string): Promise<EnrichmentData> {
    // Return empty enrichment data
    return {
      provider: 'null',
      personId,
      claims: [],
      metadata: {
        reason: 'No enrichment provider configured',
        timestamp: new Date().toISOString(),
      },
    };
  }
  
  isAvailable(): boolean {
    return true; // Always available as fallback
  }
}

export class ClearbitEnrichmentProvider implements EnrichmentProviderInterface {
  name: EnrichmentProvider = 'clearbit';
  private apiKey?: string;
  
  constructor() {
    this.apiKey = process.env.CLEARBIT_API_KEY;
  }
  
  async enrich(personId: string, email?: string, name?: string): Promise<EnrichmentData> {
    if (!this.isAvailable() || !email) {
      return {
        provider: 'clearbit',
        personId,
        claims: [],
        metadata: {
          reason: 'Provider not available or no email provided',
          timestamp: new Date().toISOString(),
        },
      };
    }
    
    try {
      // In production, this would make actual API calls to Clearbit
      // For MVP, we'll simulate the response
      const response = await this.simulateClearbitCall(email);
      
      return {
        provider: 'clearbit',
        personId,
        claims: response.claims,
        metadata: {
          source: 'clearbit_api',
          timestamp: new Date().toISOString(),
          confidence: response.confidence,
        },
      };
    } catch (error) {
      console.error('Clearbit enrichment failed:', error);
      return {
        provider: 'clearbit',
        personId,
        claims: [],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
  
  isAvailable(): boolean {
    return !!this.apiKey;
  }
  
  private async simulateClearbitCall(email: string): Promise<{
    claims: Array<{ key: string; value: string; confidence: number; source: string }>;
    confidence: number;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock response based on email domain
    const domain = email.split('@')[1];
    const claims = [];
    
    if (domain.includes('google')) {
      claims.push(
        { key: 'company', value: 'Google', confidence: 95, source: 'clearbit' },
        { key: 'title', value: 'Software Engineer', confidence: 80, source: 'clearbit' },
        { key: 'location', value: 'Mountain View, CA', confidence: 85, source: 'clearbit' },
      );
    } else if (domain.includes('microsoft')) {
      claims.push(
        { key: 'company', value: 'Microsoft', confidence: 95, source: 'clearbit' },
        { key: 'title', value: 'Product Manager', confidence: 80, source: 'clearbit' },
        { key: 'location', value: 'Seattle, WA', confidence: 85, source: 'clearbit' },
      );
    } else {
      claims.push(
        { key: 'company', value: 'Unknown Company', confidence: 50, source: 'clearbit' },
        { key: 'title', value: 'Professional', confidence: 30, source: 'clearbit' },
      );
    }
    
    return {
      claims,
      confidence: 75,
    };
  }
}

export class ApolloEnrichmentProvider implements EnrichmentProviderInterface {
  name: EnrichmentProvider = 'apollo';
  private apiKey?: string;
  
  constructor() {
    this.apiKey = process.env.APOLLO_API_KEY;
  }
  
  async enrich(personId: string, email?: string, name?: string): Promise<EnrichmentData> {
    if (!this.isAvailable()) {
      return {
        provider: 'apollo',
        personId,
        claims: [],
        metadata: {
          reason: 'Provider not available',
          timestamp: new Date().toISOString(),
        },
      };
    }
    
    // Apollo implementation would go here
    return {
      provider: 'apollo',
      personId,
      claims: [],
      metadata: {
        reason: 'Apollo provider not implemented in MVP',
        timestamp: new Date().toISOString(),
      },
    };
  }
  
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

export class HunterEnrichmentProvider implements EnrichmentProviderInterface {
  name: EnrichmentProvider = 'hunter';
  private apiKey?: string;
  
  constructor() {
    this.apiKey = process.env.HUNTER_API_KEY;
  }
  
  async enrich(personId: string, email?: string, name?: string): Promise<EnrichmentData> {
    if (!this.isAvailable()) {
      return {
        provider: 'hunter',
        personId,
        claims: [],
        metadata: {
          reason: 'Provider not available',
          timestamp: new Date().toISOString(),
        },
      };
    }
    
    // Hunter implementation would go here
    return {
      provider: 'hunter',
      personId,
      claims: [],
      metadata: {
        reason: 'Hunter provider not implemented in MVP',
        timestamp: new Date().toISOString(),
      },
    };
  }
  
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

// Factory function to create the appropriate provider
export function createEnrichmentProvider(): EnrichmentProviderInterface {
  const providerName = process.env.FEATURE_PROVIDER_CLEARBIT === 'true' ? 'clearbit' : 'null';
  
  switch (providerName) {
    case 'clearbit':
      return new ClearbitEnrichmentProvider();
    case 'apollo':
      return new ApolloEnrichmentProvider();
    case 'hunter':
      return new HunterEnrichmentProvider();
    default:
      return new NullEnrichmentProvider();
  }
}

// Export all providers
export {
  NullEnrichmentProvider,
  ClearbitEnrichmentProvider,
  ApolloEnrichmentProvider,
  HunterEnrichmentProvider,
};
