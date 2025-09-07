'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function BookAppointment() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    deviceType: 'computer',
    serviceType: 'hardware-repair',
    description: '',
    preferredDate: '',
    preferredTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        router.push(`/track-repair?id=${data.id}`);
      } else {
        throw new Error('Failed to book appointment');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error booking your appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTypes = [
    { value: 'hardware-repair', label: 'Hardware Repair', icon: '/assets/images/laptop-repair.svg' },
    { value: 'software-issue', label: 'Software Issue', icon: '/assets/images/mobile-unlocking.svg' },
    { value: 'maintenance', label: 'Maintenance', icon: '/assets/images/mobile-motherboard-repair.svg' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-primary">Book Your Repair Appointment</h1>
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === i ? 'bg-primary text-white' : step > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > i ? '✓' : i}
                </div>
                <span className="text-sm mt-2">
                  {i === 1 ? 'Personal Info' : i === 2 ? 'Service Details' : 'Schedule'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 h-2 flex">
            <div className={`flex-1 rounded-l-full ${step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`flex-1 rounded-r-full ${step >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Service Details</h2>
                
                <div>
                  <label className="block text-gray-700 mb-2">Device Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer ${
                        formData.deviceType === 'computer' ? 'border-primary bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, deviceType: 'computer' }))}
                    >
                      <div className="flex items-center mb-2">
                        <i className="fas fa-laptop text-xl mr-2 text-primary"></i>
                        <span className="font-medium">Computer/Laptop</span>
                      </div>
                      <p className="text-sm text-gray-500">Desktop, laptop, or all-in-one computers</p>
                    </div>
                    
                    <div
                      className={`border rounded-lg p-4 cursor-pointer ${
                        formData.deviceType === 'mobile' ? 'border-primary bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, deviceType: 'mobile' }))}
                    >
                      <div className="flex items-center mb-2">
                        <i className="fas fa-mobile-alt text-xl mr-2 text-primary"></i>
                        <span className="font-medium">Mobile Device</span>
                      </div>
                      <p className="text-sm text-gray-500">Smartphones, tablets, and other mobile devices</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Service Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {serviceTypes.map(service => (
                      <div
                        key={service.value}
                        className={`border rounded-lg p-4 cursor-pointer ${
                          formData.serviceType === service.value ? 'border-primary bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, serviceType: service.value }))}
                      >
                        <div className="flex items-center justify-center mb-3">
                          <div className="relative w-12 h-12">
                            <Image 
                              src={service.icon} 
                              alt={service.label}
                              fill
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        </div>
                        <p className="text-center font-medium">{service.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-gray-700 mb-2">Issue Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="input-field"
                    placeholder="Please describe the issue you're experiencing..."
                  ></textarea>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-outline"
                  >
                    Previous Step
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Schedule Your Appointment</h2>
                
                <div>
                  <label htmlFor="preferredDate" className="block text-gray-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    required
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label htmlFor="preferredTime" className="block text-gray-700 mb-2">Preferred Time</label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select a time slot</option>
                    <option value="09:00">9:00 AM - 10:00 AM</option>
                    <option value="10:00">10:00 AM - 11:00 AM</option>
                    <option value="11:00">11:00 AM - 12:00 PM</option>
                    <option value="13:00">1:00 PM - 2:00 PM</option>
                    <option value="14:00">2:00 PM - 3:00 PM</option>
                    <option value="15:00">3:00 PM - 4:00 PM</option>
                    <option value="16:00">4:00 PM - 5:00 PM</option>
                  </select>
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Appointment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {formData.name}</p>
                    <p><span className="font-medium">Email:</span> {formData.email}</p>
                    <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                    <p><span className="font-medium">Device Type:</span> {formData.deviceType === 'computer' ? 'Computer/Laptop' : 'Mobile Device'}</p>
                    <p><span className="font-medium">Service Type:</span> {
                      serviceTypes.find(s => s.value === formData.serviceType)?.label
                    }</p>
                    <p><span className="font-medium">Issue Description:</span> {formData.description}</p>
                    <p><span className="font-medium">Appointment:</span> {formData.preferredDate} at {formData.preferredTime}</p>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-outline"
                  >
                    Previous Step
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : 'Book Appointment'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
