import React from 'react';
import { 
  Video, 
  Camera,
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Radio,
  Building2,
  Timer,
  Zap,
  Layers,
  BarChart3
} from 'lucide-react';
import FeedbackCard from './FeedbackCard';
import CorporateLogo from './CorporateLogo';

/**
 * InterviewView — Spacious Modern Dark Executive Telepresence Studio
 * Unified Theme matching Workspace Scenario:
 * - Spacious layout, modern dark cards (#181928), crisp borders (#282a3e)
 * - Support for 60s Pressure Room mode countdown
 * - Live conversational AI telepresence & speech transcription
 */
export default function InterviewView({
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
  const { videoRef, cameraReady, cameraError, faceCount = 1, phoneDetected = false, startCamera, toggleFacingMode, currentFacingMode = 'user' } = camera || {};

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');

  const isSpeaking = phase === 'speaking';
  const isListening = phase === 'listening';
  const isReviewing = phase === 'reviewing';
  const isEvaluating = phase === 'evaluating';

  return (
    <div 
      className="flex-1 w-full h-full flex flex-col overflow-y-auto select-none font-sans dash-bg text-slate-100"
      onCopy={handleCopyAttempt}
      onPaste={handlePasteAttempt}
      onCut={handleCutAttempt}
      onContextMenu={handleContextMenu}
    >
      {/* ── TOP STATUS BAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#121320]/95 backdrop-blur-2xl border-b border-[#282a3e] px-6 sm:px-10 py-4 flex items-center justify-between gap-6 shadow-xl">
        {/* Left: Brand & Role Information */}
        <div className="flex items-center gap-4">
          <CorporateLogo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {config.role || 'Professional Candidate'}
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                Studio Room #104
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {config.company || 'Enterprise'} • Division: {config.domain || 'General'}
            </p>
          </div>
        </div>

        {/* Center: Progress Bar Tracker */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-2xl bg-[#181928] border border-[#282a3e]">
          <span className="text-xs font-bold text-slate-300">
            {isFollowUp ? 'Follow-up Dialogue' : `Round ${currentIndex + 1} of ${questions?.length || 1}`}
          </span>
          <div className="w-28 h-2 rounded-full bg-[#121320] overflow-hidden border border-[#282a3e]">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(10, progress)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-cyan-300 font-bold">{Math.round(progress)}%</span>
        </div>

        {/* Right: Pressure / Duration Countdown & Controls */}
        <div className="flex items-center gap-3">
          {/* Pressure Mode Badge */}
          {isPressureMode && (
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs font-black shadow-lg ${
              feedback || isEvaluating
                ? 'border-slate-600 text-slate-400 bg-slate-800/40'
                : (pressureRemainingSec ?? 60) <= 15
                ? 'border-rose-400 text-rose-300 bg-rose-500/30 animate-ping'
                : 'border-amber-400/60 text-amber-300 bg-amber-500/20 animate-pulse'
            }`}>
              <Timer className="w-4 h-4 text-amber-400" />
              <span>
                {feedback || isEvaluating
                  ? 'PRESSURE 0s [STOPPED]'
                  : `PRESSURE ${pressureRemainingSec}s`}
              </span>
            </div>
          )}

          {/* SLA Countdown Timer */}
          <div className="px-4 py-2 rounded-xl border border-[#282a3e] bg-[#181928] text-slate-200 flex items-center gap-2 font-mono text-xs font-bold">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{mm}:{ss}</span>
          </div>

          {/* Voice Settings button */}
          <button
            onClick={() => setShowVoicePanel(!showVoicePanel)}
            className="p-2.5 rounded-xl bg-[#181928] border border-[#282a3e] text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="Voice Settings"
          >
            <Radio className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline font-semibold">Voice</span>
          </button>
        </div>
      </header>

      {/* Pressure Mode High Urgency Banner */}
      {isPressureMode && (
        <div className={`w-full py-2.5 px-6 sm:px-10 flex items-center justify-between text-xs font-bold border-b transition-all ${
          feedback || isEvaluating
            ? 'bg-slate-900/60 border-slate-700/60 text-slate-300'
            : 'bg-gradient-to-r from-amber-600/20 via-orange-600/30 to-amber-600/20 border-amber-500/40 text-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${feedback || isEvaluating ? 'text-slate-400' : 'text-amber-400 animate-pulse'}`} />
            <span>
              {feedback
                ? isAutoSubmitted
                  ? 'PRESSURE PROTOCOL: 60-Second Deadline Expired. Performance report generated below.'
                  : 'PRESSURE PROTOCOL: Spoken answer recorded and evaluated.'
                : isEvaluating
                ? 'PRESSURE PROTOCOL: 60s Timer stopped. Evaluating interview response…'
                : 'PRESSURE ROOM ACTIVE: 60-second response deadline. Prioritize core impact.'}
            </span>
          </div>
          <span className="font-mono text-amber-300">
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

      {/* ── MAIN STUDIO STAGE (SPACIOUS PANORAMIC LAYOUT) ────────────────────── */}
      <main className="flex-1 w-full p-6 sm:p-10 lg:p-12 flex flex-col gap-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN (lg:col-span-8): AI INTERVIEWER TELEPRESENCE & INPUT ── */}
          <section className="lg:col-span-8 flex flex-col gap-8 w-full">
            
            {/* AI Interviewer Stage Card */}
            <div className={`dash-card p-8 sm:p-10 relative overflow-hidden space-y-6 ${isPressureMode ? 'dash-card-pressure' : ''}`}>
              <div className="flex items-start justify-between gap-4 border-b border-[#282a3e] pb-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                      <div className="w-full h-full rounded-[14px] bg-[#121320] flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-cyan-300" />
                      </div>
                    </div>
                    {isSpeaking && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                      <span>AI Executive Interviewer</span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                        Live Telepresence
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Evaluating communication clarity, practical acumen, and reasoning.
                    </p>
                  </div>
                </div>

                {/* Soundwaves / Status Indicator */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121320] border border-[#282a3e]">
                  {isSpeaking ? (
                    <div className="flex items-center gap-1 h-5 px-1">
                      <span className="w-1 bg-cyan-400 rounded-full animate-soundwave-1" />
                      <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-2" />
                      <span className="w-1 bg-cyan-400 rounded-full animate-soundwave-3" />
                      <span className="w-1 bg-purple-400 rounded-full animate-soundwave-4" />
                      <span className="w-1 bg-cyan-400 rounded-full animate-soundwave-5" />
                      <span className="text-xs text-cyan-300 font-bold ml-2">Speaking</span>
                    </div>
                  ) : isListening ? (
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span>Listening to you</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Ready</span>
                  )}
                </div>
              </div>

              {/* Conversational Question Teleprompter */}
              <div className="p-6 sm:p-7 rounded-2xl bg-[#121320] border border-[#282a3e] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                      {isFollowUp ? 'Follow-Up Dialogue' : `Interview Question ${currentIndex + 1}`}
                    </span>
                    {currentQuestion?.character && (
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-400/25">
                        {currentQuestion.character}
                      </span>
                    )}
                    {currentQuestion?.priority && (
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        currentQuestion.priority === 'P4' ? 'bg-rose-500/20 text-rose-300 border-rose-400/40' :
                        currentQuestion.priority === 'P3' ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' :
                        'bg-slate-500/20 text-slate-300 border-slate-400/40'
                      }`}>
                        {currentQuestion.priority}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => speech.speak(currentQuestion?.text)}
                    className="p-2 rounded-xl bg-[#181928] border border-[#282a3e] text-slate-300 hover:text-white transition-all"
                    title="Replay Audio"
                  >
                    <Volume2 className="w-4 h-4 text-cyan-300" />
                  </button>
                </div>
                <p className="text-xl sm:text-2xl font-medium text-slate-100 leading-relaxed pt-1">
                  "{currentQuestion?.text}"
                </p>
              </div>

              </div>

              {/* ── STATE 1: EVALUATING SPINNER (No text box) ─── */}
              {isEvaluating && (
                <div className="dash-card p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                  <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                  <h3 className="text-lg font-bold text-white tracking-tight">Evaluating Spoken Response…</h3>
                  <p className="text-xs text-slate-400 font-mono max-w-md">
                    Analyzing communication clarity, professional etiquette, role-specific judgment, and practical solution
                  </p>
                </div>
              )}

              {/* ── STATE 2: EVALUATION REPORT CARD (ONLY REPORT IS VISIBLE, NO TEXT BOX) ─── */}
              {feedback && (
                <div className="space-y-6 w-full animate-fadeIn">
                  {isAutoSubmitted && (
                    <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-between shadow-xl">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        <span>60-Second Deadline Expired: Response was auto-submitted. Strict operational penalties applied.</span>
                      </div>
                      <span className="font-mono text-[11px] bg-rose-500/30 px-3 py-1 rounded-lg">Auto-Submitted</span>
                    </div>
                  )}

                  {/* The Evaluation Report */}
                  <FeedbackCard feedback={feedback} />

                  {/* Post-Report Navigation Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <button
                      onClick={onFinishSession}
                      className="px-6 py-3.5 rounded-2xl bg-[#181928] hover:bg-[#202236] border border-[#282a3e] text-slate-200 text-sm font-bold flex items-center gap-2 transition-all shadow-lg"
                    >
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                      <span>View Full Simulation Report</span>
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={onNextQuestion}
                        className="dash-btn-primary px-8 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2 shadow-xl"
                      >
                        <span>Proceed to Next Round</span>
                        <Send className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={onFinishSession}
                        className="dash-btn-primary px-8 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2 shadow-xl"
                      >
                        <span>Complete Interview & View Final Report</span>
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── STATE 3: ANSWER INPUT WORKSPACE (ONLY VISIBLE BEFORE SUBMISSION) ─── */}
              {!feedback && !isEvaluating && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Your Spoken Response</span>
                    </label>
                    {isStrict && (
                      <span className="text-xs font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                        🛡️ Strict Integrity Active
                      </span>
                    )}
                  </div>

                  {/* Textarea / Live Speech Transcript */}
                  <div className="relative">
                    <textarea
                      value={editedTranscript || ''}
                      onChange={(e) => setEditedTranscript(e.target.value)}
                      placeholder={
                        isListening 
                          ? "Listening to your spoken answer... Speak clearly into your microphone..." 
                          : "Click 'Speak Answer' to talk, or formulate your response here..."
                      }
                      rows={6}
                      className="w-full dash-input rounded-2xl p-5 text-base text-slate-100 placeholder-slate-500 resize-none transition-all"
                    />

                    {/* Mic Floating Action Button inside Textarea */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      {isListening ? (
                        <button
                          onClick={speech.stopListening}
                          className="px-4 py-2 rounded-xl bg-rose-500/30 border border-rose-400 text-rose-200 text-xs font-bold flex items-center gap-2 animate-pulse"
                        >
                          <MicOff className="w-4 h-4" />
                          <span>Stop Dictation</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => speech.startListening().catch(() => {})}
                          className="px-4 py-2 rounded-xl bg-[#181928] border border-[#282a3e] text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                        >
                          <Mic className="w-4 h-4 text-cyan-400" />
                          <span>Speak Answer</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      {isReviewing && (
                        <button
                          onClick={onRedoAnswer}
                          className="dash-btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Reset Answer</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={onSubmitAnswer}
                        disabled={!(editedTranscript || '').trim() || isEvaluating}
                        className="dash-btn-primary px-8 py-3.5 rounded-2xl text-base font-bold text-white flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none shadow-xl"
                      >
                        <span>Submit Response</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </section>

          {/* ── RIGHT COLUMN (lg:col-span-4): HUD & 8 DIMENSIONS ──────────────── */}
          <aside className="lg:col-span-4 flex flex-col gap-8 w-full">
            
            {/* Candidate Video Stream Frame */}
            <div className="dash-card p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-[#282a3e] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${cameraReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Candidate Feed</span>
                </div>
                <div className="flex items-center gap-2">
                  {cameraReady && (
                    <button
                      type="button"
                      onClick={() => toggleFacingMode && toggleFacingMode()}
                      className="px-2 py-1 rounded-lg bg-[#121320] hover:bg-[#1a1c2e] border border-[#282a3e] text-slate-300 hover:text-white transition-all text-[10px] font-mono flex items-center gap-1 shadow-sm"
                      title="Switch between front and rear camera"
                    >
                      <RotateCcw className="w-2.5 h-2.5 text-indigo-400" />
                      <span>{currentFacingMode === 'user' ? 'Front Cam' : 'Rear Cam'}</span>
                    </button>
                  )}
                  <span className="text-xs font-mono text-slate-400">
                    {cameraReady ? '● 1080p Live' : 'Connecting...'}
                  </span>
                </div>
              </div>

              {/* Video Container */}
              <div className={`relative rounded-2xl overflow-hidden aspect-video bg-[#0d0e17] border transition-all duration-300 ${
                phoneDetected ? 'border-rose-500 ring-4 ring-rose-500/30' : 'border-[#282a3e]'
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#0d0e17]/95 text-center z-10 space-y-2">
                    <Video className="w-7 h-7 text-indigo-400 animate-pulse" />
                    <p className="text-xs font-medium text-slate-300">
                      {cameraError ? cameraError : 'Initializing front camera…'}
                    </p>
                    <button
                      type="button"
                      onClick={() => startCamera && startCamera('user')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-bold text-indigo-200 transition-all flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{cameraError ? 'Retry Front Camera' : 'Enable Front Camera'}</span>
                    </button>
                  </div>
                )}

                {phoneDetected && (
                  <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20 animate-pulse">
                    <ShieldAlert className="w-8 h-8 text-rose-400 mb-1" />
                    <p className="text-sm font-extrabold text-white">📱 PHONE DETECTED</p>
                    <p className="text-xs text-rose-200 mt-1">
                      Please remove your phone from camera sight to proceed.
                    </p>
                  </div>
                )}

                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 text-[10px] font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 text-emerald-300 border border-emerald-500/30">
                    {faceCount === 1 ? '👤 Face Verified' : faceCount > 1 ? 'Multiple Faces' : 'Front Face Checking...'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 text-slate-300">
                    {currentFacingMode === 'user' ? 'Front Lens' : 'Rear Lens'}
                  </span>
                </div>
              </div>
            </div>

            {/* 8 Scoring Dimensions Card */}
            <div className="dash-card p-7 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-[#282a3e] pb-3">
                Scoring Dimensions (0-100 Rubric)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Problem Solving', color: 'text-cyan-400' },
                  { label: 'Decision Making', color: 'text-indigo-400' },
                  { label: 'Communication', color: 'text-purple-400' },
                  { label: 'Etiquette', color: 'text-emerald-400' },
                  { label: 'Prioritisation', color: 'text-amber-400' },
                  { label: 'Accountability', color: 'text-rose-400' },
                  { label: 'Teamwork', color: 'text-teal-400' },
                  { label: 'Adaptability', color: 'text-fuchsia-400' },
                ].map(({ label, color }) => (
                  <div key={label} className="p-2.5 rounded-xl bg-[#121320] border border-[#282a3e] flex items-center justify-between">
                    <span className="text-slate-300 text-[11px] font-medium">{label}</span>
                    <span className={`${color} font-mono font-bold text-[10px]`}>0-100</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                💡 Speak in everyday natural language. Practical judgment is valued over textbook terminology.
              </p>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}
