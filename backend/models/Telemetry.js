const mongoose = require('mongoose');

const TelemetrySchema = new mongoose.Schema({
  deviceId: {
    type: String,
    default: 'ESP32-BATT-01'
  },
  temperature: {
    type: Number,
    required: true
  },
  gasPpm: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['NORMAL', 'ABNORMAL'],
    required: true
  },
  anomalyScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  classifiers: {
    decisionTree: { type: String, enum: ['NORMAL', 'ABNORMAL'] },
    randomForest: { type: String, enum: ['NORMAL', 'ABNORMAL'] },
    knn: { type: String, enum: ['NORMAL', 'ABNORMAL'] },
    svm: { type: String, enum: ['NORMAL', 'ABNORMAL'] },
    stacking: { type: String, enum: ['NORMAL', 'ABNORMAL'] }
  },
  actuatorsTriggered: {
    fan: { type: Boolean, default: false },
    buzzer: { type: Boolean, default: false },
    lcd: { type: String, default: '' },
    relay: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Telemetry', TelemetrySchema);
