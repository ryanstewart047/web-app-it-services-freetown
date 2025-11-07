'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Search, Filter, DollarSign, Package, Image as ImageIcon } from 'lucide-react';
import { useAdminSession } from '../../../src/hooks/useAdminSession';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  status: string;
  condition: string;
  videoUrl?: string;
  categoryId: string;
  images: { url: string; alt?: string; order: number }[];
  category: { name: string };
  sku?: string;
  brand?: string;
  featured: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  // Admin session management - auto-logout after 5 minutes of inactivity
  const { showIdleWarning, getRemainingTime } = useAdminSession({
    idleTimeout: 5 * 60 * 1000, // 5 minutes
    warningTime: 30 * 1000 // 30 seconds warning
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  
  // Form state - controlled components
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    stock: '',
    categoryId: '',
    sku: '',
    brand: '',
    status: 'active',
    condition: 'new',
    videoUrl: '',
    featured: false
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        if (res.status === 500) {
          setError('Database not configured. Please set up your database first.');
        }
        setProducts([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        setError(null);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to connect to the server.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      
      if (!res.ok) {
        console.error('Failed to fetch categories:', data.error || 'Unknown error');
        if (res.status === 503) {
          setError(data.message || 'Database not configured. Please check your environment variables.');
        }
        setCategories(data.categories || []);
        return;
      }
      
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to connect to the server. Please check your connection.');
      setCategories([]);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.categoryId === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

    const handleUpdateStock = async (id: string, newStock: number) => {
    console.log('Updating stock:', { id, newStock });
    
    try {
      const response = await fetch('/api/products/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id, 
          updates: { stock: newStock }
        }),
      });
      
      const data = await response.json();
      console.log('Stock update response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update stock');
      }
      
      await fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update product stock. Please try again.');
    }
  };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
    console.log('Updating status:', { id, newStatus });
    
    // Optimistically update the UI
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === id ? { ...p, status: newStatus } : p)
    );
    
    try {
      const response = await fetch('/api/products/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id, 
          updates: { status: newStatus }
        }),
      });
      
      const data = await response.json();
      console.log('Status update response:', data);
      
      if (!response.ok) {
        console.error('Error response:', data);
        // Revert the optimistic update
        await fetchProducts();
        throw new Error(data.error || `Failed to update status: ${response.status}`);
      }
      
      console.log('Status updated successfully:', data.product);
      
      // Refresh to ensure sync
      await fetchProducts();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update product status. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Product Management</h1>
          <p className="text-gray-300">Manage your marketplace inventory</p>
        </div>

        {/* Idle Warning Banner */}
        {showIdleWarning && (
          <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fas fa-exclamation-triangle text-xl"></i>
              <span className="font-semibold">
                Your session will expire in {getRemainingTime()} seconds due to inactivity. Move your mouse to stay logged in.
              </span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3 w-full lg:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            {/* Add Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/admin/products/bulk-upload'}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
              >
                <Upload className="w-5 h-5" />
                Bulk Upload
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setImageUrls(['']);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Products</p>
                <p className="text-white text-3xl font-bold">{products.length}</p>
              </div>
              <Package className="w-12 h-12 text-blue-100 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-500 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">In Stock</p>
                <p className="text-white text-3xl font-bold">
                  {products.filter(p => p.stock > 0).length}
                </p>
              </div>
              <Package className="w-12 h-12 text-green-100 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-500 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Out of Stock</p>
                <p className="text-white text-3xl font-bold">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
              <Package className="w-12 h-12 text-red-100 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-500 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Categories</p>
                <p className="text-white text-3xl font-bold">{categories.length}</p>
              </div>
              <Filter className="w-12 h-12 text-purple-100 opacity-50" />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                      <p>Loading products...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-yellow-500 mb-2">Database Not Configured</h3>
                        <p className="text-gray-300 mb-4">{error}</p>
                        <a 
                          href="https://github.com/ryanstewart047/web-app-it-services-freetown/blob/main/VERCEL_MARKETPLACE_SETUP.md" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          View Setup Guide →
                        </a>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{product.name}</p>
                            <p className="text-gray-400 text-sm">{product.sku || 'No SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{product.category.name}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-semibold">Le {product.price.toFixed(2)}</p>
                          {product.comparePrice && (
                            <p className="text-gray-400 text-sm line-through">
                              Le {product.comparePrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          defaultValue={product.stock}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newStock = parseInt((e.target as HTMLInputElement).value);
                              if (!isNaN(newStock) && newStock >= 0) {
                                handleUpdateStock(product.id, newStock);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const newStock = parseInt(e.target.value);
                            if (!isNaN(newStock) && newStock >= 0 && newStock !== product.stock) {
                              handleUpdateStock(product.id, newStock);
                            } else {
                              e.target.value = product.stock.toString();
                            }
                          }}
                          className="w-20 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={product.status}
                          onChange={(e) => {
                            console.log('Dropdown changed:', e.target.value);
                            handleUpdateStatus(product.id, e.target.value);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            product.status === 'active'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                              : product.status === 'out_of_stock'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                          }`}
                        >
                          <option value="active" className="bg-gray-800 text-white">Active</option>
                          <option value="out_of_stock" className="bg-gray-800 text-white">Out of Stock</option>
                          <option value="discontinued" className="bg-gray-800 text-white">Discontinued</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              // Populate form data from the product
                              setFormData({
                                name: product.name,
                                description: product.description,
                                price: product.price.toString(),
                                comparePrice: product.comparePrice?.toString() || '',
                                stock: product.stock.toString(),
                                categoryId: product.categoryId,
                                sku: product.sku || '',
                                brand: product.brand || '',
                                status: product.status,
                                condition: product.condition || 'new',
                                videoUrl: product.videoUrl || '',
                                featured: product.featured
                              });
                              // Populate image URLs from the product
                              const productImages = product.images?.map(img => img.url) || [''];
                              setImageUrls(productImages.length > 0 ? productImages : ['']);
                              setShowAddModal(true);
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                  setImageUrls(['']);
                  // Reset form data
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    comparePrice: '',
                    stock: '',
                    categoryId: '',
                    sku: '',
                    brand: '',
                    status: 'active',
                    condition: 'new',
                    videoUrl: '',
                    featured: false
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form data-no-analytics="true" onSubmit={async (e) => {
              e.preventDefault();
              
              // Validate required fields
              if (!formData.name || !formData.description || !formData.price || !formData.stock || !formData.categoryId) {
                alert('Please fill in all required fields:\n- Product Name\n- Description\n- Price\n- Stock\n- Category');
                return;
              }
              
              // Collect all non-empty image URLs
              const images = imageUrls
                .filter(url => url.trim() !== '')
                .map((url, index) => ({
                  url: url.trim(),
                  alt: formData.name,
                  order: index
                }));
              
              const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
                stock: parseInt(formData.stock),
                categoryId: formData.categoryId,
                sku: formData.sku || null,
                brand: formData.brand || null,
                status: formData.status,
                condition: formData.condition,
                videoUrl: formData.videoUrl || null,
                featured: formData.featured,
                images: images.length > 0 ? images : []
              };

              try {
                // Use POST to /api/products/update for better compatibility with HTTPS/proxies
                const url = editingProduct 
                  ? '/api/products/update'  // Use update endpoint for edits
                  : '/api/products';         // Use create endpoint for new products
                const method = 'POST';
                
                // Prepare data based on whether we're editing or creating
                const requestData = editingProduct
                  ? { id: editingProduct.id, updates: productData }  // Update format
                  : productData;  // Create format
                
                console.log('Saving product:', requestData);
                
                const res = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(requestData)
                });

                if (res.ok) {
                  let savedProduct;
                  try {
                    savedProduct = await res.json();
                    console.log('Product saved successfully:', savedProduct);
                  } catch (jsonError) {
                    console.log('Response was successful but JSON parsing failed - this is OK, product was saved');
                  }
                  
                  alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
                  setShowAddModal(false);
                  setEditingProduct(null);
                  setImageUrls(['']);
                  // Reset form data
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    comparePrice: '',
                    stock: '',
                    categoryId: '',
                    sku: '',
                    brand: '',
                    status: 'active',
                    condition: 'new',
                    videoUrl: '',
                    featured: false
                  });
                  fetchProducts();
                } else {
                  let errorMessage = 'Failed to save product';
                  try {
                    const error = await res.json();
                    console.error('Save error:', error);
                    errorMessage = error.details || error.error || errorMessage;
                  } catch (jsonError) {
                    // If we can't parse the error response, use status text
                    errorMessage = `Failed to save product: ${res.status} ${res.statusText}`;
                  }
                  alert(`Error: ${errorMessage}\n\nPlease check:\n- All required fields are filled\n- Category is selected\n- Images have valid URLs`);
                }
              } catch (error) {
                console.error('Error saving product:', error);
                alert(`Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }}>
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-white mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Price and Compare Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Price (Le) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Compare Price (Le)</label>
                    <input
                      type="number"
                      value={formData.comparePrice}
                      onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Stock and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Stock *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      min="0"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Category *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SKU and Brand */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Image URLs */}
                <div>
                  <label className="block text-white mb-2">Product Images *</label>
                  <div className="space-y-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...imageUrls];
                            newUrls[index] = e.target.value;
                            setImageUrls(newUrls);
                          }}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newUrls = imageUrls.filter((_, i) => i !== index);
                              setImageUrls(newUrls);
                            }}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setImageUrls([...imageUrls, ''])}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Image
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Add multiple image URLs. The first image will be the main product image.
                  </p>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-white mb-2">Product Video URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or direct video URL"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    YouTube, Vimeo, or direct video links (.mp4, .webm). Adds a video player to the product page.
                  </p>
                </div>

                {/* Status, Condition and Featured */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white mb-2">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white mb-2">Condition *</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">Brand New</option>
                      <option value="refurbished">Refurbished</option>
                      <option value="used-like-new">Used - Like New</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center text-white mt-8">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="mr-2 w-5 h-5"
                      />
                      Featured Product
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
