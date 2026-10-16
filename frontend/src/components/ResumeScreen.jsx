import React from 'react';

/**
 * ResumeScreen — Minimal Pastel Theme
 */
export default function ResumeScreen({ session, onResume, onNew }) {
  const { config, currentIndex, questions, answers, startedAt, durationMin } = session;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000 / 60);
  const progress = questions.length ? Math.round((currentIndex / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden flex items-center justify-center p-4">
      {/* Pastel background glows */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl border border-stone-200/80 rounded-3xl p-7 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.04)] text-center space-y-6">
          <div className="w-14 h-14 bg-purple-50 border border-purple-200 text-2xl rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            🌿
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Resume Your Session?
            </h2>
            <p className="text-stone-500 text-xs mt-1">
              You have an active simulation in progress
            </p>
          </div>

          <div className="bg-stone-50/90 border border-stone-200/70 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Role</span>
              <span className="font-semibold text-stone-800">{config.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Industry</span>
              <span className="font-semibold text-stone-800">{config.domain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Mode</span>
              <span className="font-semibold text-stone-800 capitalize">{config.mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Progress</span>
              <span className="font-semibold text-purple-700">
                {answers.length} of {questions.length} answered
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Time</span>
              <span className="text-stone-600 font-mono">
                {elapsed}m / {durationMin}m elapsed
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">{progress}% completed</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onResume}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-2xl transition-all shadow-sm text-sm"
            >
              Continue Simulation →
            </button>
            <button
              onClick={onNew}
              className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium rounded-2xl transition-all text-xs"
            >
              Discard & Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
