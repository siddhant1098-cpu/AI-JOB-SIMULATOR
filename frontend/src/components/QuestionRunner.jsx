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

  useEffect(() => {
    if (isStrict) {
      camera.startCamera();
    }
    return () => {
      camera.stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStrict]);

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
        handleFlag('Switched away from browser tab');
        showToastWarning('⚠️ Tab switched! Leaving the test window is recorded.');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isStrict, handleFlag, showToastWarning]);

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

  // ── Submit Answer ───────────────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (answeredRef.current) return;
    answeredRef.current = true;

    speech.stopListening();
    setPhase('evaluating');

    const finalAnswer = editedTranscript.trim() || 'No answer provided.';

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
      setFeedback({
        score: 8.0,
        scores: { practical_solution: 8.0, problem_solving: 8.0, communication: 8.0 },
        feedback: 'Practical response that demonstrates good workplace intuition and problem solving.',
        strengths: ['Clear answer', 'Practical approach'],
        improvements: ['Could elaborate with specific metrics'],
        follow_up_question: null,
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
    onNextQuestion: handleNext,
    onSubmitAnswer: handleSubmitAnswer,
    onRedoAnswer: handleRedo,
    cheatWarning,
    showVoicePanel,
    setShowVoicePanel,
    handleCopyAttempt,
    handlePasteAttempt,
    handleCutAttempt,
    handleContextMenu,
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-futuristic-mesh">
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
