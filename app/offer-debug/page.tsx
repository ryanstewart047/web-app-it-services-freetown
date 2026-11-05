'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function OfferDebugPage() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sessionStorage, setSessionStorageValue] = useState<string | null>(null)

  useEffect(() => {
    // Check session storage
    const shownValue = window.sessionStorage.getItem('offer-popup-shown')
    setSessionStorageValue(shownValue)

    // Fetch from API
    fetch('/api/offer')
      .then(res => res.json())
      .then(data => {
        setApiResponse(data)
        setLoading(false)
      })
      .catch(error => {
        setApiResponse({ error: error.message })
        setLoading(false)
      })
  }, [])

  const clearSession = () => {
    window.sessionStorage.removeItem('offer-popup-shown')
    setSessionStorageValue(null)
    alert('Session cleared! Popup will show again on next page load after 30 seconds.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/offer-admin"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Offer Admin
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Offer Popup Debug</h1>

        {/* Session Storage Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Session Storage Status</h2>
          <div className="flex items-start gap-3">
            {sessionStorage ? (
              <>
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gray-700 font-medium">Popup already shown this session</p>
                  <p className="text-sm text-gray-600 mt-1">
                    The popup won't show again until you clear session or open a new browser session.
                  </p>
                  <button
                    onClick={clearSession}
                    className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                  >
                    Clear Session & Enable Popup
                  </button>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">Popup can be shown</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Session storage is clear. Popup will show if offer is active.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* API Response */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">API Response</h2>
          
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <div>
              {apiResponse?.success ? (
                apiResponse?.offer ? (
                  <div>
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-700 font-medium">Active offer found!</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Popup will show after 30 seconds if session storage is clear.
                        </p>
                      </div>
                    </div>

                    {/* Offer Details */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Offer Details:</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700">Title:</span>
                          <span className="text-gray-600">{apiResponse.offer.title}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700">Active:</span>
                          <span className={apiResponse.offer.isActive ? 'text-green-600' : 'text-red-600'}>
                            {apiResponse.offer.isActive ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700">Image URL:</span>
                          <span className="text-gray-600 break-all">{apiResponse.offer.imageUrl || 'None'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-700">Description:</span>
                          <span className="text-gray-600 whitespace-pre-line">{apiResponse.offer.description}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-700 font-medium">No active offer found</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Either no offer exists, or the offer is set to inactive.
                      </p>
                      <Link
                        href="/offer-admin"
                        className="mt-3 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Create/Activate Offer
                      </Link>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-700 font-medium">API Error</p>
                    <p className="text-sm text-gray-600 mt-1">
                      There was a problem fetching the offer data.
                    </p>
                  </div>
                </div>
              )}

              {/* Raw JSON */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  View raw JSON response
                </summary>
                <pre className="mt-2 bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Troubleshooting Steps</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>Make sure you created a GitHub Gist with filename <code className="bg-white px-2 py-0.5 rounded">current-offer.json</code></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>Verify the offer JSON has <code className="bg-white px-2 py-0.5 rounded">"isActive": true</code></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <span>Confirm you added the Gist ID to Vercel environment variables as <code className="bg-white px-2 py-0.5 rounded">OFFER_GIST_ID</code></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">4.</span>
              <span>After adding the Gist ID to Vercel, redeploy the site</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">5.</span>
              <span>Clear your browser's session storage or open an incognito window</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">6.</span>
              <span>Wait 30 seconds after page load for popup to appear</span>
            </li>
          </ol>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <p className="text-sm text-gray-600 mb-3">Open browser console (F12) to see detailed logs:</p>
            <ul className="text-xs text-gray-600 space-y-1 ml-4">
              <li>• [OfferPopup] logs show popup component activity</li>
              <li>• [Offer Storage] logs show Gist API calls</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
