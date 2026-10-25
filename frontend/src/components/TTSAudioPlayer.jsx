import React from 'react';
import { Volume2, VolumeX, Loader2, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';

/**
 * TTSAudioPlayer — Compact inline audio controls for ElevenLabs TTS.
 * Shows loading, playing, paused, error, and unavailable states.
 * Light orange theme.
 */
export default function TTSAudioPlayer({
  ttsState = 'idle',
  ttsError = null,
  ttsProgress = 0,
  onPlay,
  onPause,
  onResume,
  onReplay,
  onManualPlay,
  characterName = '',
  characterRole = '',
  compact = false,
  fallbackActive = false,
}) {
  const isLoading = ttsState === 'loading';
  const isPlaying = ttsState === 'playing';
  const isPaused = ttsState === 'paused';
  const isError = ttsState === 'error';
  const isUnavailable = ttsState === 'unavailable';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isLoading && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Generating voice…</span>
          </div>
        )}

        {isPlaying && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPause}
              className="p-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 hover:text-orange-800 transition-all cursor-pointer"
              title="Pause"
              aria-label="Pause audio"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            {/* Soundwave indicator */}
            <div className="flex items-center gap-0.5 h-4 px-1">
              <span className="w-0.5 bg-orange-500 rounded-full animate-soundwave-1" />
              <span className="w-0.5 bg-orange-400 rounded-full animate-soundwave-2" />
              <span className="w-0.5 bg-orange-500 rounded-full animate-soundwave-3" />
              <span className="w-0.5 bg-orange-400 rounded-full animate-soundwave-4" />
              <span className="w-0.5 bg-orange-500 rounded-full animate-soundwave-5" />
            </div>
          </div>
        )}

        {isPaused && (
          <button
            onClick={onResume}
            className="p-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 hover:text-orange-800 transition-all cursor-pointer"
            title="Resume"
            aria-label="Resume audio"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Replay button: reads the question out loud using ElevenLabs Sara */}
        {!isLoading && !isPlaying && !isPaused && onReplay && (
          <button
            onClick={onReplay}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-orange-300 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Read out loud with Sara"
            aria-label="Replay audio"
          >
            <Volume2 className="w-4 h-4 text-orange-500" />
            <span className="text-[11px] font-medium hidden sm:inline text-gray-500">Replay</span>
          </button>
        )}
      </div>
    );
  }

  // Full layout with character info
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Character info */}
        {characterName && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block leading-tight">{characterName}</span>
              {characterRole && (
                <span className="text-[10px] text-gray-500">{characterRole}</span>
              )}
            </div>
          </div>
        )}

        {/* State indicators */}
        {isLoading && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Generating voice…</span>
          </div>
        )}

        {isPlaying && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 h-5 px-1">
              <span className="w-0.5 bg-orange-500 rounded-full animate-soundwave-1" />
              <span className="w-0.5 bg-orange-400 rounded-full animate-soundwave-2" />
              <span className="w-0.5 bg-orange-500 rounded-full animate-soundwave-3" />
              <span className="w-0.5 bg-orange-400 rounded-full animate-soundwave-4" />
              <span className="w-0.5 bg-orange-500 rounded-full animate-soundwave-5" />
            </div>
            <span className="text-xs text-orange-600 font-bold">Speaking</span>
            {/* Progress bar */}
            {ttsProgress > 0 && ttsProgress < 100 && (
              <div className="w-16 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-300"
                  style={{ width: `${ttsProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{ttsError || 'Voice unavailable'}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {isPlaying && (
          <button
            onClick={onPause}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-orange-600 hover:text-orange-800 transition-all"
            title="Pause"
            aria-label="Pause audio"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        {isPaused && (
          <button
            onClick={onResume}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-orange-600 hover:text-orange-800 transition-all"
            title="Resume"
            aria-label="Resume audio"
          >
            <Play className="w-4 h-4" />
          </button>
        )}

        {(ttsState === 'idle' || isError) && onReplay && (
          <button
            onClick={onReplay}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all"
            title="Replay audio"
            aria-label="Replay audio"
          >
            <Volume2 className="w-4 h-4 text-orange-500" />
          </button>
        )}

        {isError && onReplay && (
          <button
            onClick={onReplay}
            className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all"
            title="Retry voice"
            aria-label="Retry voice generation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
