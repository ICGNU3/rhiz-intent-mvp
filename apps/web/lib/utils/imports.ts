// Import path utilities and constants

// Database imports
export const DB_IMPORTS = {
  // Core database
  db: '@rhiz/db',
  
  // Schema tables
  person: '@rhiz/db/person',
  goal: '@rhiz/db/goal',
  suggestion: '@rhiz/db/suggestion',
  claim: '@rhiz/db/claim',
  edge: '@rhiz/db/edge',
  encounter: '@rhiz/db/encounter',
  workspace: '@rhiz/db/workspace',
  integration: '@rhiz/db/integration',
  
  // Database utilities
  setUserContext: '@rhiz/db/setUserContext',
  eq: '@rhiz/db/eq',
  and: '@rhiz/db/and',
  desc: '@rhiz/db/desc',
  sql: '@rhiz/db/sql',
  gte: '@rhiz/db/gte',
  lt: '@rhiz/db/lt',
  inArray: '@rhiz/db/inArray',
} as const;

// Core package imports
export const CORE_IMPORTS = {
  agent: '@rhiz/core/agent',
  matching: '@rhiz/core/matching',
  types: '@rhiz/core/types',
  llm: '@rhiz/core/llm',
  templates: '@rhiz/core/templates',
} as const;

// Worker imports
export const WORKER_IMPORTS = {
  queue: '@rhiz/workers/queue',
  addJob: '@rhiz/workers/queue',
  QUEUE_NAMES: '@rhiz/workers/queue',
} as const;

// Integration imports
export const INTEGRATION_IMPORTS = {
  slack: '@rhiz/integrations/slack',
  google: '@rhiz/integrations/google',
  crm: '@rhiz/integrations/crm',
} as const;

// Shared imports
export const SHARED_IMPORTS = {
  auth: '@rhiz/shared/auth',
  features: '@rhiz/shared/features',
} as const;

// Local app imports (using @ alias)
export const LOCAL_IMPORTS = {
  // Components
  ui: '@/components/ui',
  components: '@/components',
  
  // Hooks
  hooks: '@/hooks',
  useToast: '@/hooks/use-toast',
  useUser: '@/lib/useUser',
  useWorkspace: '@/lib/useWorkspace',
  
  // Lib
  lib: '@/lib',
  utils: '@/lib/utils',
  logger: '@/lib/logger',
  errors: '@/lib/errors',
  constants: '@/lib/constants',
  agent: '@/lib/agent',
  ai: '@/lib/ai',
  matching: '@/lib/matching',
  db: '@/lib/db',
  voice: '@/lib/voice',
  
  // Types
  types: '@/types',
} as const;

// Helper function to validate import paths
export function validateImportPath(path: string): boolean {
  const validPaths = [
    ...Object.values(DB_IMPORTS),
    ...Object.values(CORE_IMPORTS),
    ...Object.values(WORKER_IMPORTS),
    ...Object.values(INTEGRATION_IMPORTS),
    ...Object.values(SHARED_IMPORTS),
    ...Object.values(LOCAL_IMPORTS),
  ];
  
  return validPaths.includes(path as any);
}

// Helper function to get import path for a given module
export function getImportPath(module: string): string | null {
  const allImports = {
    ...DB_IMPORTS,
    ...CORE_IMPORTS,
    ...WORKER_IMPORTS,
    ...INTEGRATION_IMPORTS,
    ...SHARED_IMPORTS,
    ...LOCAL_IMPORTS,
  };
  
  return allImports[module as keyof typeof allImports] || null;
}
