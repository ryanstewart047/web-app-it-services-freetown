'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save, Trash2, Eye, EyeOff, Image as ImageIcon, Download, Share2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import html2canvas from 'html2canvas'

export default function OfferAdminPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [buttonLink, setButtonLink] = useState('')
  const [buttonColor, setButtonColor] = useState('#9333ea')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [textColor, setTextColor] = useState('#1f2937')
  const [badgeColor, setBadgeColor] = useState('#9333ea')
  const [badgeText, setBadgeText] = useState("TODAY'S OFFER")
  const [termsText, setTermsText] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [currentOffer, setCurrentOffer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCurrentOffer()
  }, [])

  const loadCurrentOffer = async () => {
    try {
      const response = await fetch('/api/offer/admin')
      const data = await response.json()
      
      if (data.offer) {
        setCurrentOffer(data.offer)
        setTitle(data.offer.title)
        setDescription(data.offer.description)
        setImageUrl(data.offer.imageUrl)
        setButtonText(data.offer.buttonText || '')
        setButtonLink(data.offer.buttonLink || '')
        setButtonColor(data.offer.buttonColor || '#9333ea')
        setBackgroundColor(data.offer.backgroundColor || '#ffffff')
        setTextColor(data.offer.textColor || '#1f2937')
        setBadgeColor(data.offer.badgeColor || '#9333ea')
        setBadgeText(data.offer.badgeText || "TODAY'S OFFER")
        setTermsText(data.offer.termsText || '')
        setIsActive(data.offer.isActive)
        setPreviewImage(data.offer.imageUrl)
      }
    } catch (error) {
      console.error('Error loading offer:', error)
    }
  }

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    setPreviewImage(url)
  }

  const handleAddImageUrl = () => {
    const url = prompt('Enter image URL (from Imgur, PostImages, etc.):')
    if (url) {
      handleImageUrlChange(url)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/offer/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          buttonText,
          buttonLink,
          buttonColor,
          backgroundColor,
          textColor,
          badgeColor,
          badgeText,
          termsText,
          isActive,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Offer saved successfully!')
        loadCurrentOffer()
      } else {
        toast.error('Failed to save offer')
      }
    } catch (error) {
      console.error('Error saving offer:', error)
      toast.error('Error saving offer')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!exportRef.current) return
    
    try {
      toast.loading('Generating social media image...')
      
      const canvas = await html2canvas(exportRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundColor,
        width: 1080,
        height: 1080,
        scale: 1,
        logging: false,
      })
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `offer-social-${Date.now()}.png`
          link.click()
          URL.revokeObjectURL(url)
          toast.dismiss()
          toast.success('Social media image downloaded!')
        }
      }, 'image/png')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to download image')
      console.error('Download error:', error)
    }
  }

  const handleShare = async () => {
    const shareText = `${title}\n\n${description}\n\nVisit: https://www.itservicesfreetown.com`
    const shareUrl = 'https://www.itservicesfreetown.com'

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        })
        toast.success('Shared successfully!')
      } catch (error) {
        console.error('Share error:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText + '\n' + shareUrl)
        toast.success('Link copied to clipboard!')
      } catch (error) {
        toast.error('Failed to share')
      }
    }
  }

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate the current offer?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/offer/manage', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Offer deactivated!')
        setIsActive(false)
        loadCurrentOffer()
      } else {
        toast.error('Failed to deactivate offer')
      }
    } catch (error) {
      console.error('Error deactivating offer:', error)
      toast.error('Error deactivating offer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Today's Offer</h1>
          <p className="text-gray-600">Create or update the offer popup that visitors see</p>
        </div>

        {/* Current Offer Status */}
        {currentOffer && (
          <div className={`mb-6 p-4 rounded-lg ${currentOffer.isActive ? 'bg-green-100 border border-green-300' : 'bg-gray-100 border border-gray-300'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentOffer.isActive ? (
                  <>
                    <Eye className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Current offer is active</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-800 font-medium">No active offer</span>
                  </>
                )}
              </div>
              <span className="text-sm text-gray-600">
                Last updated: {new Date(currentOffer.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side - Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Image</h3>
              
              {/* Image Preview */}
              <div className="mb-4 relative bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden aspect-square">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Offer preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">No image yet</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image URL Input */}
              <div className="space-y-3">
                <button
                  onClick={handleAddImageUrl}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Add Image URL
                </button>
                
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="Or paste image URL here"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                <p className="text-xs text-gray-500">
                  Upload to <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Imgur</a> or <a href="https://postimages.org" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">PostImages</a>
                </p>
              </div>
            </div>

            {/* Right Side - Text Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Details</h3>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 50% Off All Repairs!"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your offer in detail..."
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
                </div>

                {/* Button Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g., Book Now, Learn More, Get Started"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={30}
                  />
                  <p className="text-xs text-gray-500 mt-1">{buttonText.length}/30 characters</p>
                </div>

                {/* Button Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="e.g., /book-appointment, https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to hide button</p>
                </div>

                {/* Appearance Customization */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">🎨 Appearance Customization</h4>
                  
                  {/* Button Color */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Color
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="color"
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        placeholder="#9333ea"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        maxLength={7}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setButtonColor('#dc2626')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>Red</button>
                      <button type="button" onClick={() => setButtonColor('#040e40')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#040e40', color: '#ffffff' }}>Navy</button>
                      <button type="button" onClick={() => setButtonColor('#000000')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Black</button>
                      <button type="button" onClick={() => setButtonColor('#6b7280')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#6b7280', color: '#ffffff' }}>Gray</button>
                      <button type="button" onClick={() => setButtonColor('#9333ea')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#9333ea', color: '#ffffff' }}>Purple</button>
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        maxLength={7}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setBackgroundColor('#ffffff')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#ffffff', color: '#000000', border: '2px solid #d1d5db' }}>White</button>
                      <button type="button" onClick={() => setBackgroundColor('#f3f4f6')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#f3f4f6', color: '#000000' }}>Light Gray</button>
                      <button type="button" onClick={() => setBackgroundColor('#fef3c7')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#fef3c7', color: '#000000' }}>Light Yellow</button>
                      <button type="button" onClick={() => setBackgroundColor('#dbeafe')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#dbeafe', color: '#000000' }}>Light Blue</button>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        placeholder="#1f2937"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        maxLength={7}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setTextColor('#1f2937')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Dark Gray</button>
                      <button type="button" onClick={() => setTextColor('#000000')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Black</button>
                      <button type="button" onClick={() => setTextColor('#6b7280')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#6b7280', color: '#ffffff' }}>Gray</button>
                      <button type="button" onClick={() => setTextColor('#ffffff')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#ffffff', color: '#000000', border: '2px solid #d1d5db' }}>White</button>
                    </div>
                  </div>

                  {/* Badge Color */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Color
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="color"
                        value={badgeColor}
                        onChange={(e) => setBadgeColor(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={badgeColor}
                        onChange={(e) => setBadgeColor(e.target.value)}
                        placeholder="#9333ea"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        maxLength={7}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setBadgeColor('#9333ea')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#9333ea', color: '#ffffff' }}>Purple</button>
                      <button type="button" onClick={() => setBadgeColor('#ec4899')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#ec4899', color: '#ffffff' }}>Pink</button>
                      <button type="button" onClick={() => setBadgeColor('#dc2626')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>Red</button>
                      <button type="button" onClick={() => setBadgeColor('#f59e0b')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}>Orange</button>
                      <button type="button" onClick={() => setBadgeColor('#10b981')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>Green</button>
                      <button type="button" onClick={() => setBadgeColor('#3b82f6')} className="px-3 py-1 text-xs rounded-md border-2 hover:border-gray-400 transition-colors" style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}>Blue</button>
                    </div>
                  </div>

                  {/* Badge Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value.toUpperCase())}
                      placeholder="TODAY'S OFFER"
                      maxLength={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Customize the badge text (automatically converted to uppercase, max 20 characters)
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button type="button" onClick={() => setBadgeText("TODAY'S OFFER")} className="px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">Today's Offer</button>
                      <button type="button" onClick={() => setBadgeText('HOT DEAL')} className="px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">Hot Deal</button>
                      <button type="button" onClick={() => setBadgeText('LIMITED TIME')} className="px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">Limited Time</button>
                      <button type="button" onClick={() => setBadgeText('SPECIAL OFFER')} className="px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">Special Offer</button>
                      <button type="button" onClick={() => setBadgeText('FLASH SALE')} className="px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">Flash Sale</button>
                    </div>
                  </div>

                  {/* Terms Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms & Conditions Text (Optional)
                    </label>
                    <textarea
                      value={termsText}
                      onChange={(e) => setTermsText(e.target.value)}
                      placeholder="e.g., All rights reserved. IT Services Freetown reserves the right to modify offers."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {termsText.length}/200 characters • Shown in small gray text below the button
                    </p>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Show this offer to visitors
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Offer'}
            </button>

            <Link
              href="/offer-test"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-300"
              title="Test if offer system is working correctly"
            >
              <Eye className="w-5 h-5" />
              Diagnostics
            </Link>

            <button
              onClick={handleDownload}
              disabled={!title || !description}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!title || !description ? 'Add title and description first' : 'Download as image for social media'}
            >
              <Download className="w-5 h-5" />
              Download for Social Media
            </button>

            <button
              onClick={handleShare}
              disabled={!title || !description}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!title || !description ? 'Add title and description first' : 'Share offer details'}
            >
              <Share2 className="w-5 h-5" />
              Share Offer
            </button>

            {currentOffer?.isActive && (
              <button
                onClick={handleDeactivate}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5" />
                Deactivate
              </button>
            )}

            <a
              href="/test-offer"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300"
              title="Open debug page to test if offer API is working"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Debug API
            </a>
          </div>
        </div>

        {/* Preview Section */}
        {(title || description) && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <p className="text-sm text-gray-600 mb-4">This is how your offer popup will look to visitors:</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50">
              <div 
                ref={previewRef}
                className="rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden"
                style={{ backgroundColor }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image Preview */}
                  <div className="md:w-2/5 relative bg-gradient-to-br from-purple-100 to-pink-100 min-h-[200px]">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={title}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl">🎉</div>
                      </div>
                    )}
                  </div>

                  {/* Text Preview */}
                  <div className="md:w-3/5 p-8">
                    <div className="inline-block px-3 py-1 text-white text-xs font-bold rounded-full mb-3" style={{ background: badgeColor }}>
                      {badgeText || "TODAY'S OFFER"}
                    </div>
                    <h2 className="text-3xl font-bold mb-3" style={{ color: textColor }}>
                      {title || 'Your Offer Title'}
                    </h2>
                    <div className="leading-relaxed whitespace-pre-line mb-6" style={{ color: textColor }}>
                      {description || 'Your offer description will appear here...'}
                    </div>
                    {buttonText && buttonLink && (
                      <div>
                        <a
                          href={buttonLink}
                          className="inline-block px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:opacity-90"
                          style={{ backgroundColor: buttonColor }}
                        >
                          {buttonText}
                        </a>
                        {termsText && (
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            {termsText}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Social Media Export Version (1080x1080 for Instagram/Facebook) */}
        <div 
          ref={exportRef}
          className="fixed -left-[9999px] top-0"
          style={{ 
            width: '1080px', 
            height: '1080px',
            backgroundColor: backgroundColor 
          }}
        >
          <div className="w-full h-full flex flex-col justify-center p-16" style={{ backgroundColor }}>
            {/* Image Section - Top Third */}
            {previewImage && (
              <div className="w-full h-[340px] mb-8 rounded-3xl overflow-hidden">
                <img
                  src={previewImage}
                  alt={title}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            )}
            
            {/* Content Section */}
            <div className="flex-1 flex flex-col justify-center text-center px-12">
              <div className="inline-block mx-auto px-8 py-3 text-white text-2xl font-bold rounded-full mb-6" style={{ background: badgeColor }}>
                {badgeText || "TODAY'S OFFER"}
              </div>
              <h2 className="text-6xl font-bold mb-8 leading-tight" style={{ color: textColor }}>
                {title || 'Your Offer Title'}
              </h2>
              <div className="text-3xl leading-relaxed mb-10" style={{ color: textColor }}>
                {description || 'Your offer description will appear here...'}
              </div>
              {buttonText && buttonLink && (
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="inline-block px-16 py-6 text-white text-3xl font-bold rounded-2xl"
                    style={{ backgroundColor: buttonColor }}
                  >
                    {buttonText}
                  </div>
                  {termsText && (
                    <p className="text-xl text-gray-500">
                      {termsText}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
