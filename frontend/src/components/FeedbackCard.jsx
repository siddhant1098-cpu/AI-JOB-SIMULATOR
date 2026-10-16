import React from 'react';

/**
 * FeedbackCard — Minimal, Pastel Theme
 * Generous, empathetic human coaching feedback
 */
export default function FeedbackCard({ feedback }) {
  if (feedback?.error) {
    return (
      <div className="bg-[#FDF0ED] border border-[#F8D2CA] rounded-2xl p-5 text-stone-700">
        <p className="text-sm font-semibold text-rose-700">⚠️ Quick note: {feedback.error}</p>
      </div>
    );
  }

  const {
    correctness = 8,
    problem_solving = 8,
    communication = 8,
    verdict = 'good',
    feedback: fb,
    expected_answer,
    do_differently,
    total,
  } = feedback;

  const verdictStyles = {
    good: {
      card: 'bg-[#F2FAF5] border-[#D4EDE0]',
      badge: 'bg-[#DDF2E6] text-[#1B4D36] border-[#C2E8D3]',
      emoji: '🌿',
      headline: 'Thoughtful Response',
      barColor: 'bg-[#52B788]',
    },
    average: {
      card: 'bg-[#FFF9F2] border-[#FDE5CA]',
      badge: 'bg-[#FEECD6] text-[#7B341E] border-[#FCD7B5]',
      emoji: '☀️',
      headline: 'Solid Practical Instincts',
      barColor: 'bg-[#F4A261]',
    },
    weak: {
      card: 'bg-[#FDF4F5] border-[#FBD2D8]',
      badge: 'bg-[#FCE2E6] text-[#842029] border-[#F9C5CC]',
      emoji: '🌱',
      headline: 'Good Foundation to Build On',
      barColor: 'bg-[#E76F51]',
    },
  };

  const style = verdictStyles[verdict] || verdictStyles.average;

  const MetricPill = ({ label, value }) => (
    <div className="bg-white/80 border border-stone-200/60 rounded-xl p-2.5">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="text-stone-500 font-medium">{label}</span>
        <span className="font-bold text-stone-800">{Number(value).toFixed(1)}/10</span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.barColor}`}
          style={{ width: `${Math.min(100, Math.max(10, value * 10))}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className={`${style.card} border rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{style.emoji}</span>
          <div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
              {style.headline}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-stone-800">
            {total ? total.toFixed(1) : ((correctness * 0.4 + problem_solving * 0.3 + communication * 0.3)).toFixed(1)}
            <span className="text-xs font-medium text-stone-400"> /10</span>
          </div>
          <div className="text-[10px] text-stone-400 font-medium">overall rating</div>
        </div>
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <MetricPill label="Practical Solution" value={correctness} />
        <MetricPill label="Problem Solving" value={problem_solving} />
        <MetricPill label="Communication" value={communication} />
      </div>

      {/* Human Mentor Feedback */}
      <div className="bg-white/90 border border-stone-200/80 rounded-2xl p-4 shadow-2xs">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
          Mentor Feedback
        </p>
        <p className="text-stone-700 text-sm leading-relaxed font-normal">
          {fb}
        </p>
      </div>

      {/* Expected Example */}
      {expected_answer && (
        <div className="bg-[#F0F5FD] border border-[#D5E3FA] rounded-2xl p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A] mb-1 flex items-center gap-1.5">
            <span>💡</span> How a senior colleague might frame this
          </p>
          <p className="text-[#1E293B] text-xs leading-relaxed">
            {expected_answer}
          </p>
        </div>
      )}

      {/* Gentle next step ideas */}
      {do_differently && do_differently.length > 0 && (
        <div className="pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
            Growth Suggestions
          </p>
          <div className="space-y-1.5">
            {do_differently.map((tip, i) => (
              <div key={i} className="text-xs text-stone-600 flex items-start gap-2 bg-white/60 p-2 rounded-xl border border-stone-200/50">
                <span className="text-purple-500 font-bold">→</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
