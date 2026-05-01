'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Filter, ShoppingCart, Grid, List, ChevronDown, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getWishlistSessionId } from '@/utils/wishlistSession';
import { DisplayAd, MultiplexAd } from '@/components/AdSense';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';

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
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { cartCount, addToCart: contextAddToCart } = useCart();
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [wishlistCounts, setWishlistCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchWishlist();
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

  const fetchWishlist = async () => {
    try {
      const sessionId = getWishlistSessionId();
      const res = await fetch(`/api/wishlist?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        const wishlistIds = new Set<string>(data.map((item: any) => item.productId));
        setWishlist(wishlistIds);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchWishlistCount = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist/count/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setWishlistCounts(prev => ({ ...prev, [productId]: data.count }));
      }
      // Silently ignore errors to prevent console spam when DB not configured
    } catch (error) {
      // Database not configured - ignore
    }
  };

  const toggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const sessionId = getWishlistSessionId();
    const isInWishlist = wishlist.has(productId);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const res = await fetch(`/api/wishlist?sessionId=${sessionId}&productId=${productId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setWishlist(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          await fetchWishlistCount(productId);
        }
      } else {
        // Add to wishlist
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, productId })
        });
        if (res.ok) {
          setWishlist(prev => new Set(prev).add(productId));
          await fetchWishlistCount(productId);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist');
    }
  };

  // Wishlist counts are fetched on-demand when needed (e.g., after toggle)
  // This prevents console spam when database is not configured

  const addToCart = (product: Product) => {
    contextAddToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      quantity: 1
    });

    toast.success('Product added to cart!');
    
    // Automatically open the cart page
    router.push('/cart');
  };

  // Enhanced filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Enhanced search - searches in multiple fields
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = searchLower === '' || (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.category.name.toLowerCase().includes(searchLower) ||
        // Search by price (e.g., user types "5000" to find products around that price)
        (product.price.toString().includes(searchLower)) ||
        // Match partial words (e.g., "lap" matches "laptop")
        product.name.toLowerCase().split(' ').some(word => word.startsWith(searchLower)) ||
        product.description.toLowerCase().split(' ').some(word => word.startsWith(searchLower))
      );
      const matchesCategory = selectedCategory === 'all' || product.category.slug === selectedCategory;
      return matchesSearch && matchesCategory && product.stock > 0;
    });

    // Sort products
    return filtered.sort((a, b) => {
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
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Infinite scroll: load more products when user scrolls
  useEffect(() => {
    const currentProducts = filteredProducts.slice(0, page * ITEMS_PER_PAGE);
    setDisplayedProducts(currentProducts);
    setHasMore(currentProducts.length < filteredProducts.length);
  }, [page, filteredProducts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setPage(prev => prev + 1);
            setLoadingMore(false);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore]);

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return null;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <>
      {/* Background layer - white base */}
      <div className="fixed inset-0 bg-white -z-10 pointer-events-none"></div>
      
      {/* Main content */}
      <div className="min-h-screen pt-24 sm:pt-28 bg-white">
      {/* Header - Search and Cart */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-[64px] sm:top-[72px] z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
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
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm sm:text-base z-10 cursor-pointer shadow-lg"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center pointer-events-none">
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
                className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      {/* SEO Content Section */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop Quality IT Products & Electronics in Freetown
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Browse our extensive collection of laptops, computers, mobile phones, and accessories. 
            We offer genuine products, competitive prices, and reliable service in Sierra Leone.
          </p>
          <p className="text-gray-500">
            📍 Located at #1 Regent Highway Jui Junction, Freetown | 📞 Call us: +232 33 399 391
          </p>
        </div>
      </section>

      {/* Top Ad */}
      <div className="container mx-auto px-4 py-8">
        <DisplayAd />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories & Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-32 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
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
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
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
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
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
            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-600">
                  Showing <span className="font-bold text-gray-900">{displayedProducts.length}</span> of <span className="font-bold text-gray-900">{filteredProducts.length}</span> products
                </p>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="text-gray-400 mt-4">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-yellow-900/20 border border-yellow-600/50 rounded-xl p-8">
                {/* ... error content ... */}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-800/30 border border-gray-700 rounded-xl p-8">
                {/* ... no products content ... */}
              </div>
            ) : (
              <>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {displayedProducts.map(product => {
                  const discount = calculateDiscount(product.price, product.comparePrice);
                  
                  return (
                    <div
                      key={product.id}
                      className={`bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all duration-300 group ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      {/* Product Image ... existing product card UI ... */}
                      <div
                        className={`relative overflow-hidden cursor-pointer ${viewMode === 'list' ? 'w-40 flex-shrink-0' : 'aspect-[4/3]'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.images[0]) {
                            setZoomedImage(product.images[0].url);
                          }
                        }}
                      >
                        {product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                            <ShoppingCart className="w-12 h-12" />
                          </div>
                        )}

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

                        <button 
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
                        >
                          <Heart className={`w-5 h-5 ${wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-800'}`} />
                        </button>
                      </div>

                      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <p className="text-blue-600 text-sm font-medium mb-1">{product.category.name}</p>
                        <Link href={`/marketplace/${product.slug}`}>
                          <h3 className="text-gray-900 font-bold text-lg mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-black text-gray-900">Le {product.price.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm"
                          >
                            <ShoppingCart className="w-4 h-4" /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {loadingMore && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}

              <div ref={observerTarget} className="h-10" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Multiplex Ad */}
      <div className="container mx-auto px-4 py-8">
        <MultiplexAd />
      </div>

      {/* Image Zoom Modal ... existing ... */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Product zoom"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* SEO Footer Content */}
      <section className="bg-gray-50 border-t border-gray-100 mt-12">
        <div className="container mx-auto px-4 py-12">
          {/* ... existing footer content ... */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
            <p>Serving Freetown and all of Sierra Leone with quality IT products since 2020. We accept cash, mobile money, and bank transfers.</p>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
