'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Grid, List, ChevronDown, Heart, Star } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  status: string;
  images: { url: string; alt?: string }[];
  category: { name: string; slug: string };
  brand?: string;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    updateCartCount();
  }, []);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory);
      }
      params.append('status', 'active');

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) {
        console.error('Failed to fetch products:', res.status);
        if (res.status === 500) {
          setError('Database not configured. Please set up your database to start selling products.');
        }
        setProducts([]);
        return;
      }
      const data = await res.json();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProducts(data);
        setError(null);
      } else {
        setProducts([]);
        setError('Failed to load products. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to connect to the server. Please check your connection.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) {
        console.error('Failed to fetch categories:', res.status);
        setCategories([]);
        return;
      }
      const data = await res.json();
      // Ensure data is an array
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
  };

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Product added to cart!');
  };

  // Filter and sort products
  let filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category.slug === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  // Sort products
  filteredProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return 0;
    }
  });

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return null;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              IT Services Store
            </Link>
            
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories & Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Categories
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    fetchProducts();
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>All Products</span>
                    <span className="text-sm opacity-75">{products.length}</span>
                  </div>
                </button>

                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.slug);
                      fetchProducts();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedCategory === category.slug
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-sm opacity-75">{category._count.products}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-300">
                  Showing <span className="font-bold text-white">{filteredProducts.length}</span> products
                </p>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                    >
                      <Grid className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                    >
                      <List className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-yellow-900/20 border border-yellow-600/50 rounded-xl p-8">
                <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-yellow-500 mb-2">Database Not Configured</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">{error}</p>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-2xl mx-auto text-left">
                  <h4 className="font-semibold text-white mb-3">Quick Setup Instructions:</h4>
                  <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                    <li>Go to your Vercel Dashboard</li>
                    <li>Navigate to Storage → Create Database → Postgres</li>
                    <li>Connect the database to your project</li>
                    <li>Redeploy your application</li>
                  </ol>
                  <a 
                    href="https://github.com/ryanstewart047/web-app-it-services-freetown/blob/main/VERCEL_MARKETPLACE_SETUP.md" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    View Full Setup Guide →
                  </a>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map(product => {
                  const discount = calculateDiscount(product.price, product.comparePrice);
                  
                  return (
                    <div
                      key={product.id}
                      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all group ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      {/* Product Image */}
                      <Link
                        href={`/marketplace/${product.slug}`}
                        className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}
                      >
                        {product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <ShoppingCart className="w-16 h-16 text-gray-600" />
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-2">
                          {product.featured && (
                            <span className="px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full">
                              Featured
                            </span>
                          )}
                          {discount && (
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                              {discount}% OFF
                            </span>
                          )}
                        </div>

                        {/* Wishlist */}
                        <button className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full transition-all opacity-0 group-hover:opacity-100">
                          <Heart className="w-5 h-5 text-gray-800" />
                        </button>
                      </Link>

                      {/* Product Info */}
                      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <p className="text-blue-400 text-sm mb-1">{product.category.name}</p>
                        <Link href={`/marketplace/${product.slug}`}>
                          <h3 className="text-white font-semibold text-lg mb-2 hover:text-blue-400 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>

                        {viewMode === 'list' && (
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                        )}

                        {product.brand && (
                          <p className="text-gray-500 text-sm mb-2">{product.brand}</p>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-white">${product.price.toFixed(2)}</span>
                          {product.comparePrice && (
                            <span className="text-gray-500 line-through text-sm">
                              ${product.comparePrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Stock */}
                        <p className="text-sm text-gray-400 mb-4">
                          {product.stock > 10 ? (
                            <span className="text-green-400">In Stock</span>
                          ) : product.stock > 0 ? (
                            <span className="text-yellow-400">Only {product.stock} left</span>
                          ) : (
                            <span className="text-red-400">Out of Stock</span>
                          )}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                          <Link
                            href={`/marketplace/${product.slug}`}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
