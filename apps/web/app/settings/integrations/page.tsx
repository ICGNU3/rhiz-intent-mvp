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
        case 'n8n':
          // Open n8n integration guide
          window.open('/docs/N8N_INTEGRATION.md', '_blank')
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

  const integrations = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and use slash commands',
      icon: '💬',
      status: getIntegrationStatus('slack'),
      connected: false,
      features: ['Notifications', 'Slash Commands', 'Real-time Updates']
    },
    {
      id: 'google',
      name: 'Google Calendar',
      description: 'Import calendar events and attendees',
      icon: '📅',
      status: getIntegrationStatus('google'),
      connected: false,
      features: ['Event Import', 'Attendee Sync', 'Meeting Data']
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Sync contacts and deals',
      icon: '🎯',
      status: getIntegrationStatus('hubspot'),
      connected: false,
      features: ['Contact Sync', 'Deal Tracking', 'Custom Fields']
    },
    {
      id: 'n8n',
      name: 'n8n (Open Source)',
      description: 'Connect any CRM or tool via n8n workflows',
      icon: '🔗',
      status: 'available',
      connected: false,
      features: ['Any CRM', 'Custom Workflows', 'Free Forever'],
      isOpenSource: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your tools to enhance Rhiz with real-time data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{integration.icon}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{integration.name}</h3>
                    {integration.isOpenSource && (
                      <Badge variant="secondary" className="text-xs">
                        Open Source
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {integration.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {integration.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={integration.status === 'connected' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {integration.status === 'connected' ? 'Connected' : 'Available'}
                </Badge>
                
                {integration.id === 'n8n' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => connectIntegration(integration.id)}
                    disabled={connecting === integration.id}
                  >
                    {connecting === integration.id ? 'Opening...' : 'Setup Guide'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => connectIntegration(integration.id)}
                    disabled={connecting === integration.id}
                  >
                    {connecting === integration.id ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
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
