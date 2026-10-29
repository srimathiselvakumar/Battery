import React, { useState, useEffect } from 'react';
import { Cpu, Send, Radio, AlertOctagon, Flame, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ESP32Simulator({ onTelemetrySent }) {
  const [temp, setTemp] = useState(31.5);
  const [gas, setGas] = useState(215);
  const [deviceId, setDeviceId] = useState('ESP32-NODE-01');
  const [isSending, setIsSending] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  // Preset Scenarios
  const scenarios = [
    {
      name: 'Normal Operation',
      icon: CheckCircle,
      desc: 'Safe operating window (~31°C, ~215 ppm)',
      temp: 31.2,
      gas: 210,
      color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
    },
    {
      name: 'Thermal Overheating',
      icon: Flame,
      desc: 'Overheating fault without gas venting (35.5°C, 225 ppm)',
      temp: 35.5,
      gas: 225,
      color: 'border-rose-500/30 bg-rose-950/20 text-rose-400'
    },
    {
      name: 'Combustible Gas Leak',
      icon: ShieldAlert,
      desc: 'Electrolyte gas venting detected (31.8°C, 620 ppm)',
      temp: 31.8,
      gas: 620,
      color: 'border-amber-500/30 bg-amber-950/20 text-amber-400'
    },
    {
      name: 'Thermal Runaway Risk',
      icon: AlertOctagon,
      desc: 'Severe simultaneous thermal & gas spike (38.2°C, 820 ppm)',
      temp: 38.2,
      gas: 820,
      color: 'border-purple-500/30 bg-purple-950/20 text-purple-400'
    }
  ];

  const handleSendTelemetry = async (customTemp = temp, customGas = gas) => {
    setIsSending(true);
    try {
      const res = await api.sendTelemetry({
        temperature: parseFloat(customTemp),
        gasPpm: parseFloat(customGas),
        deviceId
      });
      setLastResponse(res);
      if (onTelemetrySent) onTelemetrySent(res.telemetry);
    } catch (err) {
      console.error('Failed to send telemetry:', err);
    } finally {
      setIsSending(false);
    }
  };

  const applyScenario = (sc) => {
    setTemp(sc.temp);
    setGas(sc.gas);
    handleSendTelemetry(sc.temp, sc.gas);
  };

  // Auto Simulation Loop
  useEffect(() => {
    let timer;
    if (autoSimulate) {
      timer = setInterval(() => {
        // Generate realistic drift around current values
        const driftT = (Math.random() - 0.48) * 0.4;
        const driftG = (Math.random() - 0.48) * 15;
        setTemp(prev => {
          const next = Math.max(25, Math.min(48, parseFloat((prev + driftT).toFixed(1))));
          return next;
        });
        setGas(prev => {
          const next = Math.max(180, Math.min(880, Math.round(prev + driftG)));
          handleSendTelemetry(temp, next);
          return next;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [autoSimulate, temp, gas]);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-heading font-bold text-slate-100 flex items-center space-x-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <span>ESP32 Hardware Node Simulator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Simulates the physical ESP32 microcontroller reading NTC thermistor & MQ-2 gas sensor telemetry via Wi-Fi
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              autoSimulate
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{autoSimulate ? 'Stop Auto Stream' : 'Live Stream Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Cards */}
      <div>
        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider block mb-2">
          One-Click Test Scenarios (Paper Validations):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.name}
                onClick={() => applyScenario(sc)}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${sc.color}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-heading font-bold text-xs">{sc.name}</span>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <p className="text-[11px] opacity-80 line-clamp-2 mb-2">{sc.desc}</p>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-1.5 border-t border-current/20">
                  <span>{sc.temp}°C</span>
                  <span>{sc.gas} ppm</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Sliders and Transmit Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end pt-2">
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
            Device Identifier
          </label>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-3">
          <div className="flex justify-between text-xs font-semibold uppercase text-slate-400 mb-1">
            <span>NTC Thermistor:</span>
            <span className="text-cyan-400 font-mono">{temp.toFixed(1)}°C</span>
          </div>
          <input
            type="range"
            min="25"
            max="48"
            step="0.1"
            value={temp}
            onChange={(e) => setTemp(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div className="md:col-span-3">
          <div className="flex justify-between text-xs font-semibold uppercase text-slate-400 mb-1">
            <span>MQ-2 Gas Sensor:</span>
            <span className="text-emerald-400 font-mono">{Math.round(gas)} ppm</span>
          </div>
          <input
            type="range"
            min="180"
            max="880"
            step="5"
            value={gas}
            onChange={(e) => setGas(parseInt(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        <div className="md:col-span-3">
          <button
            onClick={() => handleSendTelemetry(temp, gas)}
            disabled={isSending}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 text-xs transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Sending...' : 'Transmit Telemetry to IoT Cloud'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
