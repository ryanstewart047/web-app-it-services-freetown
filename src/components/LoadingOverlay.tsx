'use client'

export default function LoadingOverlay() {
  return (
    <div className="loading-overlay fixed inset-0 bg-blue-50 flex justify-center items-center z-50">
      <div className="loading-content text-center">
        <div className="loading-spinner mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-900 border-t-transparent mx-auto"></div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">IT Services Freetown</h3>
        <p className="text-gray-700 font-medium mb-4">Loading expert repair services...</p>
        <div className="loading-dots flex justify-center space-x-1">
          <div className="loading-dot w-2 h-2 bg-blue-900 rounded-full animate-bounce"></div>
          <div className="loading-dot w-2 h-2 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="loading-dot w-2 h-2 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
