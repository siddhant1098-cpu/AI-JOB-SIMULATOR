import React from 'react';

/**
 * VoicePanel — Minimal Pastel Voice Controls
 */
export default function VoicePanel({ speech }) {
  const { voices, voiceSettings, updateVoiceSettings } = speech;

  const englishVoices = voices.filter(
    (v) => v.lang.startsWith('en') || v.name.toLowerCase().includes('english')
  );
  const displayVoices = englishVoices.length ? englishVoices : voices;

  return (
    <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl p-4 space-y-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
          🎙️ Conversational Voice
        </p>
        <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
          Natural Cadence
        </span>
      </div>

      {/* Voice picker */}
      <div>
        <label className="block text-xs text-stone-500 mb-1 font-medium">Voice Model</label>
        <select
          value={voiceSettings.voiceURI || ''}
          onChange={(e) => updateVoiceSettings({ voiceURI: e.target.value })}
          className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200 font-medium"
        >
          <option value="">Auto (Best Natural Human Voice)</option>
          {displayVoices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Sliders in 2 cols */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex justify-between text-xs text-stone-500 mb-1">
            <span>Pace</span>
            <span className="font-mono font-semibold text-stone-800">
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
            className="w-full accent-purple-600 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-stone-500 mb-1">
            <span>Pitch</span>
            <span className="font-mono font-semibold text-stone-800">
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
            className="w-full accent-purple-600 cursor-pointer"
          />
        </div>
      </div>

      <button
        onClick={() =>
          speech.speak(
            "Hello! I am your simulation partner today. Take your time, breathe, and let's have a great conversation."
          )
        }
        className="w-full py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
      >
        <span>🔊</span> Test Natural Voice
      </button>
    </div>
  );
}
