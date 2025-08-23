'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';

interface Person {
  id: string;
  fullName: string;
  primaryEmail?: string;
  location?: string;
  lastEncounter?: string;
  relationshipStrength?: number;
  claims: Array<{
    key: string;
    value: string;
    confidence: number;
  }>;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const response = await fetch('/api/people');
      if (response.ok) {
        const data = await response.json();
        setPeople(data.people);
      }
    } catch (error) {
      console.error('Failed to fetch people:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 8) return 'bg-green-100 text-green-800';
    if (strength >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 8) return 'Strong';
    if (strength >= 5) return 'Medium';
    return 'Weak';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading people...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">People</h1>
          <p className="text-gray-600 mt-2">
            Your network of contacts and their relationship strength
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <Card key={person.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{person.fullName}</CardTitle>
                  {person.relationshipStrength && (
                    <Badge className={getStrengthColor(person.relationshipStrength)}>
                      {getStrengthLabel(person.relationshipStrength)}
                    </Badge>
                  )}
                </div>
                {person.primaryEmail && (
                  <p className="text-sm text-gray-600">{person.primaryEmail}</p>
                )}
                {person.location && (
                  <p className="text-sm text-gray-500">{person.location}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {person.claims.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Known Information</h4>
                      <div className="space-y-1">
                        {person.claims.map((claim, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{claim.key}:</span>
                            <span className="text-gray-900">{claim.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {person.lastEncounter && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">
                        Last encounter: {new Date(person.lastEncounter).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {people.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">No people found</p>
              <p className="text-sm text-gray-500">
                Upload calendar events or record voice notes to start building your network
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
