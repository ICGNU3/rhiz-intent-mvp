'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Users,
  Building,
  MapPin,
  Calendar,
  TrendingUp,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  ChevronRight,
  Star,
  Activity,
  Clock,
  Tag,
  MoreVertical,
  Sparkles,
  Brain,
  Grid,
  List,
  SortAsc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageNavigation } from '@/app/components/PageNavigation';

// Mock data for connections
const mockConnections = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Partner',
    company: 'Sequoia Capital',
    location: 'San Francisco, CA',
    email: 'sarah.chen@sequoia.com',
    relationshipStrength: 9,
    lastInteraction: '2 hours ago',
    interactions: 24,
    tags: ['Investor', 'AI Expert', 'Stanford'],
    status: 'active',
    goalMatch: 95,
    imageUrl: null,
    mutualConnections: 12,
    notes: 'Met at TechCrunch Disrupt. Very interested in AI startups.',
  },
  {
    id: '2',
    name: 'Mike Ross',
    title: 'Founder & CEO',
    company: 'TechCo',
    location: 'New York, NY',
    email: 'mike@techco.com',
    relationshipStrength: 7,
    lastInteraction: '1 day ago',
    interactions: 18,
    tags: ['Founder', 'B2B SaaS', 'Series B'],
    status: 'active',
    goalMatch: 78,
    imageUrl: null,
    mutualConnections: 8,
    notes: 'Looking for Series B funding. Strong product-market fit.',
  },
  {
    id: '3',
    name: 'David Kim',
    title: 'VP of Product',
    company: 'Stripe',
    location: 'Seattle, WA',
    email: 'david.kim@stripe.com',
    relationshipStrength: 5,
    lastInteraction: '1 week ago',
    interactions: 12,
    tags: ['Product', 'Payments', 'API'],
    status: 'moderate',
    goalMatch: 62,
    imageUrl: null,
    mutualConnections: 5,
    notes: 'Expert in payment infrastructure and API design.',
  },
  {
    id: '4',
    name: 'Emily Zhang',
    title: 'Engineering Manager',
    company: 'Meta',
    location: 'Menlo Park, CA',
    email: 'emily.zhang@meta.com',
    relationshipStrength: 3,
    lastInteraction: '3 months ago',
    interactions: 6,
    tags: ['Engineering', 'AI/ML', 'MIT'],
    status: 'dormant',
    goalMatch: 45,
    imageUrl: null,
    mutualConnections: 3,
    notes: 'Former colleague. Now leading AI initiatives at Meta.',
  },
  {
    id: '5',
    name: 'Alex Park',
    title: 'Research Scientist',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    email: 'alex.park@openai.com',
    relationshipStrength: 6,
    lastInteraction: 'Never',
    interactions: 0,
    tags: ['AI Research', 'LLMs', 'PhD'],
    status: 'potential',
    goalMatch: 88,
    imageUrl: null,
    mutualConnections: 4,
    notes: 'Mutual connection through Sarah. Working on GPT improvements.',
  },
];

