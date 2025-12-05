import React from 'react';

export default function MetricsOverview({ metrics }) {
  if (!metrics) return null;

  const statCards = [
    {
      label: 'Total Customers',
      value: metrics.totalCustomers?.toLocaleString() || '0',
      icon: '👥',
    },
    {
      label: 'Total Orders',
      value: metrics.totalOrders?.toLocaleString() || '0',
      icon: '📦',
    },
    {
      label: 'Total Revenue',
      value: `$${metrics.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
      icon: '💰',
    },
    {
      label: 'Average Order Value',
      value: `$${metrics.averageOrderValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
      icon: '📊',
    },
  ];

  const cardStyles = [
    {
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      textColor: 'text-purple-700',
    },
    {
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      textColor: 'text-amber-700',
    },
    {
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
      textColor: 'text-green-700',
    },
    {
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      textColor: 'text-blue-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const style = cardStyles[index] || cardStyles[0];
        return (
          <div
            key={index}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
          >
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${style.bgGradient} opacity-0 dark:opacity-10 group-hover:opacity-100 dark:group-hover:opacity-20 transition-opacity duration-300`}></div>
            
            {/* Decorative corner */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${style.gradient} opacity-5 dark:opacity-10 rounded-bl-full`}></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${style.textColor} dark:text-gray-100 mb-1`}>{stat.value}</p>
                {index === 2 && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Revenue</p>
                )}
                {index === 3 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Per order</p>
                )}
              </div>
              <div className={`${style.iconBg} text-white text-3xl p-4 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {stat.icon}
              </div>
            </div>
            
            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
        );
      })}
    </div>
  );
}

