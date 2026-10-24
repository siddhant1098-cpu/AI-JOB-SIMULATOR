import React from 'react';
import { Volume2, Sliders, Radio } from 'lucide-react';

/**
 * VoicePanel — Futuristic iOS Glass Voice Engine Controls
 */
export default function VoicePanel({ speech }) {
  const { voices, voiceSettings, updateVoiceSettings } = speech;

  const englishVoices = voices.filter(
    (v) => v.lang.startsWith('en') || v.name.toLowerCase().includes('english')
  );
  const displayVoices = englishVoices.length ? englishVoices : voices;

  return (
    <div className="ios-glass-card rounded-2xl p-4 space-y-3.5 border-white/20 shadow-2xl text-slate-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          Conversational Audio Synthesizer
        </p>
        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-400/30">
          0.95x Human Cadence
        </span>
      </div>

      {/* Voice model selector */}
      <div>
        <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Voice Model</label>
        <select
          value={voiceSettings.voiceURI || ''}
          onChange={(e) => updateVoiceSettings({ voiceURI: e.target.value })}
          className="w-full ios-glass-input rounded-xl px-2.5 py-1.5 text-xs text-white"
        >
          <option value="" className="bg-slate-900 text-white">Auto (Best Natural Neural Voice)</option>
          {displayVoices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI} className="bg-slate-900 text-white">
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-semibold">
            <span>Pace</span>
            <span className="font-mono text-cyan-300">
              {voiceSettings.rate?.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.3"
            step="0.05"
            value={voiceSettings.rate || 0.95}
            onChange={(e) => updateVoiceSettings({ rate: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-semibold">
            <span>Pitch</span>
            <span className="font-mono text-indigo-300">
              {voiceSettings.pitch?.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.05"
            value={voiceSettings.pitch || 1.0}
            onChange={(e) => updateVoiceSettings({ pitch: parseFloat(e.target.value) })}
            className="w-full accent-indigo-400 cursor-pointer"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          speech.speak(
            "Hello! I am your AI partner today. Take your time, breathe, and let's work through this together."
          )
        }
        className="w-full py-2 ios-glass-btn rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5"
      >
        <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
        <span>Test Spoken Voice</span>
      </button>
    </div>
  );
}
