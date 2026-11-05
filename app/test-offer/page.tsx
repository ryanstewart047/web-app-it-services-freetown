'use client'

import { useEffect, useState } from 'react'

export default function TestOfferPage() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/offer')
      .then(res => res.json())
      .then(data => {
        setApiResponse(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Offer API Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">API Response:</h2>
          
          {loading && <p className="text-gray-600">Loading...</p>}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {apiResponse && (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-semibold">Success: <span className={apiResponse.success ? 'text-green-600' : 'text-red-600'}>{String(apiResponse.success)}</span></p>
              </div>
              
              {apiResponse.offer ? (
                <div className="border-2 border-green-300 bg-green-50 p-4 rounded">
                  <h3 className="text-xl font-bold mb-2">✅ Offer Found!</h3>
                  <pre className="bg-white p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(apiResponse.offer, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="border-2 border-red-300 bg-red-50 p-4 rounded">
                  <h3 className="text-xl font-bold mb-2">❌ No Offer Available</h3>
                  <p className="text-gray-700">The API returned success but no offer data.</p>
                  <p className="text-sm text-gray-600 mt-2">This usually means:</p>
                  <ul className="list-disc ml-6 mt-2 text-sm text-gray-600">
                    <li>No offer has been created yet</li>
                    <li>The offer is inactive (isActive: false)</li>
                    <li>The GitHub Gist is not accessible (wrong token or Gist ID)</li>
                  </ul>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-300 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">Troubleshooting Steps:</h3>
                <ol className="list-decimal ml-6 space-y-2 text-sm">
                  <li>Check Vercel environment variables:
                    <ul className="list-disc ml-6 mt-1">
                      <li><code className="bg-white px-2 py-0.5 rounded">NEXT_PUBLIC_GITHUB_TOKEN</code></li>
                      <li><code className="bg-white px-2 py-0.5 rounded">OFFER_GIST_ID</code> = 741d3c2e3203df10a318d3dae1a94c66</li>
                    </ul>
                  </li>
                  <li>Ensure the offer is marked as "Active" in the admin panel</li>
                  <li>Check browser console for [OfferPopup] and [Offer API] logs</li>
                  <li>Clear sessionStorage: <code className="bg-white px-2 py-0.5 rounded">sessionStorage.clear()</code> in console</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions:</h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                sessionStorage.clear()
                alert('Session storage cleared! Reload the homepage to see the popup again.')
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Clear Session Storage (to show popup again)
            </button>
            
            <a
              href="/offer-admin"
              className="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 text-center"
            >
              Go to Offer Admin
            </a>
            
            <a
              href="/"
              className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-center"
            >
              Go to Homepage (to test popup)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
