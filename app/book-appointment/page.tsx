'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, ValidationError } from '@formspree/react';
import { useScrollAnimations } from '@/hooks/useScrollAnimations';
import { usePageLoader } from '@/hooks/usePageLoader';
import LoadingOverlay from '@/components/LoadingOverlay';
import { saveBooking } from '@/lib/unified-booking-storage';
import PageBanner from '@/components/PageBanner';
import dynamic from 'next/dynamic';

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false });

export default function BookAppointment() {
  const router = useRouter();
  const { isLoading, progress } = usePageLoader({
    minLoadTime: 1800
  });
  
  // Initialize scroll animations
  useScrollAnimations();
  
  // Formspree integration
  const [state, handleFormspreeSubmit] = useForm("mpwjnwrz");
  
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
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankYouCountdown, setThankYouCountdown] = useState(15);
  const [successData, setSuccessData] = useState<any>(null);
  const [currentTrackingId, setCurrentTrackingId] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const recaptchaRef = useRef<any>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const pendingNavigation = useRef<string | null>(null);

  // Check if form has any data entered
  const isFormDirty = () => {
    return (
      formData.customerName.trim() !== '' ||
      formData.email.trim() !== '' ||
      formData.phone.trim() !== '' ||
      formData.address.trim() !== '' ||
      formData.deviceType !== '' ||
      formData.deviceModel.trim() !== '' ||
      formData.serviceType !== '' ||
      formData.issueDescription.trim() !== '' ||
      formData.preferredDate !== '' ||
      formData.preferredTime !== ''
    );
  };

  // Warn user on page refresh/close if form has data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty() && !showSuccess && !showThankYou) {
        e.preventDefault();
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  // Intercept browser back/forward button when form has data
  const formDirtyRef = useRef(false);
  const backNavBlockedRef = useRef(false);
  useEffect(() => {
    formDirtyRef.current = isFormDirty() && !showSuccess && !showThankYou;
  });

  useEffect(() => {
    // Push an extra history entry so pressing back stays on this page
    const pushGuardState = () => {
      if (!backNavBlockedRef.current) {
        window.history.pushState({ bookingGuard: true }, '');
        backNavBlockedRef.current = true;
      }
    };

    pushGuardState();

    const handlePopState = (e: PopStateEvent) => {
      if (formDirtyRef.current) {
        // Re-push the guard state to keep user on the page
        window.history.pushState({ bookingGuard: true }, '');
        setShowLeaveWarning(true);
        pendingNavigation.current = '__browser_back__';
      } else {
        // Form is clean, allow normal back navigation
        backNavBlockedRef.current = false;
        window.history.back();
      }
    };

    // Intercept keyboard refresh shortcuts (Cmd+R, Ctrl+R, F5)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isRefresh = e.key === 'F5' || ((e.metaKey || e.ctrlKey) && e.key === 'r');
      if (isRefresh && formDirtyRef.current) {
        e.preventDefault();
        e.stopPropagation();
        setShowLeaveWarning(true);
        pendingNavigation.current = '__refresh__';
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  // Mark a field as touched (user has interacted and left the field)
  const markTouched = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  // Get validation error for a specific field (returns empty string if valid)
  const getFieldError = (field: string): string => {
    switch (field) {
      case 'customerName': {
        const name = formData.customerName.trim();
        if (!name) return 'Full Name is required';
        if (name.length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s'.\-]+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        return '';
      }
      case 'email': {
        const email = formData.email.trim();
        if (!email) return 'Email Address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Please enter a valid email address (e.g. name@example.com)';
        return '';
      }
      case 'phone': {
        const phone = formData.phone.trim();
        if (!phone) return 'Phone Number is required';
        const digitsOnly = phone.replace(/[\s\-()+ ]/g, '');
        if (!/^\d+$/.test(digitsOnly)) return 'Phone number can only contain digits and formatting characters (+, -, spaces, parentheses)';
        if (digitsOnly.length < 8) return 'Phone number must be at least 8 digits';
        return '';
      }
      case 'deviceModel': {
        const model = formData.deviceModel.trim();
        if (!model) return 'Device Model/Brand is required';
        if (model.length < 2) return 'Device model must be at least 2 characters';
        return '';
      }
      case 'issueDescription': {
        const desc = formData.issueDescription.trim();
        if (!desc) return 'Issue Description is required';
        if (desc.length < 10) return 'Please describe the issue in at least 10 characters';
        return '';
      }
      default:
        return '';
    }
  };

  // Handle reCAPTCHA verification
  const onCaptchaChange = async (token: string | null) => {
    if (!token) {
      setCaptchaVerified(false);
      return;
    }
    try {
      const res = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setCaptchaVerified(data.success === true);
    } catch {
      setCaptchaVerified(false);
    }
  };

  // Generate a more detailed tracking ID with ITS prefix
  const generateTrackingId = () => {
    const prefix = 'ITS';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${prefix}-${year}${month}${day}-${random}`;
  };

  // Reset all booking states for a fresh start
  const resetBookingStates = () => {
    setShowSuccess(false);
    setShowThankYou(false);
    setCurrentTrackingId('');
    setSuccessData(null);
    setThankYouCountdown(15);
  };

  // Handle user choice for chat redirect
  const handleChatChoice = (openChat: boolean) => {
    if (openChat) {
      window.location.href = 'https://itservicesfreetown.com/?openchat=true&message=' + encodeURIComponent(`Hi! I just booked an appointment (Tracking ID: ${currentTrackingId}). I'd like to discuss the details with an agent.`);
    } else {
      // Show thank you message with 15-second countdown
      setShowSuccess(false);
      setShowThankYou(true);
      setThankYouCountdown(15);
      
      // Start countdown timer
      const countdown = setInterval(() => {
        setThankYouCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            setShowThankYou(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Handle manual close of thank you popup
  const handleCloseThankYou = () => {
    setShowThankYou(false);
    setThankYouCountdown(15);
  };

  // Handle starting a new booking (clears everything)
  const handleNewBooking = () => {
    resetBookingStates();
    setTouchedFields({});
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
  };

  const submitBookingToServer = async (trackingId: string, payload: typeof formData) => {
    try {
      const response = await fetch('/api/analytics/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'submission',
          formType: 'repair-booking',
          trackingId,
          fields: {
            trackingId,
            customerName: payload.customerName,
            name: payload.customerName,
            email: payload.email,
            phone: payload.phone,
            address: payload.address,
            deviceType: payload.deviceType,
            deviceModel: payload.deviceModel,
            serviceType: payload.serviceType,
            issueDescription: payload.issueDescription,
            issue: payload.issueDescription,
            preferredDate: payload.preferredDate,
            preferredTime: payload.preferredTime,
            notes: `Preferred time: ${payload.preferredTime}`
          },
          page: '/book-appointment'
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();

      if (result?.trackingId && result.trackingId !== trackingId) {
        setCurrentTrackingId(result.trackingId);
      }

      console.log('Booking synced to server', result);
    } catch (error) {
      console.warn('Unable to sync booking to server API:', error);
    }
  };

  // Handle Formspree success
  useEffect(() => {
    if (state.succeeded && !showSuccess && !currentTrackingId) {
      const bookingSnapshot = { ...formData };
      const trackingId = generateTrackingId();
      setCurrentTrackingId(trackingId); // Store tracking ID in state
      
      // Save booking to localStorage for tracking
      const savedBooking = saveBooking({
        trackingId,
        customerName: bookingSnapshot.customerName,
        email: bookingSnapshot.email,
        phone: bookingSnapshot.phone,
        address: bookingSnapshot.address,
        deviceType: bookingSnapshot.deviceType,
        deviceModel: bookingSnapshot.deviceModel,
        serviceType: bookingSnapshot.serviceType,
        issueDescription: bookingSnapshot.issueDescription,
        preferredDate: bookingSnapshot.preferredDate,
        preferredTime: bookingSnapshot.preferredTime
      });

      // Also save to repair tracking system for admin management
      try {
        const repairs = JSON.parse(localStorage.getItem('its_repairs') || '[]');
        repairs.push({
          trackingId,
          customerName: bookingSnapshot.customerName,
          email: bookingSnapshot.email,
          phone: bookingSnapshot.phone,
          deviceType: bookingSnapshot.deviceType,
          issue: `${bookingSnapshot.serviceType}: ${bookingSnapshot.issueDescription}`,
          status: 'received',
          dateReceived: new Date().toISOString(),
          estimatedCompletion: bookingSnapshot.preferredDate,
          notes: `Device Model: ${bookingSnapshot.deviceModel}, Preferred Time: ${bookingSnapshot.preferredTime}`
        });
        localStorage.setItem('its_repairs', JSON.stringify(repairs));
      } catch (error) {
        console.error('Error saving to repair system:', error);
      }

      void submitBookingToServer(trackingId, bookingSnapshot);
      
      // Send confirmation email to customer + admin notification
      // (Formspree still handles its own notification — this is additional)
      const sendConfirmationEmails = async () => {
        try {
          const response = await fetch('/api/booking/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trackingId,
              customerName: bookingSnapshot.customerName,
              email: bookingSnapshot.email,
              phone: bookingSnapshot.phone,
              address: bookingSnapshot.address,
              deviceType: bookingSnapshot.deviceType,
              deviceModel: bookingSnapshot.deviceModel,
              serviceType: bookingSnapshot.serviceType,
              issueDescription: bookingSnapshot.issueDescription,
              preferredDate: bookingSnapshot.preferredDate,
              preferredTime: bookingSnapshot.preferredTime,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Confirmation emails sent:', result.emails);
          } else {
            console.warn('⚠️ Email API responded with', response.status);
          }
        } catch (error) {
          // Email failure should NOT block the booking — Formspree already captured it
          console.warn('ℹ️ Email confirmation not available:', error);
        }
      };
      sendConfirmationEmails();

      // Auto-sync to cloud via server API - works for all customers (if server available)
      const tryServerSync = async () => {
        // Check if we're on GitHub Pages (no server API available)
        const isGitHubPages = window.location.hostname.includes('github.io') || 
                             window.location.hostname === 'itservicesfreetown.com';
        
        if (isGitHubPages) {
          console.log('ℹ️ GitHub Pages detected - server sync not available');
          return;
        }
        
        try {
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'sync_booking',
              booking: {
                trackingId,
                customerName: formData.customerName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                deviceType: formData.deviceType,
                deviceModel: formData.deviceModel,
                serviceType: formData.serviceType,
                issueDescription: formData.issueDescription,
                preferredDate: formData.preferredDate,
                preferredTime: formData.preferredTime,
                createdAt: new Date().toISOString(),
                status: 'received'
              }
            })
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success) {
            console.log('✅ Booking automatically synced via server');
          } else {
            console.log('⚠️ Server sync failed, saved locally:', result.message);
          }
        } catch (error) {
          console.log('ℹ️ Server sync not available (GitHub Pages mode), booking saved locally');
        }
      };
      tryServerSync();
      
      const successData = {
        trackingId,
        customerName: bookingSnapshot.customerName,
        email: bookingSnapshot.email,
        preferredDate: bookingSnapshot.preferredDate,
        preferredTime: bookingSnapshot.preferredTime
      };
      
      setSuccessData(successData);
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
      
      // No automatic redirect - user will choose manually
    }
  }, [state.succeeded, showSuccess, currentTrackingId, formData.customerName, formData.email, formData.preferredDate, formData.preferredTime, formData.address, formData.deviceModel, formData.deviceType, formData.issueDescription, formData.phone, formData.serviceType]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // COMPREHENSIVE CLIENT-SIDE VALIDATION ✅
    const errors: string[] = [];

    // Validate customer info
    if (!formData.customerName || formData.customerName.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.push('Please provide a valid email address');
    }
    
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      errors.push('Phone number must be at least 8 digits');
    }

    // Validate device info
    if (!formData.deviceType) errors.push('Please select a device type');
    if (!formData.serviceType) errors.push('Please select service type');
    if (!formData.issueDescription || formData.issueDescription.trim().length < 10) {
      errors.push('Issue description must be at least 10 characters');
    }

    // Validate date/time
    if (!formData.preferredDate) errors.push('Please select a preferred date');
    if (!formData.preferredTime) errors.push('Please select a preferred time');
    if (!validateDateTime()) errors.push('Selected date/time is invalid');

    // Validate T&C and captcha
    if (!acceptedTerms) errors.push('You must accept the Terms & Conditions');
    if (!captchaVerified) errors.push('Please complete the verification challenge');

    if (errors.length > 0) {
      alert('Please fix these errors:\n\n' + errors.map((e, i) => `${i + 1}. ${e}`).join('\n'));
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Submit to Formspree
      await handleFormspreeSubmit(e);
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error booking your appointment. Please try again.');
      
      // Redirect to chat after error so customer can get help  
      setTimeout(() => {
        window.location.href = 'https://itservicesfreetown.com/?openchat=true&message=' + encodeURIComponent('Hi! I had trouble booking an appointment on your website. Can you help me with the booking process?');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Mark all fields in current step as touched to show errors
    if (currentStep === 1) {
      setTouchedFields(prev => ({ ...prev, customerName: true, email: true, phone: true }));
    }
    if (currentStep === 2) {
      setTouchedFields(prev => ({ ...prev, deviceModel: true, issueDescription: true }));
    }
    if (currentStep < 3 && validateCurrentStep()) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      return !getFieldError('customerName') && 
             !getFieldError('email') && 
             !getFieldError('phone');
    }
    if (currentStep === 2) {
      return formData.deviceType !== '' && 
             !getFieldError('deviceModel') && 
             formData.serviceType !== '' && 
             !getFieldError('issueDescription');
    }
    if (currentStep === 3) {
      if (!formData.preferredDate || !formData.preferredTime) return false;
      if (!acceptedTerms) return false;
      if (!captchaVerified) return false;
      
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
      const nameErr = getFieldError('customerName');
      if (nameErr) errors.push(nameErr);
      const emailErr = getFieldError('email');
      if (emailErr) errors.push(emailErr);
      const phoneErr = getFieldError('phone');
      if (phoneErr) errors.push(phoneErr);
    }
    if (currentStep === 2) {
      if (!formData.deviceType) errors.push('Device Type is required');
      const modelErr = getFieldError('deviceModel');
      if (modelErr) errors.push(modelErr);
      if (!formData.serviceType) errors.push('Service Type is required');
      const descErr = getFieldError('issueDescription');
      if (descErr) errors.push(descErr);
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
      if (!acceptedTerms) errors.push('You must accept the Terms & Conditions');
      if (!captchaVerified) errors.push('Please complete the verification challenge');
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
      {/* Unsaved Changes Warning Modal */}
      {showLeaveWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <i className="fas fa-exclamation-triangle text-amber-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Unsaved Changes</h3>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                You have unsaved booking information. If you leave this page, all the data you&apos;ve entered will be lost.
              </p>
            </div>
            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowLeaveWarning(false);
                  pendingNavigation.current = null;
                }}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                Stay on Page
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveWarning(false);
                  const nav = pendingNavigation.current;
                  pendingNavigation.current = null;
                  if (nav === '__refresh__') {
                    window.location.reload();
                  } else if (nav === '__browser_back__') {
                    backNavBlockedRef.current = false;
                    window.history.go(-1);
                  } else if (nav) {
                    router.push(nav);
                  }
                }}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
              >
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Hero Section */}
      <PageBanner
        title="Book Your Repair"
        subtitle="Schedule your device repair with our expert technicians. Fast, reliable, and professional service."
        icon="fas fa-calendar-plus"
      />

      {/* Progress Indicator */}
      <div className="bg-[#040e40] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-4">
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
          <div className="mt-3 text-red-100 text-center">
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
            <form onSubmit={handleSubmit} className="p-8 md:p-12" data-form-type="repair-booking">
              
              {/* Hidden inputs for Formspree - ensures all data is captured */}
              <input type="hidden" name="customerName" value={formData.customerName} />
              <input type="hidden" name="email" value={formData.email} />
              <input type="hidden" name="phone" value={formData.phone} />
              <input type="hidden" name="address" value={formData.address} />
              <input type="hidden" name="deviceType" value={formData.deviceType} />
              <input type="hidden" name="deviceModel" value={formData.deviceModel} />
              <input type="hidden" name="serviceType" value={formData.serviceType} />
              <input type="hidden" name="issueDescription" value={formData.issueDescription} />
              <input type="hidden" name="preferredDate" value={formData.preferredDate} />
              <input type="hidden" name="preferredTime" value={formData.preferredTime} />
              <input type="hidden" name="formType" value="appointment-booking" />
              <input type="hidden" name="trackingId" value={currentTrackingId} />
              
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
                          markTouched('customerName');
                          e.target.style.borderColor = getFieldError('customerName') ? '#ef4444' : '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Enter your full name"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                      />
                      {touchedFields.customerName && getFieldError('customerName') && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {getFieldError('customerName')}
                        </p>
                      )}
                      <ValidationError 
                        prefix="Name" 
                        field="customerName"
                        errors={state.errors}
                        className="text-red-600 text-sm mt-1"
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
                          markTouched('email');
                          e.target.style.borderColor = getFieldError('email') ? '#ef4444' : '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {touchedFields.email && getFieldError('email') && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {getFieldError('email')}
                        </p>
                      )}
                      <ValidationError 
                        prefix="Email" 
                        field="email"
                        errors={state.errors}
                        className="text-red-600 text-sm mt-1"
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
                          markTouched('phone');
                          e.target.style.borderColor = getFieldError('phone') ? '#ef4444' : '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="+232 76 123 456 or 076123456"
                        value={formData.phone}
                        onChange={handleChange}
                        pattern="[0-9+\-\s()]+"
                        title="Please enter numbers only. You can use +, -, spaces, and parentheses for formatting."
                        required
                      />
                      {touchedFields.phone && getFieldError('phone') && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {getFieldError('phone')}
                        </p>
                      )}
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
                        <option value="computer">💻 PC/Laptop</option>
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
                          markTouched('deviceModel');
                          e.target.style.borderColor = getFieldError('deviceModel') ? '#ef4444' : '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="e.g., iPhone 14, Samsung Galaxy S23"
                        value={formData.deviceModel}
                        onChange={handleChange}
                        required
                      />
                      {touchedFields.deviceModel && getFieldError('deviceModel') && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {getFieldError('deviceModel')}
                        </p>
                      )}
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
                        onBlur={() => markTouched('issueDescription')}
                        required
                      />
                      {touchedFields.issueDescription && getFieldError('issueDescription') && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {getFieldError('issueDescription')}
                        </p>
                      )}
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

                  {/* Google reCAPTCHA Verification */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-shield-alt mr-2 text-green-500"></i>
                      Verification
                    </h3>
                    {(() => {
                      const ReCAPTCHAAny = ReCAPTCHA as any;
                      return (
                        <ReCAPTCHAAny
                          ref={recaptchaRef}
                          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                          onChange={onCaptchaChange}
                          onExpired={() => setCaptchaVerified(false)}
                        />
                      );
                    })()}
                    {captchaVerified && (
                      <p className="text-green-600 font-semibold flex items-center mt-3">
                        <i className="fas fa-check-circle mr-1"></i> Verified
                      </p>
                    )}
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        required
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                        I agree to the{' '}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline font-semibold"
                        >
                          Terms & Conditions
                        </a>
                        {' '}of IT Services Freetown. I understand that repair services are subject to device condition and parts availability.
                      </span>
                    </label>
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
                      disabled={isSubmitting || !formData.preferredDate || !formData.preferredTime || !acceptedTerms || !captchaVerified}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform shadow-lg flex items-center ${
                        (!isSubmitting && formData.preferredDate && formData.preferredTime && acceptedTerms && captchaVerified)
                          ? 'text-white hover:scale-105 hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      } disabled:hover:scale-100`}
                      style={(!isSubmitting && formData.preferredDate && formData.preferredTime && acceptedTerms && captchaVerified) ? {
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
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all relative">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-3 right-3 w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors z-10 shadow-md border-2 border-white"
              title="Close"
            >
              <i className="fas fa-times text-red-600 font-bold"></i>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">Your appointment has been successfully scheduled.</p>
              
              {/* Tracking ID Display */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 mb-6 border-2 border-dashed border-red-300">
                <div className="flex items-center justify-center mb-2">
                  <i className="fas fa-qrcode text-red-600 mr-2"></i>
                  <h4 className="font-semibold text-gray-900">Your Tracking ID</h4>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-red-200 mb-3">
                  <span className="font-mono text-2xl font-bold text-red-700 tracking-wider">{currentTrackingId}</span>
                </div>
                <div className="flex items-center justify-center space-x-4 text-xs">
                  <button
                    onClick={() => navigator.clipboard.writeText(currentTrackingId)}
                    className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                  >
                    <i className="fas fa-copy mr-1"></i>
                    Copy ID
                  </button>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">💾 Save this ID for tracking</span>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-semibold">{successData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{successData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{successData.preferredDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{successData.preferredTime}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm text-center">
                    <i className="fas fa-comments mr-2"></i>
                    Would you like to chat with our support team about your appointment?
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleChatChoice(true)}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center shadow-lg"
                  >
                    <i className="fas fa-check mr-2"></i>
                    Yes, Open Chat
                  </button>
                  
                  <button
                    onClick={() => handleChatChoice(false)}
                    className="flex-1 py-4 px-6 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center"
                    style={{
                      backgroundColor: '#040e40',
                      color: 'white',
                      borderColor: '#040e40'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0a1a5e';
                      e.currentTarget.style.borderColor = '#0a1a5e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#040e40';
                      e.currentTarget.style.borderColor = '#040e40';
                    }}
                  >
                    <i className="fas fa-times mr-2"></i>
                    No, Thank You
                  </button>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentTrackingId);
                      alert('Tracking ID copied to clipboard!');
                    }}
                    className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center border"
                  >
                    <i className="fas fa-copy mr-2"></i>
                    Copy Tracking ID to Clipboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-pulse-once relative">
            {/* Close Button */}
            <button
              onClick={handleCloseThankYou}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              title="Close"
            >
              <i className="fas fa-times text-gray-600"></i>
            </button>
            
            {/* Countdown Badge */}
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
              Auto-close: {thankYouCountdown}s
            </div>
            
            <div className="text-center mt-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-heart text-white text-3xl"></i>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h3>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6 border-2 border-green-200">
                <p className="text-green-800 text-lg font-semibold mb-2">
                  🎉 Your appointment has been successfully booked!
                </p>
                <p className="text-green-700 text-sm">
                  We&apos;ve received your request and will contact you soon with confirmation details.
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">
                  <i className="fas fa-bookmark mr-2"></i>
                  <strong>Don&apos;t forget to save your tracking ID:</strong>
                </p>
                <p className="font-mono text-lg font-bold text-red-700 mt-2">
                  {currentTrackingId}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentTrackingId);
                    alert('Tracking ID copied to clipboard!');
                  }}
                  className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  <i className="fas fa-copy mr-2"></i>Copy ID
                </button>
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">
                <p>
                  <i className="fas fa-search mr-2" style={{color: '#040e40'}}></i>
                  Use this ID in our <strong>&quot;Track Repair&quot;</strong> section to monitor your service status.
                </p>
              </div>
              
              {/* Book Another Appointment Button */}
              <div className="border-t pt-4">
                <button
                  onClick={handleNewBooking}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Book Another Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
