import React from 'react';
import { Play, RotateCcw, Clock, Layers, Sparkles } from 'lucide-react';

/**
 * ResumeScreen — Futuristic iOS Glass Session Restore
 */
export default function ResumeScreen({ session, onResume, onNew }) {
  const { config, currentIndex, questions, answers, startedAt, durationMin } = session;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000 / 60);
  const progress = questions.length ? Math.round((currentIndex / questions.length) * 100) : 0;
  const isInterview = config.mode === 'interview';

  return (
    <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 select-none bg-futuristic-mesh">
      <div className="w-full max-w-md relative z-10">
        <div className="ios-glass-card rounded-3xl p-7 sm:p-8 text-center space-y-6 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] mx-auto shadow-[0_0_25px_rgba(6,182,212,0.4)]">
            <div className="w-full h-full rounded-[14px] bg-[#0A0F1D] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cyan-300" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Active Session Detected
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Resume Simulation?
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Your state and progress were preserved safely in browser storage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Role</span>
              <span className="font-bold text-white">{config.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Domain</span>
              <span className="font-semibold text-slate-300">{config.domain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Mode</span>
              <span className={`font-bold capitalize ${isInterview ? 'text-cyan-300' : 'text-fuchsia-300'}`}>
                {config.mode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Progress</span>
              <span className="font-bold text-indigo-300">
                {answers.length} of {questions.length} completed
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Time</span>
              <span className="font-mono text-slate-300">
                {elapsed}m / {durationMin}m elapsed
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_8px_#22d3ee]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1.5">{progress}% completed</p>
          </div>

          <div className="space-y-3 pt-1">
            <button
              onClick={onResume}
              className="w-full py-3.5 ios-glass-btn-primary text-white font-extrabold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Continue Session</span>
            </button>
            <button
              onClick={onNew}
              className="w-full py-3 ios-glass-btn text-slate-400 hover:text-white font-semibold rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard & Start Fresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
