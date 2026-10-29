import React from 'react';
import { Activity, ShieldCheck, Cpu, AlertTriangle, Database, Wifi } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isWsConnected, isMongoConnected, onSeedData, isSeeding }) {
  const navItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: Activity },
    { id: 'ml', label: 'AI Fault Detector', icon: Cpu },
    { id: 'alerts', label: 'Safety Events', icon: AlertTriangle }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Product Branding */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-bold text-lg sm:text-xl text-white tracking-wide">
                  VoltSafe <span className="text-emerald-400">IoT</span>
                </span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Li-Ion Guard
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Real-Time Battery Environmental Safety & Automated Response
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status Indicators & Demo Data Action */}
          <div className="flex items-center space-x-2.5">
            {/* MongoDB Atlas status */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isMongoConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950/60 text-amber-400 border-amber-800'
              }`}
              title={isMongoConnected ? 'MongoDB Atlas Connected' : 'Local Store'}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden lg:inline font-semibold">
                {isMongoConnected ? 'Atlas Cloud' : 'Local DB'}
              </span>
            </div>

            {/* Live Telemetry stream badge */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isWsConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Wifi className={`w-3.5 h-3.5 ${isWsConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="hidden sm:inline font-semibold">
                {isWsConnected ? 'ESP32 Stream' : 'Connecting'}
              </span>
            </div>

            {/* Load Test Profile button */}
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl border border-slate-700 font-semibold transition-all hover:border-slate-600"
              title="Preload standard battery sensor dataset for testing"
            >
              {isSeeding ? 'Loading...' : 'Load Sample Stream'}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-800/80">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
