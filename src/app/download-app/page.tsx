'use client';

import { useState } from 'react';

export default function DownloadAppPage() {
  const [selectedOS, setSelectedOS] = useState('windows');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Download Our App</h1>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedOS('windows')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOS === 'windows'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">Windows</p>
            </button>
            <button
              onClick={() => setSelectedOS('mac')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOS === 'mac'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">macOS</p>
            </button>
            <button
              onClick={() => setSelectedOS('linux')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOS === 'linux'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">Linux</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Download Now</h3>
          <p className="text-gray-600">Selected platform: {selectedOS}</p>
          <button className="mt-4 px-6 py-2 bg-gradient-to-r from-red-600 to-[#040e40] text-white rounded-lg hover:from-red-700 hover:to-[#0a1a5c]">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
