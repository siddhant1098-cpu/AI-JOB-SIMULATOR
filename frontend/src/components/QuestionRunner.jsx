import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { useCamera } from '../hooks/useCamera';
import { evaluateAnswer } from '../api';
import VoicePanel from './VoicePanel';
import FeedbackCard from './FeedbackCard';
import CameraPreview from './CameraPreview';

/**
 * QuestionRunner — Minimal, Premium Pastel Theme
 * Conversational, empathetic human guidance with Strict Anti-Cheat Proctoring
 */
export default function QuestionRunner({ session, onUpdateSession, onFinish }) {
  const { config, questions, currentIndex, answers, scores, startedAt, durationMin, flags: sessionFlags } = session;
  const isStrict = config.strictMode !== false;

  const [phase, setPhase] = useState('speaking'); // speaking | listening | reviewing | evaluating
  const [editedTranscript, setEditedTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [followUp, setFollowUp] = useState(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [cameraFlags, setCameraFlags] = useState(sessionFlags || []);
  const [cheatWarning, setCheatWarning] = useState(null);

  const warningTimerRef = useRef(null);
  const timerRef = useRef(null);
  const answeredRef = useRef(false);

  const speech = useSpeech();

  const showToastWarning = useCallback((msg) => {
    setCheatWarning(msg);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => {
      setCheatWarning(null);
    }, 4000);
  }, []);

  const handleFlag = useCallback((flag) => {
    setCameraFlags((f) => {
      const next = [...f, flag];
      onUpdateSession({ flags: next });
      return next;
    });
  }, [onUpdateSession]);

  const camera = useCamera(handleFlag, isStrict);

  const currentQuestion = isFollowUp
    ? { id: `fu-${currentIndex}`, type: 'follow_up', text: followUp }
    : questions[currentIndex];

  // ── Strict Mode: Clipboard Lock ─────────────────────────────────────────────
  const handleCopyAttempt = useCallback((e) => {
    if (!isStrict) return;
    e.preventDefault();
    showToastWarning('🚫 Copying is disabled in Strict Mode. Event logged.');
    handleFlag('Attempted to copy assessment text');
  }, [isStrict, showToastWarning, handleFlag]);

  const handlePasteAttempt = useCallback((e) => {
    if (!isStrict) return;
    e.preventDefault();
    showToastWarning('🚫 Pasting is disabled in Strict Mode. Please speak or type your own response.');
    handleFlag('Attempted to paste answer into response field');
  }, [isStrict, showToastWarning, handleFlag]);

  const handleCutAttempt = useCallback((e) => {
    if (!isStrict) return;
    e.preventDefault();
    showToastWarning('🚫 Clipboard cut action is disabled.');
    handleFlag('Attempted to cut text');
  }, [isStrict, showToastWarning, handleFlag]);

  const handleContextMenu = useCallback((e) => {
    if (!isStrict) return;
    e.preventDefault();
    showToastWarning('🚫 Right-click menu is disabled in assessment mode.');
  }, [isStrict, showToastWarning]);

  // ── Strict Mode: Keyboard & Tab Switching ────────────────────────────────────
  useEffect(() => {
    if (!isStrict) return;

    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isCmdOrCtrl && ['c', 'v', 'x', 'a', 'u', 'p', 's'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        showToastWarning(`🚫 Shortcut [Ctrl+${key.toUpperCase()}] is disabled in Strict Mode!`);
        handleFlag(`Blocked shortcut: Ctrl+${key.toUpperCase()}`);
        return false;
      }

      if (e.key === 'F12' || (isCmdOrCtrl && e.shiftKey && ['i', 'j', 'c'].includes(key))) {
        e.preventDefault();
        e.stopPropagation();
        showToastWarning('🚫 Developer inspection tools are disabled.');
        handleFlag('DevTools shortcut blocked');
        return false;
      }

      if (e.key === 'PrintScreen') {
        showToastWarning('⚠️ Screenshot attempt logged.');
        handleFlag('PrintScreen attempt detected');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        camera.triggerBlur('⚠️ Tab Switch Detected! Please stay focused on the assessment tab.');
        handleFlag('Candidate switched to another browser tab / window');
      }
    };

    const handleWindowBlur = () => {
      handleFlag('Assessment window lost focus');
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isStrict, showToastWarning, handleFlag, camera]);

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const limitMs = durationMin * 60 * 1000;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setElapsedSec(Math.floor(elapsed / 1000));
      if (elapsed >= limitMs) {
        clearInterval(timerRef.current);
        speech.stopSpeaking();
        speech.stopListening();
        onFinish();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [startedAt, durationMin, onFinish, speech]);

  // ── Natural Human Speaking Prompt ───────────────────────────────────────────
  useEffect(() => {
    answeredRef.current = false;
    setFeedback(null);
    setEditedTranscript('');
    setPhase('speaking');
    speech.setTranscript('');

    const q = isFollowUp ? followUp : questions[currentIndex]?.text;
    if (!q) return;

    // Conversational, warm spoken phrasing
    let conversationalIntro = '';
    if (isFollowUp) {
      conversationalIntro = 'That makes sense! Quick follow-up for you: ';
    } else if (currentIndex === 0) {
      conversationalIntro = config.mode === 'scenario'
        ? "Hello! Let's start with our first scenario: "
        : "Hi there! Let's jump into our first question: ";
    } else if (currentIndex === questions.length - 1) {
      conversationalIntro = "Great. Here is our final challenge for today: ";
    } else {
      conversationalIntro = config.mode === 'scenario'
        ? "Nicely done. Here is our next scenario: "
        : "Good thought. Moving on to the next question: ";
    }

    speech.speak(conversationalIntro + q).then(() => {
      if (!answeredRef.current) {
        setPhase('listening');
        speech.startListening().catch(() => setPhase('listening'));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isFollowUp]);

  // Keep editedTranscript in sync with live STT
  useEffect(() => {
    if (phase === 'listening') {
      setEditedTranscript(speech.transcript);
    }
  }, [speech.transcript, phase]);

  const handleSubmitAnswer = async () => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    speech.stopListening();
    const answer = editedTranscript.trim() || '(no response provided)';
    setPhase('evaluating');

    try {
      const result = await evaluateAnswer(config, currentQuestion, answer, currentIndex);
      setFeedback(result);
      setPhase('reviewing');

      const updatedAnswers = [...answers, { question: currentQuestion, answer }];
      const updatedScores = [...scores, result];

      onUpdateSession({
        answers: updatedAnswers,
        scores: updatedScores,
        elapsedMs: Date.now() - startedAt,
      });

      // Speak natural human coaching feedback (skip robotic numbers)
      const spokenFeedback = result.feedback
        ? `Thanks for sharing that! ${result.feedback}`
        : `Good job handling that challenge!`;

      await speech.speak(spokenFeedback);

      if (result.follow_up && !isFollowUp) {
        setFollowUp(result.follow_up);
      }
    } catch (e) {
      console.error(e);
      setPhase('reviewing');
      setFeedback({ error: e.message });
    }
  };

  const handleNext = () => {
    if (!isFollowUp && followUp) {
      setIsFollowUp(true);
      return;
    }

    setIsFollowUp(false);
    setFollowUp(null);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      onFinish();
    } else {
      onUpdateSession({ currentIndex: nextIndex });
    }
  };

  const remainingSec = Math.max(0, durationMin * 60 - elapsedSec);
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');
  const progress = ((currentIndex + (phase === 'reviewing' ? 1 : 0)) / questions.length) * 100;

  return (
    <div
      onContextMenu={handleContextMenu}
      onCopy={handleCopyAttempt}
      onCut={handleCutAttempt}
      className={`min-h-screen bg-[#FAF8F5] text-stone-800 relative pb-16 ${
        isStrict ? 'select-none' : ''
      }`}
    >
      {/* Background Pastel Atmospheric Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-100/35 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Cheat Warning Toast */}
      {cheatWarning && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-rose-600/95 text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-lg border border-rose-400 flex items-center gap-2 animate-bounce">
          <span>⚠️</span>
          <span>{cheatWarning}</span>
        </div>
      )}

      {/* Anti-cheat Frosted Pastel Blur Overlay */}
      {camera.isBlurred && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(25px)', backgroundColor: 'rgba(250, 248, 245, 0.85)' }}
        >
          <div className="text-center p-8 max-w-md w-full rounded-3xl bg-white/95 border border-stone-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <div className="text-5xl mb-3 animate-bounce">
              {camera.phoneDetected ? '📱' : '⚠️'}
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 mb-1.5">
              {camera.phoneDetected ? 'Mobile Device Detected' : 'Assessment Paused'}
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              {camera.blurReason}
            </p>
            <div className="bg-[#FFF4F2] border border-[#FCDAD5] rounded-2xl p-3 text-xs text-[#9B2C2C]">
              {camera.phoneDetected
                ? 'Please place your phone out of sight. The session resumes as soon as it is removed.'
                : 'Please face the camera and stay inside this window to resume.'}
            </div>
            <p className="text-stone-400 text-[11px] mt-4 font-medium">
              Integrity event recorded • Timer paused
            </p>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-stone-200/70 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-sm">
              {config.mode === 'interview' ? '💼' : '🏢'}
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800 leading-tight">{config.role}</p>
              <p className="text-[10px] text-stone-500 font-medium">{config.domain}</p>
            </div>
            {isStrict && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                Strict Proctor
              </span>
            )}
          </div>

          {/* Progress Pill */}
          <div className="flex-1 max-w-xs mx-2">
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400 font-medium text-center mt-0.5">
              {isFollowUp ? 'Follow-up question' : `Part ${currentIndex + 1} of ${questions.length}`}
            </p>
          </div>

          {/* Timer & Controls */}
          <div className="flex items-center gap-2">
            <div
              className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full border ${
                remainingSec < 60
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              ⏱ {mm}:{ss}
            </div>

            <button
              onClick={() => setShowVoicePanel((v) => !v)}
              className="text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1"
            >
              <span>🎙️</span>
              <span className="hidden sm:inline">Voice</span>
            </button>
          </div>
        </div>

        {/* Voice Dropdown */}
        {showVoicePanel && (
          <div className="max-w-3xl mx-auto mt-2">
            <VoicePanel speech={speech} />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 relative z-10">
        {/* Question / Challenge Card */}
        <div
          className={`rounded-3xl p-6 sm:p-7 border select-none transition-all shadow-[0_4px_25px_rgba(0,0,0,0.02)] ${
            isFollowUp
              ? 'bg-[#FFF9EE] border-[#FCE8C3]'
              : config.mode === 'scenario'
                ? 'bg-[#F2FAF6] border-[#D4EDE1]'
                : 'bg-[#F6F3FE] border-[#E2DBFA]'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/80 border border-stone-200/50 flex items-center justify-center text-xl shrink-0 shadow-2xs">
              {isFollowUp ? '🔄' : config.mode === 'scenario' ? '📋' : '💬'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {isFollowUp
                    ? 'Helpful Follow-Up'
                    : config.mode === 'scenario'
                      ? 'Workplace Scenario'
                      : `Question ${currentIndex + 1}`}
                </p>
                {currentQuestion?.type && !isFollowUp && (
                  <span className="text-[10px] bg-white/70 text-stone-600 px-2 py-0.2 rounded-full border border-stone-200/50 font-medium capitalize">
                    {currentQuestion.type}
                  </span>
                )}
                {isStrict && (
                  <span className="text-[10px] bg-white/80 text-purple-700 px-2 py-0.2 rounded-full border border-purple-200 font-mono">
                    Protected
                  </span>
                )}
              </div>
              <p className="text-stone-900 text-lg sm:text-xl font-semibold leading-relaxed">
                {currentQuestion?.text}
              </p>
            </div>
          </div>
        </div>

        {/* Answer Workspace */}
        <div className="bg-white/90 backdrop-blur-xl border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-3">
          {phase === 'speaking' && (
            <div className="flex items-center gap-3 py-3 text-stone-500">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">Your interviewer is speaking the question aloud…</span>
            </div>
          )}

          {(phase === 'listening' || phase === 'reviewing' || phase === 'evaluating') && (
            <>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  {phase === 'listening' && (
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  )}
                  {phase === 'listening' ? 'Listening to your answer…' : 'Your Response'}
                </label>
                <div className="flex items-center gap-2">
                  {isStrict && (
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      🚫 Paste Locked
                    </span>
                  )}
                  {phase === 'listening' && (
                    <button
                      onClick={speech.stopListening}
                      className="text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-full transition-all"
                    >
                      Done Speaking
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                onPaste={handlePasteAttempt}
                disabled={phase === 'evaluating'}
                rows={4}
                placeholder={
                  isStrict
                    ? "Speak naturally into your microphone... Your words will be transcribed here. You may edit manually, but pasting is disabled."
                    : "Your transcribed answer will appear here. You can edit it before submitting."
                }
                className="w-full bg-stone-50/70 border border-stone-200 rounded-2xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 resize-none text-sm leading-relaxed transition-all font-normal"
              />

              {phase === 'listening' && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!editedTranscript.trim()}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-semibold rounded-2xl transition-all shadow-sm text-sm"
                >
                  Submit Response →
                </button>
              )}

              {phase === 'evaluating' && (
                <div className="py-4 flex items-center justify-center gap-2.5 text-stone-500 text-sm">
                  <svg className="animate-spin h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Your mentor is reflecting on your response…</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Feedback Card */}
        {phase === 'reviewing' && feedback && (
          <FeedbackCard feedback={feedback} />
        )}

        {/* Navigation Action Buttons */}
        {phase === 'reviewing' && (
          <div className="flex gap-3 pt-2">
            {followUp && !isFollowUp && (
              <button
                onClick={() => {
                  setIsFollowUp(true);
                  setPhase('speaking');
                }}
                className="flex-1 py-3.5 bg-[#FFF4E5] hover:bg-[#FFE8CC] text-[#7B341E] border border-[#FCD7B5] rounded-2xl font-semibold transition-all text-sm flex items-center justify-center gap-1.5"
              >
                <span>🔄</span> Answer Quick Follow-Up
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-semibold transition-all text-sm shadow-sm"
            >
              {currentIndex + 1 >= questions.length && !followUp
                ? '📊 View Your Full Debrief'
                : 'Next Challenge →'}
            </button>
          </div>
        )}

        {/* Proctor Log Summary */}
        {cameraFlags.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-center">
            <p className="text-xs text-amber-800 font-semibold">
              ⚠️ {cameraFlags.length} proctor observation{cameraFlags.length > 1 ? 's' : ''} logged during assessment
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5 font-mono">
              Latest: {cameraFlags[cameraFlags.length - 1]}
            </p>
          </div>
        )}
      </div>

      {/* Floating Camera Preview */}
      <CameraPreview camera={camera} strictMode={isStrict} />
      <canvas ref={camera.canvasRef} className="hidden" />
    </div>
  );
}
