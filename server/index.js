require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDBMode, getDBDetails, isDBPersistent } = require('./config/db');
const { seedMongoIfEmpty, DataStore } = require('./services/dataStore');

// Import routes
const cooperativeRoutes = require('./routes/cooperatives');
const workerRoutes = require('./routes/workers');
const bookingRoutes = require('./routes/bookings');
const contractRoutes = require('./routes/contracts');
const forecastRoutes = require('./routes/forecast');
const welfareRoutes = require('./routes/welfare');
const disputeRoutes = require('./routes/disputes');
const contractorRoutes = require('./routes/contractors');
const matchingRoutes = require('./routes/matching');
const paymentRoutes = require('./routes/payments');
const authRoutes = require('./routes/auth');

const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Path to built client
const clientDistPath = path.join(__dirname, '../client/dist');
const hasBuiltClient = fs.existsSync(clientDistPath);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets in production if client is built
if (hasBuiltClient) {
  app.use(express.static(clientDistPath));
  console.log(`📦 Serving production client from: ${clientDistPath}`);
}

// Request logging in dev
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root landing & redirect to frontend UI (only in development if client not yet built)
if (!hasBuiltClient) {
  app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>KaryaSetu - National Cooperative DPI</title>
        <meta http-equiv="refresh" content="1;url=http://localhost:5173" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #090D16;
            color: #F8FAFC;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
          }
          .card {
            background: #111827;
            border: 1px solid #1F2937;
            padding: 2.5rem;
            border-radius: 1.5rem;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
          }
          .badge {
            display: inline-block;
            background: rgba(16, 185, 129, 0.15);
            color: #34D399;
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
            color: #FFFFFF;
          }
          p {
            color: #94A3B8;
            font-size: 0.875rem;
            line-height: 1.5;
            margin-bottom: 1.5rem;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background: #EA580C;
            color: #FFFFFF;
            padding: 0.875rem 1.75rem;
            border-radius: 0.875rem;
            text-decoration: none;
            font-weight: 800;
            font-size: 0.875rem;
            transition: background 0.2s;
            width: 100%;
          }
          .btn:hover {
            background: #C2410C;
          }
          .subtext {
            margin-top: 1.25rem;
            font-size: 0.75rem;
            color: #64748B;
          }
          .subtext a {
            color: #38BDF8;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">API Backend Online (Port 5000)</span>
          <h1>KaryaSetu DPI Server</h1>
          <p>You opened the backend API port. The interactive web application is running at <strong>http://localhost:5173</strong>.</p>
          <a class="btn" href="http://localhost:5173">Open KaryaSetu Web App (Port 5173) ➔</a>
          <div class="subtext">
            Redirecting automatically to <a href="http://localhost:5173">localhost:5173</a>...<br>
            API Health: <a href="/api/health">/api/health</a>
          </div>
        </div>
      </body>
    </html>
  `);
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbDetails = getDBDetails();
  res.json({
    status: 'ONLINE',
    platform: 'KaryaSetu National Cooperative Digital Labour Infrastructure',
    edition: 'Smart India Hackathon 2024-2026 DPI Edition',
    database: {
      mode: dbDetails.mode,
      isPersistent: dbDetails.isPersistent,
      host: dbDetails.host || 'ephemeral-ram',
      status: dbDetails.isPersistent ? 'PERMANENT_CLOUD_PERSISTENCE' : 'TEMPORARY_EPHEMERAL_RAM',
      notice: dbDetails.isPersistent 
        ? 'Data is safely stored in MongoDB across restarts, deploys, and container sleep cycles.'
        : 'CRITICAL ALERT: Running in temporary in-memory mode! Data will vanish on Render restart. Add MONGODB_URI to Render Environment Variables.'
    },
    timestamp: new Date().toISOString()
  });
});

// Presentation Demo Data Reset Endpoint
app.post('/api/reset-demo', async (req, res) => {
  try {
    const result = await DataStore.resetDemoData();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes
app.use('/api/cooperatives', cooperativeRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/welfare', welfareRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);

// In production, serve index.html for all non-API GET requests (SPA client-side routing)
if (hasBuiltClient) {
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ success: false, error: 'API endpoint not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start server
async function startServer() {
  await connectDB();
  await seedMongoIfEmpty();

  app.listen(PORT, () => {
    console.log(`🚀 KaryaSetu Backend running on http://localhost:${PORT}`);
    console.log(`📊 Mode: ${getDBMode().toUpperCase()} | SIH 2026 Ready`);
  });
}

startServer();
