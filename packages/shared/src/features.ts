/**
 * Feature flags for Rhiz application
 * Controls which features are enabled/disabled
 */

export interface FeatureFlags {
  CHAT_PRIMARY: boolean;
  EMAIL_BRIDGE: boolean;
  SUGGESTIONS: boolean;
  INTRO_WRITER: boolean;
  GRAPH_UI: boolean;
  REFERRALS: boolean;
  ANALYTICS: boolean;
}

/**
 * Get feature flags from environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    CHAT_PRIMARY: process.env.FEATURE_CHAT_PRIMARY === 'true',
    EMAIL_BRIDGE: process.env.FEATURE_EMAIL_BRIDGE === 'true',
    SUGGESTIONS: process.env.FEATURE_SUGGESTIONS === 'true',
    INTRO_WRITER: process.env.FEATURE_INTRO_WRITER === 'true',
    GRAPH_UI: process.env.FEATURE_GRAPH_UI === 'true',
    REFERRALS: process.env.FEATURE_REFERRALS === 'true',
    ANALYTICS: process.env.FEATURE_ANALYTICS === 'true',
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Get default feature flags for development
 */
export function getDefaultFeatureFlags(): FeatureFlags {
  return {
    CHAT_PRIMARY: true,
    EMAIL_BRIDGE: true,
    SUGGESTIONS: true,
    INTRO_WRITER: true,
    GRAPH_UI: false,
    REFERRALS: false,
    ANALYTICS: false,
  };
}
