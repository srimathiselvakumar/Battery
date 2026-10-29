# Battery

VoltSafe IoT — Real-Time Lithium-Ion Battery Safety Monitoring & Automated Protection System.

## Features
- **Real-Time Environmental Monitoring**: Continuously tracks battery temperature (°C) via NTC thermistor and combustible gas concentration (ppm) via MQ-2 sensor.
- **Intelligent Stacking Ensemble Classifier**: High-accuracy (99.1%) anomaly detection combining Decision Tree, Random Forest, KNN, and SVM models.
- **Automated Protective Response Loop**:
  - Relay-controlled Cooling Fan (2800 RPM active thermal mitigation)
  - Piezoelectric Warning Buzzer
  - 16x2 I2C LCD Display
- **Modern Full-Stack Dashboard**:
  - React 18 + Vite + Tailwind CSS + Recharts
  - Dual-sensor live streaming charts
  - Hardware actuator controls and 1-click hazard test scenarios
  - Safety event audit logging
- **Backend & Cloud Database**:
  - Node.js + Express REST API & WebSocket server
  - MongoDB Atlas cloud integration

## Quick Start

### 1. Install & Run Backend
```bash
cd backend
npm install
npm start
```
Server runs at `http://localhost:5000`.

### 2. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Dashboard opens at `http://localhost:3000`.

### 3. Unified Production Mode
```bash
npm start
```
View the live app at `http://localhost:5000`.
