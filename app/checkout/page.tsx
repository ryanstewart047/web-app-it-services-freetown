'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, CreditCard, Smartphone, DollarSign, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useCart } from '@/contexts/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, cartTotal, clearCart, isHydrated } = useCart();
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

  const subtotal = cartTotal;
  const gst = subtotal * 0.02; // 2% GST
  const shipping = 0; // Free shipping - cost included in product prices
  const total = subtotal + gst + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form Validation
    if (!formData.customerName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.customerPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!formData.customerAddress.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }
    if (paymentMethod === 'mobile_money' && !formData.mobileMoneyNumber.trim()) {
      toast.error('Please enter your Orange Money number');
      return;
    }

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
        toast.success('Order placed successfully!');
        
        clearCart();
        router.push(`/order-confirmation/${order.orderNumber}`);
      } else {
        const errorData = await response.json();
        console.error('[Checkout] Error response:', errorData);
        toast.error(errorData.error || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('[Checkout] Error placing order:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-24 h-24 text-gray-200 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium">
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-black text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Customer Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4" data-no-analytics="true">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      placeholder="+232 XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Delivery Address *</label>
                  <textarea
                    required
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    rows={3}
                    placeholder="Street address, city, postal code"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Order Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    rows={2}
                    placeholder="Any special instructions..."
                  />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                {/* Mobile Money */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile_money')}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'mobile_money'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                        paymentMethod === 'mobile_money' ? 'bg-[#FF7900]' : 'bg-gray-100'
                      }`}>
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" 
                          alt="Orange Money"
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="text-gray-900 font-bold text-lg">Orange Money</h3>
                        <p className="text-gray-500 text-sm">Pay securely via Orange Money</p>
                      </div>
                    </div>
                    {paymentMethod === 'mobile_money' && (
                      <Check className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </button>

                {paymentMethod === 'mobile_money' && (
                  <div className="pl-4">
                    <label className="block text-gray-700 font-bold mb-2">Orange Money Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.mobileMoneyNumber}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#FF7900] focus:outline-none"
                      placeholder="+232 7X XXX XXX"
                    />
                    <p className="text-gray-500 text-sm mt-2">
                      You will receive an Orange Money prompt on this number
                    </p>
                  </div>
                )}

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        paymentMethod === 'cash' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <DollarSign className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-gray-900 font-bold text-lg">Cash on Delivery</h3>
                        <p className="text-gray-500 text-sm">Pay when you receive your order</p>
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
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sticky top-4 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Order Summary</h2>

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
                      <h4 className="text-gray-900 font-bold text-sm">{item.name}</h4>
                      <p className="text-gray-500 text-sm font-medium">
                        Le {item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-black">Le {(item.price * item.quantity).toLocaleString()}</p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">Le {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-bold text-sm uppercase">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                {gst > 0 && (
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>GST (2%)</span>
                    <span className="text-gray-900 font-bold">Le {gst.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-blue-600">Le {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all transform shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-1"
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
