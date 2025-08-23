'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Goal, IntentKind } from '@rhiz/core'
import { cn } from '@/lib/utils'

interface IntentCard {
  id: string
  goalTitle: string
  goalKind: string
  goalStatus: 'active' | 'completed' | 'archived'
  suggestions: Array<{
    id: string
    personAName: string
    personBName: string
    score: number
    why?: {
      mutualInterests: string[];
      recency: number;
      frequency: number;
      affiliation: number;
      goalAlignment: number;
    };
  }>
  insight?: {
    type: 'network_gap' | 'opportunity' | 'trend';
    message: string;
    confidence: number;
  }
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
                <CardTitle className="text-lg">{card.goalTitle}</CardTitle>
                <CardDescription className="mt-1">
                  {card.goalKind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </CardDescription>
              </div>
              <Badge 
                variant={card.goalStatus === 'active' ? 'default' : 'secondary'}
                className="ml-2"
              >
                {card.goalStatus}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Top 2 Suggestions */}
            {card.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Top Suggestions</h4>
                <div className="space-y-2">
                  {card.suggestions.slice(0, 2).map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {suggestion.personAName} ↔ {suggestion.personBName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.score}
                        </Badge>
                      </div>
                      {suggestion.why?.mutualInterests.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {suggestion.why.mutualInterests.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 1 Insight */}
            {card.insight && (
              <div>
                <h4 className="text-sm font-medium mb-2">Insight</h4>
                <div
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    card.insight.type === 'opportunity' && 'bg-green-50 text-green-700',
                    card.insight.type === 'network_gap' && 'bg-blue-50 text-blue-700',
                    card.insight.type === 'trend' && 'bg-purple-50 text-purple-700'
                  )}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {card.insight.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    ({card.insight.confidence}% confidence)
                  </div>
                  <div>{card.insight.message}</div>
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
