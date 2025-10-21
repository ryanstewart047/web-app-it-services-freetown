'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Printer, Download, Plus, Trash2, Save } from 'lucide-react'

interface ReceiptItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export default function ReceiptGenerator() {
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  
  // Admin authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPasswordError, setShowPasswordError] = useState(false)

  // Receipt data
  const [receiptType, setReceiptType] = useState<'purchase' | 'repair'>('purchase')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [receiptNumber, setReceiptNumber] = useState(`RCP-${Date.now().toString().slice(-6)}`)
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ])
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [amountPaid, setAmountPaid] = useState(0)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const ADMIN_PASSWORD = 'ITServices2025!'
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setShowPasswordError(false)
    } else {
      setShowPasswordError(true)
      setTimeout(() => setShowPasswordError(false), 3000)
    }
  }

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        // Recalculate total
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    }))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateChange = () => {
    const subtotal = calculateSubtotal()
    return amountPaid - subtotal
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSaveTemplate = () => {
    const template = {
      receiptType,
      customerName,
      customerPhone,
      customerEmail,
      items,
      notes,
      paymentMethod,
      date: receiptDate
    }
    localStorage.setItem('receipt_template', JSON.stringify(template))
    alert('Receipt template saved!')
  }

  const handleLoadTemplate = () => {
    const saved = localStorage.getItem('receipt_template')
    if (saved) {
      const template = JSON.parse(saved)
      setReceiptType(template.receiptType)
      setCustomerName(template.customerName || '')
      setCustomerPhone(template.customerPhone || '')
      setCustomerEmail(template.customerEmail || '')
      setItems(template.items || items)
      setNotes(template.notes || '')
      setPaymentMethod(template.paymentMethod || 'Cash')
      alert('Template loaded!')
    } else {
      alert('No saved template found')
    }
  }

  const handleNewReceipt = () => {
    setReceiptNumber(`RCP-${Date.now().toString().slice(-6)}`)
    setReceiptDate(new Date().toISOString().split('T')[0])
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }])
    setNotes('')
    setAmountPaid(0)
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gradient-to-r from-blue-600 to-purple-600">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                Receipt Generator
              </h1>
              <p className="text-gray-600">
                Admin access required
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setShowPasswordError(false)
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    showPasswordError ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter admin password"
                  required
                />
                {showPasswordError && (
                  <p className="text-red-500 text-sm mt-2">Incorrect password</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Access Receipt Generator
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Receipt Generator
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Print Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.5cm;
          }
          
          body * {
            visibility: hidden;
          }
          #receipt-print-area,
          #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
          
          /* Optimize for single page */
          #receipt-print-area .bg-white {
            box-shadow: none !important;
            border: none !important;
            padding: 0.5cm !important;
          }
          
          /* Professional fonts */
          body {
            font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          }
          
          /* Prevent page breaks */
          #receipt-print-area {
            page-break-inside: avoid;
          }
          
          /* Compact spacing for single page */
          h1, h2, h3 {
            margin-top: 0 !important;
            margin-bottom: 0.3cm !important;
          }
          
          p, div {
            margin-bottom: 0.2cm !important;
          }
          
          table {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Editor Section - No Print */}
      <div className="no-print">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Receipt Generator
            </h1>
            <p className="text-gray-600">Create professional receipts for purchases and repairs</p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={handleNewReceipt}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              New Receipt
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
            <button
              onClick={handleSaveTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-md"
            >
              <Save className="w-5 h-5" />
              Save Template
            </button>
            <button
              onClick={handleLoadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md"
            >
              <Download className="w-5 h-5" />
              Load Template
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Receipt Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Receipt Type
                </label>
                <select
                  value={receiptType}
                  onChange={(e) => setReceiptType(e.target.value as 'purchase' | 'repair')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="purchase">Purchase</option>
                  <option value="repair">Repair</option>
                </select>
              </div>

              {/* Receipt Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Receipt Number
                </label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Phone
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+232 XX XXX XXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {/* Amount Paid */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount Paid (SLE)
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Items / Services</h2>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                        min="1"
                        placeholder="Qty"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={`SLE ${item.total.toFixed(2)}`}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes / Additional Information
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any additional notes or warranty information..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Preview - Printable */}
      <div id="receipt-print-area" className="max-w-4xl mx-auto px-4 pb-12" style={{ fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>
        <div className="bg-white rounded-lg shadow-2xl p-6 border-2 border-gray-200">
          {/* Header with Logo */}
          <div className="text-center mb-4 pb-4 border-b-2 border-gray-300">
            <div className="flex justify-center mb-3">
              <img 
                src="/assets/logo.png" 
                alt="IT Services Freetown" 
                className="h-16 w-auto"
                style={{ maxHeight: '64px' }}
              />
            </div>
            <h1 className="text-2xl font-bold text-blue-900 mb-1" style={{ fontSize: '22px', letterSpacing: '0.5px' }}>
              IT Services Freetown
            </h1>
            <p className="text-sm text-gray-600 mb-2" style={{ fontSize: '12px' }}>
              Professional Computer & Mobile Repair
            </p>
            <div className="space-y-0.5 text-xs text-gray-600" style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <p className="font-semibold">#1 Regent Highway Jui Junction, Freetown</p>
              <p>Tel: +232 33 399 391 | Email: info@itservicesfreetown.com</p>
            </div>
          </div>

          {/* Receipt Type Banner */}
          <div className="text-center mb-3">
            <h2 className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded" style={{ fontSize: '16px', letterSpacing: '1px' }}>
              {receiptType === 'purchase' ? 'PURCHASE RECEIPT' : 'REPAIR RECEIPT'}
            </h2>
          </div>

          {/* Receipt Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-4" style={{ fontSize: '13px' }}>
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm" style={{ fontSize: '13px' }}>Customer Information:</h3>
              <div className="space-y-0.5 text-gray-600" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                <p><span className="font-semibold">Name:</span> {customerName || 'N/A'}</p>
                <p><span className="font-semibold">Phone:</span> {customerPhone || 'N/A'}</p>
                {customerEmail && <p><span className="font-semibold">Email:</span> {customerEmail}</p>}
              </div>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-gray-700 mb-2 text-sm" style={{ fontSize: '13px' }}>Receipt Details:</h3>
              <div className="space-y-0.5 text-gray-600" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                <p><span className="font-semibold">Receipt #:</span> {receiptNumber}</p>
                <p><span className="font-semibold">Date:</span> {new Date(receiptDate).toLocaleDateString()}</p>
                <p><span className="font-semibold">Payment:</span> {paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <table className="w-full" style={{ fontSize: '12px' }}>
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-3 py-2 text-left font-bold text-gray-700" style={{ fontSize: '12px' }}>Description</th>
                  <th className="px-3 py-2 text-center font-bold text-gray-700" style={{ fontSize: '12px' }}>Qty</th>
                  <th className="px-3 py-2 text-right font-bold text-gray-700" style={{ fontSize: '12px' }}>Unit Price</th>
                  <th className="px-3 py-2 text-right font-bold text-gray-700" style={{ fontSize: '12px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.filter(item => item.description).map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="px-3 py-2 text-gray-700" style={{ fontSize: '11px' }}>{item.description}</td>
                    <td className="px-3 py-2 text-center text-gray-700" style={{ fontSize: '11px' }}>{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-gray-700" style={{ fontSize: '11px' }}>SLE {item.unitPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900" style={{ fontSize: '11px' }}>SLE {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-4">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-gray-300" style={{ fontSize: '13px' }}>
                <span className="font-semibold text-gray-700">Subtotal:</span>
                <span className="font-bold text-gray-900">SLE {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-300" style={{ fontSize: '13px' }}>
                <span className="font-semibold text-gray-700">Amount Paid:</span>
                <span className="font-bold text-green-600">SLE {amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded" style={{ fontSize: '14px' }}>
                <span className="font-bold text-gray-900">Change:</span>
                <span className="font-bold text-blue-600">SLE {calculateChange().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-1" style={{ fontSize: '12px' }}>Notes:</h3>
              <p className="text-gray-600 whitespace-pre-wrap" style={{ fontSize: '11px', lineHeight: '1.4' }}>{notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-3 border-t-2 border-gray-300 space-y-1">
            <p className="text-gray-600 font-semibold" style={{ fontSize: '13px' }}>Thank you for your business!</p>
            <p className="text-gray-500" style={{ fontSize: '10px' }}>This is a computer-generated receipt</p>
            <p className="text-gray-500" style={{ fontSize: '10px', lineHeight: '1.3' }}>For support, call +232 33 399 391 or visit #1 Regent Highway Jui Junction</p>
          </div>
        </div>
      </div>
    </div>
  )
}
