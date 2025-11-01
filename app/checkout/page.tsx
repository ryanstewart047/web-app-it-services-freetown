'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, CreditCard, Smartphone, DollarSign, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'cash'>('mobile_money');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    mobileMoneyNumber: '',
    notes: ''
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = subtotal * 0.02; // 2% GST
  const shipping = 0; // Free shipping - cost included in product prices
  const total = subtotal + gst + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        tax: gst,
        total,
        paymentMethod,
        mobileMoneyNumber: paymentMethod === 'mobile_money' ? formData.mobileMoneyNumber : null,
        notes: formData.notes
      };

      console.log('[Checkout] Submitting order:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      console.log('[Checkout] Response status:', response.status);

      if (response.ok) {
        const order = await response.json();
        console.log('[Checkout] Order created:', order);
        console.log('[Checkout] Redirecting to:', `/order-confirmation/${order.orderNumber}`);
        
        localStorage.removeItem('cart');
        router.push(`/order-confirmation/${order.orderNumber}`);
      } else {
        const errorData = await response.json();
        console.error('[Checkout] Error response:', errorData);
        alert(`Failed to place order: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Checkout] Error placing order:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId: string) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Add some products to get started!</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-bold text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Customer Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="+232 XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Delivery Address *</label>
                  <textarea
                    required
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="Street address, city, postal code"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Order Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    rows={2}
                    placeholder="Any special instructions..."
                  />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                {/* Mobile Money */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile_money')}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'mobile_money'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        paymentMethod === 'mobile_money' ? 'bg-blue-500' : 'bg-gray-600'
                      }`}>
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-bold text-lg">Mobile Money</h3>
                        <p className="text-gray-400 text-sm">Orange Money, Afrimoney, etc.</p>
                      </div>
                    </div>
                    {paymentMethod === 'mobile_money' && (
                      <Check className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </button>

                {paymentMethod === 'mobile_money' && (
                  <div className="pl-4">
                    <label className="block text-white font-semibold mb-2">Mobile Money Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.mobileMoneyNumber}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="+232 XX XXX XXX"
                    />
                    <p className="text-gray-400 text-sm mt-2">
                      You will receive a payment prompt on this number
                    </p>
                  </div>
                )}

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        paymentMethod === 'cash' ? 'bg-blue-500' : 'bg-gray-600'
                      }`}>
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-bold text-lg">Cash on Delivery</h3>
                        <p className="text-gray-400 text-sm">Pay when you receive your order</p>
                      </div>
                    </div>
                    {paymentMethod === 'cash' && (
                      <Check className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                      <p className="text-gray-400 text-sm">
                        Le {item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">Le {(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>Le {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-400 font-semibold">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                {gst > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>GST (2%)</span>
                    <span>Le {gst.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span>Le {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-gray-400 text-xs text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
