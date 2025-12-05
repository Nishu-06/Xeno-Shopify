import React, { useMemo } from 'react';

export default function InsightCard({ 
  totalRevenueThisWeek, 
  totalRevenueLastWeek, 
  topCustomer, 
  totalOrdersThisWeek, 
  totalOrdersLastWeek,
  averageOrderValue,
  revenueTrend,
  orderCountTrend
}) {
  const insights = useMemo(() => {
    const insightsList = [];

    // Revenue comparison insight
    if (totalRevenueThisWeek && totalRevenueLastWeek) {
      const revenueChange = ((totalRevenueThisWeek - totalRevenueLastWeek) / totalRevenueLastWeek) * 100;
      if (revenueChange > 10) {
        insightsList.push({
          type: 'positive',
          icon: '📈',
          title: 'Revenue Growth',
          message: `Your revenue increased by ${revenueChange.toFixed(1)}% compared to last week. Great momentum!`,
          color: 'green'
        });
      } else if (revenueChange < -10) {
        insightsList.push({
          type: 'negative',
          icon: '📉',
          title: 'Revenue Decline',
          message: `Revenue decreased by ${Math.abs(revenueChange).toFixed(1)}% this week. Consider reviewing your marketing strategy.`,
          color: 'red'
        });
      } else if (revenueChange > 0) {
        insightsList.push({
          type: 'neutral',
          icon: '📊',
          title: 'Steady Growth',
          message: `Revenue is up ${revenueChange.toFixed(1)}% this week. Keep up the good work!`,
          color: 'blue'
        });
      }
    }

    // Orders comparison insight
    if (totalOrdersThisWeek && totalOrdersLastWeek) {
      const orderChange = ((totalOrdersThisWeek - totalOrdersLastWeek) / totalOrdersLastWeek) * 100;
      if (orderChange > 15) {
        insightsList.push({
          type: 'positive',
          icon: '🛒',
          title: 'Order Surge',
          message: `You received ${orderChange.toFixed(0)}% more orders this week! Customer engagement is strong.`,
          color: 'green'
        });
      } else if (orderChange < -15) {
        insightsList.push({
          type: 'negative',
          icon: '⚠️',
          title: 'Order Drop',
          message: `Orders decreased by ${Math.abs(orderChange).toFixed(0)}%. Time to boost your marketing efforts.`,
          color: 'red'
        });
      }
    }

    // Top customer insight
    if (topCustomer && topCustomer.totalSpent) {
      if (topCustomer.totalSpent > 1000) {
        insightsList.push({
          type: 'positive',
          icon: '⭐',
          title: 'VIP Customer',
          message: `${topCustomer.name || 'Your top customer'} has spent $${topCustomer.totalSpent.toLocaleString()}. Consider a loyalty program!`,
          color: 'purple'
        });
      } else {
        insightsList.push({
          type: 'neutral',
          icon: '👤',
          title: 'Top Performer',
          message: `${topCustomer.name || 'Your top customer'} leads with $${topCustomer.totalSpent.toLocaleString()} in total spend.`,
          color: 'blue'
        });
      }
    }

    // Average order value insight
    if (averageOrderValue) {
      if (averageOrderValue > 100) {
        insightsList.push({
          type: 'positive',
          icon: '💰',
          title: 'High Value Orders',
          message: `Your average order value is $${averageOrderValue.toFixed(2)}. Customers are buying premium!`,
          color: 'green'
        });
      } else if (averageOrderValue < 50) {
        insightsList.push({
          type: 'neutral',
          icon: '💡',
          title: 'Upsell Opportunity',
          message: `Average order value is $${averageOrderValue.toFixed(2)}. Consider bundle deals to increase revenue.`,
          color: 'amber'
        });
      }
    }

    // Trend analysis
    if (revenueTrend && revenueTrend.length >= 2) {
      const recent = revenueTrend.slice(-3);
      const earlier = revenueTrend.slice(0, 3);
      const recentAvg = recent.reduce((sum, d) => sum + d.revenue, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, d) => sum + d.revenue, 0) / earlier.length;
      
      if (recentAvg > earlierAvg * 1.2) {
        insightsList.push({
          type: 'positive',
          icon: '🚀',
          title: 'Accelerating Growth',
          message: `Recent revenue is ${((recentAvg - earlierAvg) / earlierAvg * 100).toFixed(0)}% higher than earlier period. Excellent trend!`,
          color: 'green'
        });
      }
    }

    // Order trend analysis
    if (orderCountTrend && orderCountTrend.length >= 2) {
      const recent = orderCountTrend.slice(-3);
      const earlier = orderCountTrend.slice(0, 3);
      const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, d) => sum + d.count, 0) / earlier.length;
      
      if (recentAvg > earlierAvg * 1.15) {
        insightsList.push({
          type: 'positive',
          icon: '📦',
          title: 'Growing Demand',
          message: `Order volume is trending up. Recent average is ${((recentAvg - earlierAvg) / earlierAvg * 100).toFixed(0)}% higher.`,
          color: 'blue'
        });
      }
    }

    // Return top 3 most relevant insights
    return insightsList.slice(0, 3);
  }, [totalRevenueThisWeek, totalRevenueLastWeek, topCustomer, totalOrdersThisWeek, totalOrdersLastWeek, averageOrderValue, revenueTrend, orderCountTrend]);

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Insights</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Smart analytics powered by your data</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Not enough data to generate insights yet.</p>
        </div>
      </div>
    );
  }

  const colorClasses = {
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-400',
      icon: 'bg-green-500'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-400',
      icon: 'bg-red-500'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-400',
      icon: 'bg-blue-500'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-400',
      icon: 'bg-purple-500'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-400',
      icon: 'bg-amber-500'
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Insights</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Smart analytics powered by your data</p>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const colors = colorClasses[insight.color] || colorClasses.blue;
          return (
            <div
              key={index}
              className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-3">
                <div className={`${colors.icon} text-white text-xl w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${colors.text} mb-1`}>{insight.title}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Insights generated from your data patterns
        </p>
      </div>
    </div>
  );
}

