import React from 'react';

export default function TopCustomers({ customers }) {
  if (!customers || customers.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
            <span className="text-white text-2xl">👥</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Top 5 Customers by Spend</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your most valuable customers</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-600">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No customer data available</p>
        </div>
      </div>
    );
  }

  const getRankBadge = (index) => {
    const colors = [
      'bg-yellow-100 text-yellow-800 border-yellow-300', // Gold
      'bg-gray-100 text-gray-800 border-gray-300', // Silver
      'bg-orange-100 text-orange-800 border-orange-300', // Bronze
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-purple-50 text-purple-700 border-purple-200',
    ];
    return colors[index] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
          <span className="text-white text-2xl">👥</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Top 5 Customers by Spend</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your most valuable customers</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-gray-50 via-blue-50/50 to-purple-50/50 dark:from-gray-700 dark:via-blue-900/20 dark:to-purple-900/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Orders
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer, index) => (
              <tr key={customer.id || index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 border-b border-gray-100 dark:border-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm ${getRankBadge(index)}`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(customer.name)}
                    </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{customer.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600 dark:text-gray-400">{customer.email || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                  ${customer.totalSpent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="inline-flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{customer.ordersCount || 0}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">orders</span>
                </div>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

