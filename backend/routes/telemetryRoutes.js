const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');
const Alert = require('../models/Alert');
const ActuatorState = require('../models/ActuatorState');
const { isMongoConnected, localStore } = require('../config/db');
const { predictStacking } = require('../ml/stackingClassifier');

/**
 * Handle new incoming telemetry from ESP32, ThingSpeak bridge, or Simulator
 */
router.post('/', async (req, res) => {
  try {
    const { temperature, gasPpm, deviceId = 'ESP32-BATT-01' } = req.body;

    if (temperature === undefined || gasPpm === undefined) {
      return res.status(400).json({ error: 'temperature and gasPpm are required' });
    }

    const tempNum = parseFloat(temperature);
    const gasNum = parseFloat(gasPpm);

    // Run Machine Learning Stacking Classifier inference
    const mlResult = predictStacking(tempNum, gasNum);
    const isAbnormal = mlResult.status === 'ABNORMAL';

    // Fetch current actuator configuration
    let currentActuators;
    if (isMongoConnected()) {
      currentActuators = await ActuatorState.findOne().sort({ lastUpdated: -1 });
    } else {
      currentActuators = localStore.getActuators();
    }

    // Determine actuator response
    // If in AUTO mode, automatically activate safety response when abnormal
    let fanActive = currentActuators?.fan || false;
    let fanSpeed = currentActuators?.fanSpeedRpm || 0;
    let buzzerActive = currentActuators?.buzzer || false;
    let relayClosed = currentActuators?.relayClosed || false;
    let lcdLine1 = `T:${tempNum.toFixed(1)}C G:${Math.round(gasNum)}P`;
    let lcdLine2 = isAbnormal ? 'ALERT: DANGER!' : 'STATUS: NORMAL';

    if (!currentActuators || currentActuators.mode === 'AUTO') {
      if (isAbnormal) {
        fanActive = true;
        fanSpeed = 2800; // max RPM for safety response
        buzzerActive = true;
        relayClosed = true;
        lcdLine2 = tempNum > 34.0 && gasNum > 350
          ? 'EMERGENCY SHUT'
          : (tempNum > 34.0 ? 'TEMP OVERHEAT!' : 'GAS LEAK ALERT');
      } else {
        // Safe condition
        fanActive = false;
        fanSpeed = 0;
        buzzerActive = false;
        relayClosed = false;
        lcdLine2 = 'STATUS: NORMAL';
      }

      // Persist actuator update
      const actuatorPayload = {
        fan: fanActive,
        fanSpeedRpm: fanSpeed,
        buzzer: buzzerActive,
        lcdLine1,
        lcdLine2,
        relayClosed,
        mode: currentActuators?.mode || 'AUTO',
        lastUpdated: new Date()
      };

      if (isMongoConnected()) {
        await ActuatorState.findOneAndUpdate({}, actuatorPayload, { upsert: true, new: true });
      } else {
        localStore.updateActuators(actuatorPayload);
      }
    }

    // Construct telemetry document
    const readingData = {
      deviceId,
      temperature: tempNum,
      gasPpm: gasNum,
      status: mlResult.status,
      anomalyScore: mlResult.anomalyScore,
      classifiers: mlResult.classifiers,
      actuatorsTriggered: {
        fan: fanActive,
        buzzer: buzzerActive,
        lcd: `${lcdLine1} | ${lcdLine2}`,
        relay: relayClosed
      },
      createdAt: new Date()
    };

    let savedTelemetry;
    if (isMongoConnected()) {
      const doc = new Telemetry(readingData);
      savedTelemetry = await doc.save();
    } else {
      savedTelemetry = localStore.saveTelemetry(readingData);
    }

    // Trigger Alert Log if abnormal
    if (isAbnormal) {
      let alertType = 'CRITICAL_HAZARD';
      let message = 'Automated Safety Response Triggered: Stacking Classifier flagged abnormal status.';
      if (tempNum >= 34.0 && gasNum >= 350) {
        alertType = 'CRITICAL_HAZARD';
        message = `Critical Thermal & Gas Runaway Risk! Temp: ${tempNum}°C, Gas: ${gasNum} ppm`;
      } else if (tempNum >= 34.0) {
        alertType = 'OVERHEATING';
        message = `High Battery Temperature Detected! Temp: ${tempNum}°C`;
      } else if (gasNum >= 300) {
        alertType = 'GAS_LEAKAGE';
        message = `Dangerous Combustible Gas Concentration! Gas: ${gasNum} ppm`;
      }

      const alertData = {
        type: alertType,
        severity: tempNum > 35 || gasNum > 500 ? 'CRITICAL' : 'WARNING',
        message,
        temperature: tempNum,
        gasPpm: gasNum,
        actionsTaken: [
          'Stacking Classifier Fault Triggered',
          'Cooling Fan Activated (2800 RPM)',
          'Audible Buzzer Sounded',
          `LCD Warning: "${lcdLine2}"`
        ],
        acknowledged: false,
        createdAt: new Date()
      };

      if (isMongoConnected()) {
        const alertDoc = new Alert(alertData);
        await alertDoc.save();
      } else {
        localStore.saveAlert(alertData);
      }
    }

    // Broadcast through WebSocket if attached to app
    const wss = req.app.get('wss');
    if (wss) {
      const broadcastMsg = JSON.stringify({
        type: 'TELEMETRY_UPDATE',
        data: savedTelemetry,
        actuators: {
          fan: fanActive,
          fanSpeedRpm: fanSpeed,
          buzzer: buzzerActive,
          lcdLine1,
          lcdLine2,
          relayClosed
        }
      });
      wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(broadcastMsg);
      });
    }

    res.status(201).json({
      success: true,
      telemetry: savedTelemetry,
      prediction: mlResult
    });
  } catch (err) {
    console.error('Error processing telemetry:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

/**
 * Get recent telemetry readings (for real-time dashboard charts)
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    let data;
    if (isMongoConnected()) {
      data = await Telemetry.find().sort({ createdAt: -1 }).limit(limit);
      data = data.reverse();
    } else {
      data = localStore.getTelemetries(limit).reverse();
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get aggregated stats for the battery safety dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    let telemetries;
    if (isMongoConnected()) {
      telemetries = await Telemetry.find().sort({ createdAt: -1 }).limit(100);
    } else {
      telemetries = localStore.getTelemetries(100);
    }

    const totalReadings = telemetries.length;
    const abnormalCount = telemetries.filter(t => t.status === 'ABNORMAL').length;
    const normalCount = totalReadings - abnormalCount;
    const temps = telemetries.map(t => t.temperature);
    const gases = telemetries.map(t => t.gasPpm);

    const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : 31.0;
    const maxTemp = temps.length ? Math.max(...temps).toFixed(1) : 31.0;
    const avgGas = gases.length ? Math.round(gases.reduce((a, b) => a + b, 0) / gases.length) : 210;
    const maxGas = gases.length ? Math.round(Math.max(...gases)) : 210;

    res.json({
      totalReadings,
      normalCount,
      abnormalCount,
      safetyIndex: totalReadings > 0 ? (((normalCount) / totalReadings) * 100).toFixed(1) : '100.0',
      avgTemp,
      maxTemp,
      avgGas,
      maxGas
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Seed sample data matching Fig 3 and Fig 4 of the Research Paper
 */
router.post('/seed-paper-dataset', async (req, res) => {
  try {
    // Exact 24 sample points from Figure 3 (Temperature) and Figure 4 (MQ-2 Gas)
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

    const results = [];
    const baseTime = Date.now() - (paperSamples.length * 5000);

    for (let i = 0; i < paperSamples.length; i++) {
      const s = paperSamples[i];
      const ml = predictStacking(s.temp, s.gas);
      const isAbnormal = ml.status === 'ABNORMAL';

      const readingData = {
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
        createdAt: new Date(baseTime + (i * 5000))
      };

      if (isMongoConnected()) {
        const doc = new Telemetry(readingData);
        await doc.save();
      } else {
        localStore.saveTelemetry(readingData);
      }
      results.push(readingData);
    }

    res.json({ success: true, count: results.length, message: 'Seeded Paper Figures 3 & 4 dataset' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
