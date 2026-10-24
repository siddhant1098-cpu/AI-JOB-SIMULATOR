import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';

/**
 * FeedbackCard — Futuristic iOS Glass Coach Card
 */
export default function FeedbackCard({ feedback }) {
  if (feedback?.error) {
    return (
      <div className="ios-glass-card rounded-3xl p-5 border-rose-500/30 text-rose-200">
        <p className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Note: {feedback.error}</span>
        </p>
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
      card: 'border-emerald-500/30 bg-emerald-950/15',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      headline: 'Thoughtful Response',
      barColor: 'from-emerald-400 to-cyan-400',
    },
    average: {
      card: 'border-cyan-500/30 bg-cyan-950/15',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      headline: 'Solid Practical Instincts',
      barColor: 'from-cyan-400 to-indigo-400',
    },
    weak: {
      card: 'border-amber-500/30 bg-amber-950/15',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      headline: 'Good Foundation to Build On',
      barColor: 'from-amber-400 to-rose-400',
    },
  };

  const style = verdictStyles[verdict] || verdictStyles.average;

  const MetricPill = ({ label, value }) => (
    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="font-mono font-bold text-white">{Number(value).toFixed(1)}/10</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${style.barColor} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(10, value * 10))}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className={`ios-glass-card rounded-3xl p-6 sm:p-7 border ${style.card} space-y-5 shadow-[0_0_35px_rgba(0,0,0,0.3)] transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-cyan-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${style.badge}`}>
              {style.headline}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {total ? total.toFixed(1) : ((correctness * 0.4 + problem_solving * 0.3 + communication * 0.3)).toFixed(1)}
            <span className="text-xs font-normal text-slate-400 font-sans"> /10</span>
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Evaluation Rating</div>
        </div>
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricPill label="Practical Solution" value={correctness} />
        <MetricPill label="Problem Solving" value={problem_solving} />
        <MetricPill label="Communication" value={communication} />
      </div>

      {/* Mentor Feedback */}
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mentor Coaching Notes
        </p>
        <p className="text-slate-200 text-sm leading-relaxed">
          {fb}
        </p>
      </div>

      {/* Senior Colleague Example */}
      {expected_answer && (
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
            Senior Practitioner Exemplar
          </p>
          <p className="text-slate-300 text-xs leading-relaxed">
            {expected_answer}
          </p>
        </div>
      )}

      {/* Growth suggestions */}
      {do_differently && do_differently.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Actionable Growth Suggestions
          </p>
          <div className="space-y-2">
            {do_differently.map((tip, i) => (
              <div key={i} className="text-xs text-slate-300 flex items-start gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-amber-400 font-bold mt-0.5">➔</span>
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
