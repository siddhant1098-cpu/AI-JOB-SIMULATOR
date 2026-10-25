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
  Timer,
  Zap,
  Camera,
  Video
} from 'lucide-react';
import FeedbackCard from './FeedbackCard';
import TTSAudioPlayer from './TTSAudioPlayer';
import CorporateLogo from './CorporateLogo';

/**
 * WorkspaceView — Light Orange Clean Executive Dashboard
 * Unified Theme:
 * - Clean spacious layout without crowded clutter or fake personal greetings
 * - High-stakes Pressure Mode urgency integration (60s countdown)
 * - Stakeholder channel & strategic action plan terminal
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
  elevenLabs,
  camera,
  isStrict,
  remainingSec,
  progress,
  elapsedSec,
  isPressureMode,
  pressureRemainingSec,
  onNextQuestion,
  onSubmitAnswer,
  onRedoAnswer,
  onFinishSession,
  isAutoSubmitted,
  cheatWarning,
  showVoicePanel,
  setShowVoicePanel,
  handleCopyAttempt,
  handlePasteAttempt,
  handleCutAttempt,
  handleContextMenu
}) {
  const { config = {}, questions = [], currentIndex = 0 } = session || {};
  const { videoRef, cameraReady, cameraError, isPermissionDenied, faceCount = 1, phoneDetected = false, startCamera, toggleFacingMode, currentFacingMode = 'user' } = camera || {};

  const [activeTab, setActiveTab] = useState('action_plan');

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');

  const isSpeaking = phase === 'speaking';
  const isListening = phase === 'listening';
  const isReviewing = phase === 'reviewing';
  const isEvaluating = phase === 'evaluating';

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
      className="flex-1 w-full h-full flex flex-col overflow-y-auto select-none font-sans bg-gray-50 text-gray-900"
      onCopy={handleCopyAttempt}
      onPaste={handlePasteAttempt}
      onCut={handleCutAttempt}
      onContextMenu={handleContextMenu}
    >
      {/* ── TOP HEADER (SPACIOUS EXECUTIVE STRIP) ───────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 sm:px-10 py-4 flex items-center justify-between gap-6 shadow-sm">
        {/* Left: Brand & Incident Status */}
        <div className="flex items-center gap-4">
          <CorporateLogo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-orange-600">
                #INC-8492
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1.5 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                SEV-1 ACTIVE
              </span>
              <span className="hidden sm:inline-block text-xs font-mono text-gray-500">
                {config.domain || 'Enterprise Operations'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-tight mt-0.5">
              Workspace Scenario Console
            </h2>
          </div>
        </div>

        {/* Center: Stage Progress Tracker */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200">
          <span className="text-xs font-bold text-gray-700">Phase {currentIndex + 1} of {questions?.length || 1}</span>
          <div className="w-28 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(10, progress)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-orange-600 font-bold">{Math.round(progress)}%</span>
        </div>

        {/* Right: Pressure Countdown / SLA & Audio */}
        <div className="flex items-center gap-3">
          {/* 60s Pressure Room Timer (When Pressure Mode is Active) */}
          {isPressureMode && (
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs font-black shadow-sm ${
              feedback || isEvaluating
                ? 'border-gray-200 text-gray-500 bg-gray-50'
                : (pressureRemainingSec ?? 60) <= 15
                ? 'border-rose-300 text-rose-700 bg-rose-50 animate-pulse'
                : 'border-amber-300 text-amber-700 bg-amber-50'
            }`}>
              <Timer className="w-4 h-4 text-amber-500" />
              <span>
                {feedback || isEvaluating
                  ? 'PRESSURE 0s [STOPPED]'
                  : `PRESSURE ${pressureRemainingSec}s`}
              </span>
            </div>
          )}

          {/* SLA Countdown Timer */}
          <div className="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-orange-600 flex items-center gap-2 font-mono text-xs font-bold">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>SLA {mm}:{ss}</span>
          </div>

          {/* Voice Tool */}
          <button
            onClick={() => setShowVoicePanel(!showVoicePanel)}
            className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all text-xs flex items-center gap-1.5"
            title="Audio settings"
          >
            <Radio className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline font-semibold">Audio</span>
          </button>
        </div>
      </header>

      {/* Pressure Mode High Urgency Banner (when Pressure Mode is enabled) */}
      {isPressureMode && (
        <div className={`w-full py-2.5 px-6 sm:px-10 flex items-center justify-between text-xs font-bold border-b transition-all ${
          feedback || isEvaluating
            ? 'bg-gray-100 border-gray-200 text-gray-600'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${feedback || isEvaluating ? 'text-gray-400' : 'text-amber-500 animate-pulse'}`} />
            <span>
              {feedback
                ? isAutoSubmitted
                  ? 'PRESSURE PROTOCOL: 60-Second Deadline Expired. Operational evaluation report generated below.'
                  : 'PRESSURE PROTOCOL: Response submitted and evaluated.'
                : isEvaluating
                ? 'PRESSURE PROTOCOL: 60s Timer stopped. Evaluating response acumen…'
                : 'PRESSURE ROOM ACTIVE: 60-second strict response deadline per scenario round.'}
            </span>
          </div>
          <span className="font-mono text-amber-700">
            {feedback || isEvaluating ? 'Time Stopped (0s)' : `${pressureRemainingSec}s remaining`}
          </span>
        </div>
      )}

      {/* Cheat Warning Toast */}
      {cheatWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-rose-600/90 backdrop-blur-xl border border-rose-400 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>{cheatWarning}</span>
        </div>
      )}

      {/* ── MAIN DASHBOARD STAGE (SPACIOUS & UNCLUTTERED) ────────────────────── */}
      <main className="flex-1 w-full p-6 sm:p-10 lg:p-12 flex flex-col gap-8 max-w-7xl mx-auto">
        
        {/* ── 2-COLUMN PANORAMIC GRID ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT / MAIN COLUMN (lg:col-span-8): DOSSIER & ACTION TERMINAL ─── */}
          <section className="lg:col-span-8 flex flex-col gap-8 w-full">
            
            {/* Incident Briefing Dossier Card */}
            <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 space-y-6 ${isPressureMode ? 'border-amber-300' : ''}`}>
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <h3 className="text-base font-bold uppercase tracking-wider text-gray-900">
                    Incident Context Briefing
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                    currentQuestion?.priority === 'P4' ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' :
                    currentQuestion?.priority === 'P3' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {currentQuestion?.priority || 'P3 High Priority'}
                  </span>
                  <TTSAudioPlayer
                    ttsState={elevenLabs?.ttsState || 'idle'}
                    ttsError={elevenLabs?.ttsError}
                    ttsProgress={elevenLabs?.ttsProgress || 0}
                    onPause={() => elevenLabs?.pauseTTS()}
                    onResume={() => elevenLabs?.resumeTTS()}
                    onReplay={() => {
                      elevenLabs?.replayTTS(currentQuestion?.text, {
                        character: currentQuestion?.character || targetPersonRole,
                        characterAuthorityLevel: currentQuestion?.character_authority_level || 3,
                        priority: currentQuestion?.priority || 'P3',
                      });
                    }}
                    compact={true}
                  />
                </div>
              </div>

              {/* Scenario Context Highlight */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                <p className="text-lg sm:text-xl font-medium text-gray-900 leading-relaxed">
                  "{currentQuestion?.text}"
                </p>
              </div>

              {/* Stakeholder Interaction Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 pt-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Addressing Stakeholder: <strong className="text-gray-900 text-sm">{targetPersonRole}</strong></span>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  Authority Level {currentQuestion?.character_authority_level || 3}
                </span>
              </div>
            </div>

            {/* ── STATE 1: EVALUATING SPINNER (No text box) ─── */}
            {isEvaluating && !feedback && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Evaluating Response Acumen…</h3>
                <p className="text-xs text-gray-500 font-mono max-w-md">
                  Analyzing situational decision quality, containment urgency, communication etiquette, and business consequences
                </p>
              </div>
            )}

            {/* ── STATE 2: EVALUATION REPORT CARD (ONLY REPORT IS VISIBLE, NO TEXT BOX) ─── */}
            {feedback && (
              <div className="space-y-6 w-full animate-fadeIn">
                {isAutoSubmitted && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                      <span>60-Second Deadline Expired: Response was auto-submitted. Critical operational downtime penalties applied.</span>
                    </div>
                    <span className="font-mono text-[11px] bg-rose-100 px-3 py-1 rounded-lg">Auto-Submitted</span>
                  </div>
                )}

                {/* The Evaluation Report */}
                <FeedbackCard feedback={feedback} />

                {/* Post-Report Navigation Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <button
                    onClick={onFinishSession}
                    className="px-6 py-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <BarChart3 className="w-4 h-4 text-orange-500" />
                    <span>View Full Simulation Report</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={onNextQuestion}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <span>Proceed to Next Phase</span>
                      <Send className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onFinishSession}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <span>Finish & View Complete Report</span>
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── STATE 3: ACTION STRATEGY CONSOLE TERMINAL (ONLY VISIBLE BEFORE SUBMISSION) ─── */}
            {!feedback && !isEvaluating && (
              <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 space-y-6 ${isPressureMode ? 'border-amber-300' : ''}`}>
                
                {/* Header & Dictation */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-orange-500" />
                      <span>Response Strategy</span>
                    </span>
                  </div>

                  {/* Speech Dictation Button */}
                  <div className="flex items-center gap-2">
                    {isListening ? (
                      <button
                        onClick={speech.stopListening}
                        className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-2 animate-pulse"
                      >
                        <MicOff className="w-4 h-4" />
                        <span>Stop Dictation</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => speech.startListening().catch(() => {})}
                        className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                      >
                        <Mic className="w-4 h-4 text-orange-500" />
                        <span>Voice Command</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Action Plan Starters */}
                <div className="flex flex-wrap gap-2.5">
                  <span className="text-xs font-bold text-gray-500 self-center mr-1">Insert Block:</span>
                  <button
                    type="button"
                    onClick={() => insertTemplate('1. Immediate Containment & Root Cause:')}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:text-gray-900 hover:border-orange-300 transition-all font-medium"
                  >
                    + Containment
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('2. Step-by-Step Mitigation Plan:')}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:text-gray-900 hover:border-orange-300 transition-all font-medium"
                  >
                    + Mitigation Steps
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('3. Stakeholder Communication Strategy:')}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:text-gray-900 hover:border-orange-300 transition-all font-medium"
                  >
                    + Comms Strategy
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('4. Preventative Safeguards & SLA Recovery:')}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:text-gray-900 hover:border-orange-300 transition-all font-medium"
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
                    rows={9}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-base font-mono text-gray-900 placeholder-gray-400 resize-none leading-relaxed focus:outline-none focus:border-orange-400 transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    {isReviewing && (
                      <button
                        onClick={onRedoAnswer}
                        className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset Draft</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={onSubmitAnswer}
                      disabled={!(editedTranscript || '').trim() || isEvaluating}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl text-base font-bold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none shadow-sm transition-all"
                    >
                      <span>Submit Action Strategy</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            )}

          </section>

          {/* ── RIGHT COLUMN (lg:col-span-4): STAKEHOLDER CHANNEL & RADAR ─────── */}
          <aside className="lg:col-span-4 flex flex-col gap-8 w-full">
            
            {/* Stakeholder Channel & AI Recommendations Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Stakeholder Channel
                  </span>
                </div>
                <span className="text-xs font-mono text-orange-600">
                  Live
                </span>
              </div>

              {/* Chat Bubble from Stakeholder */}
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600">
                    {targetPersonRole}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Just now</span>
                </div>
                {elevenLabs?.ttsConfigured && (elevenLabs?.isPlaying || elevenLabs?.isLoading) && (
                  <div className="flex items-center gap-1 h-3 mt-1">
                    <span className="w-0.5 bg-orange-400 rounded-full animate-soundwave-1" />
                    <span className="w-0.5 bg-orange-500 rounded-full animate-soundwave-2" />
                    <span className="w-0.5 bg-orange-400 rounded-full animate-soundwave-3" />
                    <span className="text-[10px] text-orange-600 ml-1">Speaking…</span>
                  </div>
                )}
                <p className="text-xs text-gray-900 leading-relaxed font-medium">
                  "Critical services are impacted. Please outline your immediate mitigation plan, containment steps, and recovery timeline."
                </p>
              </div>

              {/* Bulleted Recommendations */}
              <div className="space-y-2 text-xs text-gray-700 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1">
                  Strategy Guidelines:
                </span>
                <div className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>Containment:</strong> State the immediate containment step before technical details.</span>
                </div>
                <div className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>Ownership:</strong> Demonstrate direct accountability and risk visibility.</span>
                </div>
                <div className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>Safeguards:</strong> Close with proactive measures to prevent recurrence.</span>
                </div>
              </div>
            </div>

            {/* Proctor Radar & Camera Stream Frame */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-xs font-bold text-gray-700 tracking-tight">
                    Integrity Proctor Radar
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {cameraReady && (
                    <button
                      type="button"
                      onClick={() => toggleFacingMode && toggleFacingMode()}
                      className="px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all text-[10px] font-mono flex items-center gap-1 shadow-sm"
                      title="Switch between front and rear camera"
                    >
                      <RotateCcw className="w-2.5 h-2.5 text-orange-500" />
                      <span>{currentFacingMode === 'user' ? 'Front Cam' : 'Rear Cam'}</span>
                    </button>
                  )}
                  <span className="text-xs font-mono text-gray-500">
                    {cameraReady ? '● Live' : 'Connecting...'}
                  </span>
                </div>
              </div>

              <div className={`relative rounded-2xl overflow-hidden aspect-video bg-gray-900 border transition-all ${
                phoneDetected ? 'border-rose-500 ring-4 ring-rose-500/30' : 'border-gray-200'
              }`}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  webkit-playsinline="true"
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: currentFacingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />

                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3.5 bg-gray-900/95 text-center z-10 space-y-2">
                    {isPermissionDenied || (cameraError && cameraError.toLowerCase().includes('denied')) ? (
                      <>
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                          <Camera className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-white tracking-tight">Camera Blocked in Browser</p>
                        <div className="p-2 rounded-xl bg-black/60 border border-white/10 text-[10px] text-slate-300 text-left space-y-1 max-w-[280px]">
                          <p>1. Tap the <strong>tune icon (🎚️)</strong> on left side of URL bar</p>
                          <p>2. Tap <strong>Permissions</strong> → Set <strong>Camera</strong> to <strong>Allow</strong></p>
                          <p>3. Tap <strong>Retry Front Camera</strong> below</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => startCamera && startCamera('user')}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry Front Camera</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Video className="w-7 h-7 text-orange-400 animate-pulse" />
                        <p className="text-xs font-medium text-slate-300">
                          {cameraError ? cameraError : 'Initializing front camera…'}
                        </p>
                        <button
                          type="button"
                          onClick={() => startCamera && startCamera('user')}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-600/30 hover:bg-orange-600/50 border border-orange-400/40 text-xs font-bold text-orange-200 transition-all flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{cameraError ? 'Retry Front Camera' : 'Enable Front Camera'}</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {phoneDetected && (
                  <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20 animate-pulse">
                    <ShieldAlert className="w-8 h-8 text-rose-400 mb-1" />
                    <p className="text-sm font-extrabold text-white">📱 PHONE DETECTED</p>
                    <p className="text-xs text-rose-200 mt-1">Please remove mobile device from view.</p>
                  </div>
                )}

                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 text-[10px] font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 text-emerald-300 border border-emerald-500/30">
                    {faceCount === 1 ? '1 Face Verified' : faceCount > 1 ? 'Multiple Faces' : 'Front Face Checking...'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 text-slate-300">
                    {currentFacingMode === 'user' ? 'Front Lens' : 'Rear Lens'}
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
