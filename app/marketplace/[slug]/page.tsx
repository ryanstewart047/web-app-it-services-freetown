'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Share2, Check, ArrowLeft, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getWishlistSessionId } from '@/utils/wishlistSession';
import { DisplayAd, MultiplexAd } from '@/components/AdSense';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  condition: string;
  videoUrl?: string;
  images: { url: string; alt?: string; order: number }[];
  category: { name: string; slug: string };
  brand?: string;
  sku?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    updateCartCount();
    fetchWishlist();
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
  };

  useEffect(() => {
    if (params?.slug) {
      fetchProduct();
    }
  }, [params?.slug]);

  const fetchProduct = async () => {
    if (!params?.slug) return;
    
    try {
      const res = await fetch('/api/products');
      const products = await res.json();
      const found = products.find((p: Product) => p.slug === params.slug);
      setProduct(found);
      
      // Update meta tags for social sharing preview
      if (found) {
        updateMetaTags(found);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
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

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    const sessionId = getWishlistSessionId();
    const isInWishlist = wishlist.has(product.id);

    try {
      if (isInWishlist) {
        const res = await fetch(`/api/wishlist?sessionId=${sessionId}&productId=${product.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setWishlist(prev => {
            const newSet = new Set(prev);
            newSet.delete(product.id);
            return newSet;
          });
          toast.success('Removed from wishlist');
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, productId: product.id })
        });
        if (res.ok) {
          setWishlist(prev => new Set(prev).add(product.id));
          toast.success('Added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const updateMetaTags = (product: Product) => {
    const imageUrl = product.images?.[0]?.url || '';
    const fullImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${window.location.origin}${imageUrl}`;
    
    // Create OG image with product details
    const truncatedDesc = product.description.length > 100 
      ? product.description.substring(0, 100) 
      : product.description;
    
    const ogImageUrl = `${window.location.origin}/api/og-product?` + new URLSearchParams({
      name: product.name,
      price: product.price.toString(),
      image: fullImageUrl,
      description: truncatedDesc,
      condition: product.condition || 'new'
    }).toString();
    
    // Update or create meta tags for better link previews
    const metaTags = [
      { property: 'og:title', content: `${product.name} - Le ${product.price.toLocaleString()}` },
      { property: 'og:description', content: truncatedDesc },
      { property: 'og:image', content: ogImageUrl },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:type', content: 'product' },
      { property: 'product:price:amount', content: product.price.toString() },
      { property: 'product:price:currency', content: 'SLL' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${product.name} - Le ${product.price.toLocaleString()}` },
      { name: 'twitter:description', content: truncatedDesc },
      { name: 'twitter:image', content: ogImageUrl }
    ];

    metaTags.forEach(({ property, name, content }) => {
      const attr = property ? 'property' : 'name';
      const value = (property || name) as string;
      let meta = document.querySelector(`meta[${attr}="${value}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, value);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });

  };

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url,
        quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    toast.success('Product added to cart!');
    
    // Dispatch event for other components
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('cartUpdated');
      window.dispatchEvent(event);
    }

    // Automatically open the cart page
    router.push('/cart');
  };

  const buyNow = () => {
    addToCart();
    router.push('/checkout');
  };

  const calculateDiscount = () => {
    if (!product?.comparePrice || product.comparePrice <= product.price) return null;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const handleShare = async () => {
    if (!product) return;

    // Truncate description for sharing
    const truncatedDesc = product.description.length > 100 
      ? product.description.substring(0, 100) + '...' 
      : product.description;

    // Direct link to this product page
    const productUrl = `${window.location.origin}/marketplace/${product.slug}`;
    
    // Create share text with product details
    const shareText = `${product.name}\n\nLe ${product.price.toLocaleString()}${product.comparePrice ? ` (was Le ${product.comparePrice.toLocaleString()})` : ''}\n\n${truncatedDesc}\n\n${productUrl}`;

    const shareData: ShareData = {
      title: product.name,
      text: shareText,
      url: productUrl
    };

    try {
      // Try native share API
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Shared successfully');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success('Product details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // If all else fails, try clipboard again
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Product link copied to clipboard!');
      } catch (clipboardError) {
        toast.error('Unable to share. Please copy the URL from your browser.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#040e40] to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
          <Link href="/marketplace" className="text-red-400 hover:text-red-300">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => img.url),
    brand: {
      '@type': 'Brand',
      name: product.brand || 'IT Services Freetown'
    },
    sku: product.sku || product.id,
    offers: {
      '@type': 'Offer',
      url: `https://itservicesfreetown.com/marketplace/${product.slug}`,
      priceCurrency: 'SLL',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: product.condition === 'new' ? 'https://schema.org/NewCondition' :
                     product.condition === 'refurbished' ? 'https://schema.org/RefurbishedCondition' :
                     'https://schema.org/UsedCondition',
      seller: {
        '@type': 'Organization',
        name: 'IT Services Freetown',
        url: 'https://itservicesfreetown.com'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '156',
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#040e40] to-gray-900">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-[64px] sm:top-[72px] z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Marketplace
          </Link>
          
          <Link
            href="/cart"
            className="relative flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm z-10 cursor-pointer shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center pointer-events-none">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-16 sm:pt-20">
        <DisplayAd className="mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Gallery */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col">
            {/* Main Image */}
            <div className="bg-transparent rounded-2xl overflow-hidden mb-6 aspect-square relative flex items-center justify-center group">
              {/* Subtle background glow based on theme */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              
              {product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].alt || product.name}
                  className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 relative z-10"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center relative z-10">
                  <ShoppingCart className="w-24 h-24 text-gray-500/50" />
                </div>
              )}

              {/* Badges */}
              {discount && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg shadow-red-500/30">
                    {discount}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 mt-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                      selectedImage === index
                        ? 'border-2 border-blue-500 ring-4 ring-blue-500/20 scale-105'
                        : 'border border-white/10 hover:border-white/30 hover:scale-105 bg-white/5'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Video */}
            {product.videoUrl && (
              <div className="mt-4">
                <h3 className="text-white text-lg font-semibold mb-3">Product Video</h3>
                <div className="bg-gray-800 rounded-2xl overflow-hidden aspect-video">
                  {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={product.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : product.videoUrl.includes('vimeo.com') ? (
                    <iframe
                      src={product.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      className="w-full h-full"
                      src={product.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 bg-white/5 inline-flex px-4 py-1.5 rounded-full border border-white/10">
              <Link href="/marketplace" className="hover:text-blue-400 transition-colors">Marketplace</Link>
              <span className="opacity-50">/</span>
              <Link href={`/marketplace?category=${product.category.slug}`} className="hover:text-blue-400 transition-colors">
                {product.category.name}
              </Link>
              <span className="opacity-50">/</span>
              <span className="text-gray-200 truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
            </div>

            {/* Back to Home Button */}
            <div className="mb-6">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.7)] transition-all duration-300 transform hover:scale-105 border-2 border-red-500"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-base">Back to Home</span>
              </Link>
            </div>

            {/* Brand */}
            {product.brand && (
              <p className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold rounded-full text-xs uppercase tracking-wider mb-3">
                {product.brand}
              </p>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-400 tracking-tight leading-tight mb-4 drop-shadow-sm">
              {product.name}
            </h1>

            {/* SKU */}
            {product.sku && (
              <p className="text-gray-400 text-sm mb-4">SKU: {product.sku}</p>
            )}

            {/* Condition Badge */}
            <div className="mb-4">
              <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                product.condition === 'new' ? 'bg-red-500/20 text-red-400' :
                product.condition === 'refurbished' ? 'bg-green-500/20 text-green-400' :
                product.condition === 'used-like-new' ? 'bg-[#040e40]/30 text-gray-300' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                Condition: {
                  product.condition === 'new' ? 'Brand New' :
                  product.condition === 'refurbished' ? 'Refurbished' :
                  product.condition === 'used-like-new' ? 'Used - Like New' :
                  'Used'
                }
              </span>
            </div>

            {/* Rating (Placeholder) */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-400">(4.8) • 124 reviews</span>
            </div>

            {/* Price Container */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-3">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">Le {product.price.toLocaleString()}</span>
                {product.comparePrice && (
                  <span className="text-gray-400 line-through text-lg sm:text-xl font-medium mb-1">
                    Le {product.comparePrice.toLocaleString()}
                  </span>
                )}
                {discount && (
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg shadow-green-500/20 mb-1 sm:ml-auto">
                    Save {discount}%
                  </span>
                )}
              </div>
              <p className="text-green-400/80 text-sm font-medium flex items-center gap-2">
                <Check className="w-4 h-4" /> Tax included. Shipping calculated at checkout.
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {product.stock > 10 ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 font-semibold rounded-full">
                  <Check className="w-5 h-5" />
                  In Stock - Ready to Ship
                </div>
              ) : product.stock > 0 ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-semibold rounded-full">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                  Only {product.stock} left in stock - Order soon!
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 font-semibold rounded-full">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8 prose prose-invert max-w-none">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Product Description</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-gray-300 text-sm font-semibold uppercase tracking-wider mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-white font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-400 text-sm font-medium">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={buyNow}
                disabled={product.stock === 0}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 transform hover:-translate-y-1 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                Buy Now
              </button>
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/10 disabled:bg-white/5 disabled:border-transparent disabled:cursor-not-allowed text-white font-bold rounded-2xl backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 disabled:hover:translate-y-0"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex gap-4 mb-10">
              <button 
                onClick={toggleWishlist}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 border hover:bg-white/5 rounded-xl transition-all duration-300 ${
                  wishlist.has(product.id) 
                    ? 'border-red-500/50 text-red-400 bg-red-500/5' 
                    : 'border-white/10 text-gray-300'
                }`}
              >
                <Heart className={`w-5 h-5 transition-transform ${wishlist.has(product.id) ? 'fill-current scale-110' : ''}`} />
                {wishlist.has(product.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 text-gray-300 hover:text-blue-400 rounded-xl transition-all duration-300"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                  <Truck className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-white font-bold mb-1 text-sm">Free Shipping</h4>
                <p className="text-gray-400 text-xs">On orders over Le 500k within Freetown</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-white font-bold mb-1 text-sm">Warranty</h4>
                <p className="text-gray-400 text-xs">6 months warranty on all products</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                  <RefreshCw className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-white font-bold mb-1 text-sm">Easy Returns</h4>
                <p className="text-gray-400 text-xs">14-day return policy, no questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <MultiplexAd />
      </div>
    </div>
  );
}
