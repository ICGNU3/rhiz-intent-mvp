'use client';

import React from 'react';
import { Navigation } from './components/navigation';
import { IntentCards } from './components/intent-cards';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Mic, Upload, ChevronRight, Zap, Calendar, MessageSquare } from 'lucide-react';

export default function HomePageOption3() {
  // Use the demo workspace ID for now
  const demoWorkspaceId = '550e8400-e29b-41d4-a716-446655440001';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="lg:ml-64">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Simple Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome back
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your networking goals
            </p>
          </div>

          {/* Intent Cards - Main Focus */}
          <div className="mb-12">
            <IntentCards workspaceId={demoWorkspaceId} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mic className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Record Voice Note</h3>
                      <p className="text-sm text-gray-600">Capture meeting insights</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Upload Calendar</h3>
                      <p className="text-sm text-gray-600">Import your events</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Create Goal</h3>
                      <p className="text-sm text-gray-600">Set new objective</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New suggestion created</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Voice note processed</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Goal updated</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Goals</span>
                    <span className="font-semibold text-gray-900">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Network Size</span>
                    <span className="font-semibold text-gray-900">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Suggestions</span>
                    <span className="font-semibold text-gray-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="font-semibold text-gray-900">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Ready to accelerate your networking?</h3>
                </div>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start by creating your first goal or uploading some data to see Rhiz in action.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Goal
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    View Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
