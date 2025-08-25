'use client';

import React, { useState } from 'react';
import { Navigation } from './components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  Download, 
  Send, 
  Mic, 
  Paperclip,
  Users,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function HomePage() {
  const [chatMessage, setChatMessage] = useState('');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Implement AI chat functionality
      console.log('Sending message:', chatMessage);
      setChatMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Network Overview</h1>
              <Badge variant="secondary">127 connections</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search people..." 
                  className="pl-10 w-64"
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                {viewMode.toUpperCase()}
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Network Graph (60% of screen) */}
          <div className="flex-1 border-r">
            <div className="h-full relative bg-gradient-to-br from-blue-50/50 to-purple-50/50">
              {/* Graph Controls */}
              <div className="absolute top-4 left-4 z-10 flex space-x-2">
                <Button size="sm" variant="outline">Zoom</Button>
                <Button size="sm" variant="outline">Pan</Button>
                <Button size="sm" variant="outline">Reset</Button>
                <Button size="sm" variant="outline">Fullscreen</Button>
              </div>

              {/* Network Graph Visualization */}
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-8">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Interactive Network Graph
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Visualize your network relationships, connections, and opportunities. 
                      Click on nodes to see details, drag to reorganize, and use the AI chat below to explore.
                    </p>
                  </div>
                  
                  {/* Placeholder Graph Nodes */}
                  <div className="relative w-96 h-64 mx-auto">
                    {/* Central Node */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                      </div>
                      <div className="text-xs text-center mt-2 font-medium">You</div>
                    </div>
                    
                    {/* Connected Nodes */}
                    <div className="absolute top-8 left-16">
                      <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
                      </div>
                      <div className="text-xs text-center mt-1">Sarah</div>
                    </div>
                    
                    <div className="absolute top-8 right-16">
                      <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                      </div>
                      <div className="text-xs text-center mt-1">Mike</div>
                    </div>
                    
                    <div className="absolute bottom-8 left-20">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
                      </div>
                      <div className="text-xs text-center mt-1">David</div>
                    </div>
                    
                    <div className="absolute bottom-8 right-20">
                      <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-red-400 to-red-600"></div>
                      </div>
                      <div className="text-xs text-center mt-1">Emily</div>
                    </div>
                    
                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line x1="50%" y1="50%" x2="25%" y2="15%" stroke="#3b82f6" strokeWidth="2" opacity="0.6"/>
                      <line x1="50%" y1="50%" x2="75%" y2="15%" stroke="#8b5cf6" strokeWidth="2" opacity="0.6"/>
                      <line x1="50%" y1="50%" x2="30%" y2="85%" stroke="#eab308" strokeWidth="2" opacity="0.6"/>
                      <line x1="50%" y1="50%" x2="70%" y2="85%" stroke="#ef4444" strokeWidth="2" opacity="0.6"/>
                    </svg>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-500">
                    <p>🎯 Green: High goal alignment • 🟣 Purple: Key connectors • 🟡 Yellow: Moderate alignment • 🔴 Red: Dormant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Chat Interface (40% of screen) */}
          <div className="w-96 flex flex-col">
            {/* Chat Header */}
            <div className="border-b p-4">
              <h3 className="font-semibold text-gray-900 mb-1">AI Assistant</h3>
              <p className="text-sm text-gray-600">Ask questions about your network and get intelligent insights</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-medium">AI</span>
                </div>
                <div className="flex-1">
                  <div className="bg-blue-50 rounded-lg p-3">
                                          <p className="text-sm text-gray-900">
                        I noticed Sarah and Mike both mentioned sustainable investing. They&apos;re both Stanford alums. Should I suggest an introduction?
                      </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 justify-end">
                <div className="flex-1 text-right">
                  <div className="bg-gray-100 rounded-lg p-3 inline-block">
                    <p className="text-sm text-gray-900">
                      Yes, draft the intro
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-medium">You</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-medium">AI</span>
                </div>
                <div className="flex-1">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900 mb-2">
                      *Graph highlights connection* Here's a draft:
                    </p>
                    <div className="bg-white rounded border p-3 text-sm">
                      <p className="text-gray-700">
                        &ldquo;Hi Sarah and Mike! I think you&apos;d both enjoy connecting. You&apos;re both passionate about sustainable investing and Stanford alumni. Sarah, Mike has been building some interesting AI-powered ESG solutions. Mike, Sarah just led a $10M round in a climate tech startup. Would love to introduce you both!&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-medium">AI</span>
                </div>
                <div className="flex-1">
                  <div className="bg-blue-50 rounded-lg p-3">
                                          <p className="text-sm text-gray-900">
                        💡 <strong>Pro tip:</strong> Try asking &ldquo;Who should I reconnect with?&rdquo; or &ldquo;Show me investors interested in AI&rdquo; to explore your network more effectively.
                      </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Mic className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type a command or question..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
