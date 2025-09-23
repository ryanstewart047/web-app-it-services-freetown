'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScrollAnimations } from '@/hooks/useScrollAnimations';
import { usePageLoader } from '@/hooks/usePageLoader';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function BookAppointment() {
  const router = useRouter();
  const { isLoading, progress } = usePageLoader({
    minLoadTime: 1800
  });
  
  // Initialize scroll animations
  useScrollAnimations();
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    deviceType: '',
    deviceModel: '',
    serviceType: '',
    issueDescription: '',
    preferredDate: '',
    preferredTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number - only allow numbers, spaces, +, -, (, )
    if (name === 'phone') {
      const phoneRegex = /^[0-9+\-\s()]*$/;
      if (!phoneRegex.test(value)) {
        return; // Don't update if invalid characters
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate that appointment is not in the past
  const validateDateTime = () => {
    if (!formData.preferredDate || !formData.preferredTime) return false;
    
    const selectedDateTime = new Date(`${formData.preferredDate}T${formData.preferredTime}`);
    const now = new Date();
    
    // Check if the selected date/time is in the past
    if (selectedDateTime <= now) {
      alert('Please select a future date and time for your appointment.');
      return false;
    }
    
    // Check if it's within business hours (8 AM to 6 PM)
    const selectedHour = selectedDateTime.getHours();
    if (selectedHour < 8 || selectedHour >= 18) {
      alert('Please select a time between 8:00 AM and 6:00 PM.');
      return false;
    }
    
    // Check if it's a weekend (Saturday = 6, Sunday = 0)
    const selectedDay = selectedDateTime.getDay();
    if (selectedDay === 0 || selectedDay === 6) {
      alert('We are only available Monday through Friday. Please select a weekday.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date and time before submission
    if (!validateDateTime()) {
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessData(data);
        setShowSuccess(true);
        
        // Reset form
        setFormData({
          customerName: '',
          email: '',
          phone: '',
          address: '',
          deviceType: '',
          deviceModel: '',
          serviceType: '',
          issueDescription: '',
          preferredDate: '',
          preferredTime: '',
        });
        setCurrentStep(1);
        
        // Redirect to chat after 3 seconds to allow user to see the success message
        setTimeout(() => {
          window.location.href = 'https://itservicesfreetown.com/?openchat=true';
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error booking your appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3 && validateCurrentStep()) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      const phonePattern = /^[+]?[\d\s\-()]{8,}$/; // At least 8 digits with optional formatting
      return formData.customerName.trim() !== '' && 
             formData.email.trim() !== '' && 
             formData.phone.trim() !== '' &&
             phonePattern.test(formData.phone.replace(/[\s\-()]/g, '')); // Remove formatting for validation
    }
    if (currentStep === 2) {
      return formData.deviceType !== '' && 
             formData.deviceModel.trim() !== '' && 
             formData.serviceType !== '' && 
             formData.issueDescription.trim() !== '';
    }
    if (currentStep === 3) {
      if (!formData.preferredDate || !formData.preferredTime) return false;
      
      const selectedDateTime = new Date(`${formData.preferredDate}T${formData.preferredTime}`);
      const now = new Date();
      
      // Must be in the future
      if (selectedDateTime <= now) return false;
      
      // Must be during business hours (8 AM to 6 PM)
      const selectedHour = selectedDateTime.getHours();
      if (selectedHour < 8 || selectedHour >= 18) return false;
      
      // Must be a weekday
      const selectedDay = selectedDateTime.getDay();
      if (selectedDay === 0 || selectedDay === 6) return false;
      
      return true;
    }
    return true;
  };

  const getCurrentStepErrors = () => {
    const errors = [];
    if (currentStep === 1) {
      if (!formData.customerName.trim()) errors.push('Full Name is required');
      if (!formData.email.trim()) errors.push('Email Address is required');
      if (!formData.phone.trim()) {
        errors.push('Phone Number is required');
      } else {
        const phonePattern = /^[+]?[\d\s\-()]{8,}$/;
        const digitsOnly = formData.phone.replace(/[\s\-()]/g, '');
        if (!phonePattern.test(digitsOnly) || digitsOnly.length < 8) {
          errors.push('Phone Number must be at least 8 digits (numbers only)');
        }
      }
    }
    if (currentStep === 2) {
      if (!formData.deviceType) errors.push('Device Type is required');
      if (!formData.deviceModel.trim()) errors.push('Device Model/Brand is required');
      if (!formData.serviceType) errors.push('Service Type is required');
      if (!formData.issueDescription.trim()) errors.push('Issue Description is required');
    }
    if (currentStep === 3) {
      if (!formData.preferredDate) errors.push('Preferred Date is required');
      if (!formData.preferredTime) errors.push('Preferred Time is required');
      
      if (formData.preferredDate && formData.preferredTime) {
        const selectedDateTime = new Date(`${formData.preferredDate}T${formData.preferredTime}`);
        const now = new Date();
        
        if (selectedDateTime <= now) {
          errors.push('Please select a future date and time');
        }
        
        const selectedHour = selectedDateTime.getHours();
        if (selectedHour < 8 || selectedHour >= 18) {
          errors.push('Please select a time between 8:00 AM and 6:00 PM');
        }
        
        const selectedDay = selectedDateTime.getDay();
        if (selectedDay === 0 || selectedDay === 6) {
          errors.push('We are only available Monday through Friday');
        }
      }
    }
    return errors;
  };

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('preferredDate') as HTMLInputElement;
    if (dateInput) {
      dateInput.min = today;
    }
  }, []);

  if (isLoading) {
    return <LoadingOverlay progress={progress} variant="modern" />;
  }

  return (
    <>
      {/* Modern Hero Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #040e40 100%)'}}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-blue-900/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-red-400/10 to-transparent rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-900/10 to-transparent rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <i className="fas fa-calendar-plus text-2xl text-white"></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
              Book Your Repair
            </h1>
            <p className="text-lg md:text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
              Schedule your device repair with our expert technicians. Fast, reliable, and professional service.
            </p>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-white shadow-lg' 
                    : 'bg-white/20 text-white border-2 border-white/30'
                }`} style={currentStep >= step ? {color: '#040e40'} : {}}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 rounded transition-all duration-300 ${
                    currentStep > step ? 'bg-white' : 'bg-white/30'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-red-100">
            <span className="text-sm">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Personal Information' :
                currentStep === 2 ? 'Device & Service Details' :
                'Schedule & Confirm'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 md:p-12">
              
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{background: '#040e40'}}>
                      <i className="fas fa-user text-white text-xl"></i>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h2>
                    <p className="text-gray-600">Let us know how to reach you</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-user mr-2" style={{color: '#040e40'}}></i>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all duration-300 text-lg placeholder-gray-400"
                        style={{
                          '--tw-ring-color': '#040e40',
                          '--tw-ring-opacity': '0.2'
                        } as React.CSSProperties}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#040e40';
                          e.target.style.boxShadow = '0 0 0 4px rgba(4, 14, 64, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Enter your full name"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-envelope mr-2" style={{color: '#040e40'}}></i>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all duration-300 text-lg placeholder-gray-400"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#040e40';
                          e.target.style.boxShadow = '0 0 0 4px rgba(4, 14, 64, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-phone mr-2" style={{color: '#040e40'}}></i>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all duration-300 text-lg placeholder-gray-400"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#040e40';
                          e.target.style.boxShadow = '0 0 0 4px rgba(4, 14, 64, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="+232 76 123 456 or 076123456"
                        value={formData.phone}
                        onChange={handleChange}
                        pattern="[0-9+\-\s()]+"
                        title="Please enter numbers only. You can use +, -, spaces, and parentheses for formatting."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        <i className="fas fa-info-circle mr-1"></i>
                        Numbers only. Use spaces, +, -, () for formatting
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-map-marker-alt mr-2" style={{color: '#040e40'}}></i>
                        Address (Optional)
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all duration-300 text-lg placeholder-gray-400"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#040e40';
                          e.target.style.boxShadow = '0 0 0 4px rgba(4, 14, 64, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Your address or nearest landmark"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Device & Service Information */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4">
                      <i className="fas fa-mobile-alt text-white text-xl"></i>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Device & Service Details</h2>
                    <p className="text-gray-600">Tell us about your device and what needs fixing</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="deviceType" className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-laptop mr-2 text-red-500"></i>
                        Device Type *
                      </label>
                      <select 
                        id="deviceType" 
                        name="deviceType" 
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all duration-300 text-lg bg-white"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#ef4444';
                          e.target.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        value={formData.deviceType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Choose your device type...</option>
                        <option value="computer">💻 Computer/Laptop</option>
                        <option value="mobile">📱 Mobile Phone</option>
                        <option value="tablet">📱 Tablet/iPad</option>
                        <option value="other">🔧 Other Device</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="deviceModel" className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-tag mr-2 text-red-500"></i>
                        Device Model/Brand *
                      </label>
                      <input
                        type="text"
                        id="deviceModel"
                        name="deviceModel"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all duration-300 text-lg placeholder-gray-400"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#ef4444';
                          e.target.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="e.g., iPhone 14, Samsung Galaxy S23"
                        value={formData.deviceModel}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="serviceType" className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-tools mr-2 text-green-500"></i>
                        Service Type *
                      </label>
                      <select 
                        id="serviceType" 
                        name="serviceType" 
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 text-lg bg-white"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Choose the service you need...</option>
                        <option value="repair">🔧 Repair (Fix hardware/software issues)</option>
                        <option value="diagnostic">🔍 Diagnostic (Identify the problem)</option>
                        <option value="maintenance">⚙️ Maintenance (Cleaning, updates)</option>
                        <option value="consultation">💬 Consultation (Expert advice)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="issueDescription" className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-comment-alt mr-2 text-green-500"></i>
                        Issue Description *
                      </label>
                      <textarea
                        id="issueDescription"
                        name="issueDescription"
                        rows={5}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 text-lg placeholder-gray-400 resize-none"
                        placeholder="Please describe the issue in detail. For example: 'Screen is cracked and not responding to touch', 'Computer won't turn on', etc."
                        value={formData.issueDescription}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule & Confirm */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{background: '#040e40'}}>
                      <i className="fas fa-calendar-check text-white text-xl"></i>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Schedule Your Appointment</h2>
                    <p className="text-gray-600">Choose your preferred date and time</p>
                    
                    {/* Business Hours Notice */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 inline-block">
                      <div className="flex items-center text-blue-700 text-sm">
                        <i className="fas fa-info-circle mr-2"></i>
                        <span className="font-semibold">Business Hours:</span>
                      </div>
                      <p className="text-blue-900 text-sm mt-1">
                        Monday - Friday: 8:00 AM - 6:00 PM<br/>
                        Weekends: Closed
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="preferredDate" className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-calendar mr-2 text-purple-500"></i>
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        id="preferredDate"
                        name="preferredDate"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="preferredTime" className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-clock mr-2 text-purple-500"></i>
                        Preferred Time *
                      </label>
                      <select 
                        id="preferredTime" 
                        name="preferredTime" 
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg bg-white"
                        value={formData.preferredTime}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select your preferred time...</option>
                        <option value="09:00">🌅 09:00 AM (Early Morning)</option>
                        <option value="09:30">🌅 09:30 AM</option>
                        <option value="10:00">☀️ 10:00 AM (Morning)</option>
                        <option value="10:30">☀️ 10:30 AM</option>
                        <option value="11:00">☀️ 11:00 AM</option>
                        <option value="11:30">☀️ 11:30 AM</option>
                        <option value="12:00">🕛 12:00 PM (Noon)</option>
                        <option value="12:30">🕛 12:30 PM</option>
                        <option value="13:00">🌤️ 01:00 PM (Afternoon)</option>
                        <option value="13:30">🌤️ 01:30 PM</option>
                        <option value="14:00">🌤️ 02:00 PM</option>
                        <option value="14:30">🌤️ 02:30 PM</option>
                        <option value="15:00">🌅 03:00 PM</option>
                        <option value="15:30">🌅 03:30 PM</option>
                        <option value="16:00">🌆 04:00 PM (Late Afternoon)</option>
                        <option value="16:30">🌆 04:30 PM</option>
                        <option value="17:00">🌇 05:00 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-clipboard-list mr-2 text-blue-500"></i>
                      Booking Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><strong>Name:</strong> {formData.customerName || 'Not provided'}</div>
                      <div><strong>Email:</strong> {formData.email || 'Not provided'}</div>
                      <div><strong>Phone:</strong> {formData.phone || 'Not provided'}</div>
                      <div><strong>Device:</strong> {formData.deviceModel || 'Not provided'}</div>
                      <div><strong>Service:</strong> {formData.serviceType || 'Not selected'}</div>
                      <div><strong>Date & Time:</strong> {formData.preferredDate && formData.preferredTime ? `${formData.preferredDate} at ${formData.preferredTime}` : 'Not selected'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                {/* Validation Errors */}
                {!validateCurrentStep() && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <i className="fas fa-exclamation-triangle text-red-500 mt-1 mr-3"></i>
                      <div>
                        <h4 className="text-red-800 font-semibold text-sm">Please complete the following fields:</h4>
                        <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                          {getCurrentStepErrors().map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      currentStep === 1 
                        ? 'invisible' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center'
                    }`}
                    disabled={currentStep === 1}
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Previous
                  </button>

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateCurrentStep()}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform shadow-lg flex items-center ${
                        validateCurrentStep()
                          ? 'text-white hover:scale-105 hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      style={validateCurrentStep() ? {
                        background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)'
                      } : {}}
                    >
                      Next Step
                      <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.preferredDate || !formData.preferredTime}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform shadow-lg flex items-center ${
                        (!isSubmitting && formData.preferredDate && formData.preferredTime)
                          ? 'text-white hover:scale-105 hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      } disabled:hover:scale-100`}
                      style={(!isSubmitting && formData.preferredDate && formData.preferredTime) ? {
                        background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)'
                      } : {}}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Booking...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check mr-2"></i>
                          Book Appointment
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Additional Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{background: '#040e40'}}>
                <i className="fas fa-clock text-white text-lg"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-gray-600 text-sm">We&apos;ll confirm your appointment within 2 hours during business hours</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-shield-alt text-white text-lg"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure & Safe</h3>
              <p className="text-gray-600 text-sm">Your personal information is encrypted and protected</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{background: '#040e40'}}>
                <i className="fas fa-bell text-white text-lg"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600 text-sm">Get SMS and email notifications about your repair progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">Your appointment has been successfully scheduled.</p>
              
              {/* Tracking ID Display */}
              <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-6 mb-6 border-2 border-dashed border-red-200">
                <h4 className="font-semibold text-gray-900 mb-2">Your Tracking ID</h4>
                <div className="bg-white rounded-lg p-3 border">
                  <span className="font-mono text-xl font-bold text-red-600">{successData.trackingId}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Save this ID to track your repair progress</p>
              </div>

              {/* Appointment Details */}
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-semibold">{successData.appointment?.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Device:</span>
                  <span className="font-semibold">{successData.appointment?.deviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-semibold">{successData.appointment?.deviceModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{successData.appointment?.preferredDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{successData.appointment?.preferredTime}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 text-sm">
                    <i className="fas fa-info-circle mr-2"></i>
                    You&apos;ll be redirected to chat with our agents in a few seconds, or click below to go now.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    window.location.href = 'https://itservicesfreetown.com/?openchat=true';
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center"
                >
                  <i className="fas fa-comments mr-2"></i>
                  Chat with Agent Now
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(successData.trackingId);
                    alert('Tracking ID copied to clipboard!');
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center"
                >
                  <i className="fas fa-copy mr-2"></i>
                  Copy Tracking ID
                </button>
                
                <button
                  onClick={() => router.push(`/track-repair`)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center"
                >
                  <i className="fas fa-search mr-2"></i>
                  Track My Repair
                </button>
                
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
