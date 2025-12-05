import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tenant API
export const tenantAPI = {
  create: (data) => api.post('/tenants', data),
  getAll: () => api.get('/tenants'),
  getById: (id) => api.get(`/tenants/${id}`),
  update: (id, data) => api.put(`/tenants/${id}`, data),
};

// Sync API
export const syncAPI = {
  syncAll: (tenantId) => api.post(`/tenants/${tenantId}/sync`),
  syncCustomers: (tenantId) => api.post(`/tenants/${tenantId}/sync/customers`),
  syncOrders: (tenantId) => api.post(`/tenants/${tenantId}/sync/orders`),
  syncProducts: (tenantId) => api.post(`/tenants/${tenantId}/sync/products`),
};

// Orders API
export const ordersAPI = {
  getRecent: (tenantId, limit = 5) =>
    api.get(`/tenants/${tenantId}/orders`, {
      params: { limit },
    }),
};

// Insights API
export const insightsAPI = {
  getOverview: (tenantId) => api.get(`/tenants/${tenantId}/insights/overview`),
  getOrdersByDate: (tenantId, startDate, endDate) =>
    api.get(`/tenants/${tenantId}/insights/orders-by-date`, {
      params: { startDate, endDate },
    }),
  getTopCustomers: (tenantId, limit = 5) =>
    api.get(`/tenants/${tenantId}/insights/top-customers`, {
      params: { limit },
    }),
  getRevenueTrend: (tenantId, startDate, endDate) =>
    api.get(`/tenants/${tenantId}/insights/revenue-trend`, {
      params: { startDate, endDate },
    }),
  getOrderCountTrend: (tenantId, startDate, endDate) =>
    api.get(`/tenants/${tenantId}/insights/order-count-trend`, {
      params: { startDate, endDate },
    }),
};

export default api;
