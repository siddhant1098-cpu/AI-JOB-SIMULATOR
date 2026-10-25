import React from 'react';
import { Play, RotateCcw, Clock, Layers, Sparkles } from 'lucide-react';
import CorporateLogo from './CorporateLogo';

export default function ResumeScreen({ session, onResume, onNew }) {
  const { config, currentIndex, questions, answers, startedAt, durationMin } = session;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000 / 60);
  const progress = questions.length ? Math.round((currentIndex / questions.length) * 100) : 0;
  const isInterview = config.mode === 'interview';

  return (
    <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 select-none bg-gray-50 bg-[radial-gradient(circle,#E5E7EB_1px,transparent_1px)] bg-[length:24px_24px]">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-3xl p-7 sm:p-8 text-center space-y-6 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
              Active Session Detected
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
              Continue Where You Left Off?
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Your session progress has been preserved in browser storage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Role</span>
              <span className="font-bold text-gray-900">{config.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Domain</span>
              <span className="font-semibold text-gray-700">{config.domain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Mode</span>
              <span className={`font-bold capitalize ${isInterview ? 'text-orange-600' : 'text-orange-600'}`}>
                {config.mode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Progress</span>
              <span className="font-bold text-gray-900">
                {answers.length} of {questions.length} completed
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Time</span>
              <span className="font-mono text-gray-600">
                {elapsed}m / {durationMin}m elapsed
              </span>
            </div>
          </div>

          <div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1.5">{progress}% completed</p>
          </div>

          <div className="space-y-3 pt-1">
            <button
              onClick={onResume}
              className="w-full py-3.5 btn-orange-primary text-white font-bold rounded-full transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Continue Session</span>
            </button>
            <button
              onClick={onNew}
              className="w-full py-3 btn-outline-dark text-gray-600 hover:text-gray-900 font-semibold rounded-full transition-all text-xs flex items-center justify-center gap-1.5 border border-gray-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard &amp; Start Fresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
