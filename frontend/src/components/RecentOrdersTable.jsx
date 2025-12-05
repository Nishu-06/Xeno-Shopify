import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ordersAPI } from '../lib/api';

export default function RecentOrdersTable({ tenantId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      loadOrders();
    }
  }, [tenantId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getRecent(tenantId, 5);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading recent orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (customer) => {
    if (!customer) return 'Guest';
    const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
    return name || 'Unknown';
  };

  const getProductTitles = (lineItems) => {
    if (!lineItems || lineItems.length === 0) return 'N/A';
    return lineItems
      .map(item => item.product?.title || item.title)
      .filter(Boolean)
      .join(', ');
  };

  const getTotalQuantity = (lineItems) => {
    if (!lineItems || lineItems.length === 0) return 0;
    return lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || 'paid').toLowerCase();
    const colorClasses = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      refunded: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      authorized: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };
    const colorClass = colorClasses[statusLower] || colorClasses.paid;
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {statusLower.charAt(0).toUpperCase() + statusLower.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
            <span className="text-white text-xl">🛒</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Orders</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest 5 orders</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
            <span className="text-white text-xl">🛒</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Orders</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest 5 orders</p>
          </div>
        </div>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-3">📦</div>
          <p>No orders found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Orders</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest 5 orders</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-gray-50 via-blue-50/50 to-purple-50/50 dark:from-gray-700 dark:via-blue-900/20 dark:to-purple-900/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Total Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{order.orderNumber || order.id.slice(0, 8)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {getCustomerName(order.customer)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={getProductTitles(order.lineItems)}>
                    {getProductTitles(order.lineItems)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getTotalQuantity(order.lineItems)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                    ${order.totalPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(order.orderDate), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.financialStatus)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

