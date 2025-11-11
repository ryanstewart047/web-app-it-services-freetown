'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number; // Available stock from database
  outOfStock?: boolean; // Flag to indicate if item is out of stock
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasOutOfStock, setHasOutOfStock] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Fetch current product stock information
      if (cart.length > 0) {
        const productIds = cart.map((item: CartItem) => item.productId);
        const response = await fetch('/api/products');
        
        if (response.ok) {
          const allProducts = await response.json();
          
          // Update cart items with current stock info
          const updatedCart = cart.map((item: CartItem) => {
            const product = allProducts.find((p: any) => p.id === item.productId);
            return {
              ...item,
              stock: product?.stock || 0,
              outOfStock: !product || product.stock === 0
            };
          });
          
          setCartItems(updatedCart);
          
          // Check if any items are out of stock
          const hasOutOfStockItems = updatedCart.some((item: CartItem) => item.outOfStock);
          setHasOutOfStock(hasOutOfStockItems);
        } else {
          setCartItems(cart);
        }
      } else {
        setCartItems(cart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const gst = subtotal * 0.02; // 2% GST
    return subtotal + gst;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-4">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
            <p className="text-gray-400 mb-8">Add some products to get started!</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Shopping Cart</h1>
          <p className="text-gray-400">{cartItems.length} item(s) in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 hover:border-blue-500/50 transition-all ${
                  item.outOfStock ? 'border-red-500/50 opacity-75' : 'border-gray-700'
                }`}
              >
                {item.outOfStock && (
                  <div className="mb-4 bg-red-500/20 border border-red-500 rounded-lg p-3">
                    <p className="text-red-400 text-sm font-semibold flex items-center gap-2">
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
                    <h3 className="text-white font-semibold mb-2">{item.name}</h3>
                    <p className="text-blue-400 font-bold text-lg mb-4">
                      Le {item.price.toLocaleString()}
                    </p>
                    {!item.outOfStock && item.stock !== undefined && item.stock < 5 && (
                      <p className="text-yellow-400 text-sm mb-2">
                        Only {item.stock} left in stock
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1 || item.outOfStock}
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="text-white font-semibold px-4">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.outOfStock}
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-2">Subtotal</p>
                    <p className="text-white font-bold text-xl">
                      Le {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>Le {calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>GST (2%)</span>
                  <span>Le {(calculateSubtotal() * 0.02).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Total</span>
                    <span>Le {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {hasOutOfStock && (
                <div className="mb-4 bg-red-500/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400 text-sm font-semibold text-center">
                    ⚠️ Cannot proceed: Some items are out of stock
                  </p>
                  <p className="text-red-300 text-xs text-center mt-2">
                    Please remove out of stock items to continue
                  </p>
                </div>
              )}

              <button
                onClick={() => router.push('/checkout')}
                disabled={hasOutOfStock}
                className={`w-full py-4 font-bold rounded-xl transition-all transform shadow-lg ${
                  hasOutOfStock
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105'
                }`}
              >
                {hasOutOfStock ? 'Cannot Proceed - Out of Stock Items' : 'Proceed to Checkout'}
              </button>

              <Link
                href="/marketplace"
                className="block text-center text-blue-400 hover:text-blue-300 mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
