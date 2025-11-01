'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Package, Phone, Mail, MapPin, CreditCard, Clock, ArrowLeft, Wallet } from 'lucide-react';
import PaymentInstructionsPopup from '@/components/PaymentInstructionsPopup';
// Payment popup feature - mobile money instructions

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  mobileMoneyNumber?: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      console.log('[Order Confirmation] Fetching order:', orderNumber);
      const response = await fetch(`/api/orders/lookup?orderNumber=${encodeURIComponent(orderNumber)}`);
      console.log('[Order Confirmation] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Order Confirmation] Order data received:', data);
        setOrder(data);
      } else {
        const errorData = await response.json();
        console.error('[Order Confirmation] Error fetching order:', errorData);
      }
    } catch (error) {
      console.error('[Order Confirmation] Exception:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Order Not Found</h2>
          <p className="text-gray-400 mb-8">We couldn't find this order.</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 mb-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-green-100 text-lg">Thank you for your purchase</p>
          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-block">
            <p className="text-white text-sm mb-1">Order Number</p>
            <p className="text-white text-2xl font-bold">{order.orderNumber}</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Customer Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Delivery Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm">Delivery Address</p>
                  <p className="text-white">{order.customerName}</p>
                  <p className="text-gray-300 text-sm">{order.customerAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-sm">Phone</p>
                  <p className="text-white">{order.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{order.customerEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Payment Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-sm">Payment Method</p>
                  <p className="text-white capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                  {order.mobileMoneyNumber && (
                    <p className="text-gray-300 text-sm">{order.mobileMoneyNumber}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-sm">Order Status</p>
                  <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full mt-1">
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-sm">Order Date</p>
                  <p className="text-white">{new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-gray-900/50 rounded-lg">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{item.product.name}</h3>
                  <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                  <p className="text-blue-400 font-semibold">Le {item.price.toFixed(2)} each</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">Le {item.subtotal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-700 mt-6 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>Le {order.subtotal.toFixed(2)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>Le {order.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-700">
                <span>Total</span>
                <span>Le {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">What's Next?</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5" />
              <span>You will receive a confirmation email at {order.customerEmail}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5" />
              <span>Our team will contact you at {order.customerPhone} to confirm delivery details</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5" />
              <span>Delivery typically takes 1-3 business days within Freetown</span>
            </li>
          </ul>
        </div>

        {/* Pay Now Button (if order is pending) */}
        {order.status === 'pending' && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 mb-8 text-center">
            <h2 className="text-xl font-bold text-white mb-3">Complete Your Payment</h2>
            <p className="text-green-100 mb-4">Click below to get payment instructions</p>
            <button
              onClick={() => setShowPaymentPopup(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-green-50 text-green-700 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Wallet className="w-6 h-6" />
              Pay Now - Le {order.total.toLocaleString()}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Payment Instructions Popup */}
      {showPaymentPopup && (
        <PaymentInstructionsPopup
          orderNumber={order.orderNumber}
          totalAmount={order.total}
          onClose={() => setShowPaymentPopup(false)}
        />
      )}
    </div>
  );
}
