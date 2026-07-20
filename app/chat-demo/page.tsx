'use client'

import { openChatFloat } from '@/lib/chat-float-controller'

export default function ChatIntegrationDemo() {
  const testCases = [
    {
      id: 'general-support',
      title: 'General Support Request',
      description: 'Opens chat with a general support message',
      message: 'Hi! I need general support with my IT services. Can you help me?',
      buttonText: 'Get General Support',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'troubleshoot-device',
      title: 'Troubleshooting Help',
      description: 'Opens chat for device troubleshooting assistance',
      message: 'Hi! I need help troubleshooting my device. Can you assist me?',
      buttonText: 'Get Troubleshooting Help',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'book-appointment',
      title: 'Book Appointment',
      description: 'Opens chat to help with booking an appointment',
      message: 'Hi! I would like to book an appointment for device repair. Can you help me with the process?',
      buttonText: 'Book Appointment via Chat',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'connect-agent',
      title: 'Connect to Agent',
      description: 'Simulates the Connect to Agent functionality from the chat page',
      message: 'Hi! I need to speak with a human agent about my device issue. I was chatting on your website and need further assistance.',
      buttonText: 'Connect to Human Agent',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'track-repair',
      title: 'Track Repair Status',
      description: 'Opens chat for repair tracking assistance',
      message: 'Hi! I need help tracking my repair status. Can you assist me with finding my repair information?',
      buttonText: 'Track My Repair',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'emergency-support',
      title: 'Emergency Support',
      description: 'Opens chat for urgent technical issues',
      message: 'URGENT: I have a critical IT issue that needs immediate attention. Please help!',
      buttonText: 'Emergency Support',
      color: 'bg-red-600 hover:bg-red-700 animate-pulse'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Chat Float Integration Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience the seamless integration of our WhatsApp chat float across different user scenarios. 
            Click any button below to see how the chat automatically opens with contextual pre-filled messages.
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testCases.map((testCase) => (
            <div key={testCase.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {testCase.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {testCase.description}
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Pre-filled Message:</p>
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;{testCase.message}&rdquo;
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => openChatFloat(testCase.message)}
                className={`w-full ${testCase.color} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl`}
              >
                {testCase.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ✨ Integration Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-magic-wand-sparkles text-2xl text-blue-600"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Pre-filling</h3>
              <p className="text-sm text-gray-600">
                Contextual messages based on where users click &ldquo;Connect to Agent&rdquo;
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fab fa-whatsapp text-2xl text-green-600"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp Integration</h3>
              <p className="text-sm text-gray-600">
                Direct connection to WhatsApp with pre-filled messages
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-eye text-2xl text-purple-600"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visual Feedback</h3>
              <p className="text-sm text-gray-600">
                Animated chat button with pulse effect when opened programmatically
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-mobile-screen-button text-2xl text-red-600"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile Optimized</h3>
              <p className="text-sm text-gray-600">
                Responsive design with mobile-friendly positioning and overlay
              </p>
            </div>
          </div>
        </div>

        {/* Implementation Details */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔧 Implementation Highlights
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pages with Integration:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  Chat Page - &ldquo;Connect to Agent&rdquo; button
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  Troubleshoot Page - &ldquo;Start Chat&rdquo; button
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  Contact Section - &ldquo;Live Chat&rdquo; buttons
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  Global Chat Float - Always available
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Experience Benefits:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <i className="fas fa-star text-yellow-500 mr-2"></i>
                  No page reloads or navigation needed
                </li>
                <li className="flex items-center">
                  <i className="fas fa-star text-yellow-500 mr-2"></i>
                  Instant WhatsApp connection
                </li>
                <li className="flex items-center">
                  <i className="fas fa-star text-yellow-500 mr-2"></i>
                  Context-aware messaging
                </li>
                <li className="flex items-center">
                  <i className="fas fa-star text-yellow-500 mr-2"></i>
                  Consistent across all devices
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 How to Test
          </h3>
          <p className="text-blue-700">
            Click any button above to see the chat float automatically open with a pre-filled message. 
            The chat float will appear in the bottom-right corner with a pulsing animation. 
            Click &ldquo;Send via WhatsApp&rdquo; to be redirected to WhatsApp with the message ready to send!
          </p>
        </div>
      </div>
    </div>
  )
}