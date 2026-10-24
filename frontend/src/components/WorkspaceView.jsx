import React, { useState } from 'react';
import { 
  Terminal, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  Clock, 
  RotateCcw, 
  Activity, 
  Cpu, 
  Flame, 
  Layers, 
  CheckCircle2, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Volume2, 
  Radio, 
  FileText, 
  Sliders
} from 'lucide-react';
import FeedbackCard from './FeedbackCard';
import CorporateLogo from './CorporateLogo';

/**
 * WorkspaceView — Futuristic Incident Command Center & Workplace Crisis Workbench
 * Mode: 'scenario' / 'workspace'
 * Completely distinct UI from Interview Mode:
 * Multi-pane operations cockpit with Incident Dossier, simulated stakeholder chat,
 * action plan terminal, real-time SLA metrics, and integrity radar.
 */
export default function WorkspaceView({
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
  onNextQuestion,
  onSubmitAnswer,
  onRedoAnswer,
  cheatWarning,
  showVoicePanel,
  setShowVoicePanel,
  handleCopyAttempt,
  handlePasteAttempt,
  handleCutAttempt,
  handleContextMenu
}) {
  const { config, questions, currentIndex } = session;
  const { videoRef, cameraReady, cameraError, faceCount, phoneDetected } = camera;

  const [activeTab, setActiveTab] = useState('action_plan'); // action_plan | terminal | stakeholders

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');

  const isSpeaking = phase === 'speaking';
  const isListening = phase === 'listening';
  const isReviewing = phase === 'reviewing';
  const isEvaluating = phase === 'evaluating';

  // Quick action templates to assist candidates during crisis scenarios
  const insertTemplate = (prefix) => {
    setEditedTranscript((prev) => {
      const space = prev.trim() ? '\n\n' : '';
      return `${prev}${space}${prefix} `;
    });
  };

  return (
    <div 
      className="flex-1 w-full h-full flex flex-col overflow-y-auto select-none font-sans"
      onCopy={handleCopyAttempt}
      onPaste={handlePasteAttempt}
      onCut={handleCutAttempt}
      onContextMenu={handleContextMenu}
    >
      {/* ── TOP CORPORATE OPERATIONS STRIP ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 ios-glass border-b border-fuchsia-500/20 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Corporate Logo & Incident ID */}
        <div className="flex items-center gap-3.5">
          <CorporateLogo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold text-fuchsia-400">
                #INC-8492
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 animate-pulse flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                SEV-1 ACTIVE
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400">
                {config.domain}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
              {config.company} • Crisis Operations Command
            </h2>
          </div>
        </div>

        {/* Center: System Health & SLA Tracker */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">System Health</p>
              <p className="text-xs font-mono font-bold text-amber-300">64% Degraded</p>
            </div>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Scenario Phase</p>
              <p className="text-xs font-mono font-bold text-cyan-300">
                {isFollowUp ? 'Escalation Follow-up' : `Phase ${currentIndex + 1} of ${questions.length}`}
              </p>
            </div>
          </div>
        </div>

        {/* Right: SLA Countdown & Proctor Badges */}
        <div className="flex items-center gap-3">
          {/* SLA Countdown Timer */}
          <div className={`px-3 py-1 rounded-full ios-glass border flex items-center gap-1.5 font-mono text-xs font-bold ${
            remainingSec < 60 ? 'border-rose-400/50 text-rose-300 bg-rose-500/20 animate-pulse' : 'border-white/15 text-slate-200'
          }`}>
            <Clock className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>SLA {mm}:{ss}</span>
          </div>

          {/* Voice Tool */}
          <button
            onClick={() => setShowVoicePanel(!showVoicePanel)}
            className="ios-glass-btn px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 text-slate-200 hover:text-white"
          >
            <Radio className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="hidden sm:inline">Audio</span>
          </button>
        </div>
      </header>

      {/* Cheat Warning Toast */}
      {cheatWarning && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-rose-600/90 backdrop-blur-xl border border-rose-400 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>{cheatWarning}</span>
        </div>
      )}

      {/* ── THREE-PANE PANORAMIC WORKBENCH ──────────────────────────────────── */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto">
        
        {/* ── LEFT PANE (lg:col-span-4): CRISIS DOSSIER & STAKEHOLDERS ────────── */}
        <section className="lg:col-span-4 flex flex-col gap-5 w-full order-2 lg:order-1">
          
          {/* Incident Dossier Box */}
          <div className="ios-glass-card rounded-3xl p-5 sm:p-6 border-fuchsia-500/20 relative overflow-hidden space-y-4 shadow-[0_0_30px_rgba(217,70,239,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-fuchsia-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Incident Briefing
              </span>
              <button
                onClick={() => speech.speak(currentQuestion?.text)}
                className="ios-glass-btn p-1.5 rounded-xl text-slate-300 hover:text-white"
                title="Read Briefing Aloud"
              >
                <Volume2 className="w-4 h-4 text-fuchsia-400" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
              <p className="text-base font-semibold text-slate-100 leading-relaxed">
                {currentQuestion?.text}
              </p>
            </div>

            {/* Simulated Live Stakeholder Chatter */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-cyan-400" />
                Simulated Stakeholder Channel
              </span>
              
              <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">VP of Operations</span>
                  <span className="text-[9px] font-mono text-slate-400">1m ago</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  "Critical services are currently impacted. Please outline your immediate stabilization steps and mitigation timeline."
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300">Executive Sponsor</span>
                  <span className="text-[9px] font-mono text-slate-400">Just now</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  "Keep the action plan grounded and pragmatic. Clear decision-making is our top priority."
                </p>
              </div>
            </div>
          </div>

          {/* Camera Integrity Radar */}
          <div className="ios-glass-card rounded-3xl p-5 border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Integrity Proctor Radar
              </span>
              <span className="text-[10px] font-mono text-slate-400">On-Device AI</span>
            </div>

            <div className={`relative rounded-2xl overflow-hidden aspect-video bg-[#05070D] border-2 transition-all ${
              phoneDetected ? 'border-rose-500 ring-4 ring-rose-500/30' : 'border-white/10'
            }`}>
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />

              {phoneDetected && (
                <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center z-20 animate-pulse">
                  <ShieldAlert className="w-8 h-8 text-rose-400 mb-1" />
                  <p className="text-xs font-extrabold text-white">📱 MOBILE DETECTED</p>
                  <p className="text-[10px] text-rose-200 mt-0.5">Workspace locked until device is removed.</p>
                </div>
              )}

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 text-[9px] font-mono">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                  {faceCount === 1 ? 'Single Operator' : 'Verifying...'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300">
                  Private Session
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── CENTER / RIGHT PANE (lg:col-span-8): ACTION CONSOLE WORKBENCH ───── */}
        <section className="lg:col-span-8 flex flex-col gap-5 w-full order-1 lg:order-2">
          
          {/* Action Console Glass Terminal */}
          <div className="ios-glass-card rounded-3xl p-6 sm:p-7 border-white/15 space-y-4 shadow-[0_0_35px_rgba(0,0,0,0.3)]">
            
            {/* Header & Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('action_plan')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'action_plan'
                      ? 'bg-fuchsia-500/25 border border-fuchsia-400/40 text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.25)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📝 Action Plan Strategy
                </button>
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'terminal'
                      ? 'bg-fuchsia-500/25 border border-fuchsia-400/40 text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.25)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Incident Terminal
                </button>
              </div>

              {/* Speech recognition toggle */}
              <div className="flex items-center gap-2">
                {isListening ? (
                  <button
                    onClick={speech.stopListening}
                    className="px-3 py-1.5 rounded-full bg-rose-500/30 border border-rose-400 text-rose-200 text-xs font-bold flex items-center gap-1.5 animate-pulse"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Voice Dictation</span>
                  </button>
                ) : (
                  <button
                    onClick={speech.startListening}
                    className="ios-glass-btn px-3 py-1.5 rounded-full text-xs font-bold text-fuchsia-300 hover:text-white flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Voice Command</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action Plan Starters */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Insert Block:</span>
              <button
                type="button"
                onClick={() => insertTemplate('1. Immediate Containment & Root Cause:')}
                className="ios-glass-btn px-2.5 py-1 rounded-xl text-[11px] text-slate-300 hover:text-white"
              >
                + Containment
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('2. Step-by-Step Mitigation Plan:')}
                className="ios-glass-btn px-2.5 py-1 rounded-xl text-[11px] text-slate-300 hover:text-white"
              >
                + Mitigation Steps
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('3. Stakeholder & Customer Communication:')}
                className="ios-glass-btn px-2.5 py-1 rounded-xl text-[11px] text-slate-300 hover:text-white"
              >
                + Comms Strategy
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('4. Post-Mortem & Preventative Safeguards:')}
                className="ios-glass-btn px-2.5 py-1 rounded-xl text-[11px] text-slate-300 hover:text-white"
              >
                + Prevention
              </button>
            </div>

            {/* Action Response Textarea */}
            <div className="space-y-2">
              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening to your mitigation strategy... Speak naturally into your microphone..."
                    : "Formulate your mitigation plan, practical actions, and communication strategy here..."
                }
                rows={8}
                className="w-full ios-glass-input rounded-2xl p-4 text-sm sm:text-base font-mono text-slate-100 placeholder-slate-500 resize-none leading-relaxed"
              />
            </div>

            {/* Terminal Footer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {isReviewing && (
                  <button
                    onClick={onRedoAnswer}
                    className="ios-glass-btn px-4 py-2 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Draft</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {feedback ? (
                  <button
                    onClick={onNextQuestion}
                    className="ios-glass-btn-primary px-6 py-2.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.4)]"
                  >
                    <span>Proceed to Next Phase</span>
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onSubmitAnswer}
                    disabled={!editedTranscript.trim() || isEvaluating}
                    className="ios-glass-btn-primary px-6 py-2.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Evaluating Response…</span>
                      </>
                    ) : (
                      <>
                        <span>Deploy Mitigation & Submit</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Card (when evaluated) */}
          {feedback && (
            <div className="w-full">
              <FeedbackCard feedback={feedback} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
