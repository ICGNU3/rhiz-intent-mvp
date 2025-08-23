'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Navigation } from '@/components/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  kind: string;
  score: number;
  state: string;
  createdAt: string;
  personA: {
    name: string;
    title?: string;
    company?: string;
  };
  personB: {
    name: string;
    title?: string;
    company?: string;
  };
  why?: {
    mutualInterests: string[];
    recency: number;
    frequency: number;
    affiliation: number;
    goalAlignment: number;
  };
  draft?: {
    preIntroPing: string;
    doubleOptIntro: string;
  };
}

export default function SuggestionsPage() {
  const searchParams = useSearchParams();
  const goalId = searchParams.get('goalId');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, [goalId]);

  const fetchSuggestions = async () => {
    try {
      const url = goalId ? `/api/suggestions?goalId=${goalId}` : '/api/suggestions';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/suggestions/${suggestionId}/accept`, {
        method: 'POST',
      });
      if (response.ok) {
        // Optimistic UI update
        setAcceptedSuggestions(prev => new Set(prev).add(suggestionId));
        
        // Show toast
        toast({
          title: "Intro accepted",
          description: "Follow-up scheduled for next week",
        });
        
        // Refresh suggestions after a delay
        setTimeout(() => {
          fetchSuggestions();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to accept suggestion",
        variant: "destructive",
      });
    }
  };

  const handleSkip = (suggestionId: string) => {
    // Remove from list with animation
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'proposed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading suggestions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Suggestions</h1>
          <p className="text-gray-600 mt-2">
            {goalId ? 'Filtered by goal' : 'All introduction recommendations'}
          </p>
        </div>

        <div className="space-y-6">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(suggestion.personA.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{suggestion.personA.name}</p>
                        {suggestion.personA.title && (
                          <p className="text-sm text-gray-600">{suggestion.personA.title}</p>
                        )}
                        {suggestion.personA.company && (
                          <p className="text-sm text-gray-500">{suggestion.personA.company}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-gray-400">↔</div>
                    
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(suggestion.personB.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{suggestion.personB.name}</p>
                        {suggestion.personB.title && (
                          <p className="text-sm text-gray-600">{suggestion.personB.title}</p>
                        )}
                        {suggestion.personB.company && (
                          <p className="text-sm text-gray-500">{suggestion.personB.company}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getScoreColor(suggestion.score)}>
                      Score: {suggestion.score}
                    </Badge>
                    <Badge className={getStateColor(suggestion.state)}>
                      {suggestion.state}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Why This Match */}
                {suggestion.why && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Why This Match</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Recency:</span>
                        <span className="ml-1 font-medium">{suggestion.why.recency}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Frequency:</span>
                        <span className="ml-1 font-medium">{suggestion.why.frequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Affiliation:</span>
                        <span className="ml-1 font-medium">{suggestion.why.affiliation}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Goal Alignment:</span>
                        <span className="ml-1 font-medium">{suggestion.why.goalAlignment}</span>
                      </div>
                    </div>
                    
                    {suggestion.why.mutualInterests.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Mutual Interests:</span>
                        <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                          {suggestion.why.mutualInterests.map((interest, index) => (
                            <li key={index}>{interest}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Draft Messages */}
                {suggestion.draft && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Draft Messages</h4>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="pre-intro">
                        <AccordionTrigger className="text-sm">Pre-Intro Ping</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {suggestion.draft.preIntroPing}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="double-opt">
                        <AccordionTrigger className="text-sm">Double-Opt Intro</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {suggestion.draft.doubleOptIntro}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {suggestion.state === 'proposed' && !acceptedSuggestions.has(suggestion.id) && (
                    <>
                      <Button 
                        onClick={() => handleAccept(suggestion.id)}
                        className="flex-1"
                      >
                        Accept Intro
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleSkip(suggestion.id)}
                      >
                        Skip
                      </Button>
                    </>
                  )}
                  {acceptedSuggestions.has(suggestion.id) && (
                    <Button variant="outline" className="flex-1" disabled>
                      Accepted ✓
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {suggestions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">No suggestions found</p>
              <p className="text-sm text-gray-500">
                {goalId ? 'No suggestions for this goal yet' : 'Create goals and add people to your network to get introduction suggestions'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
