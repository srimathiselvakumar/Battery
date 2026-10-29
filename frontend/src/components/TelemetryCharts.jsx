import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Activity, Layers, Thermometer, Wind } from 'lucide-react';

export default function TelemetryCharts({ history = [] }) {
  const [chartView, setChartView] = useState('split'); // 'split' | 'combined'

  // Prepare chart-ready data points
  const chartData = history.map((item, idx) => ({
    sample: item.sample || idx + 1,
    time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperature: parseFloat(item.temperature),
    gasPpm: Math.round(item.gasPpm),
    status: item.status,
    anomalyScore: item.anomalyScore ? parseFloat((item.anomalyScore * 100).toFixed(1)) : 0
  }));

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* Header and View Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h2 className="text-xl font-heading font-bold text-white flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <span>Real-Time Environmental Telemetry Stream</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Continuous sensor telemetry for battery temperature and combustible gas concentration
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setChartView('split')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartView === 'split' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dual Sensor View</span>
          </button>
          <button
            onClick={() => setChartView('combined')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartView === 'combined' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Combined Timeline</span>
          </button>
        </div>
      </div>

      {chartView === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Stream */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">
                      Battery Temperature (°C)
                    </h3>
                    <p className="text-[11px] text-slate-400">NTC Thermistor Sensor Readings</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded-lg">
                  Safety Limit: 33.5°C
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="sample"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Sample Number', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 10 }}
                    />
                    <YAxis
                      domain={[28, 38]}
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', offset: 25, fill: '#64748b', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                      labelFormatter={(val) => `Sample #${val}`}
                    />
                    <ReferenceLine y={33.5} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Warn 33.5°C', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      name="Temperature (°C)"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ fill: '#0284c7', r: 3, strokeWidth: 1.5, stroke: '#38bdf8' }}
                      activeDot={{ r: 6, fill: '#38bdf8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
              <span>Nominal Operating: <b>25°C - 33°C</b></span>
              <span className="text-cyan-400 font-mono">Live Sync Active</span>
            </div>
          </div>

          {/* Gas Concentration Stream */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">
                      Combustible Gas Concentration (ppm)
                    </h3>
                    <p className="text-[11px] text-slate-400">MQ-2 Combustible Gas Sensor</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg">
                  Clean Base: ~200 ppm
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="sample"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Sample Number', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 10 }}
                    />
                    <YAxis
                      domain={[150, 900]}
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Gas (ppm)', angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                      labelFormatter={(val) => `Sample #${val}`}
                    />
                    <ReferenceLine y={280} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Threshold 280 ppm', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                    <Area
                      type="monotone"
                      dataKey="gasPpm"
                      name="Gas Level (ppm)"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#gasGradient)"
                      dot={{ fill: '#059669', r: 3, strokeWidth: 1.5, stroke: '#10b981' }}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
              <span>Vent Alert Threshold: <b>&gt; 280 ppm</b></span>
              <span className="text-emerald-400 font-mono">Live Sync Active</span>
            </div>
          </div>
        </div>
      ) : (
        /* Combined Dual-Axis Live Chart */
        <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">
              Synchronized Dual-Sensor Timeline
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Temperature (Left °C) vs Gas Concentration (Right ppm)
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#38bdf8" fontSize={11} domain={[25, 45]} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} domain={[150, 950]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="gasPpm"
                  name="Gas Concentration (ppm)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
