import React from 'react';
import { Thermometer, Wind, AlertCircle, CheckCircle2, Shield, Flame } from 'lucide-react';

export default function LiveTelemetryCards({ latest, stats }) {
  const temp = latest?.temperature ?? 31.0;
  const gas = latest?.gasPpm ?? 210;
  const status = latest?.status ?? 'NORMAL';
  const anomalyScore = latest?.anomalyScore ?? 0.04;
  const isAbnormal = status === 'ABNORMAL';

  // Paper thresholds:
  // Normal Temp: ~30 - 33.5°C, Warning: >33.5°C, Hazardous: >=34.5°C
  // Normal Gas: 180 - 250 ppm, Warning: >260 ppm, Hazardous: >=320 ppm
  const isTempHigh = temp >= 34.0;
  const isGasHigh = gas >= 300;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Temperature Card (NTC Thermistor) */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isTempHigh
          ? 'bg-rose-950/30 border-rose-500/40 glow-rose'
          : 'bg-slate-900/70 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-xl ${isTempHigh ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400">Battery Temperature</span>
              <p className="text-[11px] text-slate-500">NTC Thermistor</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
            isTempHigh ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
          }`}>
            {isTempHigh ? 'OVERHEATING' : 'OPTIMAL'}
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-extrabold font-heading text-slate-100 tracking-tight">
            {Number(temp).toFixed(1)}
          </span>
          <span className="text-xl font-medium text-slate-400">°C</span>
        </div>

        {/* Progress Bar with safe limit indicator */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>25°C</span>
            <span className="text-amber-400 font-mono">Safe Limit: 33.5°C</span>
            <span>50°C</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                temp > 35 ? 'bg-rose-500' : temp > 33.5 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, ((temp - 25) / 25) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Gas Concentration Card (MQ-2 Gas Sensor) */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isGasHigh
          ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-500/10'
          : 'bg-slate-900/70 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-xl ${isGasHigh ? 'bg-amber-500/20 text-amber-400' : 'bg-teal-500/20 text-teal-400'}`}>
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400">Combustible Gas</span>
              <p className="text-[11px] text-slate-500">MQ-2 Gas Sensor</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
            isGasHigh ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
          }`}>
            {isGasHigh ? 'GAS DETECTED' : 'CLEAN'}
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-extrabold font-heading text-slate-100 tracking-tight">
            {Math.round(gas)}
          </span>
          <span className="text-xl font-medium text-slate-400">ppm</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>200 ppm</span>
            <span className="text-amber-400 font-mono">Warn: &gt;280 ppm</span>
            <span>900 ppm</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                gas > 500 ? 'bg-rose-500' : gas > 280 ? 'bg-amber-500' : 'bg-teal-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, ((gas - 200) / 700) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Stacking Classifier Safety Status */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isAbnormal
          ? 'bg-rose-950/40 border-rose-500/50 glow-rose animate-pulse-alarm'
          : 'bg-emerald-950/30 border-emerald-500/40 glow-emerald'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-xl ${isAbnormal ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isAbnormal ? <Flame className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400">AI Safety Decision</span>
              <p className="text-[11px] text-slate-500">Stacking Classifier (99.1%)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isAbnormal ? (
            <AlertCircle className="w-8 h-8 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          )}
          <span className={`text-2xl font-black font-heading tracking-wide ${
            isAbnormal ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {isAbnormal ? 'ABNORMAL FAULT' : 'NORMAL / SAFE'}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <span>Anomaly Probability:</span>
          <span className={`font-mono font-bold ${isAbnormal ? 'text-rose-400' : 'text-emerald-400'}`}>
            {(anomalyScore * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 4. Safety Reliability Index */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400">Fleet Reliability</span>
              <p className="text-[11px] text-slate-500">Logged Telemetries</p>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
            {stats?.totalReadings || 0} Samples
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-extrabold font-heading text-slate-100 tracking-tight">
            {stats?.safetyIndex || '100.0'}
          </span>
          <span className="text-xl font-medium text-slate-400">%</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Normal: <b className="text-emerald-400">{stats?.normalCount ?? 0}</b></span>
          <span>Abnormal: <b className="text-rose-400">{stats?.abnormalCount ?? 0}</b></span>
        </div>
      </div>
    </div>
  );
}
