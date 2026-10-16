import React, { useState, useEffect, useCallback } from 'react';
import SetupForm from './components/SetupForm';
import QuestionRunner from './components/QuestionRunner';
import ReportPage from './components/ReportPage';
import ResumeScreen from './components/ResumeScreen';
import { loadSession, saveSession, clearSession, createSession } from './session';
import { generateQuestions } from './api';

/**
 * App — top-level router
 * Stages: setup | resume | running | report
 */
export default function App() {
  const [stage, setStage] = useState('loading'); // loading | setup | resume | running | report
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [setupError, setSetupError] = useState(null);

  // On mount: check for existing session
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.stage === 'running' && saved.questions?.length > 0) {
      setSession(saved);
      setStage('resume');
    } else {
      setStage('setup');
    }
  }, []);

  // Update session state + persist on every change
  const updateSession = useCallback((patch) => {
    setSession((prev) => {
      const next = { ...prev, ...patch };
      saveSession(next);
      return next;
    });
  }, []);

  // Start new session
  const handleStart = async (config) => {
    setIsLoading(true);
    setSetupError(null);
    try {
      const { items } = await generateQuestions(config);
      if (!items || !items.length) throw new Error('No questions returned');
      const newSession = createSession(config);
      newSession.questions = items;
      saveSession(newSession);
      setSession(newSession);
      setStage('running');
    } catch (e) {
      setSetupError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resume saved session
  const handleResume = () => {
    setStage('running');
  };

  // Start fresh (discard session)
  const handleNewSession = () => {
    clearSession();
    setSession(null);
    setStage('setup');
  };

  // Finish session → go to report
  const handleFinish = useCallback(() => {
    updateSession({ stage: 'report' });
    setStage('report');
  }, [updateSession]);

  // Reset from report
  const handleReset = () => {
    clearSession();
    setSession(null);
    setStage('setup');
  };

  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-purple-400 text-xl animate-pulse">Loading…</div>
      </div>
    );
  }

  if (stage === 'setup') {
    return (
      <div>
        <SetupForm onStart={handleStart} isLoading={isLoading} />
        {setupError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-500 text-red-200 px-6 py-3 rounded-xl text-sm shadow-2xl">
            ⚠️ {setupError}
          </div>
        )}
      </div>
    );
  }

  if (stage === 'resume' && session) {
    return (
      <ResumeScreen
        session={session}
        onResume={handleResume}
        onNew={handleNewSession}
      />
    );
  }

  if (stage === 'running' && session) {
    return (
      <QuestionRunner
        session={session}
        onUpdateSession={updateSession}
        onFinish={handleFinish}
      />
    );
  }

  if (stage === 'report' && session) {
    return (
      <ReportPage
        session={session}
        onReset={handleReset}
      />
    );
  }

  return null;
}
