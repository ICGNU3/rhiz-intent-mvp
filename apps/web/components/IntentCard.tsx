'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  personAName: string;
  personBName: string;
  score: number;
  why?: {
    mutualInterests: string[];
    recency: number;
    frequency: number;
    affiliation: number;
    goalAlignment: number;
  };
}

interface Insight {
  type: 'network_gap' | 'opportunity' | 'trend' | 'dormant_relationship';
  message: string;
  confidence: number;
}

interface IntentCardProps {
  id: string;
  goalTitle: string;
  goalKind: string;
  goalStatus: string;
  suggestions: Suggestion[];
  insight?: Insight;
}

export function IntentCard({ id, goalTitle, goalKind, goalStatus, suggestions, insight }: IntentCardProps) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return '💡';
      case 'network_gap':
        return '🔗';
      case 'trend':
        return '📈';
      case 'dormant_relationship':
        return '⏰';
      default:
        return '💡';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'network_gap':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'trend':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'dormant_relationship':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleViewAllSuggestions = () => {
    router.push(`/suggestions?goalId=${id}`);
  };

  const handleAddNote = () => {
    // TODO: Implement note saving
    console.log('Note added:', note);
    setNote('');
    setIsNoteModalOpen(false);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{goalTitle}</h3>
            <p className="text-blue-100 text-sm capitalize">
              {goalKind.replace(/_/g, ' ')}
            </p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {goalStatus}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Top 2 Suggestions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Top Suggestions</h4>
          <div className="space-y-3">
            {suggestions.slice(0, 2).map((suggestion, index) => (
              <div
                key={suggestion.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {suggestion.personAName} ↔ {suggestion.personBName}
                  </span>
                  <Badge className={cn('text-xs', getScoreColor(suggestion.score))}>
                    {suggestion.score}
                  </Badge>
                </div>
                {suggestion.why?.mutualInterests && suggestion.why.mutualInterests.length > 0 && (
                  <p className="text-xs text-gray-600">
                    {suggestion.why.mutualInterests.slice(0, 2).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Insight */}
        {insight && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Insight</h4>
            <div className={cn(
              'p-3 rounded-lg border text-sm',
              getInsightColor(insight.type)
            )}>
              <div className="flex items-start gap-2">
                <span className="text-lg">{getInsightIcon(insight.type)}</span>
                <div className="flex-1">
                  <div className="text-xs opacity-75 mb-1">
                    {insight.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    ({insight.confidence}% confidence)
                  </div>
                  <div>{insight.message}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleViewAllSuggestions}
            className="flex-1"
            variant="default"
          >
            View all suggestions
          </Button>
          
          <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Add note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Note for "{goalTitle}"</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    placeholder="Add your thoughts about this goal..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsNoteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddNote}>
                    Save Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
