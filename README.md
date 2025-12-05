# Xeno Shopify - Multi-Tenant Data Ingestion & Insights Service

A production-ready, multi-tenant Shopify data ingestion and insights platform that helps enterprise retailers onboard, integrate, and analyze their customer data.

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL Database (use cloud: Render/Railway - see Database Setup below)
- Shopify Development Store (for real data)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
# DATABASE_URL="your_postgresql_connection_string"
# PORT=3001
# NODE_ENV=development
# FRONTEND_URL=http://localhost:5173

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed demo data (optional)
npm run db:seed

# Start development server
npm run dev
```

Backend runs on: http://localhost:3001

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file (optional - defaults work)
# VITE_API_URL=http://localhost:3001

# Start development server
npm run dev
```

Frontend runs on: http://localhost:5173

### Database Setup

#### Option 1: Render PostgreSQL (Recommended - Free)

1. Go to **https://render.com** and sign up
2. Click **"New +"** → **"PostgreSQL"**
3. Name it: `xeno-shopify-db`, choose **Free** plan
4. Copy the **External Database URL** (for local dev)
5. Update `backend/.env`:
   ```env
   DATABASE_URL="paste_your_render_postgresql_url_here"
   ```
6. Run: `npm run db:push` to create tables

#### Option 2: Railway PostgreSQL

1. Go to **https://railway.app** and sign up
2. **New Project** → **Database** → **Add PostgreSQL**
3. Go to **Variables** tab and copy `DATABASE_URL`
4. Update `backend/.env` with the connection string
5. Run: `npm run db:push`

#### Option 3: Local PostgreSQL

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create database: `CREATE DATABASE xeno_shopify;`
3. Update `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/xeno_shopify"
   ```
4. Run: `npm run db:push`

---

## Architecture Diagram

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (React.js + Vite)"
        UI[Dashboard UI]
        Auth[Auth Context]
        Charts[Recharts Components]
    end

    subgraph "Backend (Express.js)"
        API[REST API]
        Shopify[Shopify Service]
        Sync[Data Ingestion Service]
        Insights[Insights Service]
        Scheduler[Cron Scheduler<br/>Every 6 hours]
    end

    subgraph "Database (PostgreSQL)"
        DB[(PostgreSQL)]
        Prisma[Prisma ORM]
    end

    subgraph "External"
        ShopifyAPI[Shopify Admin API]
    end

    UI -->|HTTPS| API
    Auth -->|Session| API
    API --> Shopify
    API --> Sync
    API --> Insights
    Sync --> Prisma
    Insights --> Prisma
    Prisma -->|Multi-tenant Queries| DB
    Shopify -->|REST API| ShopifyAPI
    Scheduler -->|Auto Sync| Sync
    Scheduler -->|Periodic| Shopify

    style UI fill:#0ea5e9
    style API fill:#10b981
    style DB fill:#f59e0b
    style ShopifyAPI fill:#6366f1
```

### Multi-Tenancy Pattern

- **Row-Level Security:** All data tables include `tenantId` foreign key
- **Query Isolation:** All queries automatically filter by `tenantId`
- **Composite Keys:** `(tenantId, shopifyId)` ensures unique records per tenant
- **Indexed Lookups:** Optimized for tenant-scoped queries

---

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Tenant Management

**Create Tenant**
```http
POST /api/tenants
Content-Type: application/json

{
  "shopDomain": "myshop.myshopify.com",
  "accessToken": "shpat_xxxxxxxxxxxxx",
  "name": "My Shopify Store"
}
```

**Get All Tenants**
```http
GET /api/tenants
```

**Get Tenant by ID**
```http
GET /api/tenants/:id
```

**Update Tenant**
```http
PUT /api/tenants/:id
Content-Type: application/json

{
  "name": "Updated Store Name",
  "isActive": true
}
```

### Data Ingestion

**Sync All Data**
```http
POST /api/tenants/:tenantId/sync
```

**Sync Customers Only**
```http
POST /api/tenants/:tenantId/sync/customers
```

**Sync Orders Only**
```http
POST /api/tenants/:tenantId/sync/orders
```

**Sync Products Only**
```http
POST /api/tenants/:tenantId/sync/products
```

### Insights

**Get Overview Metrics**
```http
GET /api/tenants/:tenantId/insights/overview

