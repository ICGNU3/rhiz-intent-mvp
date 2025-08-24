'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Copy, Mail, Check, AlertCircle } from 'lucide-react';

export default function SharePage() {
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [emailDraft, setEmailDraft] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Mock people data
  const mockPeople = [
    {
      id: 'person-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@stripe.com',
      role: 'CTO',
      company: 'Stripe'
    },
    {
      id: 'person-2',
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@netflix.com',
      role: 'Senior Engineer',
      company: 'Netflix'
    },
    {
      id: 'person-3',
      name: 'Lisa Thompson',
      email: 'lisa.thompson@airbnb.com',
      role: 'Product Manager',
      company: 'Airbnb'
    }
  ];

  const handleGenerateEmail = async () => {
    if (!selectedPerson || !purpose) return;

    try {
      const response = await fetch('/api/chat/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personId: selectedPerson,
          purpose
        })
      });

      const data = await response.json();
      if (data.success) {
        setEmailDraft(data.emailDraft);
      }
    } catch (error) {
      console.error('Failed to generate email:', error);
    }
  };

  const handleCopyEmail = async () => {
    if (!emailDraft) return;

    const emailText = `To: ${emailDraft.to}\nSubject: ${emailDraft.subject}\n\n${emailDraft.body}`;
    
    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSendEmail = () => {
    if (!emailDraft) return;

    const mailtoLink = `mailto:${emailDraft.to}?subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`;
    window.open(mailtoLink);
  };

  const selectedPersonData = mockPeople.find(p => p.id === selectedPerson);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Share with Rhiz</h1>
          <p className="text-gray-600">
            Generate an email invite to help your contacts get introduced to relevant people in your network.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPeople.map((person) => (
                    <div
                      key={person.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPerson === person.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPerson(person.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{person.name}</div>
                          <div className="text-sm text-gray-500">
                            {person.role} at {person.company}
                          </div>
                          <div className="text-xs text-gray-400">{person.email}</div>
                        </div>
                        {selectedPerson === person.id && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Purpose</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Find investors, Hire engineers, Get customers"
                  className="mb-4"
                />
                <Button 
                  onClick={handleGenerateEmail}
                  disabled={!selectedPerson || !purpose}
                  className="w-full"
                >
                  Generate Email
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Email Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {emailDraft ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>To:</strong> {emailDraft.to}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        <strong>Subject:</strong> {emailDraft.subject}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {emailDraft.body}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCopyEmail}
                        variant="outline"
                        className="flex-1"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy to Clipboard
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleSendEmail}
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send via Mail Client
                      </Button>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <strong>Note:</strong> Email replies will appear in your Rhiz chat once the inbound webhook is connected.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a contact and purpose to generate an email draft.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedPersonData && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {selectedPersonData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedPersonData.name}</div>
                      <div className="text-sm text-gray-500">
                        {selectedPersonData.role} at {selectedPersonData.company}
                      </div>
                      <div className="text-xs text-gray-400">{selectedPersonData.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
