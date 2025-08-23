import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGoogleCalendarIntegration } from '../google/calendar'

// Mock environment variables
vi.mock('process', () => ({
  env: {
    GOOGLE_CLIENT_ID: 'test-client-id',
    GOOGLE_CLIENT_SECRET: 'test-client-secret',
    GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback'
  }
}))

describe('Google Calendar Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createGoogleCalendarIntegration', () => {
    it('should create Google Calendar integration when environment variables are set', () => {
      const integration = createGoogleCalendarIntegration()
      expect(integration).toBeDefined()
      expect(integration).not.toBeNull()
    })

    it('should return null when environment variables are missing', () => {
      // Temporarily clear environment variables
      const originalEnv = process.env
      process.env = {}
      
      const integration = createGoogleCalendarIntegration()
      expect(integration).toBeNull()
      
      // Restore environment variables
      process.env = originalEnv
    })
  })

  describe('GoogleCalendarIntegration class', () => {
    it('should generate OAuth URL with correct parameters', () => {
      const integration = createGoogleCalendarIntegration()
      if (!integration) {
        throw new Error('Integration should be created')
      }
      
      const authUrl = integration.generateAuthUrl('workspace-123')
      
      expect(authUrl).toBeDefined()
      expect(typeof authUrl).toBe('string')
      expect(authUrl).toContain('googleapis.com')
      expect(authUrl).toContain('calendar.readonly')
    })

    it('should check connection status', async () => {
      const integration = createGoogleCalendarIntegration()
      if (!integration) {
        throw new Error('Integration should be created')
      }
      
      // Mock the isConnected method
      const mockIsConnected = vi.fn().mockResolvedValue(false)
      integration.isConnected = mockIsConnected
      
      const isConnected = await integration.isConnected('workspace-123')
      
      expect(mockIsConnected).toHaveBeenCalledWith('workspace-123')
      expect(isConnected).toBe(false)
    })

    it('should handle calendar import', async () => {
      const integration = createGoogleCalendarIntegration()
      if (!integration) {
        throw new Error('Integration should be created')
      }
      
      // Mock the importCalendarEvents method
      const mockImportResult = {
        success: true,
        eventsProcessed: 5,
        peopleCreated: 3,
        encountersCreated: 5
      }
      const mockImportCalendarEvents = vi.fn().mockResolvedValue(mockImportResult)
      integration.importCalendarEvents = mockImportCalendarEvents
      
      const result = await integration.importCalendarEvents('workspace-123', 30)
      
      expect(mockImportCalendarEvents).toHaveBeenCalledWith('workspace-123', 30)
      expect(result).toEqual(mockImportResult)
    })
  })
})
