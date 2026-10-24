import React from 'react';
import { 
  Video, 
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
  Building2
} from 'lucide-react';
import FeedbackCard from './FeedbackCard';
import CorporateLogo from './CorporateLogo';

/**
 * InterviewView — Futuristic Executive Telepresence & Virtual Interview Studio
 * Mode: 'interview'
 * Dedicated layout with conversational AI avatar, soundwave telemetry, live speech transcribing,
 * and high-tech biometric proctoring frame.
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

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');

  const isSpeaking = phase === 'speaking';
  const isListening = phase === 'listening';
  const isReviewing = phase === 'reviewing';
  const isEvaluating = phase === 'evaluating';

  return (
    <div 
      className="flex-1 w-full h-full flex flex-col overflow-y-auto select-none"
      onCopy={handleCopyAttempt}
      onPaste={handlePasteAttempt}
      onCut={handleCutAttempt}
      onContextMenu={handleContextMenu}
    >
      {/* ── TOP CORPORATE STATUS BAR ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 ios-glass border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Corporate Logo & Role Information */}
        <div className="flex items-center gap-3.5">
          <CorporateLogo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {config.role}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                Corporate Room #104
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {config.company} • Division: {config.domain}
            </p>
          </div>
        </div>

        {/* Center: Progress Bar (Desktop) */}
        <div className="hidden md:flex flex-col items-center flex-1 max-w-xs mx-6">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500 rounded-full shadow-[0_0_8px_#22d3ee]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-medium">
            {isFollowUp ? 'Follow-up Dialogue' : `Round ${currentIndex + 1} of ${questions.length}`}
          </span>
        </div>

        {/* Right: Timer & Proctor Badges */}
        <div className="flex items-center gap-3">
          {/* Strict proctor badge */}
          {isStrict && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full ios-glass border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Proctor Active</span>
            </div>
          )}

          {/* SLA Countdown Timer */}
          <div className={`px-3 py-1 rounded-full ios-glass border flex items-center gap-1.5 font-mono text-xs font-bold ${
            remainingSec < 60 ? 'border-rose-400/50 text-rose-300 bg-rose-500/20 animate-pulse' : 'border-white/15 text-slate-200'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{mm}:{ss}</span>
          </div>

          {/* Voice Selector button */}
          <button
            onClick={() => setShowVoicePanel(!showVoicePanel)}
            className="ios-glass-btn px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 text-slate-200 hover:text-white"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Voice</span>
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

      {/* ── MAIN STUDIO STAGE (Wide Responsive Split View) ──────────────────── */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto">
        
        {/* ── LEFT COLUMN (lg:col-span-8): AI INTERVIEWER TELEPRESENCE & INPUT ── */}
        <section className="lg:col-span-8 flex flex-col gap-5 w-full">
          
          {/* AI Interviewer Holographic Card */}
          <div className="ios-glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    <div className="w-full h-full rounded-[14px] bg-[#0A0F1D] flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-cyan-300" />
                    </div>
                  </div>
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    AI Lead Interviewer
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                      Live Telepresence
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evaluating practical acumen, clarity, and communication
                  </p>
                </div>
              </div>

              {/* Soundwaves / Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full ios-glass border-white/10">
                {isSpeaking ? (
                  <div className="flex items-center gap-1 h-5 px-1">
                    <span className="w-1 bg-cyan-400 rounded-full animate-soundwave-1" />
                    <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-2" />
                    <span className="w-1 bg-cyan-400 rounded-full animate-soundwave-3" />
                    <span className="w-1 bg-purple-400 rounded-full animate-soundwave-4" />
                    <span className="w-1 bg-cyan-400 rounded-full animate-soundwave-5" />
                    <span className="text-[10px] text-cyan-300 font-bold ml-1.5">Speaking</span>
                  </div>
                ) : isListening ? (
                  <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Listening to you</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Ready</span>
                )}
              </div>
            </div>

            {/* Conversational Question Teleprompter */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400/90">
                    {isFollowUp ? 'Follow-Up Inquiring' : `Interview Question ${currentIndex + 1}`}
                  </span>
                  {currentQuestion?.character && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-400/20">
                      {currentQuestion.character}
                    </span>
                  )}
                  {currentQuestion?.priority && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      currentQuestion.priority === 'P4' ? 'bg-rose-500/15 text-rose-300 border-rose-400/30' :
                      currentQuestion.priority === 'P3' ? 'bg-amber-500/15 text-amber-300 border-amber-400/30' :
                      'bg-slate-500/15 text-slate-300 border-slate-400/30'
                    }`}>
                      {currentQuestion.priority}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => speech.speak(currentQuestion?.text)}
                  className="ios-glass-btn p-1.5 rounded-xl text-slate-300 hover:text-white"
                  title="Replay Audio"
                >
                  <Volume2 className="w-4 h-4 text-cyan-300" />
                </button>
              </div>
              <p className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
                "{currentQuestion?.text}"
              </p>
            </div>

            {/* Answer Input Workspace */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Your Spoken Response</span>
                </label>
                {isStrict && (
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 border border-purple-400/30 px-2 py-0.5 rounded-full">
                    🛡️ Protected Field
                  </span>
                )}
              </div>

              {/* Textarea / Live Speech Transcript */}
              <div className="relative">
                <textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  placeholder={
                    isListening 
                      ? "Listening to your answer... Speak naturally into your microphone..." 
                      : "Click 'Speak Answer' to talk, or type your answer here..."
                  }
                  rows={4}
                  className="w-full ios-glass-input rounded-2xl p-4 text-sm sm:text-base text-slate-100 placeholder-slate-500 resize-none transition-all"
                />

                {/* Live Mic Floating Action inside Textarea */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {isListening ? (
                    <button
                      onClick={speech.stopListening}
                      className="px-3 py-1.5 rounded-full bg-rose-500/30 border border-rose-400 text-rose-200 text-xs font-bold flex items-center gap-1.5 animate-pulse"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Stop Dictation</span>
                    </button>
                  ) : (
                    <button
                      onClick={speech.startListening}
                      className="ios-glass-btn px-3 py-1.5 rounded-full text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Speak Answer</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {isReviewing && (
                    <button
                      onClick={onRedoAnswer}
                      className="ios-glass-btn px-4 py-2 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Response</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {feedback ? (
                    <button
                      onClick={onNextQuestion}
                      className="ios-glass-btn-primary px-6 py-2.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    >
                      <span>Proceed to Next Round</span>
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
                          <span>AI Mentor Evaluating…</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Answer</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Card (when answered) */}
          {feedback && (
            <div className="w-full">
              <FeedbackCard feedback={feedback} />
            </div>
          )}
        </section>

        {/* ── RIGHT COLUMN (lg:col-span-4): CANDIDATE HUD & CAMERA PROCTOR ────── */}
        <aside className="lg:col-span-4 flex flex-col gap-5 w-full">
          
          {/* Candidate Video Stream Frame */}
          <div className="ios-glass-card rounded-3xl p-5 relative overflow-hidden border-white/15">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-tight">Candidate Feed</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {cameraReady ? '1080p Live' : 'Camera Initializing'}
              </span>
            </div>

            {/* Video Container */}
            <div className={`relative rounded-2xl overflow-hidden aspect-video bg-[#05070D] border-2 transition-all duration-300 ${
              phoneDetected 
                ? 'border-rose-500 ring-4 ring-rose-500/30' 
                : 'border-white/10'
            }`}>
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Instant On-Device Phone Detection Warning Overlay */}
              {phoneDetected && (
                <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20 animate-pulse">
                  <ShieldAlert className="w-10 h-10 text-rose-400 mb-2" />
                  <p className="text-sm font-extrabold text-white">📱 PHONE DETECTED</p>
                  <p className="text-[11px] text-rose-200 mt-1">
                    Please place your mobile phone out of camera sight to proceed.
                  </p>
                </div>
              )}

              {/* HUD Bounding telemetry */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                  {faceCount === 1 ? '👤 1 Face Verified' : faceCount === 0 ? '⚠️ No Face' : `👥 Multiple (${faceCount})`}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300">
                  Zero Cloud Upload
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              🔒 MediaPipe vision runs on your device. Video is never recorded.
            </p>
          </div>

          {/* Interview Competencies — 8 Scoring Dimensions */}
          <div className="ios-glass-card rounded-3xl p-5 border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Scoring Dimensions (0-100)
            </h4>
            <div className="space-y-1.5 text-xs">
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
                <div key={label} className="p-2 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">{label}</span>
                  <span className={`${color} font-mono font-bold text-[10px]`}>0-100</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              💡 Speak naturally. Practical intuition and clear communication are rewarded.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
