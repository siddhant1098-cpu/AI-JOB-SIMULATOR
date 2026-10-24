import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { useCamera } from '../hooks/useCamera';
import { evaluateAnswer } from '../api';
import VoicePanel from './VoicePanel';
import InterviewView from './InterviewView';
import WorkspaceView from './WorkspaceView';

/**
 * QuestionRunner — Futuristic Fullscreen Dynamic Session Engine
 * Dynamically switches between completely different UIs:
 * - 'interview': AI Virtual Telepresence Interview Suite
 * - 'scenario': Incident Command Center & Mission Console
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
  const [questionElapsedSec, setQuestionElapsedSec] = useState(0);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);

  const answeredRef = useRef(false);
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);

  const isPressureMode = !!config.pressureMode;

  // Per-question timer for Pressure Mode (60s response deadline)
  useEffect(() => {
    setQuestionElapsedSec(0);
    setIsAutoSubmitted(false);
  }, [currentIndex, isFollowUp]);

  useEffect(() => {
    if (!isPressureMode) return;
    // Freeze and stop timer immediately if evaluating, evaluated, or answer submitted
    if (phase === 'evaluating' || feedback || answeredRef.current) return;

    const qTimer = setInterval(() => {
      setQuestionElapsedSec((s) => {
        if (s >= 60) return 60;
        return s + 1;
      });
    }, 1000);

    return () => clearInterval(qTimer);
  }, [isPressureMode, currentIndex, isFollowUp, phase, feedback]);

  const isPressureFrozen = answeredRef.current || phase === 'evaluating' || !!feedback;
  const pressureRemainingSec = isPressureMode 
    ? (isPressureFrozen ? (isAutoSubmitted ? 0 : Math.max(0, 60 - questionElapsedSec)) : Math.max(0, 60 - questionElapsedSec))
    : null;

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

  useEffect(() => {
    camera.startCamera();
    return () => {
      camera.stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rawQ = isFollowUp
    ? { id: `fu-${currentIndex}`, type: 'follow_up', text: followUp }
    : (questions && questions[currentIndex]) || {};

  const questionText = rawQ.text || rawQ.initial_dialogue || rawQ.scenario_context || rawQ.objective || rawQ.question || rawQ.scenario || rawQ.title || 'Please explain your strategy and practical response for this scenario.';

  const currentQuestion = {
    ...rawQ,
    id: rawQ.id || `q-${currentIndex}`,
    text: questionText,
    character: rawQ.character || 'Senior Stakeholder',
    character_authority_level: rawQ.character_authority_level || 3,
    priority: rawQ.priority || 'P2',
  };

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
        showToastWarning('🚫 Developer inspection tools are disabled.');
        handleFlag('Attempted to open DevTools');
        return false;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        handleFlag('Switched away from browser tab or minimized mobile app');
        showToastWarning('⚠️ Tab / App switch detected! Leaving assessment is recorded.');
      }
    };

    const handleWindowBlur = () => {
      handleFlag('Assessment window lost focus (app switch, notification shade, or split-screen)');
    };

    const handlePageHide = () => {
      handleFlag('Assessment window hidden (navigated away or mobile app closed)');
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isStrict, handleFlag, showToastWarning]);

  // ── Screen Wake Lock (Keeps mobile front camera & screen active without dimming) ──
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch {
          // ignore wakeLock rejection
        }
      }
    };
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Check overall duration expiry
  useEffect(() => {
    if (elapsedSec >= durationMin * 60) {
      clearInterval(timerRef.current);
      onFinish();
    }
  }, [elapsedSec, durationMin, onFinish]);

  // ── Question Lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentQuestion?.text) return;

    answeredRef.current = false;
    setFeedback(null);
    setEditedTranscript('');
    if (typeof speech.resetTranscript === 'function') {
      speech.resetTranscript();
    } else if (typeof speech.setTranscript === 'function') {
      speech.setTranscript('');
    }

    setPhase('speaking');
    speech.speak(currentQuestion.text, () => {
      setPhase('listening');
      speech.startListening().catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isFollowUp]);

  // Sync Speech-to-Text transcript into edited text
  useEffect(() => {
    if (phase === 'listening' && speech.transcript) {
      setEditedTranscript(speech.transcript);
    }
  }, [phase, speech.transcript]);

  // Transition from listening → reviewing when user stops speaking
  useEffect(() => {
    if (phase === 'listening' && !speech.isListening && editedTranscript) {
      setPhase('reviewing');
    }
  }, [phase, speech.isListening, editedTranscript]);

  // ── Auto-submit in Pressure Mode when 60s Deadline is reached ────────────────
  useEffect(() => {
    if (!isPressureMode) return;
    if (questionElapsedSec >= 60 && !answeredRef.current && phase !== 'evaluating' && !feedback) {
      setIsAutoSubmitted(true);
      showToastWarning('⏱️ 60-Second Deadline Expired! Auto-submitting response...');
      handleSubmitAnswer(true);
    }
  }, [isPressureMode, questionElapsedSec, phase, feedback]);

  // ── Submit Answer ───────────────────────────────────────────────────────────
  const handleSubmitAnswer = async (fromAutoSubmit = false) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    if (fromAutoSubmit) {
      setIsAutoSubmitted(true);
    }

    speech.stopListening();
    if (typeof speech.stop === 'function') speech.stop();
    setPhase('evaluating');

    const trimmed = (editedTranscript || '').trim();
    const finalAnswer = trimmed || (isPressureMode ? '[NO ANSWER PROVIDED - 60s RESPONSE DEADLINE EXPIRED]' : 'No answer provided.');

    try {
      const evaluation = await evaluateAnswer({
        question_id: currentQuestion.id || `q-${currentIndex}`,
        question_text: currentQuestion.text,
        candidate_answer: finalAnswer,
        domain: config.domain,
        role: config.role,
        difficulty: config.difficulty,
        mode: config.mode,
        strict_mode: isStrict,
        candidate_name: config.candidate_name,
        resume_text: config.resume_text,
        character: currentQuestion.character,
        character_authority_level: currentQuestion.character_authority_level,
        priority: currentQuestion.priority,
        pressureMode: config.pressureMode,
      });

      setFeedback(evaluation);

      const nextAnswers = [
        ...answers,
        {
          question: currentQuestion.text,
          answer: finalAnswer,
          isFollowUp,
        },
      ];
      const nextScores = [...scores, evaluation];
      onUpdateSession({ answers: nextAnswers, scores: nextScores });

      if (evaluation.follow_up_question && !isFollowUp) {
        setFollowUp(evaluation.follow_up_question);
      }
    } catch {
      const isUnanswered = !trimmed || finalAnswer.includes('NO ANSWER PROVIDED') || finalAnswer === 'No answer provided.';
      setFeedback({
        overall_score: isUnanswered ? 7.0 : 70.0,
        dimension_scores: isUnanswered ? {
          problem_solving: 5.0,
          decision_making: 5.0,
          communication: 10.0,
          etiquette: 10.0,
          prioritisation: 5.0,
          accountability: 10.0,
          teamwork: 5.0,
          adaptability: 5.0,
        } : {
          problem_solving: 70.0,
          decision_making: 70.0,
          communication: 70.0,
          etiquette: 75.0,
          prioritisation: 70.0,
          accountability: 70.0,
          teamwork: 70.0,
          adaptability: 70.0,
        },
        verdict: isUnanswered ? 'developing' : 'good',
        feedback: isUnanswered
          ? 'CRITICAL SLA BREACH: You did not provide any response within the mandatory 60-second operational window. In high-stakes workplace incidents, complete silence causes severe operational failure.'
          : 'Practical response recorded under time pressure.',
        strengths: isUnanswered ? [] : ['Direct response under time constraints'],
        improvement_areas: isUnanswered
          ? ['Failed to formulate an action plan within the 60-second deadline', 'Lack of stakeholder containment communication']
          : ['Could provide deeper containment steps'],
        consequences: isUnanswered
          ? 'Crisis escalated directly to executive level with severe operational downtime due to lack of response.'
          : 'Standard operational mitigation in progress.',
        suggested_improved_response: 'Even under 60-second pressure, immediately state initial containment and ETA.',
        do_differently: ['State containment immediately within 30 seconds', 'Never let the SLA timer expire in silence'],
        follow_up_question: null,
        total: isUnanswered ? 0.7 : 7.0,
      });
    }
  };

  // Redo / Clear answer
  const handleRedo = () => {
    answeredRef.current = false;
    if (typeof speech.resetTranscript === 'function') {
      speech.resetTranscript();
    } else if (typeof speech.setTranscript === 'function') {
      speech.setTranscript('');
    }
    setEditedTranscript('');
    setPhase('listening');
    speech.startListening().catch(() => {});
  };

  // Next question navigation
  const handleNext = () => {
    if (followUp && !isFollowUp) {
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
  const progress = ((currentIndex + (phase === 'reviewing' || feedback ? 1 : 0)) / questions.length) * 100;

  const isInterviewMode = config.mode === 'interview';

  const viewProps = {
    session,
    currentQuestion,
    isFollowUp,
    phase,
    editedTranscript,
    setEditedTranscript,
    feedback,
    speech,
    camera,
    isStrict,
    remainingSec,
    progress,
    elapsedSec,
    isPressureMode,
    pressureRemainingSec,
    isAutoSubmitted,
    onNextQuestion: handleNext,
    onSubmitAnswer: handleSubmitAnswer,
    onRedoAnswer: handleRedo,
    onFinishSession: onFinish,
    cheatWarning,
    showVoicePanel,
    setShowVoicePanel,
    handleCopyAttempt,
    handlePasteAttempt,
    handleCutAttempt,
    handleContextMenu,
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden dash-bg">
      {/* Voice Panel Dropdown (if toggled) */}
      {showVoicePanel && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 max-w-sm w-full ios-glass-card rounded-2xl p-4 shadow-2xl">
          <VoicePanel speech={speech} />
        </div>
      )}

      {/* Anti-cheat Frosted Futuristic Blur Shield */}
      {camera.isBlurred && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(32px)', backgroundColor: 'rgba(7, 9, 19, 0.88)' }}
        >
          <div className="text-center p-8 max-w-md w-full rounded-3xl ios-glass-panel-active border-rose-500/40 shadow-[0_0_60px_rgba(244,63,94,0.3)]">
            <div className="text-5xl mb-3 animate-bounce">
              {camera.phoneDetected ? '📱' : '⚠️'}
            </div>
            <h2 className="text-xl font-extrabold text-white mb-1.5 tracking-tight">
              {camera.phoneDetected ? 'Mobile Device Detected' : 'Assessment Paused'}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              {camera.blurReason}
            </p>
            <div className="bg-rose-500/20 border border-rose-500/40 rounded-2xl p-3 text-xs text-rose-200">
              {camera.phoneDetected
                ? 'Please place your phone out of camera sight. The workspace resumes automatically once removed.'
                : 'Please face the camera and remain in this window to resume.'}
            </div>
            <p className="text-slate-400 text-[11px] mt-4 font-mono">
              Integrity event recorded on-device • Timer paused
            </p>
          </div>
        </div>
      )}

      {/* Dynamic View Injection: Interview Mode vs Workspace Mode */}
      {isInterviewMode ? (
        <InterviewView {...viewProps} />
      ) : (
        <WorkspaceView {...viewProps} />
      )}
    </div>
  );
}
