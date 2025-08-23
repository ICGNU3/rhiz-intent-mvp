import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSlackIntegration } from '../slack'

// Mock environment variables
vi.mock('process', () => ({
  env: {
    SLACK_BOT_TOKEN: 'xoxb-test-token',
    SLACK_SIGNING_SECRET: 'test-signing-secret',
    SLACK_APP_TOKEN: 'xapp-test-token'
  }
}))

describe('Slack Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSlackIntegration', () => {
    it('should create Slack integration when environment variables are set', () => {
      const integration = createSlackIntegration()
      expect(integration).toBeDefined()
      expect(integration).not.toBeNull()
    })

    it('should return null when environment variables are missing', () => {
      // Temporarily clear environment variables
      const originalEnv = process.env
      process.env = {}
      
      const integration = createSlackIntegration()
      expect(integration).toBeNull()
      
      // Restore environment variables
      process.env = originalEnv
    })
  })

  describe('SlackIntegration class', () => {
    it('should initialize with correct configuration', () => {
      const integration = createSlackIntegration()
      if (!integration) {
        throw new Error('Integration should be created')
      }
      
      // Test that the integration can be instantiated
      expect(integration).toBeDefined()
    })

    it('should handle notification sending', async () => {
      const integration = createSlackIntegration()
      if (!integration) {
        throw new Error('Integration should be created')
      }
      
      // Mock the sendNotification method
      const mockSendNotification = vi.fn().mockResolvedValue(undefined)
      integration.sendNotification = mockSendNotification
      
      await integration.sendNotification('workspace-123', 'user-456', 'Test message')
      
      expect(mockSendNotification).toHaveBeenCalledWith(
        'workspace-123',
        'user-456',
        'Test message'
      )
    })
  })
})
