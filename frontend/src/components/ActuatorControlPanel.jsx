import React, { useState, useEffect, useRef } from 'react';
import { Fan, Bell, Volume2, VolumeX, ToggleLeft, ToggleRight, RotateCcw, Zap } from 'lucide-react';

export default function ActuatorControlPanel({ actuators, onControl, onReset }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);

  const fan = actuators?.fan || false;
  const fanRpm = actuators?.fanSpeedRpm || (fan ? 2800 : 0);
  const buzzer = actuators?.buzzer || false;
  const relayClosed = actuators?.relayClosed || false;
  const mode = actuators?.mode || 'AUTO';
  const lcdLine1 = actuators?.lcdLine1 || 'TEMP: 31.0C G:210P';
  const lcdLine2 = actuators?.lcdLine2 || 'STATUS: NORMAL';

  // Web Audio synthesizer for buzzer sound
  useEffect(() => {
    if (buzzer && soundEnabled) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz alarm tone

        // Pulse volume for beeping buzzer effect
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        const lfo = ctx.createOscillator();
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(3, ctx.currentTime); // 3 Hz beep rate
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);
        lfo.connect(lfoGain.gain);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = { osc, gain, lfo };
      } catch (e) {
        console.warn('Audio playback error:', e);
      }
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.osc.stop();
          oscillatorRef.current.osc.disconnect();
        } catch (e) {}
        oscillatorRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.osc.stop();
        } catch (e) {}
        oscillatorRef.current = null;
      }
    };
  }, [buzzer, soundEnabled]);

  const toggleMode = () => {
    const nextMode = mode === 'AUTO' ? 'MANUAL' : 'AUTO';
    onControl({ mode: nextMode });
  };

  const toggleFan = () => {
    if (mode === 'AUTO') {
      onControl({ mode: 'MANUAL', fan: !fan, fanSpeedRpm: !fan ? 2800 : 0 });
    } else {
      onControl({ fan: !fan, fanSpeedRpm: !fan ? 2800 : 0 });
    }
  };

  const toggleBuzzer = () => {
    if (mode === 'AUTO') {
      onControl({ mode: 'MANUAL', buzzer: !buzzer });
    } else {
      onControl({ buzzer: !buzzer });
    }
  };

  const isAlarming = buzzer || fan;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center space-x-2">
            <span>Automated Safety Response Node</span>
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Hardware Actuators
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time control loop for Relay, Cooling Fan, 16x2 LCD, and Audible Warning Buzzer
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mode Switcher */}
          <button
            onClick={toggleMode}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
              mode === 'AUTO'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {mode === 'AUTO' ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-amber-400" />}
            <span>MODE: {mode}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            title="Reset actuators to safe standby"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Hardware 16x2 LCD Display Emulator */}
        <div className="md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold text-slate-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>16x2 I2C LCD Display</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">HD44780 / PCF8574</span>
            </div>

            <div className={`p-4 rounded-xl lcd-screen border-2 font-mono-lcd transition-all duration-300 ${
              isAlarming ? 'border-rose-500/60 bg-red-950/60' : 'border-emerald-600/40'
            }`}>
              {/* LCD Screw styling */}
              <div className="flex justify-between text-slate-600 text-[8px] mb-1">
                <span>+</span>
                <span className="text-emerald-400/80 text-[10px] tracking-widest uppercase">SafeGuard 1602A</span>
                <span>+</span>
              </div>

              {/* Line 1 */}
              <div className={`text-base font-bold tracking-wider truncate py-0.5 ${
                isAlarming ? 'text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'text-lcd-glow drop-shadow-[0_0_8px_rgba(0,255,127,0.8)]'
              }`}>
                {lcdLine1.padEnd(16, ' ').slice(0, 16)}
              </div>

              {/* Line 2 */}
              <div className={`text-base font-bold tracking-wider truncate py-0.5 ${
                isAlarming ? 'text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'text-lcd-glow drop-shadow-[0_0_8px_rgba(0,255,127,0.8)]'
              }`}>
                {lcdLine2.padEnd(16, ' ').slice(0, 16)}
              </div>

              <div className="flex justify-between text-slate-600 text-[8px] mt-1">
                <span>+</span>
                <span className="text-[9px] text-slate-400 font-mono">5V VCC | SDA/SCL</span>
                <span>+</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
            <span>LCD Warning Display</span>
            <span className={`font-mono font-semibold ${isAlarming ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isAlarming ? 'WARN ACTIVE' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* 2. Cooling Fan & Relay Module */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${fan ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                <Fan className={`w-5 h-5 ${fan ? 'animate-spin-fast' : ''}`} />
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-slate-300">Cooling Fan & Relay</span>
                <p className="text-[11px] text-slate-500">Active Thermal Mitigation</p>
              </div>
            </div>
            <button
              onClick={toggleFan}
              className={`px-2.5 py-1 text-xs rounded-md font-mono font-semibold transition-all ${
                fan ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {fan ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Visual Fan Blades Animation */}
          <div className="flex items-center justify-center py-2">
            <div className={`relative w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${
              fan ? 'border-cyan-400/60 bg-cyan-950/30 animate-spin-fast' : 'border-slate-800 bg-slate-900/40'
            }`}>
              <div className={`w-3 h-3 rounded-full ${fan ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-slate-700'}`} />
              {/* Blade 1 */}
              <div className={`absolute w-1.5 h-7 rounded top-1 ${fan ? 'bg-cyan-300' : 'bg-slate-700'}`} />
              {/* Blade 2 */}
              <div className={`absolute w-7 h-1.5 rounded right-1 ${fan ? 'bg-cyan-300' : 'bg-slate-700'}`} />
              {/* Blade 3 */}
              <div className={`absolute w-1.5 h-7 rounded bottom-1 ${fan ? 'bg-cyan-300' : 'bg-slate-700'}`} />
              {/* Blade 4 */}
              <div className={`absolute w-7 h-1.5 rounded left-1 ${fan ? 'bg-cyan-300' : 'bg-slate-700'}`} />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Zap className={`w-3 h-3 ${relayClosed ? 'text-amber-400' : 'text-slate-600'}`} />
              <span>Relay: <b className={relayClosed ? 'text-amber-400' : 'text-slate-400'}>{relayClosed ? 'CLOSED' : 'OPEN'}</b></span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">{fanRpm} RPM</span>
          </div>
        </div>

        {/* 3. Audible Buzzer & Audio Alarm */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${buzzer ? 'bg-rose-500/20 text-rose-400 animate-pulse-alarm' : 'bg-slate-800 text-slate-500'}`}>
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-slate-300">Audible Buzzer</span>
                <p className="text-[11px] text-slate-500">Piezoelectric Alarm (880Hz)</p>
              </div>
            </div>
            <button
              onClick={toggleBuzzer}
              className={`px-2.5 py-1 text-xs rounded-md font-mono font-semibold transition-all ${
                buzzer ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {buzzer ? 'ALARM ON' : 'SILENT'}
            </button>
          </div>

          {/* Sound Synthesizer Enable/Disable Button */}
          <div className="my-auto py-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                soundEnabled
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-400 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Synthesized Sound Audio Enabled' : 'Enable Web Audio Synth'}</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-1">
              Synthesizes real acoustic buzzer tone through browser audio
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Alert State:</span>
            <span className={`font-mono font-bold ${buzzer ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}>
              {buzzer ? 'ACTIVE BEEPS' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
