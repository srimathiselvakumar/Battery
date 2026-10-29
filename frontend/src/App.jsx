import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import LiveTelemetryCards from './components/LiveTelemetryCards';
import ActuatorControlPanel from './components/ActuatorControlPanel';
import TelemetryCharts from './components/TelemetryCharts';
import ESP32Simulator from './components/ESP32Simulator';
import MLClassifierView from './components/MLClassifierView';
import AlertsLogTable from './components/AlertsLogTable';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [latestTelemetry, setLatestTelemetry] = useState(null);
  const [stats, setStats] = useState(null);
  const [actuators, setActuators] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isMongoConnected, setIsMongoConnected] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const wsRef = useRef(null);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      const [historyData, statsData, actuatorsData, alertsData, healthData] = await Promise.all([
        api.getRecentTelemetry(35),
        api.getStats(),
        api.getActuators(),
        api.getAlerts(50),
        api.getHealth()
      ]);

      setTelemetryHistory(historyData);
      if (historyData.length > 0) {
        setLatestTelemetry(historyData[historyData.length - 1]);
      }
      setStats(statsData);
      setActuators(actuatorsData);
      setAlerts(alertsData);
      setIsMongoConnected(healthData.mongoConnected);
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // WebSocket live connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:5000`;

    function connectWs() {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'TELEMETRY_UPDATE') {
              setLatestTelemetry(msg.data);
              setTelemetryHistory(prev => {
                const next = [...prev, msg.data];
                return next.slice(-40); // keep last 40 items in view
              });
              if (msg.actuators) {
                setActuators(prev => ({ ...prev, ...msg.actuators }));
              }
              // Refresh stats & alerts on change
              api.getStats().then(setStats).catch(() => {});
              api.getAlerts().then(setAlerts).catch(() => {});
            } else if (msg.type === 'ACTUATOR_UPDATE') {
              setActuators(msg.data);
            } else if (msg.type === 'CONNECTION_INIT') {
              if (msg.actuators) setActuators(msg.actuators);
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          setIsWsConnected(false);
          // Reconnect after 3s
          setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          setIsWsConnected(false);
        };
      } catch (err) {
        setIsWsConnected(false);
        setTimeout(connectWs, 3000);
      }
    }

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Actuator Handlers
  const handleControlActuator = async (payload) => {
    try {
      const res = await api.controlActuators(payload);
      if (res.actuators) setActuators(res.actuators);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetActuators = async () => {
    try {
      const res = await api.resetActuators();
      if (res.actuators) setActuators(res.actuators);
    } catch (e) {
      console.error(e);
    }
  };

  // Seed IEEE Paper Figures 3 & 4 Dataset
  const handleSeedPaperData = async () => {
    setIsSeeding(true);
    try {
      await api.seedPaperDataset();
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearAlerts = async () => {
    try {
      await api.clearAlerts();
      setAlerts([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWsConnected={isWsConnected}
        isMongoConnected={isMongoConnected}
        onSeedData={handleSeedPaperData}
        isSeeding={isSeeding}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Render Tab Contents */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <LiveTelemetryCards latest={latestTelemetry} stats={stats} />

            {/* Actuators: LCD, Fan, Buzzer, Relay */}
            <ActuatorControlPanel
              actuators={actuators}
              onControl={handleControlActuator}
              onReset={handleResetActuators}
            />

            {/* Telemetry Charts (Fig 3 & Fig 4 from Paper) */}
            <TelemetryCharts history={telemetryHistory} />

            {/* Hardware Node Simulator */}
            <ESP32Simulator
              onTelemetrySent={(telemetry) => {
                setLatestTelemetry(telemetry);
                setTelemetryHistory(prev => [...prev.slice(-39), telemetry]);
                api.getStats().then(setStats).catch(() => {});
                api.getAlerts().then(setAlerts).catch(() => {});
              }}
            />
          </div>
        )}

        {activeTab === 'ml' && (
          <MLClassifierView />
        )}

        {activeTab === 'alerts' && (
          <AlertsLogTable
            alerts={alerts}
            onAlertUpdated={() => api.getAlerts().then(setAlerts)}
            onClearAlerts={handleClearAlerts}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1.5">
          <p className="font-semibold text-slate-300 tracking-wide text-sm">
            VoltSafe IoT • Real-Time Lithium-Ion Battery Safety Monitoring & Protection
          </p>
          <p className="text-slate-500">
            Automated Environmental Fault Detection, Thermal Runaway Prevention, and Hardware Response System
          </p>
          <p className="text-[11px] text-slate-600 font-mono">
            React 18 • Node.js Express • MongoDB Atlas • ESP32 Hardware Streaming
          </p>
        </div>
      </footer>
    </div>
  );
}
