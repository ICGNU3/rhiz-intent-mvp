export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="text-sm text-gray-600 mb-6">
              <p><strong>Effective Date:</strong> December 25, 2024</p>
              <p><strong>Last Updated:</strong> December 25, 2024</p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Rhiz (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and personal data. 
                This Privacy Policy explains how we collect, use, process, and protect your information when you use 
                our AI-powered relationship intelligence platform (the &quot;Service&quot;). This policy applies to all 
                users of our platform and covers both personal and professional relationship data processing.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By using our Service, you acknowledge that you have read, understood, and agree to be bound by 
                this Privacy Policy. If you do not agree with our practices, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">We collect the following types of personal information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Account Information:</strong> Name, email address, phone number, profile photo, and professional title</li>
                <li><strong>Authentication Data:</strong> Login credentials, OAuth tokens from third-party services</li>
                <li><strong>Profile Information:</strong> Professional background, goals, interests, and networking preferences</li>
                <li><strong>Contact Information:</strong> Email addresses, phone numbers, and social media profiles of your contacts</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">2.2 Voice and Audio Data</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Important:</strong> Voice recordings are considered Personally Identifiable Information (PII) 
                under GDPR and personal information under CCPA, as they can reveal gender, ethnic origin, health conditions, 
                and other sensitive characteristics.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Voice Recordings:</strong> Audio recordings of conversations, meetings, and voice notes</li>
                <li><strong>Transcripts:</strong> AI-generated text transcriptions of audio content</li>
                <li><strong>Voice Metadata:</strong> Duration, timestamp, participant information, and audio quality metrics</li>
                <li><strong>Conversation Insights:</strong> AI-extracted relationship signals, sentiment analysis, and interaction patterns</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">2.3 Relationship and Network Data</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Contact Networks:</strong> Information about your professional and personal contacts</li>
                <li><strong>Interaction History:</strong> Communication patterns, frequency, and relationship strength metrics</li>
                <li><strong>Network Analysis:</strong> Connection paths, mutual contacts, and network topology</li>
                <li><strong>Goal Tracking:</strong> Your professional objectives and networking targets</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">2.4 Technical and Usage Data</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage Analytics:</strong> Feature usage, session duration, click patterns, and performance metrics</li>
                <li><strong>Integration Data:</strong> Information from connected CRM systems, calendar applications, and email clients</li>
                <li><strong>Error Logs:</strong> Technical errors and debugging information (anonymized when possible)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Core Service Features</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Relationship Intelligence:</strong> Analyze your network to identify connection opportunities and relationship patterns</li>
                <li><strong>Voice Processing:</strong> Transcribe conversations, extract insights, and track relationship developments</li>
                <li><strong>Network Visualization:</strong> Create interactive maps of your professional network with flow analysis</li>
                <li><strong>Goal Matching:</strong> Connect your objectives with relevant contacts across your extended network</li>
                <li><strong>Introduction Generation:</strong> Suggest and facilitate strategic introductions based on AI analysis</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">3.2 AI Model Training and Improvement</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Legal Basis:</strong> We process your data for AI training based on legitimate interests, 
                with appropriate safeguards and data minimization practices.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Train and improve our AI models for relationship analysis and conversation processing</li>
                <li>Enhance natural language processing capabilities for better insight extraction</li>
                <li>Develop and refine network analysis algorithms</li>
                <li>Improve voice recognition and transcription accuracy (voice data is pseudonymized)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">3.3 Automated Decision Making</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our platform uses automated decision-making technology (ADMT) for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Connection Recommendations:</strong> Suggesting relevant contacts based on your goals and network analysis</li>
                <li><strong>Relationship Scoring:</strong> Calculating relationship strength and engagement levels</li>
                <li><strong>Opportunity Identification:</strong> Flagging potential networking opportunities and follow-up actions</li>
                <li><strong>Content Prioritization:</strong> Ranking conversations and contacts by relevance and importance</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>Your Rights:</strong> You can opt out of automated decision-making, request human review of 
                automated decisions, and access explanations of how automated decisions affect you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For users in the European Union, we process your personal data based on the following legal grounds:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Contract:</strong> Processing necessary for providing our services and fulfilling our contract with you</li>
                <li><strong>Consent:</strong> For voice recordings, sensitive data processing, and marketing communications</li>
                <li><strong>Legitimate Interests:</strong> For service improvement, fraud prevention, and AI model enhancement</li>
                <li><strong>Legal Obligation:</strong> For compliance with applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Third-Party Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We share your information with trusted third-party service providers who help us operate our platform:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Cloud Infrastructure:</strong> Secure hosting and data storage providers</li>
                <li><strong>AI Services:</strong> Machine learning and natural language processing providers</li>
                <li><strong>Analytics Providers:</strong> Usage analytics and performance monitoring services</li>
                <li><strong>Communication Services:</strong> Email, SMS, and notification delivery providers</li>
                <li><strong>Authentication Providers:</strong> OAuth and identity verification services</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">5.2 Integration Partners</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                With your explicit consent, we may share data with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>CRM systems (Salesforce, HubSpot, etc.)</li>
                <li>Calendar applications (Google Calendar, Outlook)</li>
                <li>Communication platforms (Slack, Microsoft Teams)</li>
                <li>Professional networks (LinkedIn)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">5.3 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose your information if required by law, court order, or government request, 
                or to protect our rights, property, or safety.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Data Security and Protection</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li><strong>Access Controls:</strong> Role-based access controls and multi-factor authentication</li>
                <li><strong>Regular Audits:</strong> Security assessments and compliance audits</li>
                <li><strong>Data Minimization:</strong> We collect and retain only necessary data</li>
                <li><strong>Incident Response:</strong> Established procedures for handling security incidents</li>
                <li><strong>Employee Training:</strong> Regular privacy and security training for all staff</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Your Privacy Rights</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">7.1 GDPR Rights (EU Users)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Right of Access:</strong> Request information about your personal data processing</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we process your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time for consent-based processing</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">7.2 CCPA Rights (California Users)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Right to Know:</strong> Information about personal information collection and use</li>
                <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt out of the sale or sharing of personal information</li>
                <li><strong>Right to Non-Discrimination:</strong> Not be discriminated against for exercising privacy rights</li>
                <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information</li>
                <li><strong>Right to Limit:</strong> Limit the use and disclosure of sensitive personal information</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">7.3 Exercising Your Rights</h3>
              <p className="text-gray-700 leading-relaxed">
                To exercise any of these rights, contact us at <a href="mailto:privacy@rhiz.ai" className="text-blue-600 hover:underline">privacy@rhiz.ai</a> 
                or use the privacy controls in your account settings. We will respond to your request within 30 days (GDPR) or 45 days (CCPA).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Data Retention</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Account Data:</strong> Retained while your account is active and for 90 days after deletion</li>
                <li><strong>Voice Recordings:</strong> Retained for 2 years or until you request deletion</li>
                <li><strong>Conversation Transcripts:</strong> Retained for 3 years for service improvement</li>
                <li><strong>Network Data:</strong> Retained while relevant contacts remain in your network</li>
                <li><strong>Usage Analytics:</strong> Anonymized and retained for 5 years for service improvement</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your data may be processed in countries outside your jurisdiction. We ensure appropriate 
                safeguards are in place:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate protection levels</li>
                <li><strong>Standard Contractual Clauses:</strong> EU-approved contracts for data protection</li>
                <li><strong>Data Processing Agreements:</strong> Binding agreements with all processors</li>
                <li><strong>Certification Programs:</strong> Compliance with recognized privacy frameworks</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service is not intended for individuals under 18 years of age. We do not knowingly 
                collect personal information from children under 18. If you become aware that a child 
                has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Performance Cookies:</strong> Analytics and performance monitoring</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Personalized content and advertising (with consent)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can manage cookie preferences in your browser settings or through our cookie consent banner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy periodically to reflect changes in our practices or 
                applicable laws. We will notify you of material changes via email or through our platform. 
                The updated policy will be effective immediately upon posting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Contact Information</h2>
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Data Controller:</strong> Rhiz, Inc.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Privacy Officer:</strong> <a href="mailto:privacy@rhiz.ai" className="text-blue-600 hover:underline">privacy@rhiz.ai</a>
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>General Inquiries:</strong> <a href="mailto:hello@rhiz.ai" className="text-blue-600 hover:underline">hello@rhiz.ai</a>
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>EU Representative:</strong> For EU-related privacy matters, contact us at the above email addresses.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Supervisory Authority:</strong> EU users have the right to lodge a complaint with 
                  their local data protection authority.
                </p>
              </div>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Terms of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using Rhiz, you also agree to our Terms of Service, which govern your use of our platform 
                and outline your rights and responsibilities as a user.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Key Terms:</strong> Professional use only, respect for others&apos; privacy, 
                  compliance with applicable laws, and responsible use of AI-generated insights and recommendations.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}