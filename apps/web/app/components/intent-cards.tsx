'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IntentCard } from '@/components/IntentCard'

interface IntentCardData {
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

interface IntentCardsProps {
  workspaceId: string;
}

export function IntentCards({ workspaceId }: IntentCardsProps) {
  const [cards, setCards] = useState<IntentCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchIntentCards() {
      try {
        const response = await fetch(`/api/intent-cards?workspaceId=${workspaceId}`)
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

    if (workspaceId) {
      fetchIntentCards()
    }
  }, [workspaceId])

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

  if (!cards || cards.length === 0) {
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
        <IntentCard
          key={card.id}
          id={card.id}
          goalTitle={card.goalTitle}
          goalKind={card.goalKind}
          goalStatus={card.goalStatus}
          suggestions={card.suggestions}
          insight={card.insight}
        />
      ))}
    </div>
  )
}
