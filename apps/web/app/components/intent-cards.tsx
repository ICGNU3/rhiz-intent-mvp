'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Goal, IntentKind } from '@rhiz/core'
import { cn } from '@/lib/utils'

interface IntentCard {
  id: string
  kind: IntentKind
  title: string
  description: string
  status: 'active' | 'completed' | 'archived'
  createdAt: Date
  updatedAt: Date
  actions: Array<{
    id: string
    label: string
    description: string
    kind: 'suggestion' | 'task' | 'insight'
    data: Record<string, any>
  }>
  insights: Array<{
    id: string
    title: string
    description: string
    kind: 'progress' | 'opportunity' | 'risk'
    data: Record<string, any>
  }>
}

export function IntentCards() {
  const [cards, setCards] = useState<IntentCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchIntentCards() {
      try {
        const response = await fetch('/api/intent-cards')
        if (response.ok) {
          const data = await response.json()
          setCards(data.cards)
        }
      } catch (error) {
        console.error('Failed to fetch intent cards:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIntentCards()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No Intent Cards Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating a goal or uploading some data to see your intent cards.
            </p>
            <Button asChild>
              <a href="/goals">Create Your First Goal</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Card key={card.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription className="mt-1">
                  {card.description}
                </CardDescription>
              </div>
              <Badge 
                variant={card.status === 'active' ? 'default' : 'secondary'}
                className="ml-2"
              >
                {card.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Actions */}
            {card.actions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Actions</h4>
                <div className="space-y-2">
                  {card.actions.slice(0, 2).map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Insights */}
            {card.insights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Insights</h4>
                <div className="space-y-2">
                  {card.insights.slice(0, 1).map((insight) => (
                    <div
                      key={insight.id}
                      className={cn(
                        'p-3 rounded-lg text-sm',
                        insight.kind === 'opportunity' && 'bg-green-50 text-green-700',
                        insight.kind === 'risk' && 'bg-red-50 text-red-700',
                        insight.kind === 'progress' && 'bg-blue-50 text-blue-700'
                      )}
                    >
                      <div className="font-medium">{insight.title}</div>
                      <div className="text-xs opacity-75">{insight.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Updated {new Date(card.updatedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
