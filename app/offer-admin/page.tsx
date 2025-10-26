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
  const [termsText, setTermsText] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [currentOffer, setCurrentOffer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

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
    if (!previewRef.current) return
    
    try {
      toast.loading('Generating image...')
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundColor,
        scale: 2,
        logging: false,
      })
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `offer-${Date.now()}.png`
          link.click()
          URL.revokeObjectURL(url)
          toast.dismiss()
          toast.success('Image downloaded!')
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
          </div>
        </div>

        {/* Preview Section */}
        {(title || description) && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <p className="text-sm text-gray-600 mb-4">This is how your offer popup will look to visitors:</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Image Preview */}
                  <div className="md:w-2/5 relative bg-gradient-to-br from-purple-100 to-pink-100 min-h-[200px]">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl">🎉</div>
                      </div>
                    )}
                  </div>

                  {/* Text Preview */}
                  <div className="md:w-3/5 p-8">
                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full mb-3">
                      TODAY'S OFFER
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      {title || 'Your Offer Title'}
                    </h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">
                      {description || 'Your offer description will appear here...'}
                    </div>
                    {buttonText && buttonLink && (
                      <a
                        href={buttonLink}
                        className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
                      >
                        {buttonText}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
