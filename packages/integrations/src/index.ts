// Export all integration modules
export * from './slack';
export * from './google/calendar';
export * from './crm';

// Integration types
export type IntegrationProvider = 'slack' | 'google' | 'hubspot' | 'salesforce';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

// Integration configuration interface
export interface IntegrationConfig {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  config?: Record<string, any>;
  lastSyncAt?: Date;
}
