'use client'

import { useState } from 'react'
import { Search, Clock, CheckCircle, AlertCircle, Package, Wrench, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

interface RepairStatus {
  id: string
  customerName: string
  deviceType: string
  deviceModel: string
  issueDescription: string
  status: 'received' | 'diagnostic' | 'parts-ordered' | 'in-repair' | 'testing' | 'completed' | 'ready-pickup'
  estimatedCompletion: string
  actualCompletion?: string
  cost: number
  timeline: {
    step: string
    status: 'completed' | 'current' | 'pending'
    timestamp?: string
    description: string
  }[]
  technician: {
    name: string
    email: string
    phone: string
  }
  notes: string[]
}

const mockRepairData: RepairStatus = {
  id: 'REP-2024-001',
  customerName: 'John Doe',
  deviceType: 'Laptop',
  deviceModel: 'MacBook Pro 13" 2021',
  issueDescription: 'Screen flickering and battery not charging properly',
  status: 'in-repair',
  estimatedCompletion: '2024-01-28',
  cost: 150,
  technician: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@itservicesfreetown.com',
    phone: '+232 XX XXX XXXX'
  },
  timeline: [
    {
      step: 'Device Received',
      status: 'completed',
      timestamp: '2024-01-24 09:30',
      description: 'Device received and logged into our system'
    },
    {
      step: 'Initial Diagnostic',
      status: 'completed',
      timestamp: '2024-01-24 14:15',
      description: 'Completed initial diagnostic - identified screen cable and battery issues'
    },
    {
      step: 'Parts Ordered',
      status: 'completed',
      timestamp: '2024-01-25 10:00',
      description: 'Ordered replacement screen cable and battery'
    },
    {
      step: 'Repair in Progress',
      status: 'current',
      timestamp: '2024-01-26 09:00',
      description: 'Currently replacing faulty components'
    },
    {
      step: 'Quality Testing',
      status: 'pending',
      description: 'Comprehensive testing of all functions'
    },
    {
      step: 'Ready for Pickup',
      status: 'pending',
      description: 'Device ready for customer pickup'
    }
  ],
  notes: [
    'Customer notified about parts ordering delay',
    'Battery replacement will include 6-month warranty',
    'Screen cable replacement completed successfully'
  ]
}

export default function TrackRepair() {
  const [trackingId, setTrackingId] = useState('')
  const [repairData, setRepairData] = useState<RepairStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID')
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, return mock data for any ID
      setRepairData(mockRepairData)
      toast.success('Repair status found!')
    } catch (error) {
      toast.error('Repair not found. Please check your tracking ID.')
      setRepairData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
      case 'diagnostic':
        return 'bg-blue-100 text-blue-800'
      case 'parts-ordered':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-repair':
        return 'bg-purple-100 text-purple-800'
      case 'testing':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
      case 'ready-pickup':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'current':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Track Your Repair
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your tracking ID to get real-time updates on your device repair status
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking ID
              </label>
              <input
                type="text"
                id="trackingId"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="input-field"
                placeholder="Enter your tracking ID (e.g., REP-2024-001)"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center px-6 py-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track Repair
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Repair Status Results */}
        {repairData && (
          <div className="space-y-8">
            {/* Status Overview */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Repair #{repairData.id}
                  </h2>
                  <p className="text-gray-600">{repairData.deviceType} - {repairData.deviceModel}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`status-badge ${getStatusColor(repairData.status)}`}>
                    {repairData.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Customer</h3>
                  <p className="text-gray-600">{repairData.customerName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Estimated Completion</h3>
                  <p className="text-gray-600">{repairData.estimatedCompletion}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Estimated Cost</h3>
                  <p className="text-gray-600">${repairData.cost}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Issue Description</h3>
                <p className="text-gray-600">{repairData.issueDescription}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Repair Timeline</h2>
              <div className="space-y-6">
                {repairData.timeline.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold ${
                          item.status === 'completed' ? 'text-green-900' :
                          item.status === 'current' ? 'text-blue-900' :
                          'text-gray-500'
                        }`}>
                          {item.step}
                        </h3>
                        {item.timestamp && (
                          <span className="text-sm text-gray-500">
                            {item.timestamp}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        item.status === 'pending' ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technician Info */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Assigned Technician</h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {repairData.technician.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{repairData.technician.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{repairData.technician.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{repairData.technician.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {repairData.notes.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Repair Notes</h2>
                <div className="space-y-3">
                  {repairData.notes.map((note, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-700 mb-4">
            Can&apos;t find your tracking ID or have questions about your repair?
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/chat"
              className="btn-primary inline-flex items-center justify-center"
            >
              <Package className="w-5 h-5 mr-2" />
              Live Chat Support
            </a>
            <a
              href="tel:+232XXXXXXXX"
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 inline-flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
