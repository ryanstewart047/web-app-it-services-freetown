'use client'

import { useState, useEffect } from 'react'
import { getBookingByTrackingId, getAllBookings, addCustomerComment, BookingData, CustomerComment } from '@/lib/unified-booking-storage'
import PaymentInstructionsPopup from '@/components/PaymentInstructionsPopup'

// Print-only styles: hide everything on screen, show ONLY slip section when printing
const printStyles = `
@media screen {
  #repair-slip-printable {
    display: none !important;
  }
}
@media print {
  /* Hide all other elements on page */
  body * {
    visibility: hidden !important;
  }
  /* Show only the printable slip and its contents */
  #repair-slip-printable,
  #repair-slip-printable * {
    visibility: visible !important;
  }
  #repair-slip-printable {
    display: block !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
  }
  .no-print {
    display: none !important;
  }
  @page {
    margin: 1cm;
    size: portrait;
  }
}
`

interface AppointmentStatusProps {
  trackingId: string
}

interface AppointmentStatus {
  id: string
  customerName: string
  deviceType: string
  deviceModel: string
  status: 'pending' | 'confirmed' | 'received' | 'submitted' | 'diagnosed' | 'in-progress' | 'completed' | 'ready-for-pickup' | 'collected' | 'cancelled' | 'terminal'
  estimatedCompletion?: string
  notes?: string
  cost?: number
  paymentStatus?: string
  createdAt: string
  updatedAt: string
  diagnosticImages?: Array<string | { data: string; uploadedAt: string }>
  diagnosticNotes?: string
  customerComments?: CustomerComment[]
}

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: 'fas fa-clock', color: '#f59e0b' },
  { key: 'confirmed', label: 'Confirmed', icon: 'fas fa-calendar-check', color: '#3b82f6' },
  { key: 'received', label: 'Received', icon: 'fas fa-inbox', color: '#040e40' },
  { key: 'submitted', label: 'Submitted', icon: 'fas fa-paper-plane', color: '#3b82f6' },
  { key: 'diagnosed', label: 'Diagnosed', icon: 'fas fa-search', color: '#ef4444' },
  { key: 'in-progress', label: 'In Progress', icon: 'fas fa-tools', color: '#ef4444' },
  { key: 'completed', label: 'Completed', icon: 'fas fa-check', color: '#10b981' },
  { key: 'ready-for-pickup', label: 'Ready for Pickup', icon: 'fas fa-bell', color: '#040e40' },
  { key: 'collected', label: 'Collected', icon: 'fas fa-check-circle', color: '#10b981' },
  { key: 'cancelled', label: 'Cancelled', icon: 'fas fa-times-circle', color: '#ef4444' },
  { key: 'terminal', label: '✕ Terminal — Cannot Proceed', icon: 'fas fa-ban', color: '#7f1d1d' }
]

// Parse the "--- Cost Breakdown ---" block from notes
function parseCostBreakdown(notes?: string): { items: { label: string; cost: number }[]; cleanNotes: string; amountPaid?: number; balanceDue?: number } {
  if (!notes) return { items: [], cleanNotes: '' };
  const breakdownMarker = '--- Cost Breakdown ---';
  const idx = notes.indexOf(breakdownMarker);
  if (idx === -1) return { items: [], cleanNotes: notes.trim() };

  const cleanNotes = notes.slice(0, idx).trim();
  const breakdownBlock = notes.slice(idx + breakdownMarker.length);
  const lines = breakdownBlock.split('\n').map(l => l.trim()).filter(Boolean);

  const items: { label: string; cost: number }[] = [];
  let amountPaid: number | undefined;
  let balanceDue: number | undefined;

  for (const line of lines) {
    const partMatch = line.match(/^[•\-]?\s*Part Payment Received:\s*Le\s*([\d,\.]+)/i);
    if (partMatch) {
      amountPaid = parseFloat(partMatch[1].replace(/,/g, ''));
      continue;
    }
    const balMatch = line.match(/^[•\-]?\s*Balance Due:\s*Le\s*([\d,\.]+)/i);
    if (balMatch) {
      balanceDue = parseFloat(balMatch[1].replace(/,/g, ''));
      continue;
    }
    // Match lines like: • Screen Replacement: Le 350
    const match = line.match(/^[•\-]?\s*(.+?):\s*Le\s*([\d,\.]+)$/i);
    if (match) {
      const label = match[1].trim();
      const cost = parseFloat(match[2].replace(/,/g, ''));
      if (label && !isNaN(cost)) items.push({ label, cost });
    }
  }
  return { items, cleanNotes, amountPaid, balanceDue };
}

