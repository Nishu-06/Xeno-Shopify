import prisma from '../config/prisma.js';
import shopifyService from './shopifyService.js';

/**
 * Data Ingestion Service
 * Handles syncing data from Shopify to PostgreSQL with multi-tenant isolation
 */
class DataIngestionService {
  /**
   * Sync all customers for a tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} Sync result
   */
  async syncCustomers(tenantId) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      console.log(`[${tenant.shopDomain}] Starting customer sync...`);
      
      const shopifyCustomers = await shopifyService.fetchCustomers(
        tenant.shopDomain,
        tenant.accessToken
      );

      let created = 0;
      let updated = 0;

      for (const shopifyCustomer of shopifyCustomers) {
        const customerData = {
          shopifyId: String(shopifyCustomer.id),
          email: shopifyCustomer.email || null,
          firstName: shopifyCustomer.first_name || null,
          lastName: shopifyCustomer.last_name || null,
          totalSpent: parseFloat(shopifyCustomer.total_spent || 0),
          ordersCount: parseInt(shopifyCustomer.orders_count || 0),
          shopifyCreatedAt: shopifyCustomer.created_at ? new Date(shopifyCustomer.created_at) : null,
          shopifyUpdatedAt: shopifyCustomer.updated_at ? new Date(shopifyCustomer.updated_at) : null,
        };

        await prisma.customer.upsert({
          where: {
            tenantId_shopifyId: {
              tenantId,
              shopifyId: customerData.shopifyId,
            },
          },
          create: {
            tenantId,
            ...customerData,
          },
          update: customerData,
        });

        if (customerData.shopifyCreatedAt && new Date(customerData.shopifyCreatedAt) > new Date(Date.now() - 60000)) {
          created++;
        } else {
          updated++;
        }
      }

      console.log(`[${tenant.shopDomain}] Customer sync complete: ${created} created, ${updated} updated`);

