import { useRef, useState, useCallback, useEffect } from 'react';
import { loadVoiceSettings, saveVoiceSettings } from '../session';

/**
 * useSpeech — wraps browser speechSynthesis (TTS) and SpeechRecognition (STT)
 * Optimized for natural, warm human cadence and conversational clarity.
 */
export function useSpeech() {
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceSettings, setVoiceSettings] = useState(() => {
    const s = loadVoiceSettings();
    return { voiceURI: '', rate: 0.95, pitch: 1.0, ...s };
  });

  const recognitionRef = useRef(null);
  const resolveRef = useRef(null);
  const transcriptRef = useRef('');

  // Auto-pick the most natural sounding human voice
  const findBestHumanVoice = (availableVoices) => {
    if (!availableVoices || availableVoices.length === 0) return null;

    // 1. Sara / Sarah voices (matches default persona)
    const saraVoice = availableVoices.find(
      (v) =>
        (v.name.toLowerCase().includes('sarah') || v.name.toLowerCase().includes('sara')) &&
        v.lang.startsWith('en')
    );
    if (saraVoice) return saraVoice;

    // 2. Edge/Chrome online natural voices
    const naturalVoice = availableVoices.find(
      (v) =>
        (v.name.includes('Natural') || v.name.includes('Online')) &&
        v.lang.startsWith('en')
    );
    if (naturalVoice) return naturalVoice;

    // 2. Google US / UK English voices (very warm & clear)
    const googleVoice = availableVoices.find(
      (v) =>
        (v.name.includes('Google US English') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Google')) &&
        v.lang.startsWith('en')
    );
    if (googleVoice) return googleVoice;

    // 3. Apple Samantha or Ava
    const appleVoice = availableVoices.find(
      (v) =>
        (v.name.includes('Samantha') || v.name.includes('Ava') || v.name.includes('Alex')) &&
        v.lang.startsWith('en')
    );
    if (appleVoice) return appleVoice;

    // 4. Any English voice
    const enVoice = availableVoices.find((v) => v.lang.startsWith('en'));
    return enVoice || availableVoices[0];
  };

  // Load voices (Chrome loads them async)
  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length) {
        setVoices(v);
        // If no voice selected yet, pick the best human voice
        setVoiceSettings((prev) => {
          if (!prev.voiceURI) {
            const best = findBestHumanVoice(v);
            if (best) {
              const updated = { ...prev, voiceURI: best.voiceURI };
              saveVoiceSettings(updated);
              return updated;
            }
          }
          return prev;
        });
      }
    };
    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, []);

  const updateVoiceSettings = useCallback((patch) => {
    setVoiceSettings((prev) => {
      const next = { ...prev, ...patch };
      saveVoiceSettings(next);
      return next;
    });
  }, []);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = '';
    setTranscript('');
  }, []);

  /** Browser TTS disabled - audio is exclusively handled by ElevenLabs Sara on Replay */
  const speak = useCallback((text, onEnd) => {
    if (typeof onEnd === 'function') onEnd();
    return Promise.resolve();
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  /** Start listening. Returns Promise<string> that resolves with final transcript. */
  const startListening = useCallback(() => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        reject(new Error('SpeechRecognition not supported in this browser'));
        return;
      }

      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      recognitionRef.current = rec;
      resolveRef.current = resolve;
      transcriptRef.current = '';
      setTranscript('');

      rec.onstart = () => setIsListening(true);

      rec.onresult = (e) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t;
          else interim += t;
        }
        transcriptRef.current += final;
        const display = transcriptRef.current + interim;
        setTranscript(display);
      };

      rec.onerror = (e) => {
        setIsListening(false);
        if (e.error === 'no-speech') {
          resolve(transcriptRef.current);
        } else {
          reject(new Error(`STT error: ${e.error}`));
        }
      };

      rec.onend = () => {
        setIsListening(false);
        resolve(transcriptRef.current);
      };

      rec.start();
    });
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    transcript,
    setTranscript,
    resetTranscript,
    isSpeaking,
    isListening,
    voices,
    voiceSettings,
    updateVoiceSettings,
  };
}
