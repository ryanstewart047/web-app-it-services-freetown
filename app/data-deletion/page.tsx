import Link from 'next/link';
import { Metadata } from 'next';
import PageBanner from '@/components/PageBanner';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions - IT Services Freetown',
  description: 'Instructions on how to request and manage the deletion of your personal data associated with IT Services Freetown on Facebook.',
  robots: { index: true, follow: true },
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        title="Data Deletion Instructions"
        subtitle="Last updated: June 25, 2026"
        icon="fas fa-trash-alt"
        compact
      />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Commitment to Your Privacy
            </h2>
            <p className="text-gray-700">
              IT Services Freetown is committed to protecting your personal data. We only access the minimal Facebook profile data required to administer our Facebook page auto-posting integrations. We do not sell, trade, or store your private Facebook data.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How to Remove the App from Facebook
            </h2>
            <p className="text-gray-700 mb-4">
              If you have interacted with our Meta developer application ("ITS Freetown") and wish to remove its access, you can do so directly from your Facebook settings:
            </p>
            <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-4">
              <li>Go to your Facebook Profile's <strong>Settings & Privacy</strong> &gt; <strong>Settings</strong>.</li>
              <li>Scroll down the left menu and select <strong>Apps and Websites</strong>.</li>
              <li>Locate <strong>ITS Freetown</strong> (or search for it in the search bar).</li>
              <li>Click the <strong>Remove</strong> button next to the application.</li>
              <li>Confirm the removal in the pop-up modal.</li>
            </ol>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Requesting Complete Data Deletion
            </h2>
            <p className="text-gray-700 mb-4">
              If you want us to completely delete any local cache or data history that might have been processed by our auto-posting application, please send us a formal request:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Email:</strong> support@itservicesfreetown.com</li>
              <li><strong>Subject:</strong> Facebook Data Deletion Request (ITS Freetown)</li>
              <li><strong>Required details:</strong> Please specify your Facebook name or user identifier so we can locate any relevant logs.</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Once received, our tech team will manually inspect our logs, permanently delete any records related to your Facebook profile, and email you a confirmation within <strong>48 hours</strong>.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Support
            </h2>
            <p className="text-gray-700 mb-4">
              For any further questions regarding your data privacy, feel free to reach out:
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
