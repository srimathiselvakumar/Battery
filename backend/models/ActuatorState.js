const mongoose = require('mongoose');

const ActuatorStateSchema = new mongoose.Schema({
  fan: {
    type: Boolean,
    default: false
  },
  fanSpeedRpm: {
    type: Number,
    default: 0
  },
  buzzer: {
    type: Boolean,
    default: false
  },
  lcdLine1: {
    type: String,
    default: 'TEMP: 31.0C G:210P'
  },
  lcdLine2: {
    type: String,
    default: 'STATUS: NORMAL'
  },
  relayClosed: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    enum: ['AUTO', 'MANUAL'],
    default: 'AUTO'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActuatorState', ActuatorStateSchema);