      return {
        success: true,
        total: shopifyCustomers.length,
        created,
        updated,
      };
    } catch (error) {
      console.error(`Error syncing customers for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Sync all orders for a tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} Sync result
   */
  async syncOrders(tenantId) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      console.log(`[${tenant.shopDomain}] Starting order sync...`);
      
      const shopifyOrders = await shopifyService.fetchOrders(
        tenant.shopDomain,
        tenant.accessToken
      );

      let created = 0;
      let updated = 0;

      for (const shopifyOrder of shopifyOrders) {
        // Find or create customer
        let customerId = null;
        if (shopifyOrder.customer) {
          const customer = await prisma.customer.findUnique({
            where: {
              tenantId_shopifyId: {
                tenantId,
                shopifyId: String(shopifyOrder.customer.id),
              },
            },
          });
          customerId = customer?.id || null;
        }

        const orderData = {
          shopifyId: String(shopifyOrder.id),
          orderNumber: String(shopifyOrder.order_number || shopifyOrder.number),
          customerId,
          email: shopifyOrder.email || null,
          financialStatus: shopifyOrder.financial_status || null,
          fulfillmentStatus: shopifyOrder.fulfillment_status || null,
          totalPrice: parseFloat(shopifyOrder.total_price || 0),
          subtotalPrice: parseFloat(shopifyOrder.subtotal_price || 0),
          totalTax: parseFloat(shopifyOrder.total_tax || 0),
          currency: shopifyOrder.currency || 'USD',
          orderDate: new Date(shopifyOrder.created_at),
          shopifyCreatedAt: shopifyOrder.created_at ? new Date(shopifyOrder.created_at) : null,
          shopifyUpdatedAt: shopifyOrder.updated_at ? new Date(shopifyOrder.updated_at) : null,
        };

        const order = await prisma.order.upsert({
          where: {
            tenantId_shopifyId: {
              tenantId,
              shopifyId: orderData.shopifyId,
            },
          },
          create: {
            tenantId,
            ...orderData,
          },
          update: orderData,
          include: {
            lineItems: true,
          },
        });

        // Sync line items
        if (shopifyOrder.line_items) {
          // Delete existing line items and recreate
          await prisma.orderLineItem.deleteMany({
            where: { orderId: order.id },
          });

          for (const item of shopifyOrder.line_items) {
            const productId = item.product_id 
              ? await this.getProductId(tenantId, String(item.product_id))
              : null;

            await prisma.orderLineItem.create({
              data: {
                orderId: order.id,
                shopifyId: String(item.id),
                title: item.title,
                quantity: parseInt(item.quantity || 0),
                price: parseFloat(item.price || 0),
                productId,
              },
            });
          }
        }

        if (orderData.shopifyCreatedAt && new Date(orderData.shopifyCreatedAt) > new Date(Date.now() - 60000)) {
          created++;
        } else {
          updated++;
        }
      }

      console.log(`[${tenant.shopDomain}] Order sync complete: ${created} created, ${updated} updated`);

      return {
        success: true,
        total: shopifyOrders.length,
        created,
        updated,
      };
    } catch (error) {
      console.error(`Error syncing orders for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Sync all products for a tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} Sync result
   */
  async syncProducts(tenantId) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      console.log(`[${tenant.shopDomain}] Starting product sync...`);
      
      const shopifyProducts = await shopifyService.fetchProducts(
        tenant.shopDomain,
        tenant.accessToken
      );

      let created = 0;
      let updated = 0;

      for (const shopifyProduct of shopifyProducts) {
        const productData = {
          shopifyId: String(shopifyProduct.id),
          title: shopifyProduct.title,
          handle: shopifyProduct.handle || null,
          description: shopifyProduct.body_html || null,
          vendor: shopifyProduct.vendor || null,
          productType: shopifyProduct.product_type || null,
          status: shopifyProduct.status || null,
          shopifyCreatedAt: shopifyProduct.created_at ? new Date(shopifyProduct.created_at) : null,
          shopifyUpdatedAt: shopifyProduct.updated_at ? new Date(shopifyProduct.updated_at) : null,
        };

        await prisma.product.upsert({
          where: {
            tenantId_shopifyId: {
              tenantId,
              shopifyId: productData.shopifyId,
            },
          },
          create: {
            tenantId,
            ...productData,
          },
          update: productData,
        });

        if (productData.shopifyCreatedAt && new Date(productData.shopifyCreatedAt) > new Date(Date.now() - 60000)) {
          created++;
        } else {
          updated++;
        }
      }

      // Update product total sales from orders
      await this.updateProductSales(tenantId);

      console.log(`[${tenant.shopDomain}] Product sync complete: ${created} created, ${updated} updated`);

      return {
        success: true,
        total: shopifyProducts.length,
        created,
        updated,
      };
    } catch (error) {
      console.error(`Error syncing products for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Update product total sales from orders
   * @param {string} tenantId - Tenant ID
   */
  async updateProductSales(tenantId) {
    const products = await prisma.product.findMany({
      where: { tenantId },
    });

    for (const product of products) {
      const sales = await prisma.orderLineItem.aggregate({
        where: {
          productId: product.id,
        },
        _sum: {
          price: true,
        },
      });

      await prisma.product.update({
        where: { id: product.id },
        data: {
          totalSales: sales._sum.price || 0,
        },
      });
    }
  }

  /**
   * Get or create product ID from Shopify product ID
   * @param {string} tenantId - Tenant ID
   * @param {string} shopifyProductId - Shopify product ID
   * @returns {Promise<string|null>} Product ID or null
   */
  async getProductId(tenantId, shopifyProductId) {
    const product = await prisma.product.findUnique({
      where: {
        tenantId_shopifyId: {
          tenantId,
          shopifyId: shopifyProductId,
        },
      },
    });
    return product?.id || null;
  }

  /**
   * Sync all data for a tenant (customers, orders, products)
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} Sync results
   */
  async syncAll(tenantId) {
    try {
      const [customers, orders, products] = await Promise.all([
        this.syncCustomers(tenantId),
        this.syncOrders(tenantId),
        this.syncProducts(tenantId),
      ]);

      return {
        success: true,
        customers,
        orders,
        products,
      };
    } catch (error) {
      console.error(`Error syncing all data for tenant ${tenantId}:`, error);
      throw error;
    }
  }
}

export default new DataIngestionService();

