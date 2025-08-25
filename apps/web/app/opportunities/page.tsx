'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  Users,
  Calendar,
  Mail,
  Send,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Brain,
  Star,
  Filter,
  SortDesc,
  Eye,
  MessageCircle,
  Share2,
  Target,
  Building,
  MapPin,
  Lightbulb,
  Rocket,
  Trophy,
  AlertTriangle,
  Timer,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageNavigation } from '@/app/components/PageNavigation';

// Mock data for opportunities
const mockOpportunities = [
  {
    id: '1',
    type: 'introduction',
    title: 'Connect Sarah Chen with Alex Park',
    description: 'Both are AI experts from Stanford working on similar challenges',
    priority: 'high',
    status: 'ready',
    confidence: 95,
    mutualBenefit: 'Sarah needs technical advisors, Alex wants industry connections',
    timeline: '2 days',
    effort: 'low',
    impact: 'high',
    tags: ['AI', 'Stanford', 'Technical'],
    participants: [
      { name: 'Sarah Chen', role: 'Partner @ Sequoia', match: 92 },
      { name: 'Alex Park', role: 'Research Scientist @ OpenAI', match: 88 }
    ],
    nextActions: ['Draft introduction email', 'Get consent from both parties'],
    insights: [
      'Both mentioned similar challenges in AI safety during recent conversations',
      'Sarah invested in 3 companies that could benefit from Alex\'s expertise',
      'Alex is looking for industry advisory roles'
    ],
    estimatedValue: '$50K+ in potential deals',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    type: 'reconnect',
    title: 'Reconnect with David Kim at Stripe',
    description: 'Former colleague, now VP of Product - congratulate on promotion',
    priority: 'medium',
    status: 'ready',
    confidence: 78,
    mutualBenefit: 'Strengthen dormant tie, potential partnership opportunities',
    timeline: '1 day',
    effort: 'low',
    impact: 'medium',
    tags: ['Former Colleague', 'Payments', 'Partnership'],
    participants: [
      { name: 'David Kim', role: 'VP Product @ Stripe', match: 62 }
    ],
    nextActions: ['Send congratulatory message', 'Schedule catch-up call'],
    insights: [
      'David was promoted 2 weeks ago - perfect timing for reconnection',
      'Stripe is expanding into AI payments - relevant to your startup',
      'You worked together for 2 years with strong rapport'
    ],
    estimatedValue: 'Partnership potential',
    createdAt: '2024-01-14T15:30:00Z'
  },
  {
    id: '3',
    type: 'referral',
    title: 'Mike Ross seeking Series B investors',
    description: 'Strong founder with proven traction, matches your investor network',
    priority: 'high',
    status: 'ready',
    confidence: 85,
    mutualBenefit: 'Help Mike raise capital, strengthen investor relationships',
    timeline: '3 days',
    effort: 'medium',
    impact: 'high',
    tags: ['Series B', 'B2B SaaS', 'Investors'],
    participants: [
      { name: 'Mike Ross', role: 'CEO @ TechCo', match: 78 },
      { name: 'Sarah Chen', role: 'Partner @ Sequoia', match: 92 }
    ],
    nextActions: ['Review Mike\'s pitch deck', 'Intro to 2-3 relevant investors'],
    insights: [
      'Mike\'s ARR grew 300% in 12 months - very attractive to VCs',
      'Sarah recently mentioned looking for B2B SaaS deals',
      'Perfect timing as Mike just opened his Series B round'
    ],
    estimatedValue: '$10M+ funding potential',
    createdAt: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    type: 'collaboration',
    title: 'Product Hunt launch collaboration',
    description: 'Coordinate with your network of hunters for maximum impact',
    priority: 'medium',
    status: 'planning',
    confidence: 72,
    mutualBenefit: 'Successful launch, strengthen community relationships',
    timeline: '2 weeks',
    effort: 'high',
    impact: 'high',
    tags: ['Product Hunt', 'Launch', 'Community'],
    participants: [
      { name: 'Multiple hunters', role: 'Product Hunt Community', match: 65 }
    ],
    nextActions: ['Create launch timeline', 'Reach out to top hunters', 'Prepare assets'],
    insights: [
      'Your network includes 8 top Product Hunt hunters',
      'Tuesday launches have 23% higher success rate',
      'Similar products averaged 850 upvotes on successful days'
    ],
    estimatedValue: '5K+ new users potential',
    createdAt: '2024-01-12T14:20:00Z'
  },
  {
    id: '5',
    type: 'hiring',
    title: 'Engineering referrals from MIT network',
    description: 'Tap into MIT alumni network for senior engineering hires',
    priority: 'high',
    status: 'ready',
    confidence: 68,
    mutualBenefit: 'Fill critical roles, help alumni find opportunities',
    timeline: '1 week',
    effort: 'medium',
    impact: 'high',
    tags: ['MIT', 'Engineering', 'Hiring'],
    participants: [
      { name: 'MIT Alumni Network', role: 'Various Engineering Roles', match: 55 }
    ],
    nextActions: ['Post in MIT alumni Slack', 'Reach out to 5 specific contacts', 'Schedule referral calls'],
    insights: [
      'Your MIT network includes 12 senior engineers open to opportunities',
      'MIT alumni are 40% more likely to respond to fellow alumni',
      'Q1 is prime hiring season for senior talent'
    ],
    estimatedValue: '3-5 senior hires',
    createdAt: '2024-01-11T11:45:00Z'
  }
];

