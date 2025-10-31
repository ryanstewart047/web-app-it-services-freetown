'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Eye, Clock, Check, X, Truck, DollarSign, Phone, Mail, MapPin } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    name: string;
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
  paymentStatus: string;
  orderStatus: string;
  mobileMoneyNumber?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <Check className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Orders Management</h1>
            <p className="text-gray-400">View and manage all customer orders</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-white text-3xl font-bold">{orders.length}</p>
              </div>
              <Package className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-white text-3xl font-bold">
                  {orders.filter(o => o.orderStatus === 'pending').length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-400 opacity-50" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Processing</p>
                <p className="text-white text-3xl font-bold">
                  {orders.filter(o => o.orderStatus === 'processing').length}
                </p>
              </div>
              <Package className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-white text-3xl font-bold">
                  Le {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Order</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{order.orderNumber}</p>
                          <p className="text-gray-400 text-sm">{order.paymentMethod}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{order.customerName}</p>
                          <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">Le {order.total.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.orderStatus)}`}
                        >
                          <option value="pending" className="bg-gray-800 text-white">Pending</option>
                          <option value="processing" className="bg-gray-800 text-white">Processing</option>
                          <option value="shipped" className="bg-gray-800 text-white">Shipped</option>
                          <option value="delivered" className="bg-gray-800 text-white">Delivered</option>
                          <option value="cancelled" className="bg-gray-800 text-white">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Order Number</p>
                      <p className="text-white font-semibold">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Order Date</p>
                      <p className="text-white font-semibold">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Payment Method</p>
                      <p className="text-white font-semibold capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(selectedOrder.orderStatus)}`}>
                        {getStatusIcon(selectedOrder.orderStatus)}
                        {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{selectedOrder.customerName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{selectedOrder.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="w-5 h-5 text-gray-400" />
                      {selectedOrder.customerEmail}
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Phone className="w-5 h-5 text-gray-400" />
                      {selectedOrder.customerPhone}
                    </div>
                    <div className="flex items-start gap-3 text-gray-300">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      {selectedOrder.customerAddress}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-600 last:border-0">
                        <div>
                          <p className="text-white font-medium">{item.product.name}</p>
                          <p className="text-gray-400 text-sm">Quantity: {item.quantity} × Le {item.price.toFixed(2)}</p>
                        </div>
                        <p className="text-white font-semibold">Le {item.subtotal.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-6 pt-6 border-t border-gray-600 space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>Le {selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedOrder.tax > 0 && (
                      <div className="flex justify-between text-gray-300">
                        <span>Tax</span>
                        <span>Le {selectedOrder.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-600">
                      <span>Total</span>
                      <span>Le {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Notes</h3>
                    <p className="text-gray-300">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
