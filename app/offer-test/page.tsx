'use client'

import { useState, useEffect } from 'react'

export default function OfferTestPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [offerInfo, setOfferInfo] = useState<any>(null)
  const [adminOfferInfo, setAdminOfferInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test all endpoints
    Promise.all([
      fetch('/api/offer/debug').then(r => r.json()).catch(e => ({ error: e.message })),
      fetch('/api/offer').then(r => r.json()).catch(e => ({ error: e.message })),
      fetch('/api/offer/admin').then(r => r.json()).catch(e => ({ error: e.message })),
    ]).then(([debug, offer, adminOffer]) => {
      setDebugInfo(debug)
      setOfferInfo(offer)
      setAdminOfferInfo(adminOffer)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Offer System Diagnostics</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-8">Offer System Diagnostics</h1>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔍 GitHub Token Debug
            {debugInfo?.success ? (
              <span className="text-green-600 text-sm">✓ Working</span>
            ) : (
              <span className="text-red-600 text-sm">✗ Failed</span>
            )}
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Public Offer API */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🌐 Public Offer API (/api/offer)
            {offerInfo?.success && offerInfo?.offer ? (
              <span className="text-green-600 text-sm">✓ Offer Found</span>
            ) : (
              <span className="text-yellow-600 text-sm">⚠ No Active Offer</span>
            )}
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(offerInfo, null, 2)}
          </pre>
          {offerInfo?.offer && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <p className="font-semibold">{offerInfo.offer.title}</p>
              <p className="text-sm text-gray-600">{offerInfo.offer.description}</p>
              <p className="text-sm mt-2">
                <span className={`font-medium ${offerInfo.offer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {offerInfo.offer.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Admin Offer API */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔐 Admin Offer API (/api/offer/admin)
            {adminOfferInfo?.success && adminOfferInfo?.offer ? (
              <span className="text-green-600 text-sm">✓ Offer Found</span>
            ) : (
              <span className="text-red-600 text-sm">✗ No Offer</span>
            )}
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(adminOfferInfo, null, 2)}
          </pre>
          {adminOfferInfo?.offer && (
            <div className="mt-4 p-4 bg-purple-50 rounded">
              <p className="font-semibold">{adminOfferInfo.offer.title}</p>
              <p className="text-sm text-gray-600">{adminOfferInfo.offer.description}</p>
              <p className="text-sm mt-2">
                <span className={`font-medium ${adminOfferInfo.offer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {adminOfferInfo.offer.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Issue Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">📋 Issue Summary</h2>
          <div className="space-y-3">
            {!debugInfo?.success && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="font-semibold text-red-800">❌ GitHub Token Issue</p>
                <p className="text-sm text-red-600 mt-1">
                  {debugInfo?.details || 'Token authentication failed'}
                </p>
                <p className="text-xs text-red-500 mt-2">
                  → Cannot save or retrieve offers from GitHub Gist
                </p>
              </div>
            )}

            {!offerInfo?.offer && adminOfferInfo?.offer && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-semibold text-yellow-800">⚠ Offer is Inactive</p>
                <p className="text-sm text-yellow-600 mt-1">
                  An offer exists but isActive = false
                </p>
                <p className="text-xs text-yellow-500 mt-2">
                  → Offer saved but won't show on website (checkbox needs to be checked)
                </p>
              </div>
            )}

            {offerInfo?.offer && offerInfo.offer.isActive && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="font-semibold text-green-800">✓ Offer is Active</p>
                <p className="text-sm text-green-600 mt-1">
                  Offer should appear in popup after 30 seconds
                </p>
                <p className="text-xs text-green-500 mt-2">
                  → Check homepage for popup (default delay: 30s)
                </p>
              </div>
            )}

            {!offerInfo?.offer && !adminOfferInfo?.offer && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <p className="font-semibold text-gray-800">ℹ No Offer Saved</p>
                <p className="text-sm text-gray-600 mt-1">
                  No offer has been saved yet
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  → Create one in /offer-admin
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🛠️ Fix Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            {!debugInfo?.success && (
              <>
                <li className="text-red-600 font-semibold">
                  Fix GitHub Token Issue:
                  <ul className="ml-6 mt-1 space-y-1 list-disc text-gray-600 font-normal">
                    <li>Go to Vercel Dashboard → Settings → Environment Variables</li>
                    <li>Delete old GITHUB_TOKEN</li>
                    <li>Generate new token at: https://github.com/settings/tokens</li>
                    <li>Only check "gist" permission</li>
                    <li>Add new GITHUB_TOKEN to Vercel (all environments)</li>
                    <li>Redeploy site</li>
                  </ul>
                </li>
              </>
            )}
            {debugInfo?.success && !offerInfo?.offer && (
              <li className="text-blue-600">
                Create a new offer at <a href="/offer-admin" className="underline">/offer-admin</a>
              </li>
            )}
            {debugInfo?.success && adminOfferInfo?.offer && !offerInfo?.offer && (
              <li className="text-yellow-600">
                Your offer is saved but inactive. Make sure "Activate Offer" checkbox is checked when saving.
              </li>
            )}
            {debugInfo?.success && offerInfo?.offer && (
              <li className="text-green-600">
                Everything working! Popup appears after 30 seconds. To test immediately, change delay in layout.tsx
              </li>
            )}
          </ol>
        </div>
      </div>
    </div>
  )
}
