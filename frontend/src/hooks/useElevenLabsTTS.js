import { useState, useRef, useCallback, useEffect } from 'react';

const RAW_BASE = import.meta.env.VITE_API_URL || '';
const BASE = RAW_BASE.replace(/\/+$/, '');

/**
 * useElevenLabsTTS — Manages ElevenLabs Text-to-Speech via backend API.
 * Provides play, pause, replay, and cleanup for streamed audio.
 * Falls back gracefully when TTS is unavailable.
 */
export function useElevenLabsTTS() {
  const [ttsState, setTtsState] = useState('idle'); // idle | loading | playing | paused | error | unavailable
  const [ttsError, setTtsError] = useState(null);
  const [ttsConfigured, setTtsConfigured] = useState(null); // null = checking, true/false
  const [ttsProgress, setTtsProgress] = useState(0); // 0-100 playback progress
  
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const abortControllerRef = useRef(null);
  const currentTextRef = useRef('');
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;

  // Check TTS availability on mount
  useEffect(() => {
    let cancelled = false;
    const checkStatus = async () => {
      try {
        const res = await fetch(`${BASE}/api/tts/status`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          setTtsConfigured(data.configured);
          if (!data.configured) {
            setTtsState('unavailable');
          }
        } else if (!cancelled) {
          setTtsConfigured(false);
          setTtsState('unavailable');
        }
      } catch {
        if (!cancelled) {
          setTtsConfigured(false);
          setTtsState('unavailable');
        }
      }
    };
    checkStatus();
    return () => { cancelled = true; };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Stop and release audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    // Revoke object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopTTS = useCallback(() => {
    cleanup();
    setTtsState('idle');
    setTtsProgress(0);
    setTtsError(null);
  }, [cleanup]);

  const speakWithElevenLabs = useCallback(async (text, { character = 'Interviewer', characterAuthorityLevel = 3, priority = 'P2', onEnd = null } = {}) => {
    if (!text?.trim()) {
      onEnd?.();
      return false;
    }

    // Stop any previous playback
    cleanup();
    retryCountRef.current = 0;
    currentTextRef.current = text;

    const attemptPlay = async () => {
      setTtsState('loading');
      setTtsError(null);
      setTtsProgress(0);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(`${BASE}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            character,
            character_authority_level: characterAuthorityLevel,
            priority,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Voice generation failed' }));
          throw new Error(err.detail || `TTS failed (${res.status})`);
        }

        // Read the complete response as a blob for reliable playback
        const blob = await res.blob();
        
        if (controller.signal.aborted) return false;

        // Create object URL for audio playback
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        // Create and play audio
        const audio = new Audio(url);
        audioRef.current = audio;

        // Track progress
        audio.addEventListener('timeupdate', () => {
          if (audio.duration > 0) {
            setTtsProgress(Math.round((audio.currentTime / audio.duration) * 100));
          }
        });

        audio.addEventListener('ended', () => {
          setTtsState('idle');
          setTtsProgress(100);
          onEnd?.();
        });

        audio.addEventListener('error', () => {
          setTtsState('error');
          setTtsError('Audio playback failed');
          onEnd?.();
        });

        await audio.play().catch((playErr) => {
          // Autoplay blocked by browser - this is expected
          if (playErr.name === 'NotAllowedError') {
            setTtsState('idle');
            setTtsError('Click play to hear the audio');
            // Don't call onEnd - user can manually play
            return;
          }
          throw playErr;
        });

        if (audio.paused && !controller.signal.aborted) {
          // Autoplay was blocked
          setTtsState('idle');
          return true; // Audio is loaded but not playing
        }

        setTtsState('playing');
        return true;

      } catch (err) {
        if (err.name === 'AbortError') {
          setTtsState('idle');
          return false;
        }

        // Retry logic
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          return attemptPlay();
        }

        setTtsState('error');
        setTtsError(err.message || 'Voice generation failed');
        // Do NOT call onEnd here so fallback audio can complete smoothly
        return false;
      }
    };

    return attemptPlay();
  }, [ttsConfigured, cleanup]);

  const pauseTTS = useCallback(() => {
    if (audioRef.current && ttsState === 'playing') {
      audioRef.current.pause();
      setTtsState('paused');
    }
  }, [ttsState]);

  const resumeTTS = useCallback(() => {
    if (audioRef.current && ttsState === 'paused') {
      audioRef.current.play().catch(() => {});
      setTtsState('playing');
    }
  }, [ttsState]);

  const replayTTS = useCallback(async (text, options = {}) => {
    const textToReplay = text || currentTextRef.current;
    if (!textToReplay) return false;
    return speakWithElevenLabs(textToReplay, options);
  }, [speakWithElevenLabs]);

  // Manual play (for when autoplay is blocked)
  const manualPlay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setTtsState('playing');
        setTtsError(null);
      }).catch(() => {});
    }
  }, []);

  return {
    ttsState,
    ttsError,
    ttsConfigured,
    ttsProgress,
    speakWithElevenLabs,
    stopTTS,
    pauseTTS,
    resumeTTS,
    replayTTS,
    manualPlay,
    cleanup,
    isLoading: ttsState === 'loading',
    isPlaying: ttsState === 'playing',
    isPaused: ttsState === 'paused',
    isError: ttsState === 'error',
    isUnavailable: ttsState === 'unavailable',
  };
}
