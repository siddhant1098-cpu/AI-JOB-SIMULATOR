import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Terminal, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  ShieldCheck, 
  Volume2, 
  VolumeX,
  Compass,
  Cpu
} from 'lucide-react';

/**
 * NavigationRail — Futuristic iOS Glass Left Column Navigation
 * Provides 2 prominent symbols for switching between Interview Mode & Workspace Mode.
 * Fully responsive: Sticky left rail on desktop, floating bottom glass dock on mobile phones.
 */
export default function NavigationRail({ 
  currentMode, 
  onSelectMode, 
  stage, 
  isStrict = true,
  onToggleSound,
  soundMuted = false 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isInterview = currentMode === 'interview';
  const isWorkspace = currentMode === 'scenario' || currentMode === 'workspace';

  return (
    <>
      {/* ── DESKTOP LEFT COLUMN (Hidden on mobile, flex on md+) ──────────────── */}
      <aside className="hidden md:flex flex-col items-center justify-between w-20 lg:w-22 h-screen py-6 px-3 ios-glass border-r border-white/10 z-50 shrink-0 select-none">
        {/* Top: Futuristic Brand Orb */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-[0_0_20px_rgba(99,102,241,0.4)] group cursor-pointer transition-transform hover:scale-105 active:scale-95">
            <div className="w-full h-full rounded-[14px] bg-[#090D18]/90 backdrop-blur-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300/80">
            Aegis
          </span>
        </div>

        {/* Center: Two Main Mode Switcher Symbols */}
        <div className="flex flex-col items-center gap-5 w-full">
          <div className="w-8 h-[1px] bg-white/10 my-1" />

          {/* Mode 1: Interview Mode Symbol */}
          <button
            onClick={() => onSelectMode('interview')}
            title="Switch to Interview Mode (Conversational Audio/Video)"
            className={`group relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
              isInterview
                ? 'ios-glass-panel-active bg-gradient-to-br from-indigo-500/25 to-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-105'
                : 'ios-glass-btn text-slate-400 hover:text-white hover:border-white/30'
            }`}
          >
            {/* Active Pill Indicator on edge */}
            {isInterview && (
              <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#22d3ee]" />
            )}

            <Video className={`w-6 h-6 transition-transform duration-300 ${isInterview ? 'scale-110 text-cyan-300' : 'group-hover:scale-110'}`} />
            <span className="text-[9px] font-bold tracking-tight mt-1 opacity-90">
              Interview
            </span>

            {/* Glowing Hover Tooltip */}
            <div className="absolute left-18 px-3 py-1.5 rounded-xl ios-glass text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 text-white shadow-xl translate-x-1 group-hover:translate-x-0 border-white/20">
              🎙️ Interview Mode
            </div>
          </button>

          {/* Mode 2: Workspace Mode Symbol */}
          <button
            onClick={() => onSelectMode('scenario')}
            title="Switch to Workspace Mode (Incident Simulation Console)"
            className={`group relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
              isWorkspace
                ? 'ios-glass-panel-active bg-gradient-to-br from-purple-500/25 to-pink-500/20 text-fuchsia-300 border-fuchsia-400/40 shadow-[0_0_25px_rgba(217,70,239,0.35)] scale-105'
                : 'ios-glass-btn text-slate-400 hover:text-white hover:border-white/30'
            }`}
          >
            {/* Active Pill Indicator on edge */}
            {isWorkspace && (
              <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-fuchsia-400 rounded-r-full shadow-[0_0_12px_#e879f9]" />
            )}

            <Terminal className={`w-6 h-6 transition-transform duration-300 ${isWorkspace ? 'scale-110 text-fuchsia-300' : 'group-hover:scale-110'}`} />
            <span className="text-[9px] font-bold tracking-tight mt-1 opacity-90">
              Workspace
            </span>

            {/* Glowing Hover Tooltip */}
            <div className="absolute left-18 px-3 py-1.5 rounded-xl ios-glass text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 text-white shadow-xl translate-x-1 group-hover:translate-x-0 border-white/20">
              ⚡ Workspace Mode
            </div>
          </button>

          <div className="w-8 h-[1px] bg-white/10 my-1" />
        </div>

        {/* Bottom: Utilities & Fullscreen Toggle */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Proctor Shield Badge */}
          {isStrict && (
            <div 
              title="On-Device Strict Proctor Active (Zero Video Stored)"
              className="w-10 h-10 rounded-xl ios-glass flex items-center justify-center text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-help"
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}

          {/* Sound Toggle (if callback provided) */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="w-10 h-10 rounded-xl ios-glass-btn flex items-center justify-center text-slate-300 hover:text-white"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="w-10 h-10 rounded-xl ios-glass-btn flex items-center justify-center text-slate-300 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* ── MOBILE RESPONSIVE BOTTOM GLASS DOCK (md:hidden) ────────────────── */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 ios-glass rounded-3xl p-2 px-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-center justify-around border-white/20">
        {/* Brand Orb Mini */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Mode 1: Interview */}
        <button
          onClick={() => onSelectMode('interview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 ${
            isInterview
              ? 'bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span className="text-xs font-bold">Interview</span>
        </button>

        {/* Mode 2: Workspace */}
        <button
          onClick={() => onSelectMode('scenario')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 ${
            isWorkspace
              ? 'bg-purple-500/25 border border-purple-400/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span className="text-xs font-bold">Workspace</span>
        </button>

        {/* Fullscreen Mini */}
        <button
          onClick={toggleFullscreen}
          className="p-2 text-slate-400 hover:text-white"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </nav>
    </>
  );
}
