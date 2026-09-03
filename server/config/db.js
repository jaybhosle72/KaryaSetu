const mongoose = require('mongoose');

let isConnected = false;
let inMemoryStore = {
  cooperatives: [],
  workers: [],
  bookings: [],
  contracts: [],
  forecasts: [],
  welfareLedger: []
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sahakar_seva';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000 // Fast fail to in-memory mode if mongod isn't running
    });
    isConnected = true;
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}`);
    return { mode: 'mongodb', connection: conn };
  } catch (error) {
    console.warn(`⚠️ [MongoDB Not Detected]: Falling back to High-Performance In-Memory DB for zero-friction hackathon demo. (${error.message})`);
    isConnected = false;
    return { mode: 'in-memory', store: inMemoryStore };
  }
};

const getDBMode = () => isConnected ? 'mongodb' : 'in-memory';
const getInMemoryStore = () => inMemoryStore;

module.exports = {
  connectDB,
  getDBMode,
  getInMemoryStore
};
