'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Search, Filter, DollarSign, Package, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  status: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
      if (!res.ok) {
        setCategories([]);
        return;
      }
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update stock');
      }
      
      await fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update product stock. Please try again.');
    }
  };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
    console.log('Updating status:', { id, newStatus });
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to update status');
      }
      
      const updatedProduct = await response.json();
      console.log('Updated product:', updatedProduct);
      
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
                onClick={() => setShowAddModal(true)}
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
                          value={product.stock}
                          onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
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

      {/* Add/Edit Modal - We'll create a separate component for this */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-gray-400 mb-6">
              Click "Bulk Upload" for uploading multiple products at once
            </p>
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
