import insightsService from '../services/insightsService.js';

/**
 * Insights Controller
 * Handles dashboard analytics and insights endpoints
 */
export class InsightsController {
  /**
   * Get overview metrics
   * GET /api/tenants/:tenantId/insights/overview
   */
  async getOverview(req, res) {
    try {
      const { tenantId } = req.params;
      const metrics = await insightsService.getOverviewMetrics(tenantId);

      res.json({ metrics });
    } catch (error) {
      console.error('Error getting overview metrics:', error);
      res.status(500).json({
        error: 'Failed to get overview metrics',
        message: error.message,
      });
    }
  }

  /**
   * Get orders by date range
   * GET /api/tenants/:tenantId/insights/orders-by-date
   */
  async getOrdersByDate(req, res) {
    try {
      const { tenantId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Missing required query parameters: startDate, endDate',
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
        });
      }

      const orders = await insightsService.getOrdersByDate(tenantId, start, end);

      res.json({ orders });
    } catch (error) {
      console.error('Error getting orders by date:', error);
      res.status(500).json({
        error: 'Failed to get orders by date',
        message: error.message,
      });
    }
  }

  /**
   * Get top customers
   * GET /api/tenants/:tenantId/insights/top-customers
   */
  async getTopCustomers(req, res) {
    try {
      const { tenantId } = req.params;
      const limit = parseInt(req.query.limit) || 5;

      const customers = await insightsService.getTopCustomers(tenantId, limit);

      res.json({ customers });
    } catch (error) {
      console.error('Error getting top customers:', error);
      res.status(500).json({
        error: 'Failed to get top customers',
        message: error.message,
      });
    }
  }

  /**
   * Get revenue trend
   * GET /api/tenants/:tenantId/insights/revenue-trend
   */
  async getRevenueTrend(req, res) {
    try {
      const { tenantId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Missing required query parameters: startDate, endDate',
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
        });
      }

      const trend = await insightsService.getRevenueTrend(tenantId, start, end);

      res.json({ trend });
    } catch (error) {
      console.error('Error getting revenue trend:', error);
      res.status(500).json({
        error: 'Failed to get revenue trend',
        message: error.message,
      });
    }
  }

  /**
   * Get recent orders
   * GET /api/tenants/:tenantId/orders
   */
  async getRecentOrders(req, res) {
    try {
      const { tenantId } = req.params;
      const limit = parseInt(req.query.limit) || 5;

      const orders = await insightsService.getRecentOrders(tenantId, limit);

      res.json({ orders });
    } catch (error) {
      console.error('Error getting recent orders:', error);
      res.status(500).json({
        error: 'Failed to get recent orders',
        message: error.message,
      });
    }
  }

  /**
   * Get order count trend
   * GET /api/tenants/:tenantId/insights/order-count-trend
   */
  async getOrderCountTrend(req, res) {
    try {
      const { tenantId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Missing required query parameters: startDate, endDate',
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
        });
      }

      const trend = await insightsService.getOrderCountTrend(tenantId, start, end);

      res.json({ trend });
    } catch (error) {
      console.error('Error getting order count trend:', error);
      res.status(500).json({
        error: 'Failed to get order count trend',
        message: error.message,
      });
    }
  }
}

export default new InsightsController();

