import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Trash2, BellOff, Clock, Flame, Wind } from 'lucide-react';
import { api } from '../services/api';

export default function AlertsLogTable({ alerts = [], onAlertUpdated, onClearAlerts }) {
  const [filter, setFilter] = useState('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'WARNING') return a.severity === 'WARNING';
    if (filter === 'UNACK') return !a.acknowledged;
    return true;
  });

  const handleAcknowledge = async (id) => {
    try {
      await api.acknowledgeAlert(id);
      if (onAlertUpdated) onAlertUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-heading font-bold text-slate-100 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>Automated Safety Response Event Log</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time audit trail of lithium-ion battery anomalies detected by the Stacking Classifier
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filters */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'CRITICAL', 'WARNING', 'UNACK'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filter === f ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Clear button */}
          <button
            onClick={onClearAlerts}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500/50" />
          <p className="text-sm font-medium text-slate-400">No abnormal safety hazards detected</p>
          <p className="text-xs">All lithium-ion battery cells operating within standard parameters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Severity</th>
                <th className="py-2.5 px-3 font-semibold">Hazard Event</th>
                <th className="py-2.5 px-3 font-semibold">Telemetry Data</th>
                <th className="py-2.5 px-3 font-semibold">Automated Actions Taken</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredAlerts.map((alert) => {
                const isCritical = alert.severity === 'CRITICAL';
                return (
                  <tr key={alert._id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[9px] text-slate-600 block">{new Date(alert.createdAt).toLocaleDateString()}</span>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>

                    {/* Message */}
                    <td className="py-3 px-3 font-sans text-slate-200">
                      <div className="flex items-center space-x-1.5 font-semibold text-xs">
                        {alert.type === 'OVERHEATING' && <Flame className="w-3.5 h-3.5 text-rose-400 inline" />}
                        {alert.type === 'GAS_LEAKAGE' && <Wind className="w-3.5 h-3.5 text-amber-400 inline" />}
                        <span>{alert.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">{alert.message}</p>
                    </td>

                    {/* Telemetry at fault */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      <div>Temp: <b className="text-rose-400">{alert.temperature}°C</b></div>
                      <div>Gas: <b className="text-amber-400">{alert.gasPpm} ppm</b></div>
                    </td>

                    {/* Actions Taken */}
                    <td className="py-3 px-3 font-sans">
                      <div className="flex flex-wrap gap-1">
                        {alert.actionsTaken?.map((act, i) => (
                          <span key={i} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
                            {act}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Acknowledge */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {alert.acknowledged ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Acknowledged</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcknowledge(alert._id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[11px] border border-slate-700 font-sans hover:text-white transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
