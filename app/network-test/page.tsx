'use client'

import { useState } from 'react'

export default function NetworkTestPage() {
  const [testStatus, setTestStatus] = useState<string>('')

  const simulateOffline = () => {
    setTestStatus('Simulating offline mode...')
    // Dispatch offline event
    window.dispatchEvent(new Event('offline'))
    setTimeout(() => {
      setTestStatus('Offline event dispatched')
    }, 500)
  }

  const simulateOnline = () => {
    setTestStatus('Simulating online mode...')
    // Dispatch online event
    window.dispatchEvent(new Event('online'))
    setTimeout(() => {
      setTestStatus('Online event dispatched')
    }, 500)
  }

  const checkCurrentStatus = () => {
    const status = navigator.onLine ? 'Online' : 'Offline'
    setTestStatus(`Current status: ${status}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Network Monitor Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the network monitoring system with the buttons below
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={simulateOffline}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <i className="fas fa-wifi-slash"></i>
              <span>Simulate Offline</span>
            </button>

            <button
              onClick={simulateOnline}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <i className="fas fa-wifi"></i>
              <span>Simulate Online</span>
            </button>

            <button
              onClick={checkCurrentStatus}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <i className="fas fa-info-circle"></i>
              <span>Check Status</span>
            </button>
          </div>

          {testStatus && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 font-medium">{testStatus}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">How to Test:</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-3">
                <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <p><strong>Manual Testing:</strong> Use the &ldquo;Simulate Offline&rdquo; button to trigger the offline popup</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-100 text-green-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <p><strong>Real Testing:</strong> Disconnect your device from internet (WiFi/Ethernet)</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <p><strong>Reconnection:</strong> Reconnect to internet to see the &ldquo;Back online!&rdquo; popup</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Expected Behavior:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Offline:</strong> Red popup with your logo appears at top</li>
              <li>• <strong>Online:</strong> Green popup with success animation appears</li>
              <li>• <strong>Auto-hide:</strong> Online popup disappears after 3 seconds</li>
              <li>• <strong>Manual close:</strong> Both popups can be closed with X button</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}