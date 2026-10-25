import React, { useState, useEffect } from 'react';
import { Video, Terminal, Maximize2, Minimize2, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import CorporateLogo from './CorporateLogo';

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
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
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
      {/* ── DESKTOP LEFT RAIL ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col items-center justify-between w-20 h-screen py-6 px-3 bg-white border-r border-gray-200 z-50 shrink-0 select-none">
        {/* Brand Mark */}
        <div className="flex flex-col items-center gap-1.5">
          <CorporateLogo size="md" showText={false} />
        </div>

        {/* Center Nav */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="w-8 h-px bg-gray-200 my-1" />

          {/* Interview Mode */}
          <button
            onClick={() => onSelectMode('interview')}
            title="Interview Mode"
            className={`group relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
              isInterview
                ? 'bg-orange-50 border-2 border-orange-500 text-orange-600'
                : 'bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isInterview && (
              <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-orange-500 rounded-r-full" />
            )}
            <Video className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-tight mt-1">Interview</span>
            <div className="absolute left-16 px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 shadow-xl">
              Interview Mode
            </div>
          </button>

          {/* Workspace Mode */}
          <button
            onClick={() => onSelectMode('scenario')}
            title="Workspace Mode"
            className={`group relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
              isWorkspace
                ? 'bg-orange-50 border-2 border-orange-500 text-orange-600'
                : 'bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isWorkspace && (
              <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-orange-500 rounded-r-full" />
            )}
            <Terminal className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-tight mt-1">Workspace</span>
            <div className="absolute left-16 px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 shadow-xl">
              Workspace Mode
            </div>
          </button>

          <div className="w-8 h-px bg-gray-200 my-1" />
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col items-center gap-3 w-full">
          {isStrict && (
            <div
              title="Integrity monitoring active"
              className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600 cursor-help"
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              title={soundMuted ? 'Unmute' : 'Mute'}
              className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM DOCK ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/95 backdrop-blur-xl rounded-3xl p-2 px-4 shadow-lg flex items-center justify-around border border-gray-200">
        <div className="flex items-center gap-2">
          <CorporateLogo size="sm" showText={false} />
        </div>
        <button
          onClick={() => onSelectMode('interview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
            isInterview
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span className="text-xs font-bold">Interview</span>
        </button>
        <button
          onClick={() => onSelectMode('scenario')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
            isWorkspace
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span className="text-xs font-bold">Workspace</span>
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 text-gray-500 hover:text-gray-800"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </nav>
    </>
  );
}
