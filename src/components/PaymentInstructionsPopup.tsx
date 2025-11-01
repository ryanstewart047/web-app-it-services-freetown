'use client'

import { X, Phone, MessageCircle, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface PaymentInstructionsPopupProps {
  orderNumber: string
  totalAmount: number
  onClose: () => void
}

export default function PaymentInstructionsPopup({ 
  orderNumber, 
  totalAmount,
  onClose 
}: PaymentInstructionsPopupProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const paymentDetails = {
    orangeMoney: '076210320',
    afriMoney: '033399391',
    whatsapp: '+23233399391'
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Hello, I've made a payment for Order #${orderNumber}\nTotal Amount: Le ${totalAmount.toLocaleString()}\n\nPlease find attached payment screenshot.`
    )
    window.open(`https://wa.me/${paymentDetails.whatsapp.replace('+', '')}?text=${message}`, '_blank')
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Popup Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 border border-blue-500/30 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden pointer-events-auto transform transition-all duration-300 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-all hover:scale-110"
            aria-label="Close popup"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Complete Your Payment</h2>
            <p className="text-blue-100">Mobile Money Payment Instructions</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Details */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Order Number:</span>
                <span className="text-white font-bold">{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Amount:</span>
                <span className="text-green-400 font-bold text-xl">Le {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Instructions */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm rounded-full">1</span>
                Send Payment To:
              </h3>
              
              {/* Orange Money */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-400 text-sm font-medium mb-1">Orange Money</p>
                    <p className="text-white text-lg font-bold">{paymentDetails.orangeMoney}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentDetails.orangeMoney, 'orange')}
                    className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors"
                    title="Copy number"
                  >
                    {copiedField === 'orange' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-orange-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* AfriMoney */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium mb-1">AfriMoney</p>
                    <p className="text-white text-lg font-bold">{paymentDetails.afriMoney}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentDetails.afriMoney, 'afri')}
                    className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                    title="Copy number"
                  >
                    {copiedField === 'afri' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-green-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Screenshot Instruction */}
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm rounded-full">2</span>
                Take Screenshot
              </h3>
              <p className="text-gray-300 text-sm">
                After making the payment, take a screenshot of your transaction confirmation.
              </p>
            </div>

            {/* WhatsApp Button */}
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm rounded-full">3</span>
                Send Confirmation
              </h3>
              <button
                onClick={handleWhatsAppContact}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-6 h-6" />
                <span>Send Payment Proof via WhatsApp</span>
              </button>
              <p className="text-gray-400 text-xs mt-2 text-center">
                Include your Order Number: {orderNumber}
              </p>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> Your order will be confirmed once we verify your payment. 
                This usually takes a few minutes during business hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
