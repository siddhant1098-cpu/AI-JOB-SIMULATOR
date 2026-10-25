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
      if (config.prebuiltScenario) {
        // PREBUILT SCENARIO: No AI generation called. Load prebuilt scenario directly.
        const sc = config.prebuiltScenario;
        const initialQuestion = {
          id: 1,
          type: 'scenario',
          scenario_id: sc.id,
          text: sc.opening_message,
          character: `${sc.character.name}, ${sc.character.role}`,
          character_authority_level: sc.character.authority_level === 'Senior Executive' ? 5 : (sc.character.authority_level === 'Manager' ? 4 : 3),
          character_voice_profile: sc.character.voice_profile,
          priority: 'P1',
          scenario_context: sc.description,
          objective: `Address ${sc.character.name}'s request with operational ownership, realistic timelines, and high professional composure.`,
          constraints: [
            'Maintain professional composure and constructive tone',
            'Propose actionable solution with realistic delivery checkpoints',
          ],
          evaluation_criteria: sc.criteria_names || sc.rubric?.map((c) => c.name) || [],
          prebuilt: true,
          rubric: sc.rubric,
          time_limit_seconds: sc.time_limit_seconds || 60,
        };

        const newSession = createSession(config);
        newSession.questions = [initialQuestion];
        newSession.prebuiltScenario = sc;
        saveSession(newSession);
        setSession(newSession);
        setActiveMode(config.mode);
        setStage('running');
      } else {
        const { items } = await generateQuestions(config);
        if (!items || !items.length) throw new Error('No questions returned');
        const newSession = createSession(config);
        newSession.questions = items;
        saveSession(newSession);
        setSession(newSession);
        setActiveMode(config.mode);
        setStage('running');
      }
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
      <div className="h-screen w-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center animate-pulse">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-gray-500 tracking-wide">
            Loading PrepRoom…
          </span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onReset={handleNewSession}>
      <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-gray-50 select-none font-sans text-gray-900">
        
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
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 border border-red-700 text-white px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce">
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
