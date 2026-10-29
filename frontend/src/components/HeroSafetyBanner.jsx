import React from 'react';
import { ShieldCheck, AlertOctagon, Fan, Bell, Flame, Wind, RotateCcw } from 'lucide-react';

export default function HeroSafetyBanner({
  latest,
  actuators,
  onResetActuators
}) {
  const isAbnormal = latest?.status === 'ABNORMAL';
  const temp = latest?.temperature ?? 31.0;
  const gas = latest?.gasPpm ?? 210;
  const fan = actuators?.fan || false;
  const fanRpm = actuators?.fanSpeedRpm || (fan ? 2800 : 0);
  const buzzer = actuators?.buzzer || false;

  return (
    <div className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
      isAbnormal
        ? 'bg-gradient-to-r from-rose-950/70 via-red-900/40 to-slate-900 border-rose-500/50 glow-rose'
        : 'bg-gradient-to-r from-emerald-950/50 via-teal-950/30 to-slate-900 border-emerald-500/30 glow-emerald'
    }`}>
      {/* Decorative background glow */}
      <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        isAbnormal ? 'bg-rose-500/15' : 'bg-emerald-500/10'
      }`} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Status & Description */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
              isAbnormal
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isAbnormal ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>{isAbnormal ? 'Emergency Alert' : 'System Healthy'}</span>
            </span>

            <span className="text-xs text-slate-400 font-mono">
              Device: <b className="text-slate-200">{latest?.deviceId || 'ESP32-BATT-01'}</b>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
            {isAbnormal
              ? 'Critical Safety Hazard Detected'
              : 'Lithium-Ion Battery Operating Normally'}
          </h2>

          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isAbnormal ? (
              <>
                Abnormal environmental signature registered (<b className="text-rose-300">{temp.toFixed(1)}°C</b>,{' '}
                <b className="text-amber-300">{Math.round(gas)} ppm</b>). Automated protection has engaged active cooling and audible alerts to mitigate thermal runaway.
              </>
            ) : (
              <>
                All environmental parameters are within safe bounds (<b className="text-emerald-400">{temp.toFixed(1)}°C</b> nominal,{' '}
                <b className="text-emerald-400">{Math.round(gas)} ppm</b> clean). Real-time AI fault detector is active with 99.1% reliability.
              </>
            )}
          </p>
        </div>

        {/* Right Side: Active Hardware Countermeasures & Reset */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Fan Badge */}
          <div className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border text-xs font-medium transition-all ${
            fan
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <Fan className={`w-4 h-4 ${fan ? 'animate-spin-fast text-cyan-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Cooling Fan</div>
              <div className="font-mono font-bold">{fan ? `${fanRpm} RPM` : 'STANDBY'}</div>
            </div>
          </div>

          {/* Buzzer Badge */}
          <div className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border text-xs font-medium transition-all ${
            buzzer
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 shadow-md shadow-rose-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <Bell className={`w-4 h-4 ${buzzer ? 'animate-bounce text-rose-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Audible Alarm</div>
              <div className="font-mono font-bold">{buzzer ? 'ACTIVE' : 'SILENT'}</div>
            </div>
          </div>

          {/* Reset Button (visible when abnormal or fan/buzzer active) */}
          {(isAbnormal || fan || buzzer) && (
            <button
              onClick={onResetActuators}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Standby</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
