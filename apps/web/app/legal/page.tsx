import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Legal & Privacy</h1>
          <p className="text-gray-600 mt-2">
            Your data protection and privacy rights
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Learn how we collect, use, and protect your personal information.
              </p>
              <Link href="/privacy">
                <Button variant="outline">View Privacy Policy</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Understand our security measures and data protection practices.
              </p>
              <Link href="/security">
                <Button variant="outline">View Security Policy</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your rights under GDPR and other privacy regulations.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Right to access your data</li>
                <li>• Right to rectification</li>
                <li>• Right to erasure</li>
                <li>• Right to data portability</li>
                <li>• Right to object to processing</li>
              </ul>
              <Button variant="outline">Contact Data Protection Officer</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consent Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage your consent preferences and data processing permissions.
              </p>
              <Button variant="outline">Manage Consent</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Protection Officer</h4>
                  <p className="text-sm text-gray-600">dpo@rhiz.ai</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Legal Team</h4>
                  <p className="text-sm text-gray-600">legal@rhiz.ai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
