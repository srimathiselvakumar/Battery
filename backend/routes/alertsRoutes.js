const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { isMongoConnected, localStore } = require('../config/db');

/**
 * Get all safety alerts
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    let alerts;
    if (isMongoConnected()) {
      alerts = await Alert.find().sort({ createdAt: -1 }).limit(limit);
    } else {
      alerts = localStore.getAlerts(limit);
    }
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Acknowledge an alert
 */
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    let alert;
    if (isMongoConnected()) {
      alert = await Alert.findByIdAndUpdate(id, { acknowledged: true }, { new: true });
    } else {
      alert = localStore.acknowledgeAlert(id);
    }
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Clear alert history
 */
router.delete('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      await Alert.deleteMany({});
    } else {
      localStore.clearAlerts();
    }
    res.json({ success: true, message: 'Alert history cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
