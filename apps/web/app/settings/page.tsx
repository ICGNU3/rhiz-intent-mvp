'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, User, Bell, Shield, Palette, Zap, 
  Database, Download, Upload, Trash2, Key, Mail, Smartphone,
  Globe, Moon, Sun, Monitor, Check, X, AlertTriangle,
  Sparkles, Brain, MessageSquare, Calendar, Link2, Github,
  Slack, Twitter, Linkedin, Chrome, Save, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SettingsSection {
  id: string;
  title: string;
  icon: any;
  color: string;
}

const settingSections: SettingsSection[] = [
  { id: 'profile', title: 'Profile', icon: User, color: 'from-blue-500 to-cyan-500' },
  { id: 'notifications', title: 'Notifications', icon: Bell, color: 'from-green-500 to-emerald-500' },
  { id: 'privacy', title: 'Privacy & Security', icon: Shield, color: 'from-red-500 to-rose-500' },
  { id: 'appearance', title: 'Appearance', icon: Palette, color: 'from-purple-500 to-violet-500' },
  { id: 'ai', title: 'AI & Automation', icon: Brain, color: 'from-orange-500 to-amber-500' },
  { id: 'integrations', title: 'Integrations', icon: Link2, color: 'from-teal-500 to-cyan-500' },
  { id: 'data', title: 'Data & Export', icon: Database, color: 'from-indigo-500 to-blue-500' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    digest: true
  });
  const [aiSettings, setAiSettings] = useState({
    autoSuggestions: true,
    smartIntros: true,
    opportunityAlerts: true,
    weeklyInsights: true
  });
  const [hasChanges, setHasChanges] = useState(false);

  const integrations = [
    { name: 'LinkedIn', icon: Linkedin, connected: true, color: 'bg-blue-600' },
    { name: 'Google Calendar', icon: Calendar, connected: true, color: 'bg-green-600' },
    { name: 'Gmail', icon: Mail, connected: false, color: 'bg-red-600' },
    { name: 'Slack', icon: Slack, connected: true, color: 'bg-purple-600' },
    { name: 'GitHub', icon: Github, connected: false, color: 'bg-gray-600' },
    { name: 'Twitter', icon: Twitter, connected: false, color: 'bg-sky-500' },
  ];

  const handleSave = () => {
    // Mock save functionality
    setHasChanges(false);
    // Show success toast
  };

  const handleReset = () => {
    // Reset to default values
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6"
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-sm text-gray-400">Customize your experience</p>
            </div>
          </div>

          <nav className="space-y-2">
            {settingSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    isActive 
                      ? `bg-gradient-to-br ${section.color}` 
                      : "bg-white/10 group-hover:bg-white/20"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{section.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="mt-8 space-y-3">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header with Save/Reset */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {settingSections.find(s => s.id === activeSection)?.title}
                </h2>
                <p className="text-gray-400">
                  Manage your {settingSections.find(s => s.id === activeSection)?.title.toLowerCase()} preferences
                </p>
              </div>

              <AnimatePresence>
                {hasChanges && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center space-x-3"
                  >
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-2 inline" />
                      Reset
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content Sections */}
            <AnimatePresence mode="wait">
              {activeSection === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue="Alex Johnson"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          onChange={() => setHasChanges(true)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue="alex@example.com"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          onChange={() => setHasChanges(true)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Bio</label>
                        <textarea
                          rows={3}
                          defaultValue="Product designer and entrepreneur passionate about building meaningful connections in the tech industry."
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                          onChange={() => setHasChanges(true)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Professional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Job Title</label>
                        <input
                          type="text"
                          defaultValue="Senior Product Designer"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          onChange={() => setHasChanges(true)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Company</label>
                        <input
                          type="text"
                          defaultValue="TechCorp Inc"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          onChange={() => setHasChanges(true)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {Object.entries({
                    'Email Notifications': { key: 'email', desc: 'Receive updates and alerts via email' },
                    'Push Notifications': { key: 'push', desc: 'Get real-time notifications on your device' },
                    'SMS Notifications': { key: 'sms', desc: 'Receive important alerts via text message' },
                    'Weekly Digest': { key: 'digest', desc: 'Get a summary of your network activity' }
                  }).map(([title, { key, desc }]) => (
                    <div key={key} className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{desc}</p>
                        </div>
                        <button
                          onClick={() => {
                            setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }));
                            setHasChanges(true);
                          }}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all duration-200 relative",
                            notifications[key as keyof typeof notifications] ? "bg-blue-600" : "bg-white/20"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200",
                            notifications[key as keyof typeof notifications] ? "translate-x-6" : "translate-x-0.5"
                          )} />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeSection === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-xl rounded-xl p-6 border border-blue-600/20">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">AI-Powered Networking</h3>
                        <p className="text-gray-300 mb-4">
                          Let our AI help you discover connections, craft perfect introductions, and identify opportunities automatically.
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-400">AI Active</span>
                          </div>
                          <div className="text-gray-400">156 insights generated this week</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {Object.entries({
                    'Smart Suggestions': { key: 'autoSuggestions', desc: 'Get AI-powered connection recommendations' },
                    'Intelligent Introductions': { key: 'smartIntros', desc: 'Auto-generate personalized introduction messages' },
                    'Opportunity Alerts': { key: 'opportunityAlerts', desc: 'Be notified when new networking opportunities arise' },
                    'Weekly Insights': { key: 'weeklyInsights', desc: 'Receive AI analysis of your network growth' }
                  }).map(([title, { key, desc }]) => (
                    <div key={key} className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{desc}</p>
                        </div>
                        <button
                          onClick={() => {
                            setAiSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof aiSettings] }));
                            setHasChanges(true);
                          }}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all duration-200 relative",
                            aiSettings[key as keyof typeof aiSettings] ? "bg-blue-600" : "bg-white/20"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200",
                            aiSettings[key as keyof typeof aiSettings] ? "translate-x-6" : "translate-x-0.5"
                          )} />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeSection === 'integrations' && (
                <motion.div
                  key="integrations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {integrations.map((integration) => {
                      const Icon = integration.icon;
                      return (
                        <div key={integration.name} className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", integration.color)}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{integration.name}</h3>
                                <p className="text-sm text-gray-400">
                                  {integration.connected ? 'Connected' : 'Not connected'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {integration.connected ? (
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                              ) : (
                                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                              )}
                            </div>
                          </div>
                          <button
                            className={cn(
                              "w-full py-2 px-4 rounded-lg text-sm font-medium transition-all",
                              integration.connected
                                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                          >
                            {integration.connected ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeSection === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'light', icon: Sun, label: 'Light' },
                        { key: 'dark', icon: Moon, label: 'Dark' },
                        { key: 'system', icon: Monitor, label: 'System' }
                      ].map((themeOption) => {
                        const Icon = themeOption.icon;
                        const isActive = theme === themeOption.key;
                        return (
                          <button
                            key={themeOption.key}
                            onClick={() => {
                              setTheme(themeOption.key);
                              setHasChanges(true);
                            }}
                            className={cn(
                              "p-4 rounded-xl border transition-all",
                              isActive 
                                ? "border-blue-500 bg-blue-500/10" 
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            )}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">{themeOption.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}