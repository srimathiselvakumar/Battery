const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB, isMongoConnected, localStore } = require('./config/db');
const telemetryRoutes = require('./routes/telemetryRoutes');
const actuatorRoutes = require('./routes/actuatorRoutes');
const alertsRoutes = require('./routes/alertsRoutes');
const mlRoutes = require('./routes/mlRoutes');
const thingspeakRoutes = require('./routes/thingspeakRoutes');
const Telemetry = require('./models/Telemetry');
const { predictStacking } = require('./ml/stackingClassifier');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Attach wss to app instance for broadcast access
app.set('wss', wss);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WebSocket handling
wss.on('connection', ws => {
  // Send current actuator state immediately on connect
  const currentActuators = localStore.getActuators();
  ws.send(JSON.stringify({
    type: 'CONNECTION_INIT',
    actuators: currentActuators,
    message: 'Connected to Li-ion Battery Safety Real-time Telemetry Service'
  }));

  ws.on('message', message => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch (e) {}
  });
});

// Mount Routes
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/actuators', actuatorRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/ml', mlRoutes);
app.use('/update', thingspeakRoutes);
app.use('/api/thingspeak', thingspeakRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'VoltSafe IoT Real-Time Lithium-Ion Battery Safety Monitoring',
    framework: 'React + Node.js/Express + MongoDB',
    mongoConnected: isMongoConnected(),
    wsClients: wss.clients.size,
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if exists
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/update')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// Seed sample data matching Fig 3 and Fig 4 of the paper on startup if empty
async function initDataset() {
  const paperSamples = [
    { sample: 1, temp: 31.0, gas: 200 },
    { sample: 2, temp: 31.8, gas: 205 },
    { sample: 3, temp: 35.1, gas: 215 },
    { sample: 4, temp: 33.9, gas: 220 },
    { sample: 5, temp: 33.1, gas: 218 },
    { sample: 6, temp: 32.0, gas: 225 },
    { sample: 7, temp: 31.9, gas: 230 },
    { sample: 8, temp: 33.0, gas: 228 },
    { sample: 9, temp: 33.9, gas: 235 },
    { sample: 10, temp: 32.8, gas: 240 },
    { sample: 11, temp: 31.5, gas: 242 },
    { sample: 12, temp: 30.5, gas: 250 },
    { sample: 13, temp: 34.0, gas: 260 },
    { sample: 14, temp: 33.0, gas: 280 },
    { sample: 15, temp: 31.0, gas: 310 },
    { sample: 16, temp: 32.0, gas: 350 },
    { sample: 17, temp: 33.2, gas: 380 },
    { sample: 18, temp: 34.0, gas: 430 },
    { sample: 19, temp: 32.1, gas: 490 },
    { sample: 20, temp: 31.6, gas: 550 },
    { sample: 21, temp: 30.2, gas: 680 },
    { sample: 22, temp: 30.8, gas: 750 },
    { sample: 23, temp: 34.8, gas: 830 },
    { sample: 24, temp: 35.2, gas: 860 }
  ];

  const baseTime = Date.now() - (paperSamples.length * 15000);

  for (let i = 0; i < paperSamples.length; i++) {
    const s = paperSamples[i];
    const ml = predictStacking(s.temp, s.gas);
    const isAbnormal = ml.status === 'ABNORMAL';

    const item = {
      deviceId: 'ESP32-BATT-01',
      temperature: s.temp,
      gasPpm: s.gas,
      status: ml.status,
      anomalyScore: ml.anomalyScore,
      classifiers: ml.classifiers,
      actuatorsTriggered: {
        fan: isAbnormal,
        buzzer: isAbnormal,
        lcd: `T:${s.temp}C G:${s.gas}P | ${isAbnormal ? 'ALERT: DANGER' : 'NORMAL'}`,
        relay: isAbnormal
      },
      createdAt: new Date(baseTime + (i * 15000))
    };

    if (isMongoConnected()) {
      try {
        const count = await Telemetry.countDocuments();
        if (count < 10) {
          await Telemetry.create(item);
        }
      } catch (err) {}
    } else {
      localStore.saveTelemetry(item);
    }
  }
}

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  initDataset();
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`[IoT Battery Safety Server] Running on http://localhost:${PORT}`);
    console.log(`[WebSocket] Live telemetry channel active`);
    console.log(`[ThingSpeak API] Endpoint available at http://localhost:${PORT}/update`);
    console.log(`=======================================================`);
  });
});
