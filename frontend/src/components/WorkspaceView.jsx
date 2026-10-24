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
  Sliders,
  Sparkles,
  User,
  ArrowRight,
  TrendingUp,
  BarChart3,
  CheckSquare
} from 'lucide-react';
import FeedbackCard from './FeedbackCard';
import CorporateLogo from './CorporateLogo';

/**
 * WorkspaceView — ProdAI Dark Purple Dashboard Theme
 * Matches the user's uploaded dashboard reference:
 * - Deep dark slate purple background (#12131e)
 * - Modern dark dashboard cards (#1c1d2c) with thin borders (#2b2d42)
 * - Top greeting banner with glowing purple progress bar
 * - AI Chat & Recommendations card from reference
 * - Donut / Bar focus efficiency telemetry from reference
 * - Task priority checklist & action strategy terminal
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
  const { config = {}, questions = [], currentIndex = 0 } = session || {};
  const { videoRef, cameraReady, cameraError, faceCount = 1, phoneDetected = false } = camera || {};

  const [activeTab, setActiveTab] = useState('action_plan'); // action_plan | terminal
  const [activeFilter, setActiveFilter] = useState('Live Incident');

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');

  const isSpeaking = phase === 'speaking';
  const isListening = phase === 'listening';
  const isReviewing = phase === 'reviewing';
  const isEvaluating = phase === 'evaluating';

  const candidateName = config.candidate_name || 'Commander';
  const targetPersonRole = config.target_person_role || currentQuestion?.character || 'Direct Manager';

  // Quick action templates to assist candidates during crisis scenarios
  const insertTemplate = (prefix) => {
    setEditedTranscript((prev) => {
      const space = (prev || '').trim() ? '\n\n' : '';
      return `${prev || ''}${space}${prefix} `;
    });
  };

  return (
    <div 
      className="flex-1 w-full h-full flex flex-col overflow-y-auto select-none font-sans prodai-bg text-slate-100"
      onCopy={handleCopyAttempt}
      onPaste={handlePasteAttempt}
      onCut={handleCutAttempt}
      onContextMenu={handleContextMenu}
    >
      {/* ── TOP HEADER (PRODAI THEME) ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#161726]/90 backdrop-blur-xl border-b border-[#2b2d42] px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand & Incident Status */}
        <div className="flex items-center gap-3.5">
          <CorporateLogo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-400">
                #INC-8492
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3 text-rose-400" />
                SEV-1 ACTIVE
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400">
                {config.domain || 'Enterprise Operations'}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
              Workspace Scenario Console
            </h2>
          </div>
        </div>

        {/* Center: Top Filter Pills matching the screenshot ("Daily", "Live Incident", etc.) */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-[#1c1d2c] border border-[#2b2d42] text-xs">
          {['Overview', 'Live Incident', 'Active Tasks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === tab
                  ? 'prodai-pill-active'
                  : 'prodai-pill-inactive'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right: SLA Countdown Timer & Audio Button */}
        <div className="flex items-center gap-3">
          {/* SLA Countdown Timer */}
          <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-xs font-bold ${
            remainingSec < 60 
              ? 'border-rose-400/50 text-rose-300 bg-rose-500/20 animate-pulse' 
              : 'border-[#2b2d42] bg-[#1c1d2c] text-purple-300'
          }`}>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>SLA {mm}:{ss}</span>
          </div>

          {/* Voice Tool */}
          <button
            onClick={() => setShowVoicePanel(!showVoicePanel)}
            className="p-2 rounded-xl bg-[#1c1d2c] border border-[#2b2d42] text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="Audio settings"
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline font-semibold">Audio</span>
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

      {/* ── MAIN DASHBOARD STAGE (PRODAI THEME) ──────────────────────────────── */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
        
        {/* Top Greeting & Slim Progress Bar (Matches Screenshot Header) */}
        <div className="prodai-card p-5 sm:p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.35)]">
                <div className="w-full h-full rounded-[11px] bg-[#161726] flex items-center justify-center text-purple-300 font-bold text-xs">
                  MG
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Good evening, {candidateName}!
                </h3>
                <p className="text-xs text-slate-400">
                  Active scenario addressing: <strong className="text-purple-300">{targetPersonRole}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#161726] border border-[#2b2d42] text-slate-300">
                Phase {currentIndex + 1} of {questions?.length || 1}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                currentQuestion?.priority === 'P4' ? 'bg-rose-500/20 text-rose-300 border-rose-400/40 animate-pulse' :
                currentQuestion?.priority === 'P3' ? 'bg-purple-500/20 text-purple-300 border-purple-400/40' :
                'bg-slate-500/20 text-slate-300 border-slate-400/40'
              }`}>
                {currentQuestion?.priority || 'P3 High Priority'}
              </span>
            </div>
          </div>

          {/* Glowing Purple Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Resolution Progress</span>
              <span className="text-purple-300 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#161726] overflow-hidden border border-[#2b2d42]">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 rounded-full shadow-[0_0_10px_#8b5cf6] transition-all duration-500"
                style={{ width: `${Math.max(10, progress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN PANORAMIC GRID ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT / MAIN COLUMN (lg:col-span-8): DOSSIER & ACTION TERMINAL ─── */}
          <section className="lg:col-span-8 flex flex-col gap-6 w-full">
            
            {/* Incident Briefing Dossier Card */}
            <div className="prodai-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2b2d42] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Incident Context Briefing
                  </span>
                </div>
                <button
                  onClick={() => speech.speak(currentQuestion?.text)}
                  className="p-1.5 rounded-lg bg-[#161726] border border-[#2b2d42] text-slate-300 hover:text-white transition-all"
                  title="Read Briefing Aloud"
                >
                  <Volume2 className="w-4 h-4 text-purple-400" />
                </button>
              </div>

              {/* Scenario Context Highlight */}
              <div className="p-4 rounded-xl bg-[#161726] border border-[#2b2d42]">
                <p className="text-base font-semibold text-slate-100 leading-relaxed">
                  "{currentQuestion?.text}"
                </p>
              </div>

              {/* Stakeholder Interaction Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Person Addressed: <strong className="text-white">{targetPersonRole}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/25">
                    Authority Level {currentQuestion?.character_authority_level || 3}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Strategy Console Terminal Card */}
            <div className="prodai-card p-6 space-y-4">
              
              {/* Header & Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b2d42] pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('action_plan')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'action_plan'
                        ? 'prodai-pill-active'
                        : 'prodai-pill-inactive'
                    }`}
                  >
                    📝 Action Plan Strategy
                  </button>
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'terminal'
                        ? 'prodai-pill-active'
                        : 'prodai-pill-inactive'
                    }`}
                  >
                    ⚡ Terminal View
                  </button>
                </div>

                {/* Speech Dictation Button */}
                <div className="flex items-center gap-2">
                  {isListening ? (
                    <button
                      onClick={speech.stopListening}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/30 border border-rose-400 text-rose-200 text-xs font-bold flex items-center gap-1.5 animate-pulse"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Stop Dictation</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => speech.startListening().catch(() => {})}
                      className="px-3 py-1.5 rounded-lg bg-[#232436] border border-[#2b2d42] text-purple-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Mic className="w-3.5 h-3.5 text-purple-400" />
                      <span>Voice Command</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Action Plan Starters (Inspired by Task list from screenshot) */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Insert Block:</span>
                <button
                  type="button"
                  onClick={() => insertTemplate('1. Immediate Containment & Root Cause:')}
                  className="px-2.5 py-1 rounded-lg bg-[#161726] border border-[#2b2d42] text-[11px] text-slate-300 hover:text-white hover:border-purple-400/40 transition-all"
                >
                  + Containment
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('2. Step-by-Step Mitigation Plan:')}
                  className="px-2.5 py-1 rounded-lg bg-[#161726] border border-[#2b2d42] text-[11px] text-slate-300 hover:text-white hover:border-purple-400/40 transition-all"
                >
                  + Mitigation Steps
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('3. Stakeholder Communication Strategy:')}
                  className="px-2.5 py-1 rounded-lg bg-[#161726] border border-[#2b2d42] text-[11px] text-slate-300 hover:text-white hover:border-purple-400/40 transition-all"
                >
                  + Comms Strategy
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('4. Preventative Safeguards & SLA Recovery:')}
                  className="px-2.5 py-1 rounded-lg bg-[#161726] border border-[#2b2d42] text-[11px] text-slate-300 hover:text-white hover:border-purple-400/40 transition-all"
                >
                  + Preventative
                </button>
              </div>

              {/* Strategy Textarea */}
              <div className="space-y-2">
                <textarea
                  value={editedTranscript || ''}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  placeholder={
                    isListening
                      ? "Listening to your response... Speak clearly into your microphone..."
                      : `Address ${targetPersonRole} directly with your mitigation strategy, ownership plan, and timeline...`
                  }
                  rows={8}
                  className="w-full prodai-input rounded-xl p-4 text-sm font-mono text-slate-100 placeholder-slate-500 resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {isReviewing && (
                    <button
                      onClick={onRedoAnswer}
                      className="px-3.5 py-2 rounded-xl bg-[#161726] border border-[#2b2d42] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
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
                      className="prodai-btn-primary px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2"
                    >
                      <span>Proceed to Next Phase</span>
                      <Send className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onSubmitAnswer}
                      disabled={!(editedTranscript || '').trim() || isEvaluating}
                      className="prodai-btn-primary px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {isEvaluating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Evaluating Response Acumen…</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Action Strategy</span>
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

          {/* ── RIGHT COLUMN (lg:col-span-4): PRODAI WIDGETS & RECOMMENDATIONS ── */}
          <aside className="lg:col-span-4 flex flex-col gap-6 w-full">
            
            {/* Widget 1: AI Chat & Recommendations (Matches Screenshot Top-Right) */}
            <div className="prodai-card p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#2b2d42] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white tracking-tight">
                    AI Chat & Recommendations
                  </span>
                </div>
                <span className="text-[10px] font-mono text-purple-300">
                  Real-Time
                </span>
              </div>

              {/* Chat Bubble from Stakeholder */}
              <div className="p-3.5 rounded-xl bg-[#161726] border border-[#2b2d42] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">
                    {targetPersonRole}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">Live</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  "I need an immediate assessment of the impact, your containment steps, and when we will be fully stabilized."
                </p>
              </div>

              {/* Bulleted AI Recommendations from Screenshot */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                <div className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Focus Block:</strong> Clearly state the immediate containment action before technical nuances.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Tone Alignment:</strong> Demonstrate personal accountability and practical next steps.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>End Reflection:</strong> Propose preventative measures to avoid recurrence.</span>
                </div>
              </div>
            </div>

            {/* Widget 2: Focus Efficiency Donut & Bar Chart (Matches Screenshot Donut & Bars) */}
            <div className="prodai-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2b2d42] pb-3">
                <span className="text-xs font-bold text-white tracking-tight">
                  Focus Efficiency & Stability
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Live Telemetry
                </span>
              </div>

              {/* Circular Donut Gauge from Screenshot (e.g. 62% in screenshot) */}
              <div className="flex items-center justify-center py-2">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#232436"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#8b5cf6"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset="75.36" // ~70%
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-bold font-mono text-white">70%</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Stability</span>
                  </div>
                </div>
              </div>

              {/* Purple Bar Chart from Screenshot */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Incident Intensity</span>
                  <span className="text-purple-300">Controlled</span>
                </div>
                {/* Visual purple bars matching the screenshot */}
                <div className="flex items-end justify-between h-14 pt-2 gap-1 px-1">
                  {[35, 65, 45, 80, 55, 90, 70, 60, 85, 40].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-700 to-indigo-400 rounded-t-sm"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Widget 3: Proctor Radar & Camera Stream Frame */}
            <div className="prodai-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#2b2d42] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white tracking-tight">
                    Integrity Proctor Radar
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">On-Device</span>
              </div>

              <div className={`relative rounded-xl overflow-hidden aspect-video bg-[#0d0e17] border transition-all ${
                phoneDetected ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-[#2b2d42]'
              }`}>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />

                {phoneDetected && (
                  <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center z-20 animate-pulse">
                    <ShieldAlert className="w-7 h-7 text-rose-400 mb-1" />
                    <p className="text-xs font-extrabold text-white">📱 PHONE DETECTED</p>
                    <p className="text-[10px] text-rose-200 mt-0.5">Please remove phone from view.</p>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 text-[9px] font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 text-emerald-300 border border-emerald-500/30">
                    {faceCount === 1 ? '1 Face Verified' : 'Verifying...'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/70 text-slate-300">
                    Private Session
                  </span>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
}
