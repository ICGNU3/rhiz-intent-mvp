'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Navigation } from '@/components/navigation';
import { Search, Calendar, Target, Users } from 'lucide-react';

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
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    const filtered = people.filter(person =>
      person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.primaryEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.claims.some(claim => 
        claim.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredPeople(filtered);
  }, [people, searchTerm]);

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
    setIsDrawerOpen(true);
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search people by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPeople.map((person) => (
            <Card key={person.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePersonClick(person)}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
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
                  </div>
                </div>
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
                      Click to view details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPeople.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No people match your search' : 'No people found'}
              </p>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Upload calendar events or record voice notes to start building your network'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Person Detail Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {selectedPerson && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">{getInitials(selectedPerson.fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedPerson.fullName}</h2>
                    {selectedPerson.primaryEmail && (
                      <p className="text-gray-600">{selectedPerson.primaryEmail}</p>
                    )}
                  </div>
                </div>
              )}
            </DrawerTitle>
          </DrawerHeader>
          
          {selectedPerson && (
            <div className="p-6 space-y-6">
              {/* Facts Timeline */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Facts & Claims
                </h3>
                <div className="space-y-2">
                  {selectedPerson.claims.map((claim, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium capitalize">{claim.key}</p>
                          <p className="text-gray-600">{claim.value}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {claim.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Encounters */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Encounters
                </h3>
                {selectedPerson.lastEncounter ? (
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Last encounter</p>
                    <p className="text-gray-600">
                      {new Date(selectedPerson.lastEncounter).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No recent encounters</p>
                )}
              </div>

              {/* Related Goals */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Related Goals
                </h3>
                <p className="text-gray-500">No related goals yet</p>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
