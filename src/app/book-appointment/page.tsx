'use client'

import { useState } from 'react'
import { Calendar, Clock, Smartphone, Monitor, User, Mail, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

interface AppointmentForm {
  customerName: string
  email: string
  phone: string
  deviceType: 'computer' | 'mobile' | 'tablet' | 'other'
  deviceModel: string
  issueDescription: string
  preferredDate: string
  preferredTime: string
  address: string
  serviceType: 'repair' | 'diagnostic' | 'maintenance' | 'consultation'
}

export default function BookAppointment() {
  const [formData, setFormData] = useState<AppointmentForm>({
    customerName: '',
    email: '',
    phone: '',
    deviceType: 'computer',
    deviceModel: '',
    issueDescription: '',
    preferredDate: '',
    preferredTime: '',
    address: '',
    serviceType: 'repair'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Send data to API
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(
          `Appointment booked successfully!\n\nAppointment ID: ${result.appointment.id}\nCustomer: ${formData.customerName}\nDevice: ${formData.deviceType} - ${formData.deviceModel}\nDate: ${formData.preferredDate} at ${formData.preferredTime}\n\nYou will receive a confirmation email shortly.`,
          { duration: 10000 }
        )
        
        // Reset form
        setFormData({
          customerName: '',
          email: '',
          phone: '',
          deviceType: 'computer',
          deviceModel: '',
          issueDescription: '',
          preferredDate: '',
          preferredTime: '',
          address: '',
          serviceType: 'repair'
        })
      } else {
        toast.error('Error: ' + (result.error || 'Failed to book appointment. Please try again.'))
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Network error: Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Book Your Repair Appointment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Schedule your computer or mobile repair with our expert technicians. 
            We&apos;ll provide you with real-time updates throughout the repair process.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Optional - for pickup service"
                  />
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-primary" />
                Device Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 mb-2">
                    Device Type *
                  </label>
                  <select
                    id="deviceType"
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="computer">Computer/Laptop</option>
                    <option value="mobile">Mobile Phone</option>
                    <option value="tablet">Tablet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="deviceModel" className="block text-sm font-medium text-gray-700 mb-2">
                    Device Model/Brand *
                  </label>
                  <input
                    type="text"
                    id="deviceModel"
                    name="deviceModel"
                    value={formData.deviceModel}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., iPhone 13, Dell XPS 13, Samsung Galaxy S21"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="repair">Repair</option>
                    <option value="diagnostic">Diagnostic</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Description *
                  </label>
                  <textarea
                    id="issueDescription"
                    name="issueDescription"
                    value={formData.issueDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field"
                    placeholder="Please describe the issue you're experiencing with your device..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Appointment Time */}
            <div className="pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Preferred Appointment Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time *
                  </label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Booking Appointment...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="card text-center">
            <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Quick Response</h3>
            <p className="text-gray-600 text-sm">We&apos;ll confirm your appointment within 2 hours</p>
          </div>
          <div className="card text-center">
            <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Email Updates</h3>
            <p className="text-gray-600 text-sm">Receive automatic updates on your repair status</p>
          </div>
          <div className="card text-center">
            <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Flexible Service</h3>
            <p className="text-gray-600 text-sm">Drop-off or pickup service available</p>
          </div>
        </div>
      </div>
    </div>
  )
}
