const mongoose = require('mongoose');

// In-memory / file fallback storage for environments where MongoDB daemon isn't running
class LocalDatastore {
  constructor() {
    this.telemetries = [];
    this.alerts = [];
    this.actuatorState = {
      fan: false,
      fanSpeedRpm: 0,
      buzzer: false,
      lcdLine1: 'TEMP: 31.0C G:210P',
      lcdLine2: 'SYSTEM: NORMAL',
      relayClosed: false,
      mode: 'AUTO',
      lastUpdated: new Date()
    };
  }

  saveTelemetry(reading) {
    const item = {
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      ...reading,
      createdAt: reading.createdAt || new Date()
    };
    this.telemetries.unshift(item);
    if (this.telemetries.length > 500) this.telemetries.pop();
    return item;
  }

  getTelemetries(limit = 50) {
    return this.telemetries.slice(0, limit);
  }

  saveAlert(alert) {
    const item = {
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      ...alert,
      acknowledged: false,
      createdAt: new Date()
    };
    this.alerts.unshift(item);
    if (this.alerts.length > 200) this.alerts.pop();
    return item;
  }

  getAlerts(limit = 50) {
    return this.alerts.slice(0, limit);
  }

  acknowledgeAlert(id) {
    const found = this.alerts.find(a => a._id === id);
    if (found) found.acknowledged = true;
    return found;
  }

  clearAlerts() {
    this.alerts = [];
    return true;
  }

  getActuators() {
    return { ...this.actuatorState };
  }

  updateActuators(updates) {
    this.actuatorState = {
      ...this.actuatorState,
      ...updates,
      lastUpdated: new Date()
    };
    return this.actuatorState;
  }
}

const localStore = new LocalDatastore();
let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/battery_safety_db';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    isMongoConnected = true;
    const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`[MongoDB Atlas] Connected successfully to: ${sanitizedUri}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[MongoDB Notice] Live MongoDB service not reachable (${err.message}).`);
    console.log(`[MongoDB Fallback] Seamless in-memory datastore activated. All data operations will persist locally during execution.`);
    console.log(`[Info] To connect to MongoDB, ensure mongod is running at ${uri} or set MONGODB_URI in backend/.env`);
  }
};

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  localStore
};
