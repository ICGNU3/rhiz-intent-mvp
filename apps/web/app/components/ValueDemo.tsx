'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Target, Zap, TrendingUp, MessageCircle, 
  Calendar, Brain, Star, ArrowRight, CheckCircle
} from 'lucide-react';

interface ValueDemoProps {
  onComplete: () => void;
}

export function ValueDemo({ onComplete }: ValueDemoProps) {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const demos = [
    {
      title: "Network Intelligence",
      description: "Rhiz analyzes your connections and reveals hidden opportunities",
      icon: Brain,
      features: [
        "127 connections analyzed",
        "12 high-value opportunities found",
        "3 dormant relationships identified"
      ],
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Goal-Driven Matching",
      description: "Find the perfect people to help achieve your objectives",
      icon: Target,
      features: [
        "3 people match your fundraising goal",
        "8 potential advisors identified",
        "5 industry experts in your network"
      ],
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Proactive Insights",
      description: "Never miss an opportunity with daily intelligence updates",
      icon: Zap,
      features: [
        "Daily opportunity alerts",
        "Relationship health monitoring",
        "Career milestone notifications"
      ],
      color: "from-orange-500 to-red-600"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (currentDemo < demos.length - 1) {
          setCurrentDemo(prev => prev + 1);
        } else {
          onComplete();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentDemo, isVisible, demos.length, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-2xl w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDemo}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className={`w-20 h-20 bg-gradient-to-r ${demos[currentDemo].color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              {(() => {
                const IconComponent = demos[currentDemo].icon;
                return <IconComponent className="w-10 h-10 text-white" />;
              })()}
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-white">
              {demos[currentDemo].title}
            </h2>
            
            <p className="text-gray-300 mb-8">
              {demos[currentDemo].description}
            </p>

            <div className="space-y-3 mb-8">
              {demos[currentDemo].features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 text-left"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-200">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <div className="flex space-x-1">
                {demos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentDemo ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2">
                {currentDemo + 1} of {demos.length}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 text-center">
          <button
            onClick={onComplete}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Skip demo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
