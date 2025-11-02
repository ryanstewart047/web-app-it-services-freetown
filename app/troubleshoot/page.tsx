'use client'

import { useState } from 'react'
import { useForm, ValidationError } from '@formspree/react'
import { Brain, Send, Smartphone, Monitor, HelpCircle, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'
import toast from 'react-hot-toast'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { openChatFloat } from '@/lib/chat-float-controller'
import { generateTroubleshootingResponseClient, isStaticDeployment } from '@/lib/groq-ai-client'
import { DisplayAd, InArticleAd } from '@/components/AdSense'

interface TroubleshootingStep {
  id: string
  title: string
  description: string
  type: 'check' | 'action' | 'info'
  completed?: boolean
}

interface AIResponse {
  diagnosis: string
  confidence: number
  steps: TroubleshootingStep[]
  escalate: boolean
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const commonIssues = [
  {
    category: 'Computer',
    issues: [
      'Computer won\'t turn on',
      'Blue screen of death (BSOD)',
      'Slow performance',
      'Overheating',
      'No internet connection',
      'Audio not working',
      'Screen flickering'
    ]
  },
  {
    category: 'Mobile',
    issues: [
      'Battery draining quickly',
      'Phone won\'t charge',
      'Screen not responding',
      'Apps crashing',
      'No network signal',
      'Camera not working',
      'Phone overheating'
    ]
  }
]

const mockAIResponse: AIResponse = {
  diagnosis: "Based on your description, your laptop appears to be experiencing thermal throttling due to overheating. This is commonly caused by dust accumulation in the cooling system or failing thermal paste.",
  confidence: 87,
  steps: [
    {
      id: '1',
      title: 'Check System Temperature',
      description: 'Download a temperature monitoring tool like HWiNFO64 or Core Temp to check your CPU and GPU temperatures. Temperatures above 80°C indicate overheating.',
      type: 'check'
    },
    {
      id: '2',
      title: 'Clean Air Vents',
      description: 'Use compressed air to blow out dust from all air vents. Focus on the exhaust vents where hot air comes out.',
      type: 'action'
    },
    {
      id: '3',
      title: 'Check Task Manager',
      description: 'Open Task Manager (Ctrl+Shift+Esc) and look for processes using high CPU. End unnecessary processes that are consuming resources.',
      type: 'action'
    },
    {
      id: '4',
      title: 'Elevate Your Laptop',
      description: 'Use a laptop stand or cooling pad to improve airflow underneath your laptop.',
      type: 'info'
    },
    {
      id: '5',
      title: 'Update Drivers',
      description: 'Update your graphics drivers and other system drivers as outdated drivers can cause excessive heat generation.',
      type: 'action'
    }
  ],
  escalate: false,
  estimatedTime: '15-30 minutes',
  difficulty: 'easy'
}

export default function Troubleshoot() {
  const { isLoading: pageLoading, progress } = usePageLoader({
    minLoadTime: 1700
  });
  
  // Initialize scroll animations
  useScrollAnimations()
  
  // Formspree integration for support tracking
  const [state, handleFormspreeSubmit] = useForm("mpwjnwrz");
  
  const [deviceType, setDeviceType] = useState<'computer' | 'mobile' | ''>('')
  const [deviceModel, setDeviceModel] = useState('')
  const [issueDescription, setIssueDescription] = useState('')
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [submitToSupport, setSubmitToSupport] = useState(false)

  if (pageLoading) {
    return <LoadingOverlay progress={progress} variant="modern" />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!deviceType || !issueDescription.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    
    try {
      // Check if we're in a static deployment (GitHub Pages)
      const useClientSide = isStaticDeployment()
      console.log('Using client-side AI:', useClientSide)
      
      if (useClientSide) {
        // Use client-side Google AI API for static deployments
        const troubleshootingResult = await generateTroubleshootingResponseClient({
          deviceType,
          deviceModel: deviceModel || undefined,
          issueDescription: issueDescription.trim()
        })
        
        setAiResponse(troubleshootingResult)
        toast.success('AI diagnosis completed!')
      } else {
        // Use server-side API for full Next.js deployments
        const response = await fetch('/api/troubleshoot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceType,
            deviceModel: deviceModel || undefined,
            issueDescription: issueDescription.trim()
          }),
        })

        const result = await response.json()
        
        if (result.success && result.data) {
          setAiResponse(result.data)
          toast.success('AI diagnosis completed!')
        } else {
          toast.error('Failed to analyze the issue. Please try again.')
        }
      }
      
      // If user opted to submit to support, also send to Formspree
      if (submitToSupport) {
        try {
          await handleFormspreeSubmit(e);
          if (state.succeeded) {
            toast.success('Support ticket also created!');
          }
        } catch (error) {
          console.error('Error submitting to support:', error);
          toast.error('AI diagnosis completed, but failed to create support ticket.');
        }
      }
      
    } catch (error) {
      console.error('Error calling troubleshoot:', error)
      toast.error('Failed to analyze the issue. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickIssue = (issue: string) => {
    setIssueDescription(issue)
  }

  const toggleStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStepIcon = (type: string, completed: boolean) => {
    if (completed) return <CheckCircle className="w-5 h-5 text-green-500" />
    
    switch (type) {
      case 'check': return <HelpCircle className="w-5 h-5 text-blue-500" />
      case 'action': return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'info': return <Lightbulb className="w-5 h-5 text-purple-500" />
      default: return <HelpCircle className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Brain className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Troubleshooting
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your device issue and get instant AI-powered repair suggestions and step-by-step solutions
          </p>
        </div>

        {/* Top Ad */}
        <div className="mb-8">
          <DisplayAd />
        </div>

        {/* Troubleshooting Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6" data-form-type="troubleshoot">
            {/* Hidden inputs for Formspree submission */}
            <input type="hidden" name="formType" value="troubleshoot" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 mb-2">
                  Device Type *
                </label>
                <select
                  id="deviceType"
                  name="deviceType"
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as 'computer' | 'mobile' | '')}
                  className="input-field"
                  required
                >
                  <option value="">Select device type</option>
                  <option value="computer">Computer/Laptop</option>
                  <option value="mobile">Mobile/Tablet</option>
                </select>
                <ValidationError 
                  prefix="Device Type" 
                  field="deviceType"
                  errors={state.errors}
                  className="text-red-600 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="deviceModel" className="block text-sm font-medium text-gray-700 mb-2">
                  Device Model (Optional)
                </label>
                <input
                  type="text"
                  id="deviceModel"
                  name="deviceModel"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="input-field"
                  placeholder="e.g., MacBook Pro 13, iPhone 12, Dell XPS"
                />
              </div>
            </div>

            <div>
              <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Issue *
              </label>
              <textarea
                id="issueDescription"
                name="issueDescription"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={4}
                className="input-field"
                placeholder="Please describe the problem you're experiencing in detail..."
                required
              />
              <ValidationError 
                prefix="Issue Description" 
                field="issueDescription"
                errors={state.errors}
                className="text-red-600 text-sm mt-1"
              />
            </div>

            {/* Support ticket option */}
            <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
              <input
                type="checkbox"
                id="submitToSupport"
                name="submitToSupport"
                checked={submitToSupport}
                onChange={(e) => setSubmitToSupport(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="submitToSupport" className="text-sm text-gray-700">
                Also create a support ticket for human assistance (optional)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  AI Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Get AI Diagnosis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Issue Selection */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Common Issues</h2>
          <p className="text-gray-600 mb-4">Click on a common issue to auto-fill the description:</p>
          
          <div className="space-y-6">
            {commonIssues.map((category) => (
              <div key={category.category}>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  {category.category === 'Computer' ? 
                    <Monitor className="w-5 h-5 mr-2 text-primary" /> : 
                    <Smartphone className="w-5 h-5 mr-2 text-primary" />
                  }
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.issues.map((issue) => (
                    <button
                      key={issue}
                      onClick={() => {
                        handleQuickIssue(issue)
                        setDeviceType(category.category.toLowerCase() as 'computer' | 'mobile')
                      }}
                      className="text-left p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors duration-200"
                    >
                      <span className="text-sm text-gray-700">{issue}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="space-y-8">
            {/* In-Article Ad before diagnosis */}
            <div className="my-6">
              <InArticleAd />
            </div>

            {/* Diagnosis Overview */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Brain className="w-8 h-8 text-primary mr-3" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">AI Diagnosis</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      Confidence: {aiResponse.confidence}%
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(aiResponse.difficulty)}`}>
                      {aiResponse.difficulty.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      Est. Time: {aiResponse.estimatedTime}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="text-gray-800">{aiResponse.diagnosis}</p>
              </div>
            </div>

            {/* Troubleshooting Steps */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Step-by-Step Solution</h2>
              <div className="space-y-6">
                {aiResponse.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStepIcon(step.type, completedSteps.includes(step.id))}
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <button
                          onClick={() => toggleStepCompleted(step.id)}
                          className={`text-xs px-2 py-1 rounded-full transition-colors ${
                            completedSteps.includes(step.id)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {completedSteps.includes(step.id) ? 'Completed' : 'Mark Complete'}
                        </button>
                      </div>
                      <p className="text-gray-700">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Book Professional Service</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    If these steps don&apos;t resolve your issue, book an appointment with our technicians.
                  </p>
                  <a href="/book-appointment" className="btn-primary text-sm px-4 py-2 inline-block">
                    Book Appointment
                  </a>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Live Chat Support</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Get instant help from our support team through live chat.
                  </p>
                  <button 
                    onClick={() => openChatFloat('Hi! I need help troubleshooting my device. Can you assist me?')} 
                    className="btn-secondary text-sm px-4 py-2 inline-block"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
