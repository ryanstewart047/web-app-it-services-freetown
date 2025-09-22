'use client'

import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'

export default function LoadingStatus() {
  const { isLoading, progress } = usePageLoader({
    minLoadTime: 2000
  })

  if (isLoading) {
    return <LoadingOverlay progress={progress} variant="modern" />
  }

  const pageStatus = [
    { page: 'Home (/)', variant: 'Modern', status: '✅ Updated', loadTime: '2000ms' },
    { page: 'Book Appointment', variant: 'Modern', status: '✅ Updated', loadTime: '1800ms' },
    { page: 'Chat', variant: 'Modern', status: '✅ Updated', loadTime: '1600ms' },
    { page: 'Track Repair', variant: 'Modern', status: '✅ Updated', loadTime: '1400ms' },
    { page: 'Troubleshoot', variant: 'Modern', status: '✅ Already Modern', loadTime: '1700ms' },
    { page: 'Learn More', variant: 'Modern', status: '✅ Updated', loadTime: '1500ms' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Loading Implementation Status
          </h1>
          <p className="text-lg text-gray-600">
            Overview of the unified loading system across all pages
          </p>
        </div>

        {/* Status Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">6/6</div>
              <div className="text-sm text-green-700">Pages Updated</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-sm text-blue-700">Consistency</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">Modern</div>
              <div className="text-sm text-purple-700">Single Variant</div>
            </div>
          </div>
        </div>

        {/* Page Status Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Page-by-Page Status</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Load Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pageStatus.map((page, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {page.page}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {page.variant}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.loadTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Changes Made */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🔧 Changes Made</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Removed Brand Name</h3>
                <p className="text-gray-600 text-sm">
                  Removed "IT Services Freetown" from the LoadingOverlay component for a cleaner, more professional appearance.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Unified Loading Variant</h3>
                <p className="text-gray-600 text-sm">
                  Changed all pages to use the "modern" variant with progress bar for consistency across the entire application.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Maintained Different Load Times</h3>
                <p className="text-gray-600 text-sm">
                  Kept varying load times (1400ms - 2000ms) across pages to simulate realistic loading scenarios while maintaining visual consistency.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">✨ Loading Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Visual Elements</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Animated spinning tools icon</li>
                <li>• Rotating loading tips</li>
                <li>• Gradient progress bar</li>
                <li>• Percentage indicator</li>
                <li>• Smooth animations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">User Experience</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Clean, professional appearance</li>
                <li>• Consistent across all pages</li>
                <li>• Informative loading messages</li>
                <li>• Progress feedback</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Links */}
        <div className="text-center mt-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🔗 Test the Loading Screens</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Home
              </a>
              <a href="/book-appointment" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Book Appointment
              </a>
              <a href="/chat" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Chat
              </a>
              <a href="/track-repair" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Track Repair
              </a>
              <a href="/troubleshoot" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Troubleshoot
              </a>
              <a href="/learn-more" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Learn More
              </a>
            </div>
            <p className="text-blue-700 text-sm mt-4">
              Click any link above to see the unified loading experience in action!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}