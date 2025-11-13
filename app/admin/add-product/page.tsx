'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ url: string; alt: string }[]>([{ url: '', alt: '' }]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    stock: '',
    categoryId: '',
    sku: '',
    brand: '',
    condition: 'new',
    featured: false,
    status: 'active'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Upload video file to storage service (Cloudinary, AWS S3, etc.)
      // For now, we just validate that the video is 30 seconds
      // You'll need to implement video upload to a storage service
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        stock: parseInt(formData.stock),
        images: images.filter(img => img.url).map((img, index) => ({ ...img, order: index })),
        // videoUrl will be set after uploading to storage service
        videoUrl: videoFile ? 'VIDEO_UPLOAD_PENDING' : undefined
      };

      console.log('[Add Product] Submitting product data:', productData);
      if (videoFile) {
        console.log('[Add Product] Video file ready for upload:', videoFile.name);
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      console.log('[Add Product] Response status:', res.status);

      if (res.ok) {
        alert('Product added successfully!');
        router.push('/admin/products');
      } else {
        // Get detailed error message from API
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Add Product] Error response:', errorData);
        alert(`Failed to add product: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Add Product] Error adding product:', error);
      alert(`Error adding product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addImageField = () => {
    setImages([...images, { url: '', alt: '' }]);
  };

  const removeImageField = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const updateImage = (index: number, field: 'url' | 'alt', value: string) => {
    const newImages = [...images];
    newImages[index][field] = value;
    setImages(newImages);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      setVideoError('Please select a valid video file');
      setVideoFile(null);
      return;
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setVideoError('Video file must be less than 50MB');
      setVideoFile(null);
      return;
    }

    // Create video element to check duration
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = Math.round(video.duration);

      if (duration !== 30) {
        setVideoError(`Video must be exactly 30 seconds (current: ${duration}s)`);
        setVideoFile(null);
        e.target.value = ''; // Reset input
      } else {
        setVideoError('');
        setVideoFile(file);
        // Create a local URL for preview if needed
        setVideoUrl(URL.createObjectURL(file));
      }
    };

    video.onerror = () => {
      setVideoError('Unable to read video file');
      setVideoFile(null);
    };

    video.src = URL.createObjectURL(file);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoUrl('');
    setVideoError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Products
          </Link>
          <h1 className="text-4xl font-bold text-white">Add New Product</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8" data-no-analytics="true">
          {/* Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., iPhone 13 Pro"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Detailed product description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="99.99"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Compare Price (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="149.99"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Stock *</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">SKU (optional)</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="PROD-001"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Brand (optional)</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Apple"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-white font-medium">Product Images</label>
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Image
                </button>
              </div>

              {images.map((img, index) => (
                <div key={index} className="flex gap-4 mb-4">
                  <input
                    type="url"
                    value={img.url}
                    onChange={(e) => updateImage(index, 'url', e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) => updateImage(index, 'alt', e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Image description"
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-white font-medium mb-2">
                Product Video (Optional - Must be exactly 30 seconds)
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                />
                
                {videoError && (
                  <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                    {videoError}
                  </div>
                )}
                
                {videoFile && !videoError && (
                  <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-300 font-medium">✓ Video uploaded: {videoFile.name}</p>
                        <p className="text-green-300/70 text-sm">Duration: 30 seconds</p>
                      </div>
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {videoUrl && (
                      <video 
                        src={videoUrl} 
                        controls 
                        className="mt-3 w-full max-w-md rounded-lg"
                      />
                    )}
                  </div>
                )}
                
                <p className="text-gray-400 text-sm">
                  Upload a 30-second video to showcase your product. Accepted formats: MP4, MOV, AVI. Max size: 50MB.
                </p>
              </div>
            </div>

            {/* Status, Condition, and Featured */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Condition *</label>
                <select
                  required
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="new">Brand New</option>
                  <option value="refurbished">Refurbished</option>
                  <option value="used-like-new">Used - Like New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-white cursor-pointer pb-3">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
