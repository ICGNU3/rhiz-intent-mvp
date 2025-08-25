'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  MessageCircle,
  Search,
  Command,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Zap,
  Users,
  Target,
  Brain,
  Mic,
  Send,
  Plus,
  Minus,
  Filter,
  MapPin,
  Building,
  GraduationCap,
  Hash,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Grid3X3,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Expand,
  Shrink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PageNavigation } from '@/app/components/PageNavigation';

// Mock data for network visualization
const mockNetworkData = {
  nodes: [
    { id: 'you', name: 'You', x: 400, y: 300, type: 'self', strength: 10, color: '#3b82f6' },
    { id: '1', name: 'Sarah Chen', x: 250, y: 200, type: 'investor', strength: 8, color: '#10b981', lastSeen: '2h ago', company: 'Sequoia Capital', match: 95 },
    { id: '2', name: 'Mike Ross', x: 550, y: 180, type: 'founder', strength: 7, color: '#8b5cf6', lastSeen: '1d ago', company: 'TechCo', match: 78 },
    { id: '3', name: 'David Kim', x: 300, y: 400, type: 'advisor', strength: 5, color: '#f59e0b', lastSeen: '1w ago', company: 'Stripe', match: 62 },
    { id: '4', name: 'Emily Zhang', x: 500, y: 420, type: 'dormant', strength: 3, color: '#6b7280', lastSeen: '3m ago', company: 'Meta', match: 45 },
    { id: '5', name: 'Alex Park', x: 180, y: 350, type: 'potential', strength: 6, color: '#06b6d4', lastSeen: 'Never', company: 'OpenAI', match: 88 },
  ],
  edges: [
    { source: 'you', target: '1', strength: 8, type: 'strong' },
    { source: 'you', target: '2', strength: 7, type: 'strong' },
    { source: 'you', target: '3', strength: 5, type: 'moderate' },
    { source: 'you', target: '4', strength: 3, type: 'weak' },
    { source: '1', target: '2', strength: 6, type: 'potential', dashed: true },
    { source: '2', target: '5', strength: 8, type: 'potential', dashed: true },
  ]
};

const aiSuggestions = [
  { icon: Zap, text: "Sarah and Mike both mentioned Series B funding - perfect intro opportunity", action: "Draft intro" },
  { icon: Users, text: "You haven't talked to David in 3 weeks. He just became VP at Stripe", action: "Reconnect" },
  { icon: Target, text: "Alex from OpenAI matches 88% with your AI startup goal", action: "Request intro" },
];

