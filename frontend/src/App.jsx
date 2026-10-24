import React, { useState, useEffect, useCallback } from 'react';
import SetupForm from './components/SetupForm';
import QuestionRunner from './components/QuestionRunner';
import ReportPage from './components/ReportPage';
import ResumeScreen from './components/ResumeScreen';
import NavigationRail from './components/NavigationRail';
import ErrorBoundary from './components/ErrorBoundary';
import { loadSession, saveSession, clearSession, createSession } from './session';
import { generateQuestions } from './api';
import { AlertCircle } from 'lucide-react';

/**
 * App — Futuristic Fullscreen Dynamic Router with Left Navigation Rail
 * Stages: setup | resume | running | report
 * Modes: 'interview' (Virtual Studio) | 'scenario' (Incident Command)
 */
export default function App() {
  const [stage, setStage] = useState('loading'); // loading | setup | resume | running | report
  const [session, setSession] = useState(null);
  const [activeMode, setActiveMode] = useState('interview'); // 'interview' | 'scenario'
  const [isLoading, setIsLoading] = useState(false);
  const [setupError, setSetupError] = useState(null);

  // On mount: check for existing session
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.stage === 'running' && saved.questions?.length > 0) {
      setSession(saved);
      if (saved.config?.mode) {
        setActiveMode(saved.config.mode);
      }
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

  // Switch mode via Left Column Symbols
  const handleSelectMode = (newMode) => {
    setActiveMode(newMode);
    if (session && stage === 'running') {
      updateSession({
        config: { ...session.config, mode: newMode }
      });
    }
  };

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
      setActiveMode(config.mode);
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

  const currentEffectiveMode = session?.config?.mode || activeMode;

  if (stage === 'loading') {
    return (
      <div className="h-screen w-screen bg-[#070913] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500/40 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs font-mono text-cyan-300 animate-pulse tracking-widest uppercase">
            Initializing AI Job Simulator…
          </span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onReset={handleNewSession}>
      <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-futuristic-mesh select-none font-sans text-slate-100">
        
        {/* ── LEFT COLUMN NAVIGATION RAIL ───────────────────────────────────────── */}
        <NavigationRail
          currentMode={currentEffectiveMode}
          onSelectMode={handleSelectMode}
          stage={stage}
          isStrict={session ? session.config.strictMode !== false : true}
        />

        {/* ── MAIN FULLSCREEN VIEWPORT (Occupies full space on wide screen) ────── */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative flex flex-col pb-16 md:pb-0">
          
          {stage === 'setup' && (
            <div className="w-full flex-1 flex flex-col">
              <SetupForm 
                onStart={handleStart} 
                isLoading={isLoading}
                activeMode={activeMode}
                onModeChange={setActiveMode}
              />
              {setupError && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-rose-950/90 border border-rose-500/60 text-rose-200 px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-2xl flex items-center gap-2 backdrop-blur-xl animate-bounce">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{setupError}</span>
                </div>
              )}
            </div>
          )}

          {stage === 'resume' && session && (
            <ResumeScreen
              session={session}
              onResume={handleResume}
              onNew={handleNewSession}
            />
          )}

          {stage === 'running' && session && (
            <QuestionRunner
              session={session}
              onUpdateSession={updateSession}
              onFinish={handleFinish}
            />
          )}

          {stage === 'report' && session && (
            <ReportPage
              session={session}
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
