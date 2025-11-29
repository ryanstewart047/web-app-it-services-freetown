'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Share2, Check, ArrowLeft, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import Link from 'next/link';

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
    alert('Product added to cart!');
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
        alert('Product details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // If all else fails, try clipboard again
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Product link copied to clipboard!');
      } catch (clipboardError) {
        alert('Unable to share. Please copy the URL from your browser.');
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
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Gallery */}
          <div>
            {/* Main Image */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden mb-4 aspect-square relative">
              {product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].alt || product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-24 h-24 text-gray-600" />
                </div>
              )}

              {/* Badges */}
              {discount && (
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full">
                    {discount}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-blue-500 ring-2 ring-blue-500/50'
                        : 'border-gray-700 hover:border-gray-600'
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
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Link href="/marketplace" className="hover:text-blue-400">Marketplace</Link>
              <span>/</span>
              <Link href={`/marketplace?category=${product.category.slug}`} className="hover:text-blue-400">
                {product.category.name}
              </Link>
              <span>/</span>
              <span className="text-white">{product.name}</span>
            </div>

            {/* Brand */}
            {product.brand && (
              <p className="text-blue-400 font-semibold mb-2">{product.brand}</p>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>

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

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl font-bold text-white">Le {product.price.toFixed(2)}</span>
                {product.comparePrice && (
                  <span className="text-gray-400 line-through ml-3">
                    Le {product.comparePrice.toFixed(2)}
                  </span>
                )}
                {discount && (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-bold rounded-full">
                    Save {discount}%
                  </span>
                )}
              </div>
              <p className="text-green-400 text-sm">Tax included. Shipping calculated at checkout.</p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 10 ? (
                <p className="text-green-400 font-semibold flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  In Stock - Ready to Ship
                </p>
              ) : product.stock > 0 ? (
                <p className="text-yellow-400 font-semibold">
                  Only {product.stock} left in stock - Order soon!
                </p>
              ) : (
                <p className="text-red-400 font-semibold">Out of Stock</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-3">Product Description</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Quantity:</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-white hover:bg-gray-600 rounded-l-lg transition-colors"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 text-white font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-white hover:bg-gray-600 rounded-r-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-400 text-sm">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={buyNow}
                disabled={product.stock === 0}
                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-[#040e40] hover:from-red-700 hover:to-[#030b30] disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100"
              >
                Buy Now
              </button>
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex gap-3 mb-8">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-700 hover:border-red-500 hover:bg-red-500/10 text-white rounded-lg transition-all">
                <Heart className="w-5 h-5" />
                Add to Wishlist
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 text-white rounded-lg transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Features */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Free Shipping</h4>
                  <p className="text-gray-400 text-sm">On orders over Le 500,000 within Freetown</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Warranty</h4>
                  <p className="text-gray-400 text-sm">6 months warranty on all products</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Easy Returns</h4>
                  <p className="text-gray-400 text-sm">14-day return policy, no questions asked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
