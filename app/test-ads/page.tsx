import React from 'react';
import Script from 'next/script';

export default function TestAdsPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-10 font-sans">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Partner Website Preview</h1>
          <p className="text-gray-600 mb-6">
            This simulates how your ads will appear on a different website (like a local blog or news portal).
          </p>
          
          <div className="border-t pt-6">
            <h2 className="text-sm font-semibold uppercase text-gray-400 mb-4">Advertisement</h2>
            
            {/* This is the container where the ad will appear */}
            <div className="its-ad-unit"></div>
            
          </div>

          <p className="mt-6 text-gray-600">
            The ad above is being "served" live from your database. Every time this page loads, it counts as one "Impression."
          </p>
        </div>

        <div className="bg-[#040e40] text-white p-6 sm:p-8 rounded-3xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-300 text-sm">
            <li>Go to your <a href="/ads-admin" className="text-red-400 font-bold underline hover:text-red-300 transition-colors">Ads Admin Dashboard</a>.</li>
            <li>Create your first ad (upload a banner and add a link).</li>
            <li>Refresh this test page to see your ad appear!</li>
            <li>Click the ad to verify that "Clicks" are being tracked in your dashboard.</li>
          </ol>
        </div>
        
        <div className="text-center">
          <a href="/admin" className="text-sm text-gray-500 hover:text-red-600 transition-colors">← Back to Admin Control</a>
        </div>
      </div>

      {/* The IT Services Freetown Ad Network Script */}
      <Script src="/js/its-ads.js" strategy="afterInteractive" />
    </div>
  );
}
