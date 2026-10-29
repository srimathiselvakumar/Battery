const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['OVERHEATING', 'GAS_LEAKAGE', 'CRITICAL_HAZARD', 'WARNING'],
    default: 'WARNING'
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'WARNING'
  },
  message: {
    type: String,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  gasPpm: {
    type: Number,
    required: true
  },
  actionsTaken: [{
    type: String
  }],
  acknowledged: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Alert', AlertSchema);
