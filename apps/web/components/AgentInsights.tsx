'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Clock, 
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentInsight {
  id: string;
  agent: 'mapper' | 'sensemaker' | 'strategist' | 'storyweaver';
  type: 'priority' | 'health' | 'opportunity' | 'maintenance';
  title: string;
  description: string;
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high';
  data?: any;
}

const mockInsights: AgentInsight[] = [
  {
    id: '1',
    agent: 'mapper',
    type: 'priority',
    title: 'High-Value Connection Opportunity',
    description: 'Sarah Chen (Sequoia) has 95% goal alignment for Series B prep',
    actionable: true,
    urgency: 'high',
    data: { contact_name: 'Sarah Chen', match_score: 95 }
  },
  {
    id: '2', 
    agent: 'sensemaker',
    type: 'health',
    title: 'Relationship Decay Alert',
    description: '3 Layer-2 connections haven&apos;t been contacted in 90+ days',
    actionable: true,
    urgency: 'medium',
    data: { decaying_count: 3, layer: 2 }
  },
  {
    id: '3',
    agent: 'strategist',
    type: 'opportunity',
    title: 'Outreach Window Optimal',
    description: 'Mike Ross activity suggests best contact time is Wednesday mornings',
    actionable: true,
    urgency: 'low',
    data: { contact_name: 'Mike Ross', optimal_day: 'Wednesday', optimal_time: 'morning' }
  },
  {
    id: '4',
    agent: 'sensemaker',
    type: 'maintenance',
    title: 'Capacity Analysis',
    description: 'Operating at 78% social capacity - consider relationship pruning',
    actionable: false,
    urgency: 'medium',
    data: { capacity_utilization: 78, dunbar_usage: 68 }
  }
];

const agentIcons = {
  mapper: Brain,
  sensemaker: TrendingUp,
  strategist: MessageCircle,
  storyweaver: Users
};

const urgencyColors = {
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
  high: 'bg-red-50 text-red-700 border-red-200'
};

const urgencyIcons = {
  low: Clock,
  medium: AlertTriangle,
  high: Zap
};

export default function AgentInsights() {
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading agent insights
    const timer = setTimeout(() => {
      setInsights(mockInsights);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleInsightAction = async (insight: AgentInsight) => {
    console.log('Acting on insight:', insight);
    // Here we would call the appropriate agent API
    
    if (insight.agent === 'mapper' && insight.type === 'priority') {
      // Call prioritize API
      // await fetch('/api/agents/prioritize', { method: 'POST', body: JSON.stringify({ goalId: 'current' }) });
    } else if (insight.agent === 'strategist' && insight.type === 'opportunity') {
      // Call outreach API
      // await fetch('/api/agents/outreach', { method: 'POST', body: JSON.stringify({ contact_id: insight.data.contact_name }) });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-6 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Agent Insights</h3>
          <p className="text-sm text-gray-600">AI-powered relationship intelligence</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const AgentIcon = agentIcons[insight.agent];
          const UrgencyIcon = urgencyIcons[insight.urgency];
          
          return (
            <motion.div
              key={insight.id}
              layout
              className={cn(
                "p-4 rounded-lg border transition-all cursor-pointer",
                selectedInsight === insight.id 
                  ? "border-blue-300 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300",
                urgencyColors[insight.urgency]
              )}
              onClick={() => setSelectedInsight(
                selectedInsight === insight.id ? null : insight.id
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center">
                    <AgentIcon className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{insight.title}</h4>
                    <UrgencyIcon className="w-3 h-3 flex-shrink-0" />
                  </div>
                  <p className="text-sm opacity-80 leading-snug">{insight.description}</p>
                  
                  {selectedInsight === insight.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-white/50"
                    >
                      <div className="flex items-center gap-2 text-xs opacity-75 mb-2">
                        <span className="capitalize">{insight.agent}</span>
                        <span>•</span>
                        <span className="capitalize">{insight.urgency} priority</span>
                      </div>
                      
                      {insight.actionable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsightAction(insight);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/80 hover:bg-white rounded-md text-xs font-medium transition-colors"
                        >
                          Take Action
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
                
                {insight.actionable && selectedInsight !== insight.id && (
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-4 h-4 opacity-40" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No insights available yet</p>
          <p className="text-xs mt-1">Agents are analyzing your network...</p>
        </div>
      )}
    </div>
  );
}