import prisma from '../config/prisma.js';
import dataIngestionService from '../services/dataIngestionService.js';

/**
 * Data Ingestion Controller
 * Handles manual and automated data sync from Shopify
 */
export class IngestionController {
  /**
   * Sync all data for a tenant
   * POST /api/tenants/:tenantId/sync
   */
  async syncAll(req, res) {
    try {
      const { tenantId } = req.params;

      // Check if tenant exists and has valid credentials
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
        });
      }

      // Check if it's a demo tenant with fake token
      if (tenant.accessToken === 'shpat_demo_token_for_testing_only') {
        return res.status(400).json({
          error: 'Cannot sync demo tenant. Demo tenant uses fake credentials and cannot connect to Shopify API. Use a real Shopify store for syncing data.',
          isDemo: true,
        });
      }

      // Start sync in background for real tenants
      dataIngestionService.syncAll(tenantId)
        .then((result) => {
          console.log(`Sync completed for tenant ${tenantId}:`, result);
        })
        .catch((error) => {
          console.error(`Sync failed for tenant ${tenantId}:`, error);
        });

      res.json({
        message: 'Data sync started. This may take a few minutes. Please check the backend logs for progress.',
        tenantId,
      });
    } catch (error) {
      console.error('Error starting sync:', error);
      res.status(500).json({
        error: 'Failed to start data sync',
        message: error.message,
      });
    }
  }

  /**
   * Sync customers only
   * POST /api/tenants/:tenantId/sync/customers
   */
  async syncCustomers(req, res) {
    try {
      const { tenantId } = req.params;
      
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
        });
      }

      if (tenant.accessToken === 'shpat_demo_token_for_testing_only') {
        return res.status(400).json({
          error: 'Cannot sync demo tenant. Use a real Shopify store for syncing data.',
          isDemo: true,
        });
      }

      const result = await dataIngestionService.syncCustomers(tenantId);

      res.json({
        message: 'Customers synced successfully',
        result,
      });
    } catch (error) {
      console.error('Error syncing customers:', error);
      res.status(500).json({
        error: 'Failed to sync customers',
        message: error.message,
      });
    }
  }

  /**
   * Sync orders only
   * POST /api/tenants/:tenantId/sync/orders
   */
  async syncOrders(req, res) {
    try {
      const { tenantId } = req.params;
      
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
        });
      }

      if (tenant.accessToken === 'shpat_demo_token_for_testing_only') {
        return res.status(400).json({
          error: 'Cannot sync demo tenant. Use a real Shopify store for syncing data.',
          isDemo: true,
        });
      }

      const result = await dataIngestionService.syncOrders(tenantId);

      res.json({
        message: 'Orders synced successfully',
        result,
      });
    } catch (error) {
      console.error('Error syncing orders:', error);
      res.status(500).json({
        error: 'Failed to sync orders',
        message: error.message,
      });
    }
  }

  /**
   * Sync products only
   * POST /api/tenants/:tenantId/sync/products
   */
  async syncProducts(req, res) {
    try {
      const { tenantId } = req.params;
      
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
        });
      }

      if (tenant.accessToken === 'shpat_demo_token_for_testing_only') {
        return res.status(400).json({
          error: 'Cannot sync demo tenant. Use a real Shopify store for syncing data.',
          isDemo: true,
        });
      }

      const result = await dataIngestionService.syncProducts(tenantId);

      res.json({
        message: 'Products synced successfully',
        result,
      });
    } catch (error) {
      console.error('Error syncing products:', error);
      res.status(500).json({
        error: 'Failed to sync products',
        message: error.message,
      });
    }
  }
}

export default new IngestionController();
