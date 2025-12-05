import prisma from '../config/prisma.js';

/**
 * Insights Service
 * Provides analytics and insights for the dashboard
 */
class InsightsService {
  /**
   * Get overview metrics for a tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} Overview metrics
   */
  async getOverviewMetrics(tenantId) {
    try {
      const [totalCustomers, totalOrders, revenueData] = await Promise.all([
        prisma.customer.count({
          where: { tenantId },
        }),
        prisma.order.count({
          where: { tenantId },
        }),
        prisma.order.aggregate({
          where: { tenantId },
          _sum: {
            totalPrice: true,
          },
        }),
      ]);

      const totalRevenue = revenueData._sum.totalPrice || 0;

      // Calculate average order value
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalCustomers,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      };
    } catch (error) {
      console.error(`Error getting overview metrics for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get orders by date range
   * @param {string} tenantId - Tenant ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Orders grouped by date
   */
  async getOrdersByDate(tenantId, startDate, endDate) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          orderDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          orderDate: true,
          totalPrice: true,
          id: true,
        },
        orderBy: {
          orderDate: 'asc',
        },
      });

      // Group by date
      const ordersByDate = {};
      orders.forEach((order) => {
        const dateKey = order.orderDate.toISOString().split('T')[0];
        if (!ordersByDate[dateKey]) {
          ordersByDate[dateKey] = {
            date: dateKey,
            count: 0,
            revenue: 0,
          };
        }
        ordersByDate[dateKey].count += 1;
        ordersByDate[dateKey].revenue += order.totalPrice;
      });

      // Convert to array and round revenue
      return Object.values(ordersByDate).map((item) => ({
        date: item.date,
        count: item.count,
        revenue: Math.round(item.revenue * 100) / 100,
      }));
    } catch (error) {
      console.error(`Error getting orders by date for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get top customers by spend
   * @param {string} tenantId - Tenant ID
   * @param {number} limit - Number of customers to return
   * @returns {Promise<Array>} Top customers
   */
  async getTopCustomers(tenantId, limit = 5) {
    try {
      const customers = await prisma.customer.findMany({
        where: {
          tenantId,
          totalSpent: {
            gt: 0,
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          totalSpent: true,
          ordersCount: true,
        },
        orderBy: {
          totalSpent: 'desc',
        },
        take: limit,
      });

      return customers.map((customer) => ({
        id: customer.id,
        email: customer.email,
        name: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'N/A',
        totalSpent: Math.round(customer.totalSpent * 100) / 100,
        ordersCount: customer.ordersCount,
      }));
    } catch (error) {
      console.error(`Error getting top customers for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get revenue trend data
   * @param {string} tenantId - Tenant ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Revenue trend data
   */
  async getRevenueTrend(tenantId, startDate, endDate) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          orderDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          orderDate: true,
          totalPrice: true,
        },
        orderBy: {
          orderDate: 'asc',
        },
      });

      // Group by date
      const revenueByDate = {};
      orders.forEach((order) => {
        const dateKey = order.orderDate.toISOString().split('T')[0];
        if (!revenueByDate[dateKey]) {
          revenueByDate[dateKey] = 0;
        }
        revenueByDate[dateKey] += order.totalPrice;
      });

      // Convert to array
      return Object.entries(revenueByDate)
        .map(([date, revenue]) => ({
          date,
          revenue: Math.round(revenue * 100) / 100,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error(`Error getting revenue trend for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get recent orders for a tenant
   * @param {string} tenantId - Tenant ID
   * @param {number} limit - Number of orders to return
   * @returns {Promise<Array>} Recent orders with customer and line items
   */
  async getRecentOrders(tenantId, limit = 5) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          tenantId,
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          lineItems: {
            include: {
              product: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
        take: limit,
      });

      return orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate.toISOString(),
        totalPrice: order.totalPrice,
        financialStatus: order.financialStatus || 'paid',
        customer: order.customer
          ? {
              firstName: order.customer.firstName,
              lastName: order.customer.lastName,
            }
          : null,
        lineItems: order.lineItems.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          product: item.product
            ? {
                title: item.product.title,
              }
            : null,
        })),
      }));
    } catch (error) {
      console.error(`Error getting recent orders for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get order count trend data
   * @param {string} tenantId - Tenant ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Order count trend data
   */
  async getOrderCountTrend(tenantId, startDate, endDate) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          orderDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          orderDate: true,
        },
        orderBy: {
          orderDate: 'asc',
        },
      });

      // Group by date
      const countByDate = {};
      orders.forEach((order) => {
        const dateKey = order.orderDate.toISOString().split('T')[0];
        countByDate[dateKey] = (countByDate[dateKey] || 0) + 1;
      });

      // Convert to array
      return Object.entries(countByDate)
        .map(([date, count]) => ({
          date,
          count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error(`Error getting order count trend for tenant ${tenantId}:`, error);
      throw error;
    }
  }
}

export default new InsightsService();

