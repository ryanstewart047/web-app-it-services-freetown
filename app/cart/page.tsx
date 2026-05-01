'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DisplayAd, MultiplexAd } from '@/components/AdSense';
import { useCart, CartItem } from '@/contexts/CartContext';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, cartTotal, isHydrated } = useCart();
  const [enrichedCart, setEnrichedCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasOutOfStock, setHasOutOfStock] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    const loadStockInfo = async () => {
      try {
        if (cart.length > 0) {
          const response = await fetch('/api/products');
          
          if (response.ok) {
            const allProducts = await response.json();
            
            const updatedCart = cart.map((item: CartItem) => {
              const product = allProducts.find((p: any) => p.id === item.productId);
              return {
                ...item,
                stock: product?.stock || 0,
                outOfStock: !product || product.stock === 0
              };
            });
            
            setEnrichedCart(updatedCart);
            setHasOutOfStock(updatedCart.some((item: CartItem) => item.outOfStock));
          } else {
            setEnrichedCart(cart);
            setHasOutOfStock(false);
          }
        } else {
          setEnrichedCart([]);
          setHasOutOfStock(false);
        }
      } catch (error) {
        console.error('Error fetching stock:', error);
        setEnrichedCart(cart);
      } finally {
        setLoading(false);
      }
    };

    loadStockInfo();
  }, [cart, isHydrated]);

  const calculateSubtotal = () => cartTotal;

  const calculateTotal = () => {
    const gst = cartTotal * 0.02; // 2% GST
    return cartTotal + gst;
  };

  if (loading || !isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-4">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (enrichedCart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 text-gray-200 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-500 font-medium">{enrichedCart.length} item(s) in your cart</p>
        </div>

        {/* Top Ad */}
        <div className="mb-8">
          <DisplayAd />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {enrichedCart.map((item) => (
              <div
                key={item.productId}
                className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${
                  item.outOfStock ? 'border-red-100 bg-red-50/30' : 'border-gray-100'
                }`}
              >
                {item.outOfStock && (
                  <div className="mb-4 bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-red-600 text-sm font-bold flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      This item is currently out of stock
                    </p>
                  </div>
                )}
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-24 h-24 object-cover rounded-lg ${
                        item.outOfStock ? 'grayscale' : ''
                      }`}
                    />
                    {item.outOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <span className="text-red-400 font-bold text-xs">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-bold mb-2">{item.name}</h3>
                    <p className="text-blue-600 font-black text-lg mb-4">
                      Le {item.price.toLocaleString()}
                    </p>
                    {!item.outOfStock && item.stock !== undefined && item.stock < 5 && (
                      <p className="text-yellow-600 text-sm font-bold mb-2">
                        Only {item.stock} left in stock
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1 || item.outOfStock}
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-gray-900 font-black px-4">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={item.outOfStock}
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-gray-500 text-sm mb-1 font-medium">Subtotal</p>
                    <p className="text-gray-900 font-black text-xl">
                      Le {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sticky top-24 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">Le {calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>GST (2%)</span>
                  <span className="text-gray-900 font-bold">Le {(calculateSubtotal() * 0.02).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-gray-900 text-xl font-black">
                    <span>Total</span>
                    <span className="text-blue-600">Le {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {hasOutOfStock && (
                <div className="mb-4 bg-red-500/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400 text-sm font-semibold text-center">
                    ⚠️ Cannot proceed: Some items are out of stock
                  </p>
                </div>
              )}

              <button
                onClick={() => router.push('/checkout')}
                disabled={hasOutOfStock}
                className={`w-full py-4 font-black rounded-xl transition-all transform shadow-lg ${
                  hasOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                Proceed to Checkout
              </button>

              <Link
                href="/marketplace"
                className="block text-center text-blue-600 hover:text-blue-700 mt-4 transition-colors font-bold"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Ad */}
        <div className="mt-12">
          <MultiplexAd />
        </div>
      </div>
    </div>
  );
}
