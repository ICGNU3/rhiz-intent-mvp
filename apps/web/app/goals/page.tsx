'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  ChevronRight,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  BarChart3,
  Sparkles,
  Brain,
  Flag,
  Rocket,
  Trophy,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for goals
const mockGoals = [
  {
    id: '1',
    title: 'Raise $2M Series A',
    description: 'Secure Series A funding to scale product development and expand team',
    status: 'in_progress',
    priority: 'high',
    progress: 67,
    dueDate: '2024-03-31',
    category: 'Fundraising',
    color: 'from-blue-500 to-purple-600',
    metrics: {
      connections: 24,
      introductions: 8,
      meetings: 5,
      proposals: 2
    },
    suggestions: 12,
    insights: [
      'Sarah Chen from Sequoia is highly aligned with your vision',
      '3 warm intros available through your network',
      'Your pitch deck engagement rate is 85% above average'
    ],
    nextActions: [
      'Follow up with Mike Ross about intro to a16z',
      'Schedule demo with potential lead investor',
      'Update financial projections for Q2'
    ]
  },
  {
    id: '2',
    title: 'Hire 5 Senior Engineers',
    description: 'Build out engineering team with senior talent in AI/ML and backend',
    status: 'in_progress',
    priority: 'high',
    progress: 40,
    dueDate: '2024-02-29',
    category: 'Recruiting',
    color: 'from-green-500 to-teal-600',
    metrics: {
      connections: 18,
      introductions: 6,
      meetings: 4,
      proposals: 1
    },
    suggestions: 8,
    insights: [
      'Emily Zhang at Meta could be a perfect engineering lead',
      'Your network includes 12 senior engineers open to opportunities',
      'Consider reaching out to MIT alumni network'
    ],
    nextActions: [
      'Review candidates from last week',
      'Post job openings on AngelList',
      'Set up technical interview panel'
    ]
  },
  {
    id: '3',
    title: 'Launch Product Hunt Campaign',
    description: 'Achieve #1 Product of the Day to drive awareness and signups',
    status: 'planned',
    priority: 'medium',
    progress: 20,
    dueDate: '2024-04-15',
    category: 'Marketing',
    color: 'from-orange-500 to-red-600',
    metrics: {
      connections: 15,
      introductions: 3,
      meetings: 2,
      proposals: 0
    },
    suggestions: 6,
    insights: [
      'Your network includes 8 top hunters on Product Hunt',
      'Best launch day based on data: Tuesday',
      'Similar products averaged 850 upvotes'
    ],
    nextActions: [
      'Prepare launch assets',
      'Reach out to top hunters',
      'Create teaser campaign'
    ]
  },
  {
    id: '4',
    title: 'Strategic Partnership with OpenAI',
    description: 'Establish partnership for API access and co-marketing opportunities',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: '2024-01-15',
    category: 'Partnerships',
    color: 'from-purple-500 to-pink-600',
    metrics: {
      connections: 10,
      introductions: 4,
      meetings: 6,
      proposals: 1
    },
    suggestions: 0,
    insights: [
      'Partnership resulted in 40% cost reduction',
      'Access to GPT-4 fine-tuning capabilities',
      'Co-marketing reached 100K developers'
    ],
    nextActions: []
  }
];

const categories = [
  { id: 'all', label: 'All Goals', count: 12 },
  { id: 'fundraising', label: 'Fundraising', count: 3 },
  { id: 'recruiting', label: 'Recruiting', count: 4 },
  { id: 'marketing', label: 'Marketing', count: 2 },
  { id: 'partnerships', label: 'Partnerships', count: 3 }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-500 bg-red-500/10';
    case 'medium': return 'text-yellow-500 bg-yellow-500/10';
    case 'low': return 'text-green-500 bg-green-500/10';
    default: return 'text-gray-500 bg-gray-500/10';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'in_progress': return Clock;
    case 'planned': return Calendar;
    default: return AlertCircle;
  }
};

export default function GoalsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showAICoach, setShowAICoach] = useState(false);

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
