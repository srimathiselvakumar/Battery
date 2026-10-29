import React from 'react';
import { ShieldCheck, ShieldAlert, Wifi, Database, Volume2, VolumeX, Settings, Cpu } from 'lucide-react';

export default function Header({
  isWsConnected,
  isMongoConnected,
  soundEnabled,
  setSoundEnabled,
  onOpenDeviceModal,
  isAbnormal
}) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
              isAbnormal
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 glow-rose animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 glow-emerald'
            }`}>
              {isAbnormal ? (
                <ShieldAlert className="w-7 h-7 text-rose-400" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-wide text-white">
                  VoltSafe <span className="text-emerald-400">IoT</span>
                </h1>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Li-ion Guard
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Real-Time Battery Environmental Safety & Automated Response
              </p>
            </div>
          </div>

          {/* Quick Status Badges & Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {/* MongoDB Atlas Status */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isMongoConnected
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80'
                  : 'bg-amber-950/40 text-amber-400 border-amber-800/80'
              }`}
              title={isMongoConnected ? 'MongoDB Atlas Connected' : 'Local Fallback Store'}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-semibold">
                {isMongoConnected ? 'Atlas Synced' : 'Local DB'}
              </span>
            </div>

            {/* Live ESP32 Stream Status */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isWsConnected
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="hidden sm:inline font-semibold">
                {isWsConnected ? 'ESP32 Live' : 'Connecting'}
              </span>
            </div>

            {/* Acoustic Buzzer Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                soundEnabled
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              title={soundEnabled ? 'Acoustic buzzer tone enabled' : 'Buzzer audio muted'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-rose-400 animate-bounce" />
                  <span className="hidden lg:inline font-semibold">Alarm Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden lg:inline">Audio Muted</span>
                </>
              )}
            </button>

            {/* Device / Hardware Guide Modal Button */}
            <button
              onClick={onOpenDeviceModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all hover:border-slate-700"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">ESP32 Device</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
