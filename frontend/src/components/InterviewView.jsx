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
import TTSAudioPlayer from './TTSAudioPlayer';
import CorporateLogo from './CorporateLogo';

/**
 * InterviewView — Light Orange Clean Executive Telepresence Studio
 * Unified Theme matching Workspace Scenario:
 * - Spacious layout, modern light cards, orange accents
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

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');

  const isSpeaking = phase === 'speaking';
  const isListening = phase === 'listening';
  const isReviewing = phase === 'reviewing';
  const isEvaluating = phase === 'evaluating';

  return (
    <div 
      className="flex-1 w-full h-full flex flex-col overflow-y-auto select-none font-sans bg-gray-50 text-gray-900"
      onCopy={handleCopyAttempt}
      onPaste={handlePasteAttempt}
      onCut={handleCutAttempt}
      onContextMenu={handleContextMenu}
    >
      {/* ── TOP STATUS BAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 sm:px-10 py-4 flex items-center justify-between gap-6 shadow-sm">
        {/* Left: Brand & Role Information */}
        <div className="flex items-center gap-4">
          <CorporateLogo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                {config.role || 'Professional Candidate'}
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                Studio Room #104
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {config.company || 'Enterprise'} • Division: {config.domain || 'General'}
            </p>
          </div>
        </div>

        {/* Center: Progress Bar Tracker */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200">
          <span className="text-xs font-bold text-gray-700">
            {isFollowUp ? 'Follow-up Dialogue' : `Round ${currentIndex + 1} of ${questions?.length || 1}`}
          </span>
          <div className="w-28 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(10, progress)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-orange-600 font-bold">{Math.round(progress)}%</span>
        </div>

        {/* Right: Pressure / Duration Countdown & Controls */}
        <div className="flex items-center gap-3">
          {/* Pressure Mode Badge */}
          {isPressureMode && (
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs font-black shadow-sm ${
              feedback || isEvaluating
                ? 'border-gray-200 text-gray-500 bg-gray-50'
                : (pressureRemainingSec ?? 60) <= 15
                ? 'border-rose-300 text-rose-700 bg-rose-50 animate-ping'
                : 'border-amber-300 text-amber-700 bg-amber-50 animate-pulse'
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
          <div className="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 flex items-center gap-2 font-mono text-xs font-bold">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>{mm}:{ss}</span>
          </div>

          {/* Voice Settings button */}
          <button
            onClick={() => setShowVoicePanel(!showVoicePanel)}
            className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all text-xs flex items-center gap-1.5"
            title="Voice Settings"
          >
            <Radio className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline font-semibold">Voice</span>
          </button>
        </div>
      </header>

      {/* Pressure Mode High Urgency Banner */}
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
                  ? 'PRESSURE PROTOCOL: 60-Second Deadline Expired. Performance report generated below.'
                  : 'PRESSURE PROTOCOL: Spoken answer recorded and evaluated.'
                : isEvaluating
                ? 'PRESSURE PROTOCOL: 60s Timer stopped. Evaluating interview response…'
                : 'PRESSURE ROOM ACTIVE: 60-second response deadline. Prioritize core impact.'}
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

      {/* ── MAIN STUDIO STAGE (SPACIOUS PANORAMIC LAYOUT) ────────────────────── */}
      <main className="flex-1 w-full p-6 sm:p-10 lg:p-12 flex flex-col gap-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN (lg:col-span-8): AI INTERVIEWER TELEPRESENCE & INPUT ── */}
          <section className="lg:col-span-8 flex flex-col gap-8 w-full">
            
            {/* AI Interviewer Stage Card */}
            <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 relative overflow-hidden space-y-6 ${isPressureMode ? 'border-amber-300' : ''}`}>
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-orange-600" />
                    </div>
                    {isSpeaking && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-400 rounded-full animate-ping" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                      <span>AI Executive Interviewer</span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                        Live Telepresence
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Evaluating communication clarity, practical acumen, and reasoning.
                    </p>
                  </div>
                </div>

                {/* Soundwaves / Status Indicator */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200">
                  {(isSpeaking || elevenLabs?.isPlaying || elevenLabs?.isLoading) ? (
                    elevenLabs?.isLoading ? (
                      <div className="flex items-center gap-2 text-orange-600 text-xs font-bold">
                        <div className="w-3 h-3 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                        <span>Generating voice…</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 h-5 px-1">
                        <span className="w-1 bg-orange-500 rounded-full animate-soundwave-1" />
                        <span className="w-1 bg-orange-400 rounded-full animate-soundwave-2" />
                        <span className="w-1 bg-orange-500 rounded-full animate-soundwave-3" />
                        <span className="w-1 bg-orange-400 rounded-full animate-soundwave-4" />
                        <span className="w-1 bg-orange-500 rounded-full animate-soundwave-5" />
                        <span className="text-xs text-orange-600 font-bold ml-2">Speaking</span>
                      </div>
                    )
                  ) : isListening ? (
                    <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span>Listening to you</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">Ready</span>
                  )}
                </div>
              </div>

              {/* Conversational Question Teleprompter */}
              <div className="p-6 sm:p-7 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                      {isFollowUp ? 'Follow-Up Dialogue' : `Interview Question ${currentIndex + 1}`}
                    </span>
                    {currentQuestion?.character && (
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        {currentQuestion.character}
                      </span>
                    )}
                    {currentQuestion?.priority && (
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        currentQuestion.priority === 'P4' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        currentQuestion.priority === 'P3' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {currentQuestion.priority}
                      </span>
                    )}
                  </div>
                  <TTSAudioPlayer
                    ttsState={elevenLabs?.ttsState || 'idle'}
                    ttsError={elevenLabs?.ttsError}
                    ttsProgress={elevenLabs?.ttsProgress || 0}
                    onPause={() => elevenLabs?.pauseTTS()}
                    onResume={() => elevenLabs?.resumeTTS()}
                    onReplay={() => {
                      elevenLabs?.replayTTS(currentQuestion?.text, {
                        character: currentQuestion?.character || 'Interviewer',
                        characterAuthorityLevel: currentQuestion?.character_authority_level || 3,
                        priority: currentQuestion?.priority || 'P2',
                      });
                    }}
                    compact={true}
                  />
                </div>
                <p className="text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed pt-1">
                  "{currentQuestion?.text}"
                </p>
              </div>

            </div>

            {/* ── STATE 1: EVALUATING SPINNER (No text box) ─── */}
            {isEvaluating && !feedback && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Evaluating Spoken Response…</h3>
                <p className="text-xs text-gray-500 font-mono max-w-md">
                  Analyzing communication clarity, professional etiquette, role-specific judgment, and practical solution
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
                      <span>60-Second Deadline Expired: Response was auto-submitted. Strict operational penalties applied.</span>
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
                      <span>Proceed to Next Round</span>
                      <Send className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onFinishSession}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
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
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    <span>Your Spoken Response</span>
                  </label>
                  {isStrict && (
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
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
                    className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-base text-gray-900 placeholder-gray-400 resize-none transition-all focus:outline-none focus:border-orange-400"
                  />

                  {/* Mic Floating Action Button inside Textarea */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
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
                        className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                      >
                        <Mic className="w-4 h-4 text-orange-500" />
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
                        className="px-5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-all"
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
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl text-base font-bold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none shadow-sm transition-all"
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
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${cameraReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Candidate Feed</span>
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
                    {cameraReady ? '● 1080p Live' : 'Connecting...'}
                  </span>
                </div>
              </div>

              {/* Video Container */}
              <div className={`relative rounded-2xl overflow-hidden aspect-video bg-gray-900 border transition-all duration-300 ${
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
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-7 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-3">
                Scoring Dimensions (0-100 Rubric)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Problem Solving', color: 'text-orange-500' },
                  { label: 'Decision Making', color: 'text-orange-600' },
                  { label: 'Communication', color: 'text-orange-500' },
                  { label: 'Etiquette', color: 'text-emerald-600' },
                  { label: 'Prioritisation', color: 'text-amber-600' },
                  { label: 'Accountability', color: 'text-rose-600' },
                  { label: 'Teamwork', color: 'text-teal-600' },
                  { label: 'Adaptability', color: 'text-violet-600' },
                ].map(({ label, color }) => (
                  <div key={label} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <span className="text-gray-600 text-[11px] font-medium">{label}</span>
                    <span className={`${color} font-mono font-bold text-[10px]`}>0-100</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed pt-1">
                💡 Speak in everyday natural language. Practical judgment is valued over textbook terminology.
              </p>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}
