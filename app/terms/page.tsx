import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600">
            Last updated: October 19, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700">
              By accessing and using IT Services Freetown's services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Services Provided
            </h2>
            <p className="text-gray-700 mb-4">
              IT Services Freetown provides:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Computer and laptop repair services</li>
              <li>Hardware diagnostics and replacement</li>
              <li>Software installation and troubleshooting</li>
              <li>Network setup and configuration</li>
              <li>Data recovery services</li>
              <li>IT consultation and support</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Service Appointments
            </h2>
            <p className="text-gray-700 mb-4">
              When booking a service appointment:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>You must provide accurate information about your device and issue</li>
              <li>Appointments are subject to technician availability</li>
              <li>You will receive a confirmation via email or SMS</li>
              <li>Cancellations must be made at least 24 hours in advance</li>
              <li>We reserve the right to reschedule in case of emergency</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Pricing and Payment
            </h2>
            <p className="text-gray-700 mb-4">
              Our pricing and payment terms:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Diagnostic fees may apply and will be communicated upfront</li>
              <li>Repair quotes are provided after initial assessment</li>
              <li>Prices are subject to change without notice</li>
              <li>Payment is due upon completion of service unless otherwise agreed</li>
              <li>We accept cash, mobile money, and bank transfers</li>
              <li>All prices are in Sierra Leonean Leones (SLL) or US Dollars (USD)</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Warranty and Guarantees
            </h2>
            <p className="text-gray-700 mb-4">
              We stand behind our work:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>All repairs come with a 30-day warranty on labor</li>
              <li>Parts are covered by manufacturer warranties where applicable</li>
              <li>Warranty does not cover damage from misuse or accidents</li>
              <li>Data recovery attempts are made on a best-effort basis with no guarantee</li>
              <li>We are not responsible for data loss during repair unless caused by negligence</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Customer Responsibilities
            </h2>
            <p className="text-gray-700 mb-4">
              As a customer, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Backup your data before bringing in your device</li>
              <li>Remove any confidential or sensitive data if possible</li>
              <li>Provide accurate passwords or access codes when necessary</li>
              <li>Pick up repaired devices within 30 days of completion</li>
              <li>Not hold us liable for pre-existing issues not related to the service</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-700">
              IT Services Freetown shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, or other intangible losses resulting from your use of our services. Our total liability shall not exceed the amount paid for the specific service in question.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-gray-700">
              All content on this website, including text, graphics, logos, and software, is the property of IT Services Freetown and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Privacy
            </h2>
            <p className="text-gray-700">
              Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Dispute Resolution
            </h2>
            <p className="text-gray-700">
              Any disputes arising from these terms or our services shall first be attempted to be resolved through good-faith negotiation. If resolution cannot be reached, disputes shall be settled through arbitration in accordance with Sierra Leone law.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Modifications to Terms
            </h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes constitutes acceptance of the modified terms.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Termination
            </h2>
            <p className="text-gray-700">
              We reserve the right to refuse service to anyone for any reason at any time. We may terminate or suspend your access to our services immediately, without prior notice, for any violation of these terms.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              13. Contact Information
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="text-gray-700 space-y-2">
              <p><strong>Email:</strong> support@itservicesfreetown.com</p>
              <p><strong>Phone:</strong> +23233399391</p>
              <p><strong>Address:</strong> Freetown, Sierra Leone</p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
