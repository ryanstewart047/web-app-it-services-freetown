'use client'

import { useState } from 'react'
import LoadingOverlay from '@/components/LoadingOverlay'

export default function LoadingDemo() {
  const [currentVariant, setCurrentVariant] = useState<'modern' | 'minimal' | 'dots' | 'pulse'>('modern')
  const [showDemo, setShowDemo] = useState(false)
  const [progress, setProgress] = useState(0)

  const variants = [
    { name: 'Modern', value: 'modern' as const, description: 'Sleek progress bar with animated tips' },
    { name: 'Minimal', value: 'minimal' as const, description: 'Clean spinner with subtle progress' },
    { name: 'Dots', value: 'dots' as const, description: 'Bouncing dots animation' },
    { name: 'Pulse', value: 'pulse' as const, description: 'Breathing pulse effect' }
  ]

  const startDemo = (variant: typeof currentVariant) => {
    setCurrentVariant(variant)
    setProgress(0)
    setShowDemo(true)
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setShowDemo(false), 1000)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  if (showDemo) {
    return <LoadingOverlay progress={progress} variant={currentVariant} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Loading Variants
          </h1>
          <p className="text-lg text-gray-600">
            Experience our professional loading animations designed for optimal user experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {variants.map((variant) => (
            <div key={variant.value} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {variant.name} Loader
                </h3>
                <p className="text-gray-600 mb-6">
                  {variant.description}
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="text-sm text-gray-500 mb-2">Preview:</div>
                  {variant.value === 'modern' && (
                    <div className="space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                        Loading expert services...
                      </div>
                    </div>
                  )}
                  
                  {variant.value === 'minimal' && (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin w-6 h-6 border-3 border-gray-300 border-t-red-500 rounded-full"></div>
                      <span className="text-gray-600">Loading...</span>
                    </div>
                  )}
                  
                  {variant.value === 'dots' && (
                    <div className="flex items-center justify-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-red-500 rounded-full animate-pulse"
                          style={{animationDelay: `${i * 0.2}s`}}
                        ></div>
                      ))}
                    </div>
                  )}
                  
                  {variant.value === 'pulse' && (
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => startDemo(variant.value)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Demo {variant.name} Loader
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Implementation Features
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">✨ Professional Design</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Multiple aesthetic variants</li>
                <li>• Smooth animations and transitions</li>
                <li>• Responsive design across all devices</li>
                <li>• Consistent branding integration</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">⚡ Performance Optimized</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Lightweight CSS animations</li>
                <li>• Configurable loading duration</li>
                <li>• Progress tracking capability</li>
                <li>• Minimal bundle impact</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🎯 User Experience</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Rotating helpful loading tips</li>
                <li>• Visual progress indicators</li>
                <li>• Professional appearance</li>
                <li>• Engaging animations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🔧 Developer Friendly</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• TypeScript support</li>
                <li>• Easy variant switching</li>
                <li>• Custom progress control</li>
                <li>• Flexible integration</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Current Implementation Status
            </h3>
            <p className="text-green-700">
              <strong>All pages now use the consistent &ldquo;Modern&rdquo; variant</strong> with progress bar for a unified user experience. 
              The brand name has been removed for a cleaner, more professional appearance.
            </p>
          </div>
          <p className="text-gray-600">
            This demo page showcases different loading variants for reference, but the actual application uses only the modern variant across all pages.
          </p>
        </div>
      </div>
    </div>
  )
}