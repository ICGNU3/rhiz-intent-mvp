import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatResponseData, PersonCard, SuggestionCard, GoalCard } from '@/types/chat';

interface ChatCardsProps {
  data: ChatResponseData;
  onAction?: (action: string, data: Record<string, unknown>) => void;
}

interface PersonCardItemProps {
  person: PersonCard;
  onAction?: (action: string, data: Record<string, unknown>) => void;
}

interface SuggestionCardItemProps {
  suggestion: SuggestionCard;
  onAction?: (action: string, data: Record<string, unknown>) => void;
}

interface GoalCardItemProps {
  goal: GoalCard;
  onAction?: (action: string, data: Record<string, unknown>) => void;
}

function PersonCardItem({ person, onAction }: PersonCardItemProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{person.name}</div>
              {(person.role || person.company) && (
                <div className="text-sm text-gray-500 truncate">
                  {person.role}
                  {person.role && person.company && ' at '}
                  {person.company}
                </div>
              )}
              {person.lastEncounter && (
                <div className="text-xs text-gray-400">
                  Last: {person.lastEncounter}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            {person.actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onAction?.(action.action, action.data)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SuggestionCardItem({ suggestion, onAction }: SuggestionCardItemProps) {
  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {suggestion.score}% match
          </Badge>
        </div>
        <div className="mb-3">
          <ul className="text-sm text-gray-600 space-y-1">
            {suggestion.why.map((reason, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span className="flex-1">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex space-x-1 flex-wrap gap-1">
          {suggestion.actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onAction?.(action.action, action.data)}
              className="text-xs"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GoalCardItem({ goal }: GoalCardItemProps) {
  const getStatusVariant = (status: GoalCard['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'paused':
        return 'outline';
      case 'archived':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{goal.title}</div>
            <div className="text-sm text-gray-500 truncate">{goal.kind}</div>
          </div>
          <Badge variant={getStatusVariant(goal.status)} className="ml-2 flex-shrink-0">
            {goal.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChatCards({ data, onAction }: ChatCardsProps) {
  if (!data || (!data.people && !data.suggestions && !data.goals)) {
    return null;
  }

  return (
    <div className="space-y-4 mt-4">
      {data.people && data.people.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">People</h4>
          <div className="space-y-2">
            {data.people.map((person) => (
              <PersonCardItem
                key={person.id}
                person={person}
                onAction={onAction}
              />
            ))}
          </div>
        </div>
      )}

      {data.suggestions && data.suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Suggestions</h4>
          <div className="space-y-2">
            {data.suggestions.map((suggestion) => (
              <SuggestionCardItem
                key={suggestion.id}
                suggestion={suggestion}
                onAction={onAction}
              />
            ))}
          </div>
        </div>
      )}

      {data.goals && data.goals.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Goals</h4>
          <div className="space-y-2">
            {data.goals.map((goal) => (
              <GoalCardItem key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}