export default function AppointmentStatus({ trackingId }: AppointmentStatusProps) {
  const [appointment, setAppointment] = useState<AppointmentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Full-page Lightbox Modal state for diagnostic photos
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Customer comment form state
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentSuccess, setCommentSuccess] = useState('')
  const [commentsList, setCommentsList] = useState<CustomerComment[]>([])

  useEffect(() => {
    fetchAppointmentStatus()
  }, [trackingId])

  // Sync commentAuthor & commentsList when appointment loads
  useEffect(() => {
    if (appointment) {
      if (!commentAuthor && appointment.customerName) {
        setCommentAuthor(appointment.customerName)
      }
      if (appointment.customerComments) {
        setCommentsList(appointment.customerComments)
      }
    }
  }, [appointment])

  // Keyboard events for Lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null || !appointment?.diagnosticImages) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') {
        setLightboxIndex((lightboxIndex + 1) % appointment.diagnosticImages.length)
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((lightboxIndex - 1 + appointment.diagnosticImages.length) % appointment.diagnosticImages.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, appointment])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !appointment) return;

    setSubmittingComment(true);
    setCommentSuccess('');

    const author = commentAuthor.trim() || appointment.customerName || 'Customer';
    const text = commentText.trim();

    try {
      // 1. Add to local storage
      const localCmt = addCustomerComment(appointment.id, author, text);

      // 2. Submit to API server
      const response = await fetch('/api/analytics/repairs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_comment',
          trackingId: appointment.id,
          authorName: author,
          comment: text
        })
      });

      let updatedList = commentsList;
      if (localCmt) {
        updatedList = [...updatedList, localCmt];
      } else {
        const data = await response.json();
        if (data.customerComments) {
          updatedList = data.customerComments;
        } else if (data.comment) {
          updatedList = [...updatedList, data.comment];
        }
      }

      setCommentsList(updatedList);
      setAppointment(prev => prev ? { ...prev, customerComments: updatedList } : prev);
      setCommentText('');
      setCommentSuccess('Your comment has been submitted successfully! Our technician team will review it.');
      setTimeout(() => setCommentSuccess(''), 6000);
    } catch (err) {
      console.error('Error submitting comment:', err);
      // Fallback local update if network error
      const localCmt = addCustomerComment(appointment.id, author, text);
      if (localCmt) {
        const newList = [...commentsList, localCmt];
        setCommentsList(newList);
        setAppointment(prev => prev ? { ...prev, customerComments: newList } : prev);
        setCommentText('');
        setCommentSuccess('Your comment was saved locally. Thank you!');
        setTimeout(() => setCommentSuccess(''), 6000);
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const cancelRepair = async () => {
    if (!appointment) return;
    setCancelling(true);
    try {
      const response = await fetch('/api/analytics/repairs/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: appointment.id,
          status: 'cancelled',
          notes: cancelReason
            ? `Customer cancellation request: ${cancelReason}`
            : 'Repair cancelled by customer via tracking page.',
        }),
      });
      if (response.ok) {
        setAppointment(prev => prev ? { ...prev, status: 'cancelled', notes: cancelReason ? `Customer cancellation request: ${cancelReason}` : 'Repair cancelled by customer via tracking page.' } : prev);
        setShowCancelConfirm(false);
        setCancelReason('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel repair. Please contact us directly.');
        setShowCancelConfirm(false);
      }
    } catch {
      setError('Network error. Please try again or contact us directly.');
      setShowCancelConfirm(false);
    } finally {
      setCancelling(false);
    }
  };

  const fetchAppointmentStatus = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Searching for tracking ID:', trackingId);
      const apiAppointment = await fetchFromApi(trackingId);

      if (apiAppointment) {
        setAppointment(apiAppointment);
        if (apiAppointment.customerComments) {
          setCommentsList(apiAppointment.customerComments);
        }
        setError('');
        return;
      }
      
      const realBooking = getBookingByTrackingId(trackingId);
      
      if (realBooking) {
        console.log('Real booking found:', realBooking);
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
          updatedAt: realBooking.updatedAt,
          diagnosticImages: realBooking.diagnosticImages,
          diagnosticNotes: realBooking.diagnosticNotes,
          customerComments: realBooking.customerComments
        };
        
        setAppointment(appointmentStatus);
        if (realBooking.customerComments) {
          setCommentsList(realBooking.customerComments);
        }
        setError('');
        return;
      }

      const mockAppointments: Record<string, AppointmentStatus> = {
        'ITS-250926-1001': {
          id: 'ITS-250926-1001',
          customerName: 'John Smith',
          deviceType: 'iPhone 14',
          deviceModel: 'iPhone 14 Pro',
          status: 'in-progress',
          estimatedCompletion: '2025-10-25',
          notes: 'Device received, diagnosis complete. Parts ordered.',
          cost: 150,
          createdAt: '2025-09-26',
          updatedAt: '2025-09-27'
        }
      }

      if (mockAppointments[trackingId]) {
        setAppointment(mockAppointments[trackingId]);
        setError('');
      } else {
        setError(`No repair found with Tracking ID "${trackingId}". Please double check your code or contact support.`);
      }
    } catch {
      setError('An error occurred while fetching appointment status. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const fetchFromApi = async (id: string): Promise<AppointmentStatus | null> => {
    try {
      const response = await fetch(`/api/analytics/repairs/?trackingId=${encodeURIComponent(id)}`);
      if (!response.ok) return null;
      const repair = await response.json();
      if (!repair || repair.error) return null;
      return transformRepairToAppointment(repair);
    } catch (error) {
      console.warn('Repair lookup API failed:', error);
      return null;
    }
  };

  const transformRepairToAppointment = (repair: any): AppointmentStatus => {
    return {
      id: repair.trackingId,
      customerName: repair.customerName,
      deviceType: repair.deviceType,
      deviceModel: repair.deviceModel || '—',
      status: (repair.status || 'received') as AppointmentStatus['status'],
      estimatedCompletion: repair.estimatedCompletion,
      notes: repair.notes,
      paymentStatus: repair.paymentStatus || 'pending',
      cost: typeof repair.totalCost === 'number' ? repair.totalCost : undefined,
      createdAt: repair.submissionDate || new Date().toISOString(),
      updatedAt: repair.lastUpdated || repair.submissionDate || new Date().toISOString(),
      diagnosticImages: repair.diagnosticImages,
      diagnosticNotes: repair.diagnosticNotes,
      customerComments: repair.customerComments
    };
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
        </div>
      </div>
    )
  }

  if (!appointment) return null

  const currentStep = getCurrentStepIndex()
  const { items: costItems, cleanNotes, amountPaid: parsedAmountPaid, balanceDue: parsedBalanceDue } = parseCostBreakdown(appointment.notes)
  const isPartPayment = appointment.paymentStatus === 'part_payment' || appointment.paymentStatus === 'part-payment' || appointment.paymentStatus === 'half_payment'

  return (
    <>
    {/* Inject print styles into <head> via a style tag */}
    <style dangerouslySetInnerHTML={{ __html: printStyles }} />
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{appointment.id}</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 uppercase tracking-wide">
              {appointment.status.replace('-', ' ')}
            </span>
          </div>
          <p className="text-gray-600 mt-1 text-sm">
            Customer: <strong className="text-gray-900">{appointment.customerName}</strong> &bull; Device: <strong className="text-gray-900">{appointment.deviceType} {appointment.deviceModel !== '—' ? `(${appointment.deviceModel})` : ''}</strong>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 no-print">
          {appointment.status !== 'cancelled' && appointment.status !== 'collected' && appointment.status !== 'terminal' && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <i className="fas fa-times-circle"></i>
              Cancel Repair
            </button>
          )}
          
          {/* Print Slip — visible when paid or part-paid */}
          {(appointment.paymentStatus === 'paid' || isPartPayment) && (
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <i className="fas fa-print"></i>
              Print Slip
            </button>
          )}
        </div>
      </div>

      {/* Cancelled Banner */}
      {appointment.status === 'cancelled' && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <i className="fas fa-ban text-red-600 text-xl mt-0.5"></i>
          <div>
            <h4 className="font-bold text-red-900 text-sm">Repair Cancelled</h4>
            <p className="text-red-700 text-xs mt-1">
              This repair request has been cancelled. If you believe this is an error or would like to re-submit your device, please contact our support team.
            </p>
          </div>
        </div>
      )}

      {/* Terminal Banner — Device cannot be repaired / no further action possible */}
      {appointment.status === 'terminal' && (
        <div className="mb-8 p-5 bg-red-950 border-2 border-red-700 rounded-xl flex items-start gap-4 shadow-lg shadow-red-900/40">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-700 flex items-center justify-center">
            <span className="text-white font-black text-2xl leading-none">✕</span>
          </div>
          <div>
            <h4 className="font-black text-red-100 text-base flex items-center gap-2">
              Terminal — No Further Action Possible
            </h4>
            <p className="text-red-300 text-xs mt-1.5 leading-relaxed">
              After thorough assessment, this repair has reached a terminal state. This may be due to irreparable hardware damage, unavailability of parts, or a device beyond economical repair. No further repair work can be carried out. Please contact our team to discuss device disposal or replacement options.
            </p>
            <a
              href="https://wa.me/23233399391"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <i className="fab fa-whatsapp"></i> Contact BridgeTech on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Status Progress Bar */}
      {appointment.status !== 'cancelled' && appointment.status !== 'terminal' && (
        <div className="mb-8">
          <div className="relative">
            {/* Desktop progress bar */}
            <div className="hidden md:flex justify-between items-center relative z-10">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStep
                const isCurrent = index === currentStep

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        isCompleted
                          ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                          : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-red-100 scale-110' : ''}`}
                    >
                      {isCompleted ? (
                        <i className="fas fa-check text-xs"></i>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold text-center ${
                        isCurrent ? 'text-red-600 font-bold' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Connecting line */}
            <div className="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{
                  width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                }}
              ></div>
            </div>

            {/* Mobile progress */}
            <div className="md:hidden bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Step {currentStep + 1} of {statusSteps.length}
                </span>
                <span className="text-xs font-bold text-red-600">
                  {statusSteps[currentStep]?.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-600 h-full transition-all duration-500"
                  style={{
                    width: `${((currentStep + 1) / statusSteps.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Information */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-gray-500 block">Submitted On:</span>
              <span className="font-semibold text-gray-800">{appointment.createdAt}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Estimated Completion:</span>
              <span className="font-semibold text-gray-800">{appointment.estimatedCompletion || 'Pending Inspection'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Payment Status:</span>
              <span className={`font-bold capitalize ${
                appointment.paymentStatus === 'paid' 
                  ? 'text-emerald-600' 
                  : isPartPayment 
                  ? 'text-amber-600' 
                  : 'text-amber-600'
              }`}>
                {isPartPayment ? 'Part Payment (Deposit)' : (appointment.paymentStatus || 'Pending')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Total Cost:</span>
              <span className="font-bold text-red-600 text-sm">
                {appointment.cost ? `Le ${appointment.cost.toLocaleString()}` : 'Quote Pending'}
              </span>
            </div>
          </div>

          {cleanNotes && (
            <div className="p-4 bg-white border border-gray-100 rounded-xl text-xs">
              <span className="text-gray-500 font-semibold block mb-1">Technician Notes:</span>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{cleanNotes}</p>
            </div>
          )}
        </div>

        {/* Right Column: Itemized Cost Breakdown */}
        <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
              <h4 className="font-bold text-sm text-red-400 flex items-center gap-2">
                <i className="fas fa-receipt"></i>
                Cost Breakdown
              </h4>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">NLE (New Leone)</span>
            </div>

            {costItems.length > 0 ? (
              <div className="space-y-2 text-xs">
                {costItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <i className="fas fa-check-circle text-[10px] text-emerald-400"></i>
                      {item.label}
                    </span>
                    <span className="font-mono font-semibold text-slate-200">Le {item.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">
                Individual repair line items will appear here once diagnostics are finalized.
              </p>
            )}
          </div>

          {/* Grand Total & Part Payment Balance Section */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Grand Total</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {appointment.cost ? `Le ${appointment.cost.toLocaleString()}` : 'Quote Pending'}
              </span>
            </div>

            {isPartPayment && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-amber-500/30 text-xs space-y-1">
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Part Payment Paid:</span>
                  <span className="font-mono">Le {(parsedAmountPaid ?? (appointment.cost ? appointment.cost / 2 : 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>Balance Due:</span>
                  <span className="font-mono">Le {(parsedBalanceDue ?? (appointment.cost ? appointment.cost / 2 : 0)).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* View Payment Instructions / Pay Balance */}
          {appointment.cost && appointment.paymentStatus !== 'paid' && (
            <button
              onClick={() => setShowPaymentPopup(true)}
              className="w-full py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xs font-bold rounded-lg transition-all shadow text-center no-print"
            >
              <i className="fas fa-credit-card mr-2"></i>
              {isPartPayment ? 'Pay Remaining Balance' : 'View Payment Instructions'}
            </button>
          )}
          {/* Paid badge when payment is complete */}
          {appointment.paymentStatus === 'paid' && (
            <div className="w-full py-2 bg-emerald-600/10 border border-emerald-500 text-emerald-700 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-2">
              <i className="fas fa-check-circle"></i>
              Payment Confirmed — Thank You!
            </div>
          )}
        </div>
      </div>

      {showPaymentPopup && appointment.cost && (
        <PaymentInstructionsPopup
          orderNumber={appointment.id}
          totalAmount={appointment.cost}
          onClose={() => setShowPaymentPopup(false)}
        />
      )}

      {/* ── Diagnostic Information Section ── */}
      {(appointment.diagnosticNotes || (appointment.diagnosticImages && appointment.diagnosticImages.length > 0)) && (
        <div className="mt-8 bg-blue-50/70 p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center text-blue-800 mb-4">
            <i className="fas fa-stethoscope mr-2.5 text-2xl text-blue-600"></i>
            <div>
              <h4 className="font-bold text-lg text-blue-950">Device Diagnostic Report</h4>
              <p className="text-xs text-blue-700">Official technical inspection report from BridgeTech IT Services</p>
            </div>
          </div>
          
          {appointment.diagnosticNotes && (
            <div className="mb-5 bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{appointment.diagnosticNotes}</p>
            </div>
          )}

          {/* Diagnostic Photos Thumbnails */}
          {appointment.diagnosticImages && appointment.diagnosticImages.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <i className="fas fa-camera text-blue-600"></i>
                  Diagnostic Photos ({appointment.diagnosticImages.length})
                </h5>
                <span className="text-xs text-blue-700 font-medium">Click photo to enlarge full page</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {appointment.diagnosticImages.map((image, index) => {
                  const imageData = typeof image === 'string' ? image : image.data;
                  return (
                    <div 
                      key={index} 
                      className="relative group cursor-pointer overflow-hidden rounded-xl shadow-sm border border-blue-200 hover:border-blue-500 transition-all hover:shadow-md"
                      onClick={() => setLightboxIndex(index)}
                    >
                      <img 
                        src={imageData} 
                        alt={`Diagnostic image ${index + 1}`}
                        className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-blue-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <i className="fas fa-search-plus text-2xl mb-1"></i>
                        <span className="text-[10px] font-bold uppercase tracking-wider">View Full Size</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Customer Comments & Feedback Section ── */}
      <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <i className="fas fa-comments text-lg"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">Customer Comments &amp; Questions</h4>
              <p className="text-xs text-gray-500">Leave a note or question for our technician team regarding your repair</p>
            </div>
          </div>
          <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-bold">
            {commentsList.length} comment{commentsList.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Existing Comments List */}
        {commentsList.length > 0 ? (
          <div className="space-y-3 mb-6">
            {commentsList.map((cmt) => (
              <div key={cmt.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                      {cmt.authorName.charAt(0).toUpperCase()}
                    </span>
                    {cmt.authorName}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(cmt.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-gray-700 text-xs pl-8 whitespace-pre-wrap">{cmt.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic mb-4">
            No comments yet. Have a question or request for the technician? Leave a message below!
          </p>
        )}

        {/* Submit Comment Form */}
        <form onSubmit={handleAddComment} className="space-y-3 pt-2">
          {commentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <i className="fas fa-check-circle text-emerald-600 text-sm"></i>
              <span>{commentSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                value={commentAuthor}
                onChange={e => setCommentAuthor(e.target.value)}
                placeholder="Your Name"
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500 bg-white"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Comment / Question for Technician</label>
              <textarea
                rows={2}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="e.g. Please proceed with screen replacement. What time will it be ready?"
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500 bg-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow"
            >
              {submittingComment ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Post Comment
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Contact Information */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg border">
        <h4 className="font-semibold text-gray-900 mb-3">Need Immediate Assistance?</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="tel:+23233399391"
            className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 border"
          >
            <i className="fas fa-phone mr-2 text-red-600"></i>
            Call Support (+232 33 399391)
          </a>
          <a 
            href={`https://wa.me/23233399391?text=Hi, I have a question about my repair. Tracking ID: ${trackingId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 font-medium text-xs"
          >
            <i className="fab fa-whatsapp mr-2 text-sm"></i>
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* ── Printable Slip (hidden on screen, shown only when printing) ── */}
      <div id="repair-slip-printable">
        <div style={{ fontFamily: 'sans-serif', padding: '24px', border: '2px solid #040e40', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid #040e40', paddingBottom: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#040e40', margin: 0 }}>BridgeTech IT Services</h1>
            <p style={{ fontSize: '12px', color: '#555', margin: '4px 0 0' }}>Repair Receipt / Payment Slip</p>
          </div>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '5px 0', color: '#555', width: '45%' }}>Tracking ID:</td><td style={{ fontWeight: 700 }}>{appointment.id}</td></tr>
              <tr><td style={{ padding: '5px 0', color: '#555' }}>Customer:</td><td style={{ fontWeight: 700 }}>{appointment.customerName}</td></tr>
              <tr><td style={{ padding: '5px 0', color: '#555' }}>Device:</td><td style={{ fontWeight: 700 }}>{appointment.deviceType} {appointment.deviceModel !== '—' ? `(${appointment.deviceModel})` : ''}</td></tr>
              <tr><td style={{ padding: '5px 0', color: '#555' }}>Status:</td><td style={{ fontWeight: 700, textTransform: 'capitalize' }}>{appointment.status.replace('-', ' ')}</td></tr>
              <tr><td style={{ padding: '5px 0', color: '#555' }}>Payment Status:</td><td style={{ fontWeight: 700, color: '#059669' }}>PAID ✓</td></tr>
              <tr><td style={{ padding: '5px 0', color: '#555' }}>Date:</td><td style={{ fontWeight: 700 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</td></tr>
            </tbody>
          </table>
          {costItems.length > 0 && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #ccc', paddingTop: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#040e40' }}>Cost Breakdown:</p>
              {costItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                  <span>{item.label}</span><span style={{ fontWeight: 700 }}>Le {item.cost.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900, borderTop: '2px solid #040e40', marginTop: '8px', paddingTop: '8px', color: '#040e40' }}>
                <span>TOTAL PAID</span><span>Le {appointment.cost?.toLocaleString()}</span>
              </div>
            </div>
          )}
          <p style={{ fontSize: '10px', color: '#888', textAlign: 'center', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>Thank you for choosing BridgeTech IT Services • Tel: +232 33 399391</p>
        </div>
      </div>

      {/* ── Full-Page Lightbox Modal Viewer for Diagnostic Photos ── */}
      {lightboxIndex !== null && appointment.diagnosticImages && (() => {
        const currentImg = appointment.diagnosticImages[lightboxIndex];
        const currentSrc = typeof currentImg === 'string' ? currentImg : (currentImg as any).data;
        return (
          <div 
            className="fixed inset-0 z-[9999] bg-black flex flex-col no-print"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between text-white z-10 p-4 bg-black/60 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono font-bold">
                  Photo {lightboxIndex + 1} / {appointment.diagnosticImages.length}
                </span>
                <span className="text-xs text-gray-300 hidden sm:inline">
                  Repair ID: {appointment.id}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={currentSrc}
                  download={`diagnostic-${appointment.id}-${lightboxIndex + 1}.jpg`}
                  onClick={e => e.stopPropagation()}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  title="Download full image"
                >
                  <i className="fas fa-download"></i>
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="w-9 h-9 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                  title="Close (Esc)"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Main Image Area with Prev/Next */}
            <div
              className="flex-1 flex items-center justify-center relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Prev Button */}
              {appointment.diagnosticImages.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + appointment.diagnosticImages!.length) % appointment.diagnosticImages!.length); }}
                  className="absolute left-2 sm:left-4 z-20 w-12 h-12 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xl transition-all shadow-lg"
                  title="Previous (Left Arrow)"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
              )}

              {/* THE ACTUAL IMAGE */}
              <img
                key={lightboxIndex}
                src={currentSrc}
                alt={`Diagnostic photo ${lightboxIndex + 1}`}
                className="max-h-full max-w-full object-contain select-none"
                style={{ maxHeight: 'calc(100vh - 160px)' }}
                draggable={false}
              />

              {/* Next Button */}
              {appointment.diagnosticImages.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % appointment.diagnosticImages!.length); }}
                  className="absolute right-2 sm:right-4 z-20 w-12 h-12 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xl transition-all shadow-lg"
                  title="Next Image (Right Arrow)"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              )}
            </div>

            {/* Footer Thumbnails */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-3 px-4 bg-black/60 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
              {appointment.diagnosticImages.map((img, idx) => {
                const src = typeof img === 'string' ? img : (img as any).data;
                return (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      idx === lightboxIndex ? 'border-red-500 scale-110 shadow-lg shadow-red-500/30' : 'border-white/20 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={src} className="w-full h-full object-cover" alt={`Thumb ${idx + 1}`} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Cancel Confirm Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cancel Repair?</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Are you sure you want to cancel your repair for <strong>{appointment.deviceType}</strong>? This will notify our team immediately.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Reason for Cancellation (Optional)</label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Changed my mind, found another solution..."
                className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
              >
                Keep Repair
              </button>
              <button
                onClick={cancelRepair}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Repair'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
