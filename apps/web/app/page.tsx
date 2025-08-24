'use client';

import React from 'react';
import { Navigation } from './components/navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="lg:ml-64">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Rhiz
              </h1>
              <p className="text-lg text-gray-600">
                Your AI-powered networking assistant
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Voice Chat</h3>
                <p className="text-gray-600 mb-4">
                  Have natural conversations with your AI assistant using voice for networking insights.
                </p>
                <a 
                  href="/voice-chat" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Voice Chat
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Text Chat</h3>
                <p className="text-gray-600 mb-4">
                  Chat with your AI assistant via text for quick networking insights and suggestions.
                </p>
                <a 
                  href="/chat" 
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Open Chat
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2">People</h3>
                <p className="text-gray-600 mb-4">
                  Manage your network contacts and track relationships.
                </p>
                <a 
                  href="/people" 
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  View People
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
