import React from 'react';
import { Volume2, Radio, Sparkles } from 'lucide-react';

/**
 * VoicePanel — Voice Engine Information (ElevenLabs Sara)
 * Default Google and Microsoft browser voice options removed.
 */
export default function VoicePanel({ elevenLabs }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3.5 shadow-sm text-gray-700">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-orange-500" />
          ElevenLabs Voice Engine
        </p>
        <span className="text-[10px] font-mono text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
          Sara (Active)
        </span>
      </div>

      <div>
        <label className="block text-[11px] text-gray-500 mb-1 font-semibold">Voice Model</label>
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 font-medium flex items-center justify-between">
          <span>Sara (ElevenLabs Neural Voice)</span>
          <span className="text-[10px] text-orange-600 font-semibold bg-orange-50 px-1.5 py-0.5 rounded">Default</span>
        </div>
      </div>

      <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-2.5 text-xs text-gray-600 space-y-1">
        <p className="text-[11px] font-semibold text-orange-800 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-500" /> Replay On Demand
        </p>
        <p className="text-[11px] text-gray-600">
          Questions are read out loud using ElevenLabs Sara only when you click the <strong>Replay</strong> button on a question card.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          if (elevenLabs?.replayTTS) {
            elevenLabs.replayTTS(
              "Hello! I am Sara, your AI interviewer today. Whenever you want to hear a question read out loud, click the Replay button."
            );
          }
        }}
        className="w-full py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Volume2 className="w-3.5 h-3.5 text-orange-500" />
        <span>Test Sara's Voice</span>
      </button>
    </div>
  );
}
