'use client';

import React from 'react';
import { Navigation } from './components/navigation';
import { IntentCards } from './components/intent-cards';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Mic, Upload, ArrowRight, Sparkles, Target, Users } from 'lucide-react';

export default function HomePageOption2() {
  // Use the demo workspace ID for now
  const demoWorkspaceId = '550e8400-e29b-41d4-a716-446655440001';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="lg:ml-64">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">AI-Powered Networking</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Turn Your Goals Into
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Connections</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Rhiz captures insights from your conversations and calendar, then uses AI to find the perfect introductions for your networking goals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Goal
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Try Voice Note
                </Button>
              </div>
            </div>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Goal-Driven</h3>
                <p className="text-gray-600">Everything revolves around your networking objectives</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Intelligence</h3>
                <p className="text-gray-600">Capture insights naturally through voice notes</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Matching</h3>
                <p className="text-gray-600">AI finds the perfect connections for you</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Intent Cards Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Intent Cards</h2>
                <p className="text-lg text-gray-600">AI-powered insights and suggestions for your goals</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Calendar
                </Button>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Goal
                </Button>
              </div>
            </div>
            
            <IntentCards workspaceId={demoWorkspaceId} />
          </div>

          {/* How It Works */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Rhiz Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">1</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Capture Insights</h4>
                  <p className="text-gray-600 text-sm">
                    Record voice notes or upload your calendar to capture relationship data
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">2</div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
                  <p className="text-gray-600 text-sm">
                    Our AI extracts people, goals, and opportunities from your data
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">3</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Get Introductions</h4>
                  <p className="text-gray-600 text-sm">
                    Receive personalized introduction suggestions with AI-drafted messages
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
