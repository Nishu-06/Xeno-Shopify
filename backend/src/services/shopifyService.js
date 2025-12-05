import axios from 'axios';

/**
 * Shopify API Service
 * Handles all interactions with Shopify Admin API
 */
class ShopifyService {
  /**
   * Create Shopify API client for a tenant
   * @param {string} shopDomain - Shop domain (e.g., "myshop.myshopify.com")
   * @param {string} accessToken - Shopify access token
   * @returns {Object} Axios instance configured for Shopify API
   */
  createClient(shopDomain, accessToken) {
    const baseURL = `https://${shopDomain}/admin/api/2024-01`;
    
    return axios.create({
      baseURL,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Fetch all customers from Shopify with pagination
   * @param {string} shopDomain - Shop domain
   * @param {string} accessToken - Access token
   * @param {number} limit - Number of items per page (max 250)
   * @returns {Promise<Array>} Array of customers
   */
  async fetchCustomers(shopDomain, accessToken, limit = 250) {
    const client = this.createClient(shopDomain, accessToken);
    const customers = [];
    let pageInfo = null;

    do {
      const params = {
        limit,
        ...(pageInfo && { page_info: pageInfo }),
      };

      const response = await client.get('/customers.json', { params });
      customers.push(...response.data.customers);
      
      // Handle pagination
      const linkHeader = response.headers.link;
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        pageInfo = nextMatch ? new URL(nextMatch[1]).searchParams.get('page_info') : null;
      } else {
        pageInfo = null;
      }
    } while (pageInfo);

    return customers;
  }

  /**
   * Fetch all orders from Shopify with pagination
   * @param {string} shopDomain - Shop domain
   * @param {string} accessToken - Access token
   * @param {number} limit - Number of items per page (max 250)
   * @returns {Promise<Array>} Array of orders
   */
  async fetchOrders(shopDomain, accessToken, limit = 250) {
    const client = this.createClient(shopDomain, accessToken);
    const orders = [];
    let pageInfo = null;

    do {
      const params = {
        limit,
        status: 'any', // Fetch all order statuses
        ...(pageInfo && { page_info: pageInfo }),
      };

      const response = await client.get('/orders.json', { params });
      orders.push(...response.data.orders);
      
      // Handle pagination
      const linkHeader = response.headers.link;
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        pageInfo = nextMatch ? new URL(nextMatch[1]).searchParams.get('page_info') : null;
      } else {
        pageInfo = null;
      }
    } while (pageInfo);

    return orders;
  }

  /**
   * Fetch all products from Shopify with pagination
   * @param {string} shopDomain - Shop domain
   * @param {string} accessToken - Access token
   * @param {number} limit - Number of items per page (max 250)
   * @returns {Promise<Array>} Array of products
   */
  async fetchProducts(shopDomain, accessToken, limit = 250) {
    const client = this.createClient(shopDomain, accessToken);
    const products = [];
    let pageInfo = null;

    do {
      const params = {
        limit,
        ...(pageInfo && { page_info: pageInfo }),
      };

      const response = await client.get('/products.json', { params });
      products.push(...response.data.products);
      
      // Handle pagination
      const linkHeader = response.headers.link;
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        pageInfo = nextMatch ? new URL(nextMatch[1]).searchParams.get('page_info') : null;
      } else {
        pageInfo = null;
      }
    } while (pageInfo);

    return products;
  }

  /**
   * Test connection to Shopify store
   * @param {string} shopDomain - Shop domain
   * @param {string} accessToken - Access token
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection(shopDomain, accessToken) {
    try {
      const client = this.createClient(shopDomain, accessToken);
      const response = await client.get('/shop.json');
      return { success: true };
    } catch (error) {
      console.error('Shopify connection test failed:', error.response?.data || error.message);
      
      // Return detailed error information
      if (error.response) {
        // API responded with error
        return {
          success: false,
          error: error.response.data?.errors || error.response.statusText || 'Shopify API error',
          status: error.response.status,
        };
      } else if (error.request) {
        // Request made but no response
        return {
          success: false,
          error: 'Could not reach Shopify store. Check if the shop domain is correct.',
        };
      } else {
        // Error in request setup
        return {
          success: false,
          error: error.message || 'Unknown error connecting to Shopify',
        };
      }
    }
  }
}

export default new ShopifyService();

