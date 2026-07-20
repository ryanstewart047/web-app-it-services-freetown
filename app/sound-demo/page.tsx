'use client'

import { ChatFloatController } from '@/lib/chat-float-controller'

export default function SoundDemoPage() {
  const openChatWithSound = () => {
    const controller = ChatFloatController.getInstance()
    controller.openChat("Hi! I clicked the test button and heard the notification sound! 🔊")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔊 Chat Sound Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test the new chat notification sound feature. Click the button below to open the chat float with a sound notification!
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-volume-up text-3xl text-blue-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Chat Sound</h2>
            <p className="text-gray-600 mb-6">
              When you click the button below, the chat float will open and play a notification sound.
            </p>
          </div>

          <button
            onClick={openChatWithSound}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            🔊 Open Chat with Sound
          </button>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 🔊 Plays a pleasant notification sound when chat opens</p>
              <p>• 🎵 Uses Web Audio API for crisp, synthetic notification tones</p>
              <p>• 🔇 Gracefully falls back if audio is not available</p>
              <p>• 🎯 Only plays when opening (not when closing)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}