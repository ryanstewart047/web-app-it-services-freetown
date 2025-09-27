'use client'

import { useState, useEffect } from 'react'
import { getBookingByTrackingId, getAllBookings, BookingData } from '@/lib/unified-booking-storage'

interface AppointmentStatusProps {
  trackingId: string
}

interface AppointmentStatus {
  id: string
  customerName: string
  deviceType: string
  deviceModel: string
  status: 'received' | 'diagnosed' | 'in-progress' | 'completed' | 'ready-for-pickup'
  estimatedCompletion?: string
  notes?: string
  cost?: number
  createdAt: string
  updatedAt: string
}

const statusSteps = [
  { key: 'received', label: 'Received', icon: 'fas fa-inbox', color: '#040e40' },
  { key: 'diagnosed', label: 'Diagnosed', icon: 'fas fa-search', color: '#ef4444' },
  { key: 'in-progress', label: 'In Progress', icon: 'fas fa-tools', color: '#ef4444' },
  { key: 'completed', label: 'Completed', icon: 'fas fa-check', color: '#040e40' },
  { key: 'ready-for-pickup', label: 'Ready for Pickup', icon: 'fas fa-bell', color: '#040e40' }
]

export default function AppointmentStatus({ trackingId }: AppointmentStatusProps) {
  const [appointment, setAppointment] = useState<AppointmentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAppointmentStatus()
  }, [trackingId])

  const fetchAppointmentStatus = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Debug logging for mobile issues
      console.log('Searching for tracking ID:', trackingId);
      
      // First check if we have real booking data
      const realBooking = getBookingByTrackingId(trackingId);
      
      if (realBooking) {
        console.log('Real booking found:', realBooking);
        // Convert BookingData to AppointmentStatus format
        const appointmentStatus: AppointmentStatus = {
          id: realBooking.trackingId,
          customerName: realBooking.customerName,
          deviceType: realBooking.deviceType,
          deviceModel: realBooking.deviceModel,
          status: realBooking.status,
          estimatedCompletion: realBooking.estimatedCompletion,
          notes: realBooking.notes,
          cost: realBooking.cost,
          createdAt: realBooking.createdAt,
          updatedAt: realBooking.updatedAt
        };
        
        setAppointment(appointmentStatus);
        setError('');
        return;
      } else {
        console.log('No real booking found for:', trackingId);
        // Debug: Log all available booking IDs
        const allBookings = getAllBookings();
        console.log('Available booking IDs:', allBookings.map(b => b.trackingId));
      }

      // Fallback: Check predefined mock data for demo purposes
      const mockAppointments: Record<string, AppointmentStatus> = {
        'ITS-250926-1001': {
          id: 'ITS-250926-1001',
          customerName: 'John Smith',
          deviceType: 'iPhone 14',
          deviceModel: 'iPhone 14 Pro',
          status: 'in-progress',
          estimatedCompletion: 'Tomorrow, 2:00 PM',
          notes: 'Screen replacement in progress. High-quality OLED display being installed.',
          cost: 299.99,
          createdAt: '2025-09-26T10:00:00Z',
          updatedAt: '2025-09-26T14:30:00Z'
        },
        'ITS-250926-1002': {
          id: 'ITS-250926-1002',
          customerName: 'Sarah Johnson',
          deviceType: 'MacBook Pro',
          deviceModel: 'MacBook Pro 13" 2023',
          status: 'diagnosed',
          estimatedCompletion: 'Friday, 4:00 PM',
          notes: 'Diagnosis complete. Logic board issue identified. Awaiting customer approval.',
          cost: 450.00,
          createdAt: '2025-09-26T09:15:00Z',
          updatedAt: '2025-09-26T13:45:00Z'
        },
        'ITS-250926-1003': {
          id: 'ITS-250926-1003',
          customerName: 'Michael Brown',
          deviceType: 'Samsung Galaxy',
          deviceModel: 'Galaxy S23 Ultra',
          status: 'completed',
          estimatedCompletion: 'Ready for pickup',
          notes: 'Battery replacement completed successfully. Device tested and ready.',
          cost: 129.99,
          createdAt: '2025-09-25T14:20:00Z',
          updatedAt: '2025-09-26T11:00:00Z'
        },
        'ITS-250926-1004': {
          id: 'ITS-250926-1004',
          customerName: 'Emily Davis',
          deviceType: 'Dell Laptop',
          deviceModel: 'Dell XPS 15',
          status: 'ready-for-pickup',
          estimatedCompletion: 'Ready now',
          notes: 'RAM upgrade completed. Performance significantly improved.',
          cost: 180.00,
          createdAt: '2025-09-24T16:30:00Z',
          updatedAt: '2025-09-26T09:15:00Z'
        },
        // Legacy TRK format for backward compatibility
        'TRK-001': {
          id: 'TRK-001',
          customerName: 'Demo User',
          deviceType: 'iPhone 14',
          deviceModel: 'iPhone 14 Pro',
          status: 'in-progress',
          estimatedCompletion: 'Tomorrow, 2:00 PM',
          notes: 'Screen replacement in progress.',
          cost: 299.99,
          createdAt: '2025-09-26T10:00:00Z',
          updatedAt: '2025-09-26T14:30:00Z'
        },
        'TRK-002': {
          id: 'TRK-002',
          customerName: 'Demo User 2',
          deviceType: 'MacBook Pro',
          deviceModel: 'MacBook Pro 13"',
          status: 'diagnosed',
          estimatedCompletion: 'Friday, 4:00 PM',
          notes: 'Diagnosis in progress.',
          cost: 450.00,
          createdAt: '2025-09-26T09:15:00Z',
          updatedAt: '2025-09-26T13:45:00Z'
        }
      };

      // Check predefined mock data
      const mockData = mockAppointments[trackingId];
      
      if (mockData) {
        setAppointment(mockData);
        setError('');
      } else {
        // No real booking data and no mock data - invalid tracking ID
        setError('Invalid tracking ID. Please check your tracking ID and try again. Make sure you use a tracking ID from a booking made on this website.');
      }
    } catch (err) {
      setError('Unable to fetch appointment status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!appointment) return 0
    return statusSteps.findIndex(step => step.key === appointment.status)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-200">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Not Found</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!appointment) return null

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      {/* Appointment Header */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Repair Status
            </h2>
            <p className="text-gray-600">
              Tracking ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{trackingId}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-sm text-gray-500">Customer</div>
            <div className="font-semibold text-gray-900">{appointment.customerName}</div>
            <div className="text-sm text-gray-600">{appointment.deviceType} - {appointment.deviceModel}</div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Repair Progress</h3>
        <div className="relative">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            
            return (
              <div key={step.key} className="flex items-center mb-6 last:mb-0">
                {/* Step Circle */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? 'text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-400'
                }`}
                style={isCompleted ? { backgroundColor: step.color } : {}}
                >
                  <i className={`${step.icon} text-lg`}></i>
                </div>

                {/* Connecting Line */}
                {index < statusSteps.length - 1 && (
                  <div 
                    className={`absolute left-6 w-0.5 h-6 mt-12 transition-colors duration-300 ${
                      index < currentStepIndex ? 'bg-gray-400' : 'bg-gray-200'
                    }`}
                  ></div>
                )}

                {/* Step Content */}
                <div className="ml-6 flex-1">
                  <div className={`font-semibold ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  {isCurrent && appointment.notes && (
                    <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-500">
                  {isCompleted && new Date(appointment.updatedAt).toLocaleDateString()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appointment.estimatedCompletion && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center text-blue-700">
              <i className="fas fa-clock mr-2"></i>
              <span className="font-semibold">Estimated Completion</span>
            </div>
            <p className="text-blue-900 mt-1">{new Date(appointment.estimatedCompletion).toLocaleDateString()}</p>
          </div>
        )}

        {appointment.cost && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center text-green-700">
              <i className="fas fa-dollar-sign mr-2"></i>
              <span className="font-semibold">Estimated Cost</span>
            </div>
            <p className="text-green-900 mt-1 text-xl font-bold">Le {appointment.cost.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg border">
        <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="tel:+23233399391"
            className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 border"
          >
            <i className="fas fa-phone mr-2 text-blue-500"></i>
            Call Us
          </a>
          <a 
            href={`https://wa.me/23233399391?text=Hi, I need help with my repair. Tracking ID: ${trackingId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
          >
            <i className="fab fa-whatsapp mr-2"></i>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
