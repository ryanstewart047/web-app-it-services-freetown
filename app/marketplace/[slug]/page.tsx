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
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
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

    // Get the product's primary image
    const productImage = product.images?.[0]?.url || '';

    const shareData: ShareData = {
      title: product.name,
      text: `${product.name} - Le ${product.price.toLocaleString()}`,
      url: window.location.href
    };

    try {
      // Try to fetch and share the product image if available
      if (productImage && navigator.canShare) {
        try {
          const response = await fetch(productImage);
          const blob = await response.blob();
          const file = new File([blob], 'product.jpg', { type: blob.type });
          const filesArray = [file];
          
          // Check if we can share files
          if (navigator.canShare({ files: filesArray })) {
            await navigator.share({
              ...shareData,
              files: filesArray
            });
            console.log('Shared successfully with image');
            return;
          }
        } catch (imageError) {
          console.log('Unable to share with image, falling back to text only');
        }
      }

      // Try native share API (text only)
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Shared successfully');
      } else {
        // Fallback: copy to clipboard with image URL
        const textToCopy = `${product.name} - Le ${product.price.toLocaleString()}\n\nImage: ${productImage}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(textToCopy);
        alert('Product details copied to clipboard (including image link)!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // If all else fails, try clipboard again
      try {
        const textToCopy = `${product.name} - Le ${product.price.toLocaleString()}\n\nImage: ${productImage}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(textToCopy);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
          <Link href="/marketplace" className="text-blue-400 hover:text-blue-300">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
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
                product.condition === 'new' ? 'bg-blue-500/20 text-blue-400' :
                product.condition === 'refurbished' ? 'bg-green-500/20 text-green-400' :
                product.condition === 'used-like-new' ? 'bg-purple-500/20 text-purple-400' :
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
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100"
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
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-700 hover:border-blue-500 text-white rounded-lg transition-all">
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
                <Truck className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Free Shipping</h4>
                  <p className="text-gray-400 text-sm">On orders over Le 500,000 within Freetown</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Warranty</h4>
                  <p className="text-gray-400 text-sm">6 months warranty on all products</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
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
