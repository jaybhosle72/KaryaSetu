const mongoose = require('mongoose');

let isConnected = false;
let connectionHost = null;
let lastConnectionError = null;

let inMemoryStore = {
  cooperatives: [],
  workers: [],
  bookings: [],
  contracts: [],
  forecasts: [],
  welfareLedger: [],
  disputes: [],
  contractors: [],
  users: []
};

const connectDB = async () => {
  const isCustomUri = Boolean(process.env.MONGODB_URI);
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sahakar_seva';
  
  // Cloud Atlas connection needs more time (15s) especially during Render container cold starts.
  // Local fallback can fail fast (2s) if mongod is not installed locally.
  const timeoutMs = isCustomUri ? 15000 : 2000;
  const maxRetries = isCustomUri ? 2 : 1;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 [DB] Connecting to MongoDB (Attempt ${attempt}/${maxRetries}, Timeout: ${timeoutMs}ms)...`);
      
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: timeoutMs,
        heartbeatFrequencyMS: 10000
      });
      
      isConnected = true;
      connectionHost = conn.connection.host;
      lastConnectionError = null;
      console.log(`✅ [MongoDB Connected]: ${conn.connection.host} (Persistent Database Active)`);
      return { mode: 'mongodb', connection: conn };
    } catch (error) {
      lastConnectionError = error.message;
      if (attempt < maxRetries) {
        console.warn(`⏳ [MongoDB Connection Attempt ${attempt} Failed]: ${error.message}. Retrying in 2 seconds...`);
        await new Promise(res => setTimeout(res, 2000));
      } else {
        console.warn(`⚠️ [MongoDB Not Connected]: ${error.message}`);
      }
    }
  }

  // Fallback to in-memory store
  isConnected = false;
  connectionHost = null;

  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    console.error(`
================================================================================
🚨 CRITICAL PERSISTENCE ALERT (RENDER DEPLOYMENT):
================================================================================
The server is currently running in EPHEMERAL IN-MEMORY MODE.
Why? Either:
  1. MONGODB_URI environment variable is missing in your Render Dashboard.
  2. Or MongoDB Atlas is blocking Render's dynamic IP address.
     (Fix: In MongoDB Atlas -> Network Access -> Add IP 0.0.0.0/0).

⚠️ CONSEQUENCE:
Render Free Tier puts your app to sleep after 15 minutes of inactivity.
Every time Render sleeps or restarts, ALL IN-MEMORY DATA (LOGINS, USERS, BOOKINGS) WILL DISAPPEAR!

👉 FIX IN 2 MINUTES:
  1. Create a free cluster on MongoDB Atlas (https://www.mongodb.com/cloud/atlas).
  2. Set Network Access to 0.0.0.0/0 (Allow from anywhere).
  3. Copy connection string and paste it as MONGODB_URI in Render Environment Variables.
================================================================================
`);
  } else {
    console.warn(`⚠️ [MongoDB Not Detected]: Falling back to High-Performance In-Memory DB for local dev/demo.`);
  }

  return { mode: 'in-memory', store: inMemoryStore };
};

const getDBMode = () => isConnected ? 'mongodb' : 'in-memory';
const isDBPersistent = () => isConnected;
const getDBDetails = () => ({
  mode: isConnected ? 'mongodb' : 'in-memory',
  isPersistent: isConnected,
  host: connectionHost,
  lastError: lastConnectionError
});
const getInMemoryStore = () => inMemoryStore;

module.exports = {
  connectDB,
  getDBMode,
  isDBPersistent,
  getDBDetails,
  getInMemoryStore
};

