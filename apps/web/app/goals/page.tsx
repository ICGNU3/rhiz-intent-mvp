'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/app/components/navigation';
import { useWorkspace } from '@/lib/useWorkspace';

interface Goal {
  id: string;
  kind: string;
  title: string;
  details?: string;
  status: string;
  createdAt: string;
  suggestionsCount?: number;
}

export default function GoalsPage() {
  const { workspaceId } = useWorkspace();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspaceId) {
      fetchGoals();
    }
  }, [workspaceId]);

  const fetchGoals = async () => {
    if (!workspaceId) return;
    
    try {
      const response = await fetch(`/api/goals?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case 'raise_seed':
        return 'Raise Seed';
      case 'hire_engineer':
        return 'Hire Engineer';
      case 'break_into_city':
        return 'Break into City';
      default:
        return kind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading goals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-2">
            Your professional objectives and networking goals
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getKindLabel(goal.kind)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goal.details && (
                    <p className="text-sm text-gray-600">{goal.details}</p>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                    {goal.suggestionsCount !== undefined && (
                      <span>{goal.suggestionsCount} suggestions</span>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Suggestions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {goals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">No goals found</p>
              <p className="text-sm text-gray-500">
                Create goals to get personalized introduction suggestions
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
