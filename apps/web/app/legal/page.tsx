import { Navigation } from '@/app/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Legal</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2>Privacy Policy</h2>
            <p>
              This privacy policy describes how we collect, use, and protect your personal information.
            </p>
            
            <h2>Terms of Service</h2>
            <p>
              By using our service, you agree to these terms and conditions.
            </p>
            
            <h2>Data Processing</h2>
            <p>
              We process your data in accordance with applicable privacy laws and regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
