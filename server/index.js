require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDBMode } = require('./config/db');
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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging in dev
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'KaryaSetu National Cooperative Digital Labour Infrastructure',
    edition: 'Smart India Hackathon 2024-2026 DPI Edition',
    databaseMode: getDBMode(),
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