const opportunityTypes = [
  { id: 'all', label: 'All Opportunities', count: 24, color: 'text-gray-500' },
  { id: 'introduction', label: 'Introductions', count: 8, color: 'text-blue-500' },
  { id: 'reconnect', label: 'Reconnections', count: 6, color: 'text-green-500' },
  { id: 'referral', label: 'Referrals', count: 5, color: 'text-purple-500' },
  { id: 'collaboration', label: 'Collaborations', count: 3, color: 'text-orange-500' },
  { id: 'hiring', label: 'Hiring', count: 2, color: 'text-pink-500' }
];

const priorityColors = {
  high: 'text-red-500 bg-red-500/10 border-red-500/20',
  medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  low: 'text-green-500 bg-green-500/10 border-green-500/20'
};

const statusIcons = {
  ready: { icon: Zap, color: 'text-green-500' },
  planning: { icon: Clock, color: 'text-yellow-500' },
  in_progress: { icon: Timer, color: 'text-blue-500' },
  completed: { icon: CheckCircle, color: 'text-gray-500' }
};

const typeIcons = {
  introduction: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  reconnect: { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  referral: { icon: Share2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  collaboration: { icon: Rocket, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  hiring: { icon: Target, color: 'text-pink-500', bg: 'bg-pink-500/10' }
};

export default function OpportunitiesPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('confidence');
  const [showAICoach, setShowAICoach] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [executingOpportunity, setExecutingOpportunity] = useState<any>(null);

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const handleExecuteOpportunity = (opportunity: any) => {
    setExecutingOpportunity(opportunity);
    setShowExecutionModal(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Premium gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Page Navigation */}
      <PageNavigation />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Opportunities</h1>
                  <p className="text-sm text-gray-400">AI-discovered networking opportunities</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* AI Coach */}
                <button
                  onClick={() => setShowAICoach(!showAICoach)}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all flex items-center space-x-2",
                    showAICoach ? "bg-blue-600 text-white" : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">AI Coach</span>
                </button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="confidence">By Confidence</option>
                  <option value="priority">By Priority</option>
                  <option value="timeline">By Timeline</option>
                  <option value="impact">By Impact</option>
                </select>

                {/* Execute All */}
                <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:opacity-90 transition-all flex items-center space-x-2">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm">Execute Top 3</span>
                </button>
              </div>
            </div>

            {/* Type Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {opportunityTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap",
                    selectedType === type.id
                      ? "bg-blue-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  )}
                >
                  <span className={type.color}>●</span>
                  <span className="ml-2">{type.label}</span>
                  <span className="ml-1.5 text-xs opacity-70">({type.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Coach Panel */}
        <AnimatePresence>
          {showAICoach && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/10 bg-gradient-to-r from-orange-900/30 to-purple-900/30 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold">AI Opportunity Coach</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-4 h-4 text-gold-500" />
                      <p className="text-sm font-medium text-yellow-400">Highest ROI</p>
                    </div>
                    <p className="text-sm text-gray-300">Sarah-Alex introduction has 95% confidence and could unlock $50K+ in deals. Execute now.</p>
                    <button className="mt-3 text-xs text-blue-400 hover:text-blue-300">Execute →</button>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <p className="text-sm font-medium text-orange-400">Time Sensitive</p>
                    </div>
                    <p className="text-sm text-gray-300">Mike&apos;s Series B window closes in 2 weeks. Connect him with investors before momentum is lost.</p>
                    <button className="mt-3 text-xs text-blue-400 hover:text-blue-300">Rush Execute →</button>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-purple-500" />
                      <p className="text-sm font-medium text-purple-400">Low Hanging Fruit</p>
                    </div>
                    <p className="text-sm text-gray-300">Congratulating David takes 2 minutes but could reactivate a valuable relationship.</p>
                    <button className="mt-3 text-xs text-blue-400 hover:text-blue-300">Quick Win →</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opportunities List */}
        <div className="p-6">
          <div className="space-y-4">
            {mockOpportunities.map((opportunity, index) => {
              const TypeIcon = typeIcons[opportunity.type as keyof typeof typeIcons];
              const StatusIcon = statusIcons[opportunity.status as keyof typeof statusIcons];
              
              return (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-gray-900/70 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Type Icon */}
                      <div className={cn("p-3 rounded-lg", TypeIcon.bg)}>
                        <TypeIcon.icon className={cn("w-5 h-5", TypeIcon.color)} />
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                          <span className={cn("px-2 py-1 rounded-full text-xs border", priorityColors[opportunity.priority as keyof typeof priorityColors])}>
                            {opportunity.priority}
                          </span>
                          <div className="flex items-center space-x-1">
                            <StatusIcon.icon className={cn("w-4 h-4", StatusIcon.color)} />
                            <span className="text-xs text-gray-400">{opportunity.status}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-3">{opportunity.description}</p>
                        
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-2 bg-white/5 rounded-lg">
                            <p className="text-xs text-gray-400">Confidence</p>
                            <p className="text-sm font-medium text-green-500">{opportunity.confidence}%</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded-lg">
                            <p className="text-xs text-gray-400">Timeline</p>
                            <p className="text-sm font-medium">{opportunity.timeline}</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded-lg">
                            <p className="text-xs text-gray-400">Effort</p>
                            <p className={cn("text-sm font-medium", getEffortColor(opportunity.effort))}>{opportunity.effort}</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded-lg">
                            <p className="text-xs text-gray-400">Impact</p>
                            <p className={cn("text-sm font-medium", getImpactColor(opportunity.impact))}>{opportunity.impact}</p>
                          </div>
                        </div>
                        
                        {/* AI Insights */}
                        {opportunity.insights.length > 0 && (
                          <div className="mb-4 p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
                            <div className="flex items-center space-x-2 mb-2">
                              <Brain className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-medium text-blue-400">AI Insight</span>
                            </div>
                            <p className="text-xs text-gray-300">{opportunity.insights[0]}</p>
                          </div>
                        )}
                        
                        {/* Participants */}
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-400 mb-2">Participants</p>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.participants.map((participant, i) => (
                              <div key={i} className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-full">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs text-white font-semibold">
                                  {participant.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-xs text-gray-300">{participant.name}</span>
                                <span className="text-xs text-green-400">{participant.match}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {opportunity.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <button 
                        onClick={() => handleExecuteOpportunity(opportunity)}
                        className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium flex items-center space-x-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Execute</span>
                      </button>
                      <button className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all text-sm">
                        Details
                      </button>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>Value: {opportunity.estimatedValue}</span>
                      <span>•</span>
                      <span>Created {new Date(opportunity.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                        <Share2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                        <Star className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Execution Modal */}
      <AnimatePresence>
        {showExecutionModal && executingOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExecutionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-lg border border-white/10"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Execute Opportunity</h3>
                  <p className="text-sm text-gray-400">{executingOpportunity.title}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-green-600/10 rounded-lg border border-green-600/20">
                  <p className="text-sm text-green-400 font-medium mb-1">✓ Ready to Execute</p>
                  <p className="text-sm text-gray-300">
                    {executingOpportunity.confidence}% confidence • {executingOpportunity.timeline} timeline • {executingOpportunity.effort} effort
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300">Next Actions:</p>
                  {executingOpportunity.nextActions.slice(0, 3).map((action: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
                  <p className="text-sm text-blue-400 font-medium mb-1">Estimated Value</p>
                  <p className="text-sm text-gray-300">{executingOpportunity.estimatedValue}</p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowExecutionModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert(`Executing "${executingOpportunity.title}"! (Demo mode)`);
                      setShowExecutionModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 rounded-lg transition-all text-sm font-medium"
                  >
                    Execute Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}