Response:
{
  "metrics": {
    "totalCustomers": 1250,
    "totalOrders": 3420,
    "totalRevenue": 125450.75,
    "averageOrderValue": 36.68
  }
}
```

**Get Orders by Date Range**
```http
GET /api/tenants/:tenantId/insights/orders-by-date?startDate=2024-01-01&endDate=2024-01-31
```

**Get Top Customers**
```http
GET /api/tenants/:tenantId/insights/top-customers?limit=5
```

**Get Revenue Trend**
```http
GET /api/tenants/:tenantId/insights/revenue-trend?startDate=2024-01-01&endDate=2024-01-31
```

**Get Order Count Trend**
```http
GET /api/tenants/:tenantId/insights/order-count-trend?startDate=2024-01-01&endDate=2024-01-31
```

**Health Check**
```http
GET /api/health
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    Tenant ||--o{ Customer : has
    Tenant ||--o{ Order : has
    Tenant ||--o{ Product : has
    Tenant ||--o{ CustomEvent : has
    Customer ||--o{ Order : places
    Order ||--o{ OrderLineItem : contains
    Product ||--o{ OrderLineItem : referenced_in

    Tenant {
        uuid id PK
        string shopDomain UK
        string accessToken
        string name
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    Customer {
        uuid id PK
        uuid tenantId FK
        string shopifyId
        string email
        string firstName
        string lastName
        float totalSpent
        int ordersCount
        timestamp createdAt
        timestamp updatedAt
    }

    Order {
        uuid id PK
        uuid tenantId FK
        uuid customerId FK
        string shopifyId
        string orderNumber
        string email
        string financialStatus
        string fulfillmentStatus
        float totalPrice
        float subtotalPrice
        float totalTax
        string currency
        timestamp orderDate
        timestamp createdAt
        timestamp updatedAt
    }

    Product {
        uuid id PK
        uuid tenantId FK
        string shopifyId
        string title
        string handle
        text description
        string vendor
        string productType
        string status
        float totalSales
        timestamp createdAt
        timestamp updatedAt
    }

    OrderLineItem {
        uuid id PK
        uuid orderId FK
        uuid productId FK
        string shopifyId
        string title
        int quantity
        float price
        timestamp createdAt
    }

    CustomEvent {
        uuid id PK
        uuid tenantId FK
        string eventType
        uuid customerId
        string email
        json metadata
        timestamp createdAt
    }
```

### Key Design Decisions

1. **Multi-Tenant Isolation:** All tables include `tenantId` foreign key for complete data isolation
2. **Composite Unique Keys:** `(tenantId, shopifyId)` ensures no duplicate Shopify records per tenant
3. **Indexing Strategy:** Indexes on `tenantId`, date fields, and frequently queried fields
4. **Soft Relationships:** Orders can exist without customers (guest checkout support)

---

## Known Limitations

1. **Authentication:**
   - Uses localStorage (no server-side session)
   - Email-based auth uses simple email storage (no real email sending in dev)

2. **Data Sync:**
   - Full sync on every run (not incremental)
   - Large stores may take significant time to sync
   - No progress tracking UI for long-running syncs
   - Demo tenant cannot sync (uses fake credentials)

3. **Shopify API:**
   - Rate limiting handled sequentially (Shopify limits: 2 calls/second)
   - No webhook implementation (only scheduled sync)
   - Custom events schema ready but not automatically ingested

4. **Scalability:**
   - Single database instance (no sharding)
   - No caching layer (Redis, etc.)
   - Synchronous API calls

5. **Features:**
   - No data export functionality
   - No advanced analytics (cohorts, retention, etc.)
   - No alerts/notifications

---

## Assumptions

### Technical Assumptions

1. **Database:** PostgreSQL used for relational data storage with ACID guarantees
2. **Shopify API:** Using REST Admin API (2024-01 version) with 250 items per page limit
3. **Authentication:** Simple localStorage-based auth for assignment simplicity
4. **Multi-tenancy:** Row-level isolation using `tenantId` foreign keys
5. **Data Sync:** Scheduled jobs every 6 hours; full sync approach

### Business Assumptions

1. **Shopify Credentials:** Store owners provide Admin API access tokens via onboarding
2. **Data Freshness:** 6-hour sync interval is acceptable; manual sync available
3. **Scale:** Designed for small to medium businesses with reasonable data volumes
4. **Permissions:** Admin API tokens have read-only access to Customers, Orders, Products

### Security Assumptions

1. **Access Tokens:** Stored in database; should be encrypted at rest in production
2. **API Security:** CORS configured for frontend domain only
3. **Authentication:** Simple localStorage-based session management
4. **Data Privacy:** Multi-tenant isolation ensures complete data separation
