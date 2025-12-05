import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import cron from 'node-cron';
import prisma from './config/prisma.js';
import routes from './routes/index.js';
import dataIngestionService from './services/dataIngestionService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow localhost on any port
    if (process.env.NODE_ENV === 'development') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // Build allowed origins list
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    
    // Add FRONTEND_URL if set (can be comma-separated for multiple URLs)
    if (process.env.FRONTEND_URL) {
      const frontendUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim());
      allowedOrigins.push(...frontendUrls);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log the rejected origin for debugging
      console.warn(`CORS: Origin "${origin}" not allowed. Allowed origins: ${allowedOrigins.join(', ')}`);
      console.warn(`CORS: FRONTEND_URL env var: ${process.env.FRONTEND_URL || 'not set'}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Xeno Shopify Data Ingestion & Insights Service API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      tenants: '/api/tenants',
      sync: '/api/tenants/:tenantId/sync',
      insights: '/api/tenants/:tenantId/insights',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Scheduled data sync (runs every 6 hours)
// This syncs data for all active tenants
cron.schedule('0 */6 * * *', async () => {
  console.log('[Scheduler] Starting scheduled data sync...');
  
  try {
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true },
    });

    console.log(`[Scheduler] Found ${tenants.length} active tenant(s)`);

    for (const tenant of tenants) {
      try {
        console.log(`[Scheduler] Syncing data for tenant: ${tenant.name} (${tenant.shopDomain})`);
        await dataIngestionService.syncAll(tenant.id);
        console.log(`[Scheduler] Successfully synced data for tenant: ${tenant.name}`);
      } catch (error) {
        console.error(`[Scheduler] Error syncing data for tenant ${tenant.id}:`, error.message);
      }
    }

    console.log('[Scheduler] Scheduled data sync completed');
  } catch (error) {
    console.error('[Scheduler] Error in scheduled sync:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

