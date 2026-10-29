import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Cpu, Award, Zap, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { api } from '../services/api';

export default function MLClassifierView() {
  const [testTemp, setTestTemp] = useState(34.5);
  const [testGas, setTestGas] = useState(380);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const benchmarkData = [
    { algorithm: 'Decision Tree', accuracy: 94.8, precision: 94.1, recall: 93.8, f1Score: 93.9, isProposed: false },
    { algorithm: 'Random Forest', accuracy: 96.7, precision: 96.3, recall: 95.9, f1Score: 96.1, isProposed: false },
    { algorithm: 'KNN', accuracy: 95.5, precision: 95.2, recall: 94.8, f1Score: 95.0, isProposed: false },
    { algorithm: 'SVM', accuracy: 97.2, precision: 97.0, recall: 96.8, f1Score: 96.9, isProposed: false },
    { algorithm: 'Stacking Classifier', accuracy: 99.1, precision: 98.9, recall: 98.8, f1Score: 98.8, isProposed: true }
  ];

  const handleRunInference = async () => {
    setIsPredicting(true);
    try {
      const res = await api.testMLPrediction(parseFloat(testTemp), parseFloat(testGas));
      setPredictionResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Cpu className="w-6 h-6" />
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
                Intelligent Stacking Ensemble Engine
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Combines predictions from multiple machine learning classifiers via a meta-learner to achieve <b>99.1% fault classification accuracy</b> for battery temperature and combustible gas anomalies.
            </p>
          </div>

          <div className="flex items-center space-x-3.5 bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 shrink-0">
            <Award className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Classification Accuracy</div>
              <div className="text-2xl font-black font-heading text-emerald-400">99.1%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Benchmark Comparison + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grouped Bar Chart */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-heading font-bold text-white">
                Model Performance Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Comparative metrics across Accuracy, Precision, Recall, and F1-Score (%)
              </p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg">
              Ensemble Top Ranked
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="algorithm" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(value) => [`${value}%`]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="accuracy" name="Accuracy" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="precision" name="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" name="Recall" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1Score" name="F1 Score" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Algorithm Table & Confusion Matrix */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-base font-heading font-bold text-white">
                Classifier Metrics Table
              </h3>
              <span className="text-xs text-slate-400 font-mono">N = 1000 Validation Samples</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Model</th>
                    <th className="py-2.5 px-2 font-semibold text-center">Acc</th>
                    <th className="py-2.5 px-2 font-semibold text-center">Prec</th>
                    <th className="py-2.5 px-2 font-semibold text-center">Rec</th>
                    <th className="py-2.5 px-2 font-semibold text-center">F1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {benchmarkData.map((row) => (
                    <tr
                      key={row.algorithm}
                      className={row.isProposed ? 'bg-emerald-950/40 font-bold text-emerald-300' : 'text-slate-300'}
                    >
                      <td className="py-2.5 px-3 font-sans flex items-center space-x-1.5">
                        {row.isProposed && <Award className="w-3.5 h-3.5 text-emerald-400 inline" />}
                        <span>{row.algorithm}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">{row.accuracy.toFixed(1)}%</td>
                      <td className="py-2.5 px-2 text-center">{row.precision.toFixed(1)}%</td>
                      <td className="py-2.5 px-2 text-center">{row.recall.toFixed(1)}%</td>
                      <td className="py-2.5 px-2 text-center">{row.f1Score.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2.5">
              Ensemble Confusion Matrix
            </span>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-emerald-950/50 border border-emerald-500/30 p-2.5 rounded-xl">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">True Positive (TP)</div>
                <div className="text-lg font-bold font-mono text-emerald-300">494</div>
                <div className="text-[10px] text-slate-400">Fault Correctly Flagged</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-[10px] text-rose-400 font-bold uppercase">False Positive (FP)</div>
                <div className="text-lg font-bold font-mono text-rose-300">3</div>
                <div className="text-[10px] text-slate-400">False Alarm</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-[10px] text-amber-400 font-bold uppercase">False Negative (FN)</div>
                <div className="text-lg font-bold font-mono text-amber-300">6</div>
                <div className="text-[10px] text-slate-400">Missed Fault</div>
              </div>
              <div className="bg-emerald-950/50 border border-emerald-500/30 p-2.5 rounded-xl">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">True Negative (TN)</div>
                <div className="text-lg font-bold font-mono text-emerald-300">497</div>
                <div className="text-[10px] text-slate-400">Safe Correctly Flagged</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Inference Sandbox */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-heading font-bold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Real-Time Inference Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400">
              Test custom temperature and gas levels to evaluate multi-model voting and final ensemble decision
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Temperature Slider */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Temperature (°C): <span className="text-emerald-400 font-mono text-sm">{testTemp}°C</span>
            </label>
            <input
              type="range"
              min="24"
              max="50"
              step="0.1"
              value={testTemp}
              onChange={(e) => setTestTemp(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>24°C (Safe)</span>
              <span>33.5°C (Threshold)</span>
              <span>50°C (Hazard)</span>
            </div>
          </div>

          {/* Gas Slider */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Gas Concentration (ppm): <span className="text-emerald-400 font-mono text-sm">{testGas} ppm</span>
            </label>
            <input
              type="range"
              min="180"
              max="900"
              step="5"
              value={testGas}
              onChange={(e) => setTestGas(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>180 ppm (Clean)</span>
              <span>280 ppm (Warning)</span>
              <span>900 ppm (Critical)</span>
            </div>
          </div>

          {/* Execute Button */}
          <div>
            <button
              onClick={handleRunInference}
              disabled={isPredicting}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isPredicting ? 'Evaluating...' : 'Run Ensemble Decision'}</span>
            </button>
          </div>
        </div>

        {/* Prediction Output */}
        {predictionResult && (
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs uppercase text-slate-400 font-semibold">Ensemble Decision:</span>
                <span className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black font-heading tracking-wide ${
                  predictionResult.finalDecision === 'ABNORMAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {predictionResult.finalDecision === 'ABNORMAL' ? 'FAULT DETECTED (ABNORMAL)' : 'SAFE OPERATING STATE (NORMAL)'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Confidence: <b className="text-emerald-400">{(predictionResult.confidence * 100).toFixed(1)}%</b> | Anomaly Score: <b className="text-amber-400">{(predictionResult.anomalyScore * 100).toFixed(1)}%</b>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {predictionResult.comparison.map((item) => (
                <div
                  key={item.model}
                  className={`p-3 rounded-xl border text-center ${
                    item.isEnsemble
                      ? 'bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-slate-400 truncate mb-1">{item.model}</div>
                  <div className={`text-xs font-bold font-mono py-0.5 px-1 rounded ${
                    item.prediction === 'ABNORMAL' ? 'text-rose-400 bg-rose-950/40' : 'text-emerald-400 bg-emerald-950/40'
                  }`}>
                    {item.prediction}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Acc: {item.paperAccuracy || '99.1%'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
