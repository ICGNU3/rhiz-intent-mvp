'use client';

import React from 'react';
import { Navigation } from './components/navigation';
import { IntentCards } from './components/intent-cards';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Mic, Upload } from 'lucide-react';

export default function HomePage() {
  // Use the demo workspace ID for now
  const demoWorkspaceId = '550e8400-e29b-41d4-a716-446655440001';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="lg:ml-64">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Intent Cards
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                AI-powered insights and suggestions based on your networking goals
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Goal
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Record Voice Note
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Calendar
                </Button>
              </div>
            </div>

            {/* Intent Cards Section */}
            <div className="mb-8">
              <IntentCards workspaceId={demoWorkspaceId} />
            </div>

            {/* Getting Started Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Getting Started with Rhiz
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Mic className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">1. Record Voice Notes</h3>
                    <p className="text-sm text-gray-600">
                      Capture insights from meetings and conversations using our voice recorder
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">2. Upload Calendar</h3>
                    <p className="text-sm text-gray-600">
                      Import your calendar events to automatically extract attendees and context
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">3. Set Goals</h3>
                    <p className="text-sm text-gray-600">
                      Define your networking objectives and let AI find relevant connections
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
