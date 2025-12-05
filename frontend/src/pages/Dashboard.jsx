import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tenantAPI, insightsAPI, syncAPI } from '../lib/api';
import MetricsOverview from '../components/MetricsOverview';
import RevenueChart from '../components/RevenueChart';
import OrdersChart from '../components/OrdersChart';
import OrdersByDateChart from '../components/OrdersByDateChart';
import TopCustomers from '../components/TopCustomers';
import TenantSelector from '../components/TenantSelector';
import SyncProgressModal from '../components/SyncProgressModal';
import InsightCard from '../components/InsightCard';
import RecentOrdersTable from '../components/RecentOrdersTable';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { isDark, setTheme } = useTheme();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedTenantData, setSelectedTenantData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadMetrics();
    }
  }, [selectedTenant, dateRange]);

  const loadTenants = async () => {
    try {
      const response = await tenantAPI.getAll();
      setTenants(response.data.tenants || []);
      if (response.data.tenants && response.data.tenants.length > 0) {
        const firstTenant = response.data.tenants[0];
        setSelectedTenant(firstTenant.id);
        setSelectedTenantData(firstTenant);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTenant && tenants.length > 0) {
      const tenant = tenants.find(t => t.id === selectedTenant);
      setSelectedTenantData(tenant);
    }
  }, [selectedTenant, tenants]);

  const loadMetrics = async () => {
    if (!selectedTenant) return;

    try {
      setLoading(true);
      const [overview, ordersByDate, topCustomers, revenueTrend, orderCountTrend] = await Promise.all([
        insightsAPI.getOverview(selectedTenant).catch(() => ({ data: { metrics: {} } })),
        insightsAPI.getOrdersByDate(selectedTenant, dateRange.startDate, dateRange.endDate).catch(() => ({ data: { orders: [] } })),
        insightsAPI.getTopCustomers(selectedTenant, 5).catch(() => ({ data: { customers: [] } })),
        insightsAPI.getRevenueTrend(selectedTenant, dateRange.startDate, dateRange.endDate).catch(() => ({ data: { trend: [] } })),
        insightsAPI.getOrderCountTrend(selectedTenant, dateRange.startDate, dateRange.endDate).catch(() => ({ data: { trend: [] } })),
      ]);

      setMetrics({
        overview: overview.data.metrics,
        ordersByDate: ordersByDate.data.orders || [],
        topCustomers: topCustomers.data.customers || [],
        revenueTrend: revenueTrend.data.trend || [],
        orderCountTrend: orderCountTrend.data.trend || [],
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedTenant) return;

    try {
      setSyncing(true);
      setSyncProgress(10);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await syncAPI.syncAll(selectedTenant);
      
      if (response.data.isDemo) {
        clearInterval(progressInterval);
        setSyncing(false);
        setSyncProgress(0);
        alert('Demo tenant cannot sync data. It uses fake credentials. To sync real data, onboard a real Shopify store with valid credentials.');
        return;
      }

      // Complete progress
      setSyncProgress(100);
      
      // Wait a bit for UI to show completion, then reload metrics
      setTimeout(() => {
        clearInterval(progressInterval);
        setSyncing(false);
        setSyncProgress(0);
        loadMetrics();
      }, 2000);
    } catch (error) {
      console.error('Error syncing data:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to sync data. Please check the backend logs.';
      setSyncing(false);
      setSyncProgress(0);
      alert(errorMsg);
    }
  };

  const handleQuickDateRange = (days) => {
    setDateRange({
      startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {/* Floating Gradient Orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-float-1"></div>
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-float-2"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-float-3"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-400/20 dark:bg-pink-600/10 rounded-full blur-3xl animate-float-4"></div>
          
          {/* Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10 dark:opacity-5"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                background: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)],
                animation: `particle-float ${Math.random() * 20 + 15}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl">🏪</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">No Tenants Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by adding your first Shopify store to see analytics and insights.</p>
          <Link
            to="/onboard"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            + Add Shopify Store
          </Link>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-float-1"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-float-2"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-float-3"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-400/20 dark:bg-pink-600/10 rounded-full blur-3xl animate-float-4"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 dark:bg-cyan-600/5 rounded-full blur-3xl animate-float-5"></div>
        
        {/* Animated Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(99, 102, 241, 0.5) 25%, rgba(99, 102, 241, 0.5) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.5) 75%, rgba(99, 102, 241, 0.5) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(99, 102, 241, 0.5) 25%, rgba(99, 102, 241, 0.5) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.5) 75%, rgba(99, 102, 241, 0.5) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}
        ></div>
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 dark:opacity-5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              background: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)],
              animation: `particle-float ${Math.random() * 20 + 15}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        
        {/* Animated Waves */}
        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-10 dark:opacity-5">
          <svg className="absolute bottom-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#3b82f6" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="animate-wave-1"></path>
            <path fill="#8b5cf6" d="M0,224L48,208C96,192,192,160,288,154.7C384,149,480,171,576,181.3C672,192,768,192,864,181.3C960,171,1056,149,1152,138.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="animate-wave-2"></path>
            <path fill="#ec4899" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,186.7C672,192,768,224,864,229.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="animate-wave-3"></path>
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">X</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Xeno Shopify Dashboard
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Analytics & Insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TenantSelector
                tenants={tenants}
                selectedTenant={selectedTenant}
                onSelect={(id) => {
                  setSelectedTenant(id);
                  const tenant = tenants.find(t => t.id === id);
                  setSelectedTenantData(tenant);
                }}
              />
              
              {/* Date Range Quick Selector */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => handleQuickDateRange(7)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    format(subDays(new Date(), 7), 'yyyy-MM-dd') === dateRange.startDate
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => handleQuickDateRange(30)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    format(subDays(new Date(), 30), 'yyyy-MM-dd') === dateRange.startDate
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                  }`}
                >
                  30D
                </button>
                <button
                  onClick={() => handleQuickDateRange(90)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    format(subDays(new Date(), 90), 'yyyy-MM-dd') === dateRange.startDate
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                  }`}
                >
                  90D
                </button>
              </div>

              {/* Dark Mode Toggle Switch */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    !isDark
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                  }`}
                  aria-label="Switch to light mode"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  Light
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme(true);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                  }`}
                  aria-label="Switch to dark mode"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  Dark
                </button>
              </div>

              <button
                onClick={handleSync}
                disabled={syncing || !selectedTenant || (selectedTenantData?.shopDomain === 'demo-store.myshopify.com')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                title={selectedTenantData?.shopDomain === 'demo-store.myshopify.com' ? 'Demo tenant cannot sync. Use a real Shopify store.' : ''}
              >
                {syncing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </span>
                ) : (
                  'Sync Data'
                )}
              </button>
              {selectedTenantData?.shopDomain === 'demo-store.myshopify.com' && (
                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md font-medium">Demo</span>
              )}
              <Link
                to="/onboard"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                + Add Store
              </Link>
              {user && (
                <button
                  onClick={() => { logout(); navigate('/auth/signin'); }}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Logout ({user.email})
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 flex gap-4 items-end bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
            />
          </div>
        </div>

        {metrics && <MetricsOverview metrics={metrics.overview} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <RevenueChart data={metrics?.revenueTrend || []} />
          <OrdersChart data={metrics?.orderCountTrend || []} />
        </div>

        <div className="mt-8">
          <OrdersByDateChart data={metrics?.ordersByDate || []} />
        </div>

        <div className="mt-8">
          <TopCustomers customers={metrics?.topCustomers || []} />
        </div>

        {/* Recent Orders Section */}
        <div className="mt-8">
          <RecentOrdersTable tenantId={selectedTenant} />
        </div>

        {/* AI Insights Section */}
        <div className="mt-8">
          <InsightCard
            totalRevenueThisWeek={(() => {
              if (!metrics?.revenueTrend) return 0;
              const now = new Date();
              const weekStart = startOfWeek(now, { weekStartsOn: 1 });
              return metrics.revenueTrend
                .filter(d => {
                  const date = new Date(d.date);
                  return isWithinInterval(date, { start: weekStart, end: now });
                })
                .reduce((sum, d) => sum + d.revenue, 0);
            })()}
            totalRevenueLastWeek={(() => {
              if (!metrics?.revenueTrend) return 0;
              const now = new Date();
              const lastWeekEnd = startOfWeek(now, { weekStartsOn: 1 });
              const lastWeekStart = subDays(lastWeekEnd, 7);
              return metrics.revenueTrend
                .filter(d => {
                  const date = new Date(d.date);
                  return isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd });
                })
                .reduce((sum, d) => sum + d.revenue, 0);
            })()}
            totalOrdersThisWeek={(() => {
              if (!metrics?.orderCountTrend) return 0;
              const now = new Date();
              const weekStart = startOfWeek(now, { weekStartsOn: 1 });
              return metrics.orderCountTrend
                .filter(d => {
                  const date = new Date(d.date);
                  return isWithinInterval(date, { start: weekStart, end: now });
                })
                .reduce((sum, d) => sum + d.count, 0);
            })()}
            totalOrdersLastWeek={(() => {
              if (!metrics?.orderCountTrend) return 0;
              const now = new Date();
              const lastWeekEnd = startOfWeek(now, { weekStartsOn: 1 });
              const lastWeekStart = subDays(lastWeekEnd, 7);
              return metrics.orderCountTrend
                .filter(d => {
                  const date = new Date(d.date);
                  return isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd });
                })
                .reduce((sum, d) => sum + d.count, 0);
            })()}
            topCustomer={metrics?.topCustomers?.[0] ? {
              name: metrics.topCustomers[0].name,
              totalSpent: metrics.topCustomers[0].totalSpent
            } : null}
            averageOrderValue={metrics?.overview?.averageOrderValue}
            revenueTrend={metrics?.revenueTrend || []}
            orderCountTrend={metrics?.orderCountTrend || []}
          />
        </div>
      </main>

        {/* Sync Progress Modal */}
        <SyncProgressModal isOpen={syncing} progress={syncProgress} />
      </div>
    </div>
  );
}

