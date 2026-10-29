const API_BASE = '/api';

export const api = {
  // Telemetry
  async getRecentTelemetry(limit = 30) {
    const res = await fetch(`${API_BASE}/telemetry/recent?limit=${limit}`);
    return res.json();
  },

  async sendTelemetry(data) {
    const res = await fetch(`${API_BASE}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/telemetry/stats`);
    return res.json();
  },

  async seedPaperDataset() {
    const res = await fetch(`${API_BASE}/telemetry/seed-paper-dataset`, {
      method: 'POST'
    });
    return res.json();
  },

  // Actuators
  async getActuators() {
    const res = await fetch(`${API_BASE}/actuators`);
    return res.json();
  },

  async controlActuators(payload) {
    const res = await fetch(`${API_BASE}/actuators/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async resetActuators() {
    const res = await fetch(`${API_BASE}/actuators/reset`, {
      method: 'POST'
    });
    return res.json();
  },

  // Alerts
  async getAlerts(limit = 50) {
    const res = await fetch(`${API_BASE}/alerts?limit=${limit}`);
    return res.json();
  },

  async acknowledgeAlert(id) {
    const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
      method: 'PATCH'
    });
    return res.json();
  },

  async clearAlerts() {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Machine Learning
  async getMLBenchmarks() {
    const res = await fetch(`${API_BASE}/ml/benchmarks`);
    return res.json();
  },

  async testMLPrediction(temperature, gasPpm) {
    const res = await fetch(`${API_BASE}/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperature, gasPpm })
    });
    return res.json();
  },

  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }
};
