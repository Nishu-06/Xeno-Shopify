import prisma from '../config/prisma.js';
import shopifyService from '../services/shopifyService.js';

/**
 * Tenant Controller
 * Handles tenant onboarding and management
 */
export class TenantController {
  /**
   * Create a new tenant (onboard a Shopify store)
   * POST /api/tenants
   */
  async createTenant(req, res) {
    try {
      const { shopDomain, accessToken, name } = req.body;

      if (!shopDomain || !accessToken || !name) {
        return res.status(400).json({
          error: 'Missing required fields: shopDomain, accessToken, name',
        });
      }

      // Normalize shop domain
      const normalizedDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

      // Test Shopify connection
      const connectionResult = await shopifyService.testConnection(normalizedDomain, accessToken);
      
      if (!connectionResult.success) {
        return res.status(400).json({
          error: connectionResult.error || 'Failed to connect to Shopify store. Please check your credentials.',
          details: connectionResult.status ? `HTTP ${connectionResult.status}` : 'Connection failed',
        });
      }

      // Check if tenant already exists
      const existingTenant = await prisma.tenant.findUnique({
        where: { shopDomain: normalizedDomain },
      });

      if (existingTenant) {
        return res.status(409).json({
          error: 'Tenant with this shop domain already exists',
          tenant: existingTenant,
        });
      }

      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          shopDomain: normalizedDomain,
          accessToken,
          name,
          isActive: true,
        },
      });

      res.status(201).json({
        message: 'Tenant created successfully',
        tenant: {
          id: tenant.id,
          shopDomain: tenant.shopDomain,
          name: tenant.name,
          isActive: tenant.isActive,
          createdAt: tenant.createdAt,
        },
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({
        error: 'Failed to create tenant',
        message: error.message,
      });
    }
  }

  /**
   * Get all tenants
   * GET /api/tenants
   */
  async getTenants(req, res) {
    try {
      const tenants = await prisma.tenant.findMany({
        select: {
          id: true,
          shopDomain: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              customers: true,
              orders: true,
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({ tenants });
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({
        error: 'Failed to fetch tenants',
        message: error.message,
      });
    }
  }

  /**
   * Get tenant by ID
   * GET /api/tenants/:id
   */
  async getTenantById(req, res) {
    try {
      const { id } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { id },
        select: {
          id: true,
          shopDomain: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              customers: true,
              orders: true,
              products: true,
            },
          },
        },
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
        });
      }

      res.json({ tenant });
    } catch (error) {
      console.error('Error fetching tenant:', error);
      res.status(500).json({
        error: 'Failed to fetch tenant',
        message: error.message,
      });
    }
  }

  /**
   * Update tenant
   * PUT /api/tenants/:id
   */
  async updateTenant(req, res) {
    try {
      const { id } = req.params;
      const { name, isActive, accessToken } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (accessToken !== undefined) updateData.accessToken = accessToken;

      const tenant = await prisma.tenant.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          shopDomain: true,
          name: true,
          isActive: true,
          updatedAt: true,
        },
      });

      res.json({
        message: 'Tenant updated successfully',
        tenant,
      });
    } catch (error) {
      console.error('Error updating tenant:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: 'Tenant not found',
        });
      }
      res.status(500).json({
        error: 'Failed to update tenant',
        message: error.message,
      });
    }
  }
}

export default new TenantController();