export default function DashboardPage() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [command, setCommand] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'network' | 'list'>('network');
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New states for collapsible UI
  const [showTopBar, setShowTopBar] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showInsights, setShowInsights] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(420);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPanelWidth(Math.min(320, window.innerWidth - 32));
      } else {
        setPanelWidth(420);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle fullscreen mode
  useEffect(() => {
    const handleFullscreen = async () => {
      try {
        if (isFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else if (!isFullscreen && document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.log('Fullscreen not supported or user denied permission');
      }
    };
    handleFullscreen();
  }, [isFullscreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch(e.key) {
          case 'k':
            e.preventDefault();
            setShowAIPanel(!showAIPanel);
            break;
          case 'f':
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
            break;
          case 'b':
            e.preventDefault();
            setShowTopBar(!showTopBar);
            break;
          case 'i':
            e.preventDefault();
            setShowInsights(!showInsights);
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAIPanel, isFullscreen, showTopBar, showInsights]);

  // Simulate AI typing effect
  const typeMessage = useCallback((message: string) => {
    setIsTyping(true);
    setAiResponse('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < message.length) {
        setAiResponse(prev => prev + message[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);
  }, []);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && command.trim()) {
      setIsProcessing(true);
      
      // Simulate AI processing
      setTimeout(() => {
        if (command.toLowerCase().includes('investor')) {
          typeMessage("I found 3 investors in your network interested in AI. Sarah Chen from Sequoia is your strongest connection with 95% goal alignment. She just led a $10M round in an AI startup. Would you like me to draft an introduction?");
          setSelectedFilter('investor');
        } else if (command.toLowerCase().includes('reconnect')) {
          typeMessage("David Kim at Stripe is your best reconnection opportunity. You had strong rapport 3 weeks ago discussing API infrastructure. He just became VP of Product - a congratulations message could rekindle this valuable connection.");
          setActiveNode('3');
        } else if (command.toLowerCase().includes('introduce')) {
          typeMessage("Sarah and Mike would be a perfect match! Both are Stanford GSB alumni passionate about sustainable tech. Sarah needs technical expertise for due diligence, Mike is looking for Series B funding. Shall I draft a mutual benefit introduction?");
        } else {
          typeMessage("I can help you navigate your network. Try commands like 'Show me investors', 'Who should I reconnect with?', or 'Find introduction opportunities'.");
        }
        setIsProcessing(false);
      }, 800);
      
      setCommand('');
    }
  };

  const filters = [
    { id: 'investor', label: 'Investors', icon: Target, color: 'text-green-500' },
    { id: 'founder', label: 'Founders', icon: Users, color: 'text-purple-500' },
    { id: 'advisor', label: 'Advisors', icon: Brain, color: 'text-amber-500' },
    { id: 'location', label: 'Location', icon: MapPin, color: 'text-blue-500' },
    { id: 'company', label: 'Company', icon: Building, color: 'text-pink-500' },
    { id: 'school', label: 'Alumni', icon: GraduationCap, color: 'text-indigo-500' },
  ];

  // Handle user interactions
  const handleMessageContact = (node: any) => {
    setAiResponse('');
    setCommand(`Message ${node.name}`);
    typeMessage(`🎯 Ready to message ${node.name} at ${node.company}! I'll help you draft a personalized message. What would you like to discuss? Consider mentioning your shared interest in ${node.type === 'investor' ? 'AI investments' : 'tech innovation'} or mutual connections.`);
    setActiveNode(null);
    // Ensure the AI panel is visible
    setShowAIPanel(true);
  };

  const handleViewProfile = (node: any) => {
    // Show immediate feedback in AI panel first
    setAiResponse('');
    typeMessage(`📋 Loading ${node.name}'s profile... Redirecting to connections page with detailed view.`);
    
    // Navigate to connections page with this person selected
    setTimeout(() => {
      window.location.href = `/connections?selected=${node.id}`;
    }, 2000); // Increased delay to see the alert first
  };

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      {/* Premium gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Page Navigation */}
      <PageNavigation />

      {/* Main Content - Full Width */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Navigation Bar - Collapsible */}
        <AnimatePresence>
          {showTopBar && (
            <motion.div 
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className="border-b border-white/10 backdrop-blur-xl bg-black/50"
            >
              <div className="px-4 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Rhiz</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Network Health</span>
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className={cn(
                      "w-2 h-4 rounded-sm",
                      i <= 4 ? "bg-green-500" : "bg-gray-600"
                    )} />
                  ))}
                </div>
                <span className="text-green-500 font-medium ml-2">Strong</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-sm">
                <Link href="/connections" className="flex items-center space-x-2 hover:text-blue-400 transition-colors cursor-pointer">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 hover:text-blue-400">127 connections</span>
                </Link>
                <Link href="/goals" className="flex items-center space-x-2 hover:text-green-400 transition-colors cursor-pointer">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 hover:text-green-400">3 active goals</span>
                </Link>
                <Link href="/opportunities" className="flex items-center space-x-2 hover:text-orange-400 transition-colors cursor-pointer">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 hover:text-orange-400">12 opportunities</span>
                </Link>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('network')}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-all",
                    viewMode === 'network' ? "bg-white/10 text-white" : "text-gray-400"
                  )}
                >
                  Network
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-all",
                    viewMode === 'list' ? "bg-white/10 text-white" : "text-gray-400"
                  )}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </motion.div>
          )}
        </AnimatePresence>
        
        {/* Toggle Top Bar Button */}
        <button
          onClick={() => setShowTopBar(!showTopBar)}
          className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30 p-1 bg-white/10 backdrop-blur-xl rounded-lg hover:bg-white/20 transition-all"
        >
          {showTopBar ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Main Dashboard Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Network Visualization - Now Fullscreen */}
          <div className={cn(
            "flex-1 relative transition-all duration-300",
            !showAIPanel && "w-full"
          )} ref={canvasRef}>
            {/* Filter Bar */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-2 left-2 md:top-4 md:left-4 z-20"
            >
              <div className="flex items-center space-x-1 md:space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-2 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-xl rounded-lg text-xs md:text-sm font-medium hover:bg-white/20 transition-all flex items-center space-x-1 md:space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="flex space-x-2 overflow-hidden"
                    >
                      {filters.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setSelectedFilter(selectedFilter === filter.id ? null : filter.id)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2",
                            selectedFilter === filter.id 
                              ? "bg-white/20 text-white" 
                              : "bg-white/10 text-gray-300 hover:bg-white/15"
                          )}
                        >
                          <filter.icon className={cn("w-4 h-4", filter.color)} />
                          <span>{filter.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Zoom & View Controls */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-4 right-4 z-20 flex flex-col space-y-2"
            >
              <button 
                onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
                className="p-2 bg-white/10 backdrop-blur-xl rounded-lg hover:bg-white/20 transition-all"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
                className="p-2 bg-white/10 backdrop-blur-xl rounded-lg hover:bg-white/20 transition-all"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(1)}
                className="p-2 bg-white/10 backdrop-blur-xl rounded-lg hover:bg-white/20 transition-all"
                title="Reset Zoom"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-white/10 backdrop-blur-xl rounded-lg hover:bg-white/20 transition-all"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="p-2 bg-white/10 backdrop-blur-xl rounded-lg hover:bg-white/20 transition-all"
                title={showAIPanel ? "Hide AI Panel" : "Show AI Panel"}
              >
                {showAIPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </button>
            </motion.div>

            {/* Network Graph */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: zoomLevel,
                  x: mousePosition.x,
                  y: mousePosition.y,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 30 }}
                className="relative"
                style={{ width: '800px', height: '600px' }}
              >
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  {mockNetworkData.edges.map((edge, i) => {
                    const source = mockNetworkData.nodes.find(n => n.id === edge.source);
                    const target = mockNetworkData.nodes.find(n => n.id === edge.target);
                    if (!source || !target) return null;
                    
                    return (
                      <motion.line
                        key={i}
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={edge.dashed ? '#9ca3af' : '#4b5563'}
                        strokeWidth={edge.strength / 3}
                        strokeDasharray={edge.dashed ? "5,5" : "0"}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="opacity-30 hover:opacity-60 transition-opacity"
                      />
                    );
                  })}
                </svg>

                {/* Network Nodes */}
                {mockNetworkData.nodes.map((node, i) => (
                  <motion.div
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                    className="absolute"
                    style={{ 
                      left: node.x - 20, 
                      top: node.y - 20,
                    }}
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveNode(activeNode === node.id ? null : node.id);
                      }}
                      className={cn(
                        "relative group",
                        activeNode === node.id && "z-50"
                      )}
                    >
                      {/* Node Circle */}
                      <div
                        className={cn(
                          "rounded-full border-2 shadow-2xl transition-all duration-300",
                          node.type === 'self' ? 'w-12 h-12' : 'w-10 h-10',
                          activeNode === node.id && "scale-125 shadow-xl"
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${node.color}dd, ${node.color}99)`,
                          borderColor: node.color,
                        }}
                      >
                        {/* Pulse animation for high-value connections */}
                        {node.match && node.match > 80 && (
                          <div className="absolute inset-0 rounded-full animate-ping opacity-30" 
                            style={{ backgroundColor: node.color }} 
                          />
                        )}
                        
                        {/* Inner gradient */}
                        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                      </div>

                      {/* Node Label */}
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-300">
                          {node.name}
                        </div>
                        {node.match && (
                          <div className="text-xs text-gray-500 text-center">
                            {node.match}% match
                          </div>
                        )}
                      </div>

                      {/* Action Card - Now shows immediately when node is active */}
                      <AnimatePresence>
                        {activeNode === node.id && node.id !== 'you' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50"
                          >
                            <div className="bg-gray-900/95 backdrop-blur-xl rounded-lg p-4 shadow-2xl border border-blue-500/20 w-64">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-white">{node.name}</h3>
                                  <p className="text-sm text-gray-400">{node.company}</p>
                                  <div className="text-xs text-blue-400 mt-1">● Active Connection</div>
                                </div>
                                <div className="text-xs text-gray-500">{node.lastSeen}</div>
                              </div>
                              
                              <div className="space-y-2 mb-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Relationship</span>
                                  <div className="flex space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <div key={i} className={cn(
                                        "w-2 h-2 rounded-full",
                                        i < Math.ceil(node.strength / 2) 
                                          ? "bg-green-500" 
                                          : "bg-gray-600"
                                      )} />
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Goal Match</span>
                                  <span className="text-green-500 font-medium">{node.match}%</span>
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMessageContact(node);
                                  }}
                                  className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                                >
                                  Message
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleViewProfile(node);
                                  }}
                                  className="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors"
                                >
                                  View Profile
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* AI Suggestions Overlay - Collapsible */}
            <AnimatePresence>
              {showInsights && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute bottom-4 left-4 z-10"
                  style={{ 
                    right: showAIPanel ? `${Math.min(panelWidth, window.innerWidth - 32) + 16}px` : '16px',
                    transition: 'right 0.3s ease-in-out'
                  }}
                >
                  <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                    {/* Collapsible Header */}
                    <button
                      onClick={() => setShowInsights(false)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">AI Insights</span>
                        <span className="text-xs text-gray-400">({aiSuggestions.length} suggestions)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to minimize
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    </button>
                    
                    {/* Insights Content */}
                    <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-3">
                      {aiSuggestions.map((suggestion, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <suggestion.icon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-300">{suggestion.text}</span>
                          </div>
                          <button className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {suggestion.action}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Toggle Insights Button - Minimized State */}
            {!showInsights && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInsights(true)}
                className="absolute bottom-4 left-4 px-3 py-2 bg-gray-900/90 backdrop-blur-xl rounded-lg hover:bg-gray-800/90 transition-all flex items-center space-x-2 border border-white/10 group"
              >
                <Brain className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">AI Insights</span>
                <span className="text-xs text-gray-400">({aiSuggestions.length})</span>
                <ChevronUp className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
              </motion.button>
            )}
          </div>

          {/* AI Command Center (Right Side - Collapsible) */}
          <AnimatePresence>
            {showAIPanel && (
              <motion.div 
                initial={{ x: 420, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 420, opacity: 0 }}
                className="border-l border-white/10 bg-black/50 backdrop-blur-xl flex flex-col"
                style={{ width: `${Math.min(panelWidth, window.innerWidth - 32)}px` }}
              >
            {/* Command Input */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold">AI Assistant</h2>
                  <p className="text-xs text-gray-400">Ask anything about your network</p>
                </div>
              </div>

              <div className="relative">
                <Command className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={handleCommand}
                  placeholder="Type a command or question..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                />
                {isProcessing && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                )}
              </div>

              {/* Quick Commands */}
              <div className="flex flex-wrap gap-2 mt-3">
                {['Show investors', 'Find intros', 'Who to reconnect'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => setCommand(cmd)}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs text-gray-400 hover:text-white transition-all"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Response Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {aiResponse}
                        </p>
                        {isTyping && (
                          <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Welcome Message */}
              {!aiResponse && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Your Network Intelligence</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    I analyze relationships, suggest connections, and help you achieve your networking goals
                  </p>
                  
                  <div className="space-y-3 text-left max-w-sm mx-auto">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs font-medium text-gray-300 mb-1">Try asking:</p>
                      <p className="text-sm text-gray-400">&ldquo;Who in my network can help with fundraising?&rdquo;</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs font-medium text-gray-300 mb-1">Or command:</p>
                      <p className="text-sm text-gray-400">&ldquo;Show me dormant connections to revive&rdquo;</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2">
                  <Mic className="w-4 h-4" />
                  <span>Voice</span>
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </motion.div>
            )}
          </AnimatePresence>
          
          {/* Resize Handle for AI Panel */}
          {showAIPanel && (
            <div 
              className="absolute right-[420px] top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-20"
              onMouseDown={(e) => {
                const startX = e.pageX;
                const startWidth = panelWidth;
                
                const handleMouseMove = (e: MouseEvent) => {
                  const delta = startX - e.pageX;
                  const newWidth = Math.min(Math.max(300, startWidth + delta), 800);
                  setPanelWidth(newWidth);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}