import express from 'express';
import tenantController from '../controllers/tenantController.js';
import ingestionController from '../controllers/ingestionController.js';
import insightsController from '../controllers/insightsController.js';

const router = express.Router();

// Tenant routes
router.post('/tenants', tenantController.createTenant.bind(tenantController));
router.get('/tenants', tenantController.getTenants.bind(tenantController));
router.get('/tenants/:id', tenantController.getTenantById.bind(tenantController));
router.put('/tenants/:id', tenantController.updateTenant.bind(tenantController));

// Data ingestion routes
router.post('/tenants/:tenantId/sync', ingestionController.syncAll.bind(ingestionController));
router.post('/tenants/:tenantId/sync/customers', ingestionController.syncCustomers.bind(ingestionController));
router.post('/tenants/:tenantId/sync/orders', ingestionController.syncOrders.bind(ingestionController));
router.post('/tenants/:tenantId/sync/products', ingestionController.syncProducts.bind(ingestionController));

// Orders routes
router.get('/tenants/:tenantId/orders', insightsController.getRecentOrders.bind(insightsController));

// Insights routes
router.get('/tenants/:tenantId/insights/overview', insightsController.getOverview.bind(insightsController));
router.get('/tenants/:tenantId/insights/orders-by-date', insightsController.getOrdersByDate.bind(insightsController));
router.get('/tenants/:tenantId/insights/top-customers', insightsController.getTopCustomers.bind(insightsController));
router.get('/tenants/:tenantId/insights/revenue-trend', insightsController.getRevenueTrend.bind(insightsController));
router.get('/tenants/:tenantId/insights/order-count-trend', insightsController.getOrderCountTrend.bind(insightsController));

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;

