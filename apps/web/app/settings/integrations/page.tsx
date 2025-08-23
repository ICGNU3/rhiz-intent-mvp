'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Slack, 
  Calendar, 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  Settings
} from 'lucide-react'

interface Integration {
  provider: string
  status: 'connected' | 'disconnected' | 'error'
  lastSyncAt?: string
  config?: Record<string, any>
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  const workspaceId = '550e8400-e29b-41d4-a716-446655440001' // Demo workspace

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from /api/integrations
      // For demo, we'll simulate the data
      const mockIntegrations: Integration[] = [
        {
          provider: 'slack',
          status: 'connected',
          lastSyncAt: new Date().toISOString(),
          config: { teamName: 'Demo Workspace' }
        },
        {
          provider: 'google',
          status: 'connected',
          lastSyncAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          config: { type: 'calendar' }
        },
        {
          provider: 'hubspot',
          status: 'disconnected'
        }
      ]
      setIntegrations(mockIntegrations)
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectIntegration = async (provider: string) => {
    try {
      setConnecting(provider)
      
      switch (provider) {
        case 'slack':
          // Redirect to Slack OAuth
          window.open('/api/integrations/slack/connect', '_blank')
          break
        case 'google':
          // Get OAuth URL and redirect
          const response = await fetch(`/api/integrations/google/calendar/import?workspaceId=${workspaceId}`)
          const data = await response.json()
          if (data.authUrl) {
            window.open(data.authUrl, '_blank')
          }
          break
        case 'hubspot':
          // Connect HubSpot (would open OAuth flow)
          alert('HubSpot integration coming soon!')
          break
      }
    } catch (error) {
      console.error('Error connecting integration:', error)
    } finally {
      setConnecting(null)
    }
  }

  const disconnectIntegration = async (provider: string) => {
    try {
      // Call disconnect API
      const response = await fetch(`/api/integrations/${provider}/disconnect?workspaceId=${workspaceId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchIntegrations() // Refresh the list
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error)
    }
  }

  const syncIntegration = async (provider: string) => {
    try {
      setConnecting(provider)
      
      switch (provider) {
        case 'google':
          await fetch(`/api/integrations/google/calendar/import?workspaceId=${workspaceId}`, {
            method: 'PUT'
          })
          break
        case 'hubspot':
          await fetch(`/api/integrations/crm/sync?workspaceId=${workspaceId}&provider=hubspot`, {
            method: 'POST'
          })
          break
      }
      
      fetchIntegrations() // Refresh the list
    } catch (error) {
      console.error('Error syncing integration:', error)
    } finally {
      setConnecting(null)
    }
  }

  const getIntegrationStatus = (provider: string) => {
    const integration = integrations.find(i => i.provider === provider)
    return integration?.status || 'disconnected'
  }

  const getLastSyncTime = (provider: string) => {
    const integration = integrations.find(i => i.provider === provider)
    if (!integration?.lastSyncAt) return 'Never'
    
    const date = new Date(integration.lastSyncAt)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const getSyncCount = (provider: string) => {
    // Mock data - in real app this would come from the API
    switch (provider) {
      case 'slack':
        return { users: 15, channels: 8 }
      case 'google':
        return { events: 47, people: 23 }
      case 'hubspot':
        return { contacts: 0, companies: 0 }
      default:
        return { items: 0 }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your tools to enhance Rhiz with real-time data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Slack Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Slack className="h-5 w-5 text-blue-500" />
                <CardTitle>Slack</CardTitle>
              </div>
              <Badge variant={getIntegrationStatus('slack') === 'connected' ? 'default' : 'secondary'}>
                {getIntegrationStatus('slack') === 'connected' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {getIntegrationStatus('slack') === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <CardDescription>
              Get notifications and manage introductions directly in Slack
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getIntegrationStatus('slack') === 'connected' ? (
              <>
                <div className="text-sm text-muted-foreground">
                  <div>Last sync: {getLastSyncTime('slack')}</div>
                  <div>Connected users: {getSyncCount('slack').users}</div>
                  <div>Active channels: {getSyncCount('slack').channels}</div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => window.open('/slack', '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open Slack
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => disconnectIntegration('slack')}
                  >
                    Disconnect
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                onClick={() => connectIntegration('slack')}
                disabled={connecting === 'slack'}
                className="w-full"
              >
                {connecting === 'slack' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Slack className="h-4 w-4 mr-2" />
                )}
                Connect Slack
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Google Calendar Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <CardTitle>Google Calendar</CardTitle>
              </div>
              <Badge variant={getIntegrationStatus('google') === 'connected' ? 'default' : 'secondary'}>
                {getIntegrationStatus('google') === 'connected' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {getIntegrationStatus('google') === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <CardDescription>
              Import calendar events and attendees automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getIntegrationStatus('google') === 'connected' ? (
              <>
                <div className="text-sm text-muted-foreground">
                  <div>Last sync: {getLastSyncTime('google')}</div>
                  <div>Events imported: {getSyncCount('google').events}</div>
                  <div>People found: {getSyncCount('google').people}</div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => syncIntegration('google')}
                    disabled={connecting === 'google'}
                  >
                    {connecting === 'google' ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Sync Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => disconnectIntegration('google')}
                  >
                    Disconnect
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                onClick={() => connectIntegration('google')}
                disabled={connecting === 'google'}
                className="w-full"
              >
                {connecting === 'google' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Connect Calendar
              </Button>
            )}
          </CardContent>
        </Card>

        {/* CRM Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-500" />
                <CardTitle>CRM Sync</CardTitle>
              </div>
              <Badge variant={getIntegrationStatus('hubspot') === 'connected' ? 'default' : 'secondary'}>
                {getIntegrationStatus('hubspot') === 'connected' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {getIntegrationStatus('hubspot') === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <CardDescription>
              Sync contacts with HubSpot or Salesforce
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getIntegrationStatus('hubspot') === 'connected' ? (
              <>
                <div className="text-sm text-muted-foreground">
                  <div>Last sync: {getLastSyncTime('hubspot')}</div>
                  <div>Contacts synced: {getSyncCount('hubspot').contacts}</div>
                  <div>Companies synced: {getSyncCount('hubspot').companies}</div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => syncIntegration('hubspot')}
                    disabled={connecting === 'hubspot'}
                  >
                    {connecting === 'hubspot' ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Sync Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => disconnectIntegration('hubspot')}
                  >
                    Disconnect
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Button 
                  onClick={() => connectIntegration('hubspot')}
                  disabled={connecting === 'hubspot'}
                  className="w-full"
                >
                  {connecting === 'hubspot' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Connect HubSpot
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => connectIntegration('salesforce')}
                  disabled={connecting === 'salesforce'}
                  className="w-full"
                >
                  {connecting === 'salesforce' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Connect Salesforce
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Need help with integrations? Contact support or check our{' '}
          <a href="/docs/integrations" className="text-primary hover:underline">
            integration documentation
          </a>
        </p>
      </div>
    </div>
  )
}
