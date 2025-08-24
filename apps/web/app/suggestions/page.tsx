'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/app/components/navigation';

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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/suggestions');
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
        // Refresh suggestions
        fetchSuggestions();
      }
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
    }
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
            AI-powered introduction recommendations for your network
          </p>
        </div>

        <div className="space-y-6">
          {suggestions?.map((suggestion) => (
            <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {suggestion.personA.name} ↔ {suggestion.personB.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getScoreColor(suggestion.score)}>
                        Score: {suggestion.score}
                      </Badge>
                      <Badge className={getStateColor(suggestion.state)}>
                        {suggestion.state}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {new Date(suggestion.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Person Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{suggestion.personA.name}</h4>
                      {suggestion.personA.title && (
                        <p className="text-sm text-gray-600">{suggestion.personA.title}</p>
                      )}
                      {suggestion.personA.company && (
                        <p className="text-sm text-gray-500">{suggestion.personA.company}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{suggestion.personB.name}</h4>
                      {suggestion.personB.title && (
                        <p className="text-sm text-gray-600">{suggestion.personB.title}</p>
                      )}
                      {suggestion.personB.company && (
                        <p className="text-sm text-gray-500">{suggestion.personB.company}</p>
                      )}
                    </div>
                  </div>

                  {/* Why This Match */}
                  {suggestion.why && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Why This Match</h4>
                      <div className="space-y-2">
                        {suggestion.why.mutualInterests.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Mutual Interests:</span>
                            <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                              {suggestion.why.mutualInterests.map((interest, index) => (
                                <li key={index}>{interest}</li>
                              ))}
                            </ul>
                          </div>
                        )}
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
                      </div>
                    </div>
                  )}

                  {/* Draft Messages */}
                  {suggestion.draft && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Draft Messages</h4>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Pre-Intro Ping:</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {suggestion.draft.preIntroPing}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Double-Opt Intro:</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {suggestion.draft.doubleOptIntro}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {suggestion.state === 'proposed' && (
                      <Button 
                        onClick={() => handleAccept(suggestion.id)}
                        className="flex-1"
                      >
                        Accept Suggestion
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
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
                Create goals and add people to your network to get introduction suggestions
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
