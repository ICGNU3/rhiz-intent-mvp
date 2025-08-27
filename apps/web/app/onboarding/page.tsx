'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Upload, Mic, Target, Users, Zap, ArrowRight, 
  CheckCircle, Loader2, Calendar, FileText, Brain, TrendingUp,
  MessageCircle, Star, Award, Lightbulb
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { VoiceRecorder } from '@/app/components/voice-recorder';
import { CalendarUpload } from '@/app/components/calendar-upload';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
  completed: boolean;
  insights?: any[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [insights, setInsights] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showValue, setShowValue] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Rhiz',
      description: 'Your network intelligence platform. Let\'s get you set up in 2 minutes.',
      icon: Sparkles,
      action: 'Get Started',
      completed: false
    },
    {
      id: 'calendar',
      title: 'Upload Your Calendar',
      description: 'We\'ll analyze your meetings and extract valuable connections.',
      icon: Calendar,
      action: 'Upload ICS File',
      completed: false
    },
    {
      id: 'voice',
      title: 'Record a Voice Note',
      description: 'Tell us about your goals and we\'ll find the right people.',
      icon: Mic,
      action: 'Start Recording',
      completed: false
    },
    {
      id: 'insights',
      title: 'Your Network Insights',
      description: 'See what we discovered about your network.',
      icon: Brain,
      action: 'View Insights',
      completed: false,
      insights: []
    }
  ];

  const handleCalendarUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('calendar', file);
      formData.append('workspaceId', 'demo-workspace');

      const response = await fetch('/api/ingest/calendar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        steps[1].completed = true;
        setCurrentStep(2);
        
        // Add insights from calendar
        setInsights(prev => [...prev, {
          type: 'calendar',
          title: 'Calendar Analysis Complete',
          description: `Found ${result.events} meetings with ${result.people} people`,
          icon: Calendar,
          value: `${result.events} events processed`
        }]);
      }
    } catch (error) {
      console.error('Calendar upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceRecording = async (transcript: string) => {
    setIsProcessing(true);
    try {
      // Simulate voice processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      steps[2].completed = true;
      setCurrentStep(3);
      
      // Add insights from voice
      setInsights(prev => [...prev, {
        type: 'voice',
        title: 'Voice Analysis Complete',
        description: 'Extracted goals and opportunities from your voice note',
        icon: Mic,
        value: '3 goals identified'
      }]);
      
      setShowValue(true);
    } catch (error) {
      console.error('Voice processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold">Rhiz</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Set Up Your Network Intelligence
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get your first insights in under 2 minutes. No complex setup required.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-700'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <step.icon className="w-5 h-5 text-white" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < currentStep ? 'bg-blue-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
          >
            {currentStep === 0 && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Welcome to Rhiz</h2>
                <p className="text-gray-300 mb-8 max-w-md mx-auto">
                  We'll analyze your calendar and voice notes to reveal hidden opportunities in your network.
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Get Started
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Upload Your Calendar</h2>
                <p className="text-gray-300 mb-8">
                  Export your calendar as an ICS file and we'll extract all the valuable connections from your meetings.
                </p>
                
                {/* Demo file download */}
                <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-sm text-blue-200 mb-3">
                    Don't have a calendar file? Try our demo:
                  </p>
                  <a
                    href="/demo-calendar.ics"
                    download
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-200 hover:text-white transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Download Demo Calendar</span>
                  </a>
                </div>
                
                <CalendarUpload onUpload={handleCalendarUpload} />
                {isProcessing && (
                  <div className="mt-6 flex items-center justify-center space-x-2 text-blue-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing your calendar...</span>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Record a Voice Note</h2>
                <p className="text-gray-300 mb-8">
                  Tell us about your goals, challenges, or what you're looking for. We'll find the perfect people to help.
                </p>
                <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
                {isProcessing && (
                  <div className="mt-6 flex items-center justify-center space-x-2 text-orange-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing your voice note...</span>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Your Network Insights</h2>
                  <p className="text-gray-300">
                    Here's what we discovered about your network and opportunities.
                  </p>
                </div>

                {/* Insights Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-xl p-6 border border-white/10"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <insight.icon className="w-6 h-6 text-blue-400" />
                        <h3 className="font-semibold">{insight.title}</h3>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{insight.description}</p>
                      <div className="text-blue-400 font-medium">{insight.value}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Demo Insights */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-green-400">Network Strength</span>
                    </div>
                    <p className="text-sm text-gray-300">127 connections across 3 industries</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-blue-400">Goal Alignment</span>
                    </div>
                    <p className="text-sm text-gray-300">3 people match your fundraising goal</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-5 h-5 text-orange-400" />
                      <span className="font-semibold text-orange-400">Opportunities</span>
                    </div>
                    <p className="text-sm text-gray-300">12 high-value introduction opportunities</p>
                  </motion.div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleComplete}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Value Proposition */}
        {showValue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">🎉 You're All Set!</h3>
              <p className="text-gray-300 mb-4">
                Rhiz is now analyzing your network and will surface opportunities daily. 
                Check back tomorrow for your first personalized insights.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Network analyzed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Goals identified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Opportunities found</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
