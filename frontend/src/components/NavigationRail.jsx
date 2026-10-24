import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Terminal, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  Volume2, 
  VolumeX,
  Briefcase
} from 'lucide-react';
import CorporateLogo from './CorporateLogo';

/**
 * NavigationRail — Futuristic iOS Glass Left Column Navigation
 * Features the corporate brand insignia and switching between Corporate Interview & Workplace Command modes.
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
      <aside className="hidden md:flex flex-col items-center justify-between w-20 lg:w-22 h-screen py-6 px-3 bg-[#121320] border-r border-[#282a3e] z-50 shrink-0 select-none">
        {/* Top: Corporate Brand Emblem */}
        <div className="flex flex-col items-center gap-1.5" title="NEXUS CORP • Enterprise Operations Suite">
          <CorporateLogo size="md" showText={false} />
          <span className="text-[9px] font-mono font-extrabold tracking-widest text-cyan-300/90 uppercase">
            NEXUS
          </span>
        </div>

        {/* Center: Two Main Corporate Mode Symbols */}
        <div className="flex flex-col items-center gap-5 w-full">
          <div className="w-8 h-[1px] bg-white/10 my-1" />

          {/* Mode 1: Interview Mode Symbol */}
          <button
            onClick={() => onSelectMode('interview')}
            title="Corporate Interview Assessment (Executive Telepresence)"
            className={`group relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
              isInterview
                ? 'ios-glass-panel-active bg-gradient-to-br from-indigo-500/25 to-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-105'
                : 'ios-glass-btn text-slate-400 hover:text-white hover:border-white/30'
            }`}
          >
            {isInterview && (
              <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#22d3ee]" />
            )}

            <Video className={`w-5 h-5 transition-transform duration-300 ${isInterview ? 'scale-110 text-cyan-300' : 'group-hover:scale-110'}`} />
            <span className="text-[9px] font-bold tracking-tight mt-1 opacity-90">
              Interview
            </span>

            {/* Glowing Hover Tooltip */}
            <div className="absolute left-18 px-3 py-1.5 rounded-xl ios-glass text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 text-white shadow-xl translate-x-1 group-hover:translate-x-0 border-white/20">
              🎙️ Corporate Interview Suite
            </div>
          </button>

          {/* Mode 2: Workspace Mode Symbol */}
          <button
            onClick={() => onSelectMode('scenario')}
            title="Workplace Scenario Mode"
            className={`group relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
              isWorkspace
                ? 'bg-purple-600/30 text-purple-200 border border-purple-400/50 shadow-[0_0_20px_rgba(139,92,246,0.35)] scale-105'
                : 'ios-glass-btn text-slate-400 hover:text-white hover:border-white/30'
            }`}
          >
            {isWorkspace && (
              <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-purple-500 rounded-r-full shadow-[0_0_12px_#8b5cf6]" />
            )}

            <Terminal className={`w-5 h-5 transition-transform duration-300 ${isWorkspace ? 'scale-110 text-purple-300' : 'group-hover:scale-110'}`} />
            <span className="text-[9px] font-bold tracking-tight mt-1 opacity-90">
              Workspace
            </span>

            {/* Glowing Hover Tooltip */}
            <div className="absolute left-18 px-3 py-1.5 rounded-xl ios-glass text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 text-white shadow-xl translate-x-1 group-hover:translate-x-0 border-white/20">
              ⚡ Workplace Incident Command
            </div>
          </button>

          <div className="w-8 h-[1px] bg-white/10 my-1" />
        </div>

        {/* Bottom: Corporate Integrity & Fullscreen Toggle */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Proctor Shield Badge */}
          {isStrict && (
            <div 
              title="Corporate Integrity Guard: On-Device Camera & Clipboard Monitoring"
              className="w-10 h-10 rounded-xl ios-glass flex items-center justify-center text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-help"
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}

          {/* Sound Toggle */}
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
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-[#121320]/95 backdrop-blur-2xl rounded-3xl p-2 px-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-center justify-around border border-[#282a3e]">
        {/* Brand Mini */}
        <div className="flex items-center gap-2">
          <CorporateLogo size="sm" showText={false} />
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