const filterOptions = [
  { id: 'all', label: 'All Connections', count: 127 },
  { id: 'active', label: 'Active', count: 45 },
  { id: 'dormant', label: 'Dormant', count: 32 },
  { id: 'potential', label: 'Potential', count: 18 },
  { id: 'investors', label: 'Investors', count: 24 },
  { id: 'founders', label: 'Founders', count: 38 },
];

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTarget, setMessageTarget] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'moderate': return 'text-yellow-500 bg-yellow-500/10';
      case 'dormant': return 'text-gray-500 bg-gray-500/10';
      case 'potential': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 8) return 'bg-green-500';
    if (strength >= 5) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const handleMessageContact = (connection: any) => {
    setMessageTarget(connection);
    setShowMessageModal(true);
  };

  const handleViewProfile = (connection: any) => {
    setSelectedConnection(connection.id);
    // Scroll to show more details or expand the connection card
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Premium gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
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
                <h1 className="text-2xl font-bold">Connections</h1>
                <span className="text-sm text-gray-400">127 total</span>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* View Toggle */}
                <div className="flex items-center bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded transition-all",
                      viewMode === 'grid' ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 rounded transition-all",
                      viewMode === 'list' ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort */}
                <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all flex items-center space-x-2">
                  <SortAsc className="w-4 h-4" />
                  <span className="text-sm">Sort</span>
                </button>

                {/* AI Insights */}
                <button
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all flex items-center space-x-2",
                    showAIInsights ? "bg-blue-600 text-white" : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">AI Insights</span>
                </button>

                {/* Add Connection */}
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Connection</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition-all",
                      selectedFilter === filter.id
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    )}
                  >
                    {filter.label}
                    <span className="ml-1.5 text-xs opacity-70">({filter.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <AnimatePresence>
          {showAIInsights && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/10 bg-gray-900/50 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">AI-Powered Insights</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Reconnect Opportunity</p>
                    <p className="text-sm">David Kim hasn&apos;t been contacted in 3 weeks. He just became VP at Stripe - perfect time to congratulate.</p>
                    <button className="mt-3 text-xs text-blue-400 hover:text-blue-300">Draft Message →</button>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Introduction Match</p>
                    <p className="text-sm">Sarah Chen and Alex Park both work in AI and attended Stanford. 88% match for mutual benefit.</p>
                    <button className="mt-3 text-xs text-blue-400 hover:text-blue-300">Create Intro →</button>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Relationship at Risk</p>
                    <p className="text-sm">Emily Zhang interaction dropped 70%. Consider reaching out to maintain this valuable connection.</p>
                    <button className="mt-3 text-xs text-blue-400 hover:text-blue-300">Schedule Call →</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connections Grid/List */}
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockConnections.map((connection, index) => (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-5 hover:bg-gray-900/70 transition-all cursor-pointer group"
                  onClick={() => setSelectedConnection(connection.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {connection.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{connection.name}</h3>
                        <p className="text-xs text-gray-400">{connection.title}</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Company & Location */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Building className="w-3 h-3" />
                      <span>{connection.company}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{connection.location}</span>
                    </div>
                  </div>

                  {/* Relationship Strength */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Relationship</span>
                      <span className="text-gray-300">{connection.relationshipStrength}/10</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className={cn("h-full rounded-full transition-all", getStrengthColor(connection.relationshipStrength))}
                        style={{ width: `${connection.relationshipStrength * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-400">Last Contact</p>
                      <p className="text-sm font-medium">{connection.lastInteraction}</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-400">Goal Match</p>
                      <p className="text-sm font-medium text-green-500">{connection.goalMatch}%</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {connection.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleMessageContact(connection)}
                      className="flex-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all text-sm"
                    >
                      Message
                    </button>
                    <button className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {mockConnections.map((connection, index) => (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900/50 backdrop-blur-xl rounded-lg border border-white/10 p-4 hover:bg-gray-900/70 transition-all cursor-pointer"
                  onClick={() => setSelectedConnection(connection.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {connection.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-white">{connection.name}</h3>
                          <span className={cn("px-2 py-0.5 rounded-full text-xs", getStatusColor(connection.status))}>
                            {connection.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                          <span>{connection.title} at {connection.company}</span>
                          <span>•</span>
                          <span>{connection.location}</span>
                          <span>•</span>
                          <span>Last: {connection.lastInteraction}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{connection.relationshipStrength}/10</p>
                        <p className="text-xs text-gray-400">Strength</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-500">{connection.goalMatch}%</p>
                        <p className="text-xs text-gray-400">Match</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && messageTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {messageTarget.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{messageTarget.name}</h3>
                  <p className="text-sm text-gray-400">{messageTarget.company}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
                  <p className="text-sm text-blue-400 font-medium mb-1">AI Suggestion</p>
                  <p className="text-sm text-gray-300">
                    {`"Hi ${messageTarget.name.split(' ')[0]}, I noticed we're both passionate about ${messageTarget.tags[0]}. Would love to connect and explore potential synergies between our work!"`}
                  </p>
                </div>
                
                <textarea
                  placeholder="Write your message..."
                  className="w-full h-24 p-3 bg-white/5 border border-white/10 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement actual message sending
                      alert('Message sent! (Demo mode)');
                      setShowMessageModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all text-sm font-medium"
                  >
                    Send Message
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