'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Printer, Download, Plus, Trash2, Save, FileText, Search, History } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useAdminSession } from '../../src/hooks/useAdminSession'

interface ReceiptItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface SavedReceipt {
  receiptNumber: string
  receiptType: 'purchase' | 'repair' | 'loan'
  customerName: string
  customerPhone: string
  customerEmail: string
  customerAddress: string
  receiptDate: string
  items: ReceiptItem[]
  notes: string
  paymentMethod: string
  amountPaid: number
  subtotal: number
  change: number
  createdAt: string
}

export default function ReceiptGenerator() {
  // Admin session management - auto-logout after 5 minutes of inactivity
  const { showIdleWarning, getRemainingTime } = useAdminSession({
    idleTimeout: 5 * 60 * 1000, // 5 minutes
    warningTime: 30 * 1000 // 30 seconds warning
  });

  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  
  // Admin authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPasswordError, setShowPasswordError] = useState(false)

  // Receipt data
  const [receiptType, setReceiptType] = useState<'purchase' | 'repair' | 'loan'>('purchase')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [receiptNumber, setReceiptNumber] = useState(`RCP-${Date.now().toString().slice(-6)}`)
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ])
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [amountPaid, setAmountPaid] = useState(0)

  // Receipt storage and search
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<SavedReceipt[]>([])
  const [allReceipts, setAllReceipts] = useState<SavedReceipt[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load all receipts on mount
  useEffect(() => {
    loadAllReceipts()
    migrateLocalStorageReceipts() // Migrate old receipts to database
  }, [])

  const migrateLocalStorageReceipts = async () => {
    const saved = localStorage.getItem('saved_receipts')
    if (!saved) {
      console.log('No receipts found in localStorage')
      return
    }

    try {
      const localReceipts: SavedReceipt[] = JSON.parse(saved)
      if (localReceipts.length === 0) {
        console.log('localStorage receipts array is empty')
        return
      }

      console.log(`Found ${localReceipts.length} receipts in localStorage. Migrating to database...`)
      
      let successCount = 0
      let failCount = 0
      const errors: string[] = []
      
      for (const receipt of localReceipts) {
        try {
          console.log(`Migrating receipt: ${receipt.receiptNumber}`)
          const response = await fetch('/api/receipts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(receipt)
          })
          
          if (response.ok) {
            successCount++
            console.log(`✅ Migrated: ${receipt.receiptNumber}`)
          } else {
            failCount++
            const errorText = await response.text()
            errors.push(`${receipt.receiptNumber}: ${response.status} - ${errorText}`)
            console.error(`❌ Failed to migrate ${receipt.receiptNumber}:`, response.status, errorText)
          }
        } catch (error) {
          failCount++
          const errorMsg = error instanceof Error ? error.message : String(error)
          errors.push(`${receipt.receiptNumber}: ${errorMsg}`)
          console.error(`❌ Exception migrating receipt ${receipt.receiptNumber}:`, error)
        }
      }
      
      if (successCount > 0) {
        console.log(`✅ Successfully migrated ${successCount} receipts to database`)
        await loadAllReceipts() // Reload to show migrated receipts
        alert(`Migration complete!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`)
      } else if (failCount > 0) {
        console.error('Migration failed for all receipts:', errors)
        alert(`Migration failed!\nAll ${failCount} receipts failed to migrate.\n\nCheck console for details or try manual migration button.`)
      }
    } catch (error) {
      console.error('Error parsing or migrating receipts:', error)
      alert('Error migrating receipts. Check console for details.')
    }
  }

  const loadAllReceipts = async () => {
    try {
      const response = await fetch('/api/receipts')
      if (response.ok) {
        const receipts = await response.json()
        setAllReceipts(receipts)
        
        // If no receipts in database, show localStorage receipts
        if (receipts.length === 0) {
          const saved = localStorage.getItem('saved_receipts')
          if (saved) {
            const localReceipts = JSON.parse(saved)
            setAllReceipts(localReceipts)
          }
        }
      }
    } catch (error) {
      console.error('Error loading receipts:', error)
      // Fallback to localStorage if API fails
      const saved = localStorage.getItem('saved_receipts')
      if (saved) {
        const receipts = JSON.parse(saved)
        setAllReceipts(receipts)
      }
    }
  }

  const saveReceipt = async () => {
    const receipt: SavedReceipt = {
      receiptNumber,
      receiptType,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      receiptDate,
      items: items.filter(item => item.description), // Only save items with descriptions
      notes,
      paymentMethod,
      amountPaid,
      subtotal: calculateSubtotal(),
      change: calculateChange(),
      createdAt: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(receipt)
      })

      if (response.ok) {
        const savedReceipt = await response.json()
        alert(`Receipt ${receiptNumber} saved successfully!`)
        loadAllReceipts() // Reload all receipts
      } else {
        throw new Error('Failed to save receipt')
      }
    } catch (error) {
      console.error('Error saving receipt:', error)
      alert('Failed to save receipt. Please try again.')
      
      // Fallback to localStorage if API fails
      const saved = localStorage.getItem('saved_receipts')
      let receipts: SavedReceipt[] = saved ? JSON.parse(saved) : []
      const existingIndex = receipts.findIndex(r => r.receiptNumber === receiptNumber)
      
      if (existingIndex >= 0) {
        receipts[existingIndex] = receipt
      } else {
        receipts.push(receipt)
      }
      
      localStorage.setItem('saved_receipts', JSON.stringify(receipts))
      loadAllReceipts()
    }
  }

  const searchReceipts = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a receipt number to search')
      return
    }

    try {
      const response = await fetch(`/api/receipts?search=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const results = await response.json()
        
        if (results.length === 0) {
          alert(`No receipts found matching "${searchQuery}"`)
          setShowSearchResults(false)
        } else {
          setSearchResults(results)
          setShowSearchResults(true)
        }
      }
    } catch (error) {
      console.error('Error searching receipts:', error)
      
      // Fallback to localStorage search
      const saved = localStorage.getItem('saved_receipts')
      if (!saved) {
        alert('No saved receipts found')
        return
      }

      const receipts: SavedReceipt[] = JSON.parse(saved)
      const results = receipts.filter(receipt => 
        receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )

      if (results.length === 0) {
        alert(`No receipts found matching "${searchQuery}"`)
        setShowSearchResults(false)
      } else {
        setSearchResults(results)
        setShowSearchResults(true)
      }
    }
  }

  const loadReceipt = (receipt: SavedReceipt) => {
    setReceiptNumber(receipt.receiptNumber)
    setReceiptType(receipt.receiptType)
    setCustomerName(receipt.customerName)
    setCustomerPhone(receipt.customerPhone)
    setCustomerEmail(receipt.customerEmail)
    setCustomerAddress(receipt.customerAddress || '')
    setReceiptDate(receipt.receiptDate)
    setItems(receipt.items)
    setNotes(receipt.notes)
    setPaymentMethod(receipt.paymentMethod)
    setAmountPaid(receipt.amountPaid)
    setShowSearchResults(false)
    setShowHistory(false)
    alert(`Receipt ${receipt.receiptNumber} loaded!`)
  }

  const deleteReceipt = async (receiptNumber: string) => {
    if (!confirm(`Are you sure you want to delete receipt ${receiptNumber}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/receipts?receiptNumber=${encodeURIComponent(receiptNumber)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadAllReceipts()
        setSearchResults(searchResults.filter(r => r.receiptNumber !== receiptNumber))
        alert(`Receipt ${receiptNumber} deleted!`)
      } else {
        throw new Error('Failed to delete receipt')
      }
    } catch (error) {
      console.error('Error deleting receipt:', error)
      alert('Failed to delete receipt. Please try again.')
      
      // Fallback to localStorage
      const saved = localStorage.getItem('saved_receipts')
      if (!saved) return

      const receipts: SavedReceipt[] = JSON.parse(saved)
      const filtered = receipts.filter(r => r.receiptNumber !== receiptNumber)
      
      localStorage.setItem('saved_receipts', JSON.stringify(filtered))
      loadAllReceipts()
      setSearchResults(searchResults.filter(r => r.receiptNumber !== receiptNumber))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsAuthenticated(true)
        setShowPasswordError(false)
      } else {
        setShowPasswordError(true)
        if (response.status === 429) {
          alert(data.error || 'Too many login attempts. Please try again later.')
        }
        setTimeout(() => setShowPasswordError(false), 3000)
      }
    } catch (error) {
      console.error('Login error:', error)
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

  const handleShareWhatsApp = () => {
    // Create a simple, clean message
    const receiptTypeLabel = receiptType === 'purchase' ? 'PURCHASE' : receiptType === 'repair' ? 'REPAIR' : 'LOAN'
    const message = `*${receiptTypeLabel} RECEIPT*

*IT Services Freetown*
Receipt #: ${receiptNumber}
Date: ${new Date(receiptDate).toLocaleDateString()}
Customer: ${customerName}

Total: SLE ${calculateSubtotal().toFixed(2)}
Paid: SLE ${amountPaid.toFixed(2)}
Change: SLE ${calculateChange().toFixed(2)}

Thank you for your business!
www.itservicesfreetown.com
#1 Regent Highway Jui Junction
+232 33 399 391`

    // Direct WhatsApp link - works on both mobile and desktop
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
    
    // Open in new window
    const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    
    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // If blocked, try direct navigation
      window.location.href = whatsappUrl
    }
  }

  const handleShareEmail = () => {
    const receiptTypeLabel = receiptType === 'purchase' ? 'PURCHASE' : receiptType === 'repair' ? 'REPAIR' : 'LOAN'
    const subject = `Receipt ${receiptNumber} - IT Services Freetown`
    const body = `${receiptTypeLabel} RECEIPT\n\nIT Services Freetown\nwww.itservicesfreetown.com\n#1 Regent Highway Jui Junction\nTel: +232 33 399 391\n\nReceipt No: ${receiptNumber}\nDate: ${new Date(receiptDate).toLocaleDateString()}\nCustomer: ${customerName}\nPhone: ${customerPhone}${customerAddress ? `\nAddress: ${customerAddress}` : ''}\n\nItems:\n${items.filter(i => i.description).map(i => `${i.description} - Qty: ${i.quantity} - SLE ${i.total.toFixed(2)}`).join('\n')}\n\nSubtotal: SLE ${calculateSubtotal().toFixed(2)}\nAmount Paid: SLE ${amountPaid.toFixed(2)}${calculateSubtotal() > amountPaid ? `\nBalance to be Paid: SLE ${(calculateSubtotal() - amountPaid).toFixed(2)}` : ''}\nChange: SLE ${calculateChange().toFixed(2)}\n\nThank you for your business!`
    window.location.href = `mailto:${customerEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleDownloadPDF = async () => {
    const receiptElement = document.getElementById('receipt-print-area')
    if (!receiptElement) return

    try {
      // Show loading state
      const btn = document.activeElement as HTMLButtonElement
      if (btn) btn.textContent = 'Generating PDF...'

      // Store original styles
      const originalOverflow = document.body.style.overflow
      const originalWidth = receiptElement.style.width
      const originalMaxWidth = receiptElement.style.maxWidth
      
      // Temporarily set styles for full capture
      document.body.style.overflow = 'visible'
      receiptElement.style.width = '800px' // Fixed width for consistent PDF
      receiptElement.style.maxWidth = 'none'
      
      // Wait a bit for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100))

      // Capture the receipt as canvas
      const canvas = await html2canvas(receiptElement, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800, // Fixed width
        windowWidth: 800
      })

      // Restore original styles
      document.body.style.overflow = originalOverflow
      receiptElement.style.width = originalWidth
      receiptElement.style.maxWidth = originalMaxWidth

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Calculate dimensions to fit A4
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      
      // Save receipt before downloading PDF
      saveReceipt()
      
      // Download the PDF
      pdf.save(`Receipt_${receiptNumber}_${customerName.replace(/\s+/g, '_')}.pdf`)

      // Reset button
      if (btn) btn.textContent = 'Download PDF'
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
      
      // Make sure to restore styles even on error
      const receiptElement = document.getElementById('receipt-print-area')
      if (receiptElement) {
        receiptElement.style.width = ''
        receiptElement.style.maxWidth = ''
      }
      document.body.style.overflow = ''
    }
  }

  const handleSharePDFWhatsApp = async () => {
    // For WhatsApp, we'll download the PDF and show instructions
    await handleDownloadPDF()
    
    setTimeout(() => {
      alert('PDF downloaded! Now:\n1. Open WhatsApp\n2. Select contact\n3. Click attachment icon\n4. Select the downloaded PDF file')
    }, 1000)
  }

  const handleSaveTemplate = () => {
    const template = {
      receiptType,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
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
      setCustomerAddress(template.customerAddress || '')
      setItems(template.items || items)
      setNotes(template.notes || '')
      setPaymentMethod(template.paymentMethod || 'Cash')
      alert('Template loaded!')
    } else {
      alert('No saved template found')
    }
  }

  const handleNewReceipt = () => {
    // Save current receipt before creating new one
    if (customerName && items.some(item => item.description)) {
      saveReceipt()
    }
    
    setReceiptNumber(`RCP-${Date.now().toString().slice(-6)}`)
    setReceiptDate(new Date().toISOString().split('T')[0])
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setCustomerAddress('')
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

            <form onSubmit={handleLogin} className="space-y-6" data-no-analytics="true">
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
          
          /* Remove link styling in print */
          .no-print-link {
            pointer-events: none;
            text-decoration: none !important;
          }
        }
      `}</style>

      {/* Idle Warning Banner */}
      {isAuthenticated && showIdleWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-6 py-3 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-xl"></i>
            <span className="font-semibold">
              Your session will expire in {getRemainingTime()} seconds due to inactivity. Move your mouse to stay logged in.
            </span>
          </div>
        </div>
      )}

      {/* Editor Section - No Print */}
      <div className="no-print">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <a href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity" title="Back to Homepage">
              <img 
                src="/assets/logo.png" 
                alt="IT Services Freetown" 
                className="h-12 w-auto"
              />
            </a>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
                Receipt Generator
              </h1>
              <p className="text-gray-600">Create professional receipts for purchases, repairs, and loans</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchReceipts()}
                  placeholder="Search by receipt number or customer name..."
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={searchReceipts}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
              <button
                onClick={() => {
                  setShowHistory(!showHistory)
                  setShowSearchResults(false)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                <History className="w-5 h-5" />
                All Receipts ({allReceipts.length})
              </button>
              <button
                onClick={async () => {
                  if (confirm('Migrate all receipts from this device to the database? This will make them accessible from all devices.')) {
                    await migrateLocalStorageReceipts()
                    alert('Migration complete! Check console for details.')
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                title="Migrate localStorage receipts to database"
              >
                <FileText className="w-5 h-5" />
                Migrate Old Receipts
              </button>
            </div>
          </div>

          {/* Search Results */}
          {(showSearchResults || showHistory) && (
            <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {showHistory ? `All Receipts (${allReceipts.length})` : `Search Results (${searchResults.length})`}
                </h2>
                <button
                  onClick={() => {
                    setShowSearchResults(false)
                    setShowHistory(false)
                    setSearchQuery('')
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕ Close
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(showHistory ? allReceipts : searchResults).map((receipt) => (
                  <div key={receipt.receiptNumber} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-lg text-blue-600">{receipt.receiptNumber}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            receipt.receiptType === 'purchase' 
                              ? 'bg-green-100 text-green-700' 
                              : receipt.receiptType === 'repair' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {receipt.receiptType.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700"><span className="font-semibold">Customer:</span> {receipt.customerName}</p>
                        <p className="text-gray-600 text-sm"><span className="font-semibold">Phone:</span> {receipt.customerPhone}</p>
                        <p className="text-gray-600 text-sm"><span className="font-semibold">Date:</span> {new Date(receipt.receiptDate).toLocaleDateString()}</p>
                        <p className="text-gray-700 font-semibold mt-2">Total: SLE {receipt.subtotal.toFixed(2)}</p>
                        <p className="text-gray-500 text-xs mt-1">Created: {new Date(receipt.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => loadReceipt(receipt)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-all"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteReceipt(receipt.receiptNumber)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(showHistory ? allReceipts : searchResults).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No receipts found</p>
                  </div>
                )}
              </div>
            </div>
          )}

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
              onClick={saveReceipt}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
            >
              <Save className="w-5 h-5" />
              Save Receipt
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md"
            >
              <FileText className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
            <button
              onClick={handleSharePDFWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share PDF (WhatsApp)
            </button>
            <button
              onClick={handleShareEmail}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              Share Email
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
                  onChange={(e) => setReceiptType(e.target.value as 'purchase' | 'repair' | 'loan')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="purchase">Purchase</option>
                  <option value="repair">Repair</option>
                  <option value="loan">Loan</option>
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

              {/* Customer Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Address (Optional)
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter customer address"
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
                  <option value="Installment Payment">Installment Payment</option>
                  <option value="Balance Payment">Balance Payment</option>
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

              {/* Balance to be Paid */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Balance to be Paid (SLE)
                </label>
                <input
                  type="number"
                  value={Math.max(0, calculateSubtotal() - amountPaid)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50 text-gray-700 font-semibold"
                  title="Auto-calculated: Subtotal - Amount Paid"
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

              {/* Mobile: Show scroll hint */}
              <div className="md:hidden text-xs text-gray-500 mb-2 flex items-center gap-1">
                <span>← Swipe to see all fields →</span>
              </div>

              {/* Scrollable container for mobile */}
              <div className="overflow-x-auto -mx-2 px-2 pb-2">
                <div className="space-y-3 min-w-[640px] md:min-w-0">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                      <div className="col-span-5">
                        <label className="text-xs text-gray-600 mb-1 block md:hidden">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-600 mb-1 block md:hidden">Qty</label>
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
                        <label className="text-xs text-gray-600 mb-1 block md:hidden">Price</label>
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
                        <label className="text-xs text-gray-600 mb-1 block md:hidden">Total</label>
                        <input
                          type="text"
                          value={`SLE ${item.total.toFixed(2)}`}
                          readOnly
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs text-gray-600 mb-1 block md:hidden opacity-0">Del</label>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all w-full"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-5 h-5 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
            <div className="flex justify-center mb-4">
              <a href="/" className="inline-block hover:opacity-80 transition-opacity no-print-link">
                <img 
                  src="/assets/logo.png" 
                  alt="IT Services Freetown" 
                  className="h-20 w-auto"
                  style={{ maxHeight: '80px' }}
                />
              </a>
            </div>
            <div className="space-y-1 text-gray-700" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: '500' }}>
              <p className="font-bold text-lg" style={{ fontSize: '16px' }}>#1 Regent Highway Jui Junction, Freetown</p>
              <p>Tel: +232 33 399 391</p>
              <p>Email: info@itservicesfreetown.com</p>
            </div>
          </div>

          {/* Receipt Type Banner */}
          <div className="text-center mb-3">
            <h2 className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded" style={{ fontSize: '16px', letterSpacing: '1px' }}>
              {receiptType === 'purchase' ? 'PURCHASE RECEIPT' : receiptType === 'repair' ? 'REPAIR RECEIPT' : 'LOAN RECEIPT'}
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
                {customerAddress && <p><span className="font-semibold">Address:</span> {customerAddress}</p>}
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
              {calculateSubtotal() > amountPaid && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-300" style={{ fontSize: '13px' }}>
                  <span className="font-semibold text-gray-700">Balance to be Paid:</span>
                  <span className="font-bold text-red-600">SLE {(calculateSubtotal() - amountPaid).toFixed(2)}</span>
                </div>
              )}
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

          {/* Terms and Conditions - Only for Repair Receipts */}
          {receiptType === 'repair' && (
            <div className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: '11px' }}>REPAIR TERMS & CONDITIONS:</h3>
              <ul className="text-gray-700 space-y-1" style={{ fontSize: '9px', lineHeight: '1.3' }}>
                <li>• LCD screens are fragile components. We cannot guarantee against future damage or defects that may appear after repair.</li>
                <li>• All repairs are tested before collection. Any issues must be reported within 1 hour of collection.</li>
                <li>• We are not responsible for data loss. Please backup your data before submitting devices for repair.</li>
                <li>• Warranty does not cover physical damage, water damage, or damage from misuse after repair.</li>
                <li>• Parts replaced are guaranteed for 30 days from the date of repair, excluding LCD damage from drops or pressure.</li>
                <li>• Customer accepts all risks associated with the inherent fragility of electronic components, especially display screens.</li>
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-3 border-t-2 border-gray-300 space-y-1">
            <p className="text-gray-600 font-semibold" style={{ fontSize: '13px' }}>Thank you for your business!</p>
            <p className="text-gray-700 font-bold" style={{ fontSize: '11px' }}>www.itservicesfreetown.com</p>
            <p className="text-gray-500" style={{ fontSize: '10px' }}>This is a computer-generated receipt</p>
            <p className="text-gray-500" style={{ fontSize: '10px', lineHeight: '1.3' }}>For support, call +232 33 399 391 or visit #1 Regent Highway Jui Junction</p>
          </div>
        </div>
      </div>
    </div>
  )
}
