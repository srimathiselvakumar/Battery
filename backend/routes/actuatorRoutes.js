const express = require('express');
const router = express.Router();
const ActuatorState = require('../models/ActuatorState');
const { isMongoConnected, localStore } = require('../config/db');

/**
 * Get current actuator states (Fan, Buzzer, LCD, Relay, Mode)
 */
router.get('/', async (req, res) => {
  try {
    let actuators;
    if (isMongoConnected()) {
      actuators = await ActuatorState.findOne().sort({ lastUpdated: -1 });
      if (!actuators) {
        actuators = await ActuatorState.create({
          fan: false,
          fanSpeedRpm: 0,
          buzzer: false,
          lcdLine1: 'TEMP: 31.0C G:210P',
          lcdLine2: 'SYSTEM: NORMAL',
          relayClosed: false,
          mode: 'AUTO'
        });
      }
    } else {
      actuators = localStore.getActuators();
    }
    res.json(actuators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Manual override actuator control (Fan toggle, Buzzer silence, Mode change)
 */
router.post('/control', async (req, res) => {
  try {
    const { fan, fanSpeedRpm, buzzer, lcdLine1, lcdLine2, relayClosed, mode } = req.body;
    const updates = {};
    if (fan !== undefined) updates.fan = Boolean(fan);
    if (fanSpeedRpm !== undefined) updates.fanSpeedRpm = Number(fanSpeedRpm);
    if (buzzer !== undefined) updates.buzzer = Boolean(buzzer);
    if (lcdLine1 !== undefined) updates.lcdLine1 = String(lcdLine1);
    if (lcdLine2 !== undefined) updates.lcdLine2 = String(lcdLine2);
    if (relayClosed !== undefined) updates.relayClosed = Boolean(relayClosed);
    if (mode !== undefined) updates.mode = mode;
    updates.lastUpdated = new Date();

    let updated;
    if (isMongoConnected()) {
      updated = await ActuatorState.findOneAndUpdate({}, updates, { upsert: true, new: true });
    } else {
      updated = localStore.updateActuators(updates);
    }

    // Broadcast to WebSocket clients
    const wss = req.app.get('wss');
    if (wss) {
      const msg = JSON.stringify({ type: 'ACTUATOR_UPDATE', data: updated });
      wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(msg);
      });
    }

    res.json({ success: true, actuators: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Reset all actuators to Safe/Idle state
 */
router.post('/reset', async (req, res) => {
  try {
    const safeState = {
      fan: false,
      fanSpeedRpm: 0,
      buzzer: false,
      lcdLine1: 'TEMP: 31.0C G:210P',
      lcdLine2: 'STATUS: NORMAL',
      relayClosed: false,
      mode: 'AUTO',
      lastUpdated: new Date()
    };

    let updated;
    if (isMongoConnected()) {
      updated = await ActuatorState.findOneAndUpdate({}, safeState, { upsert: true, new: true });
    } else {
      updated = localStore.updateActuators(safeState);
    }

    const wss = req.app.get('wss');
    if (wss) {
      const msg = JSON.stringify({ type: 'ACTUATOR_UPDATE', data: updated });
      wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(msg);
      });
    }

    res.json({ success: true, message: 'Actuators reset to safe standby mode', actuators: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
