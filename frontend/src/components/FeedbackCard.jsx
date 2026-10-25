import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, Lightbulb, AlertTriangle, ShieldAlert } from 'lucide-react';

/**
 * FeedbackCard — Light Orange Theme Coach Card
 * Updated for 8-dimension scoring (0-100 scale) with backward compatibility
 */
export default function FeedbackCard({ feedback }) {
  if (feedback?.error) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-5 text-rose-600">
        <p className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Note: {feedback.error}</span>
        </p>
      </div>
    );
  }

  // Support both new 8-dimension scores AND old 3-dimension scores
  const dimensionScores = feedback.dimension_scores || {};
  const hasDimensionScores = Object.keys(dimensionScores).length > 0;

  // Overall score: prefer 0-100, fall back to 0-10 * 10
  const overallScore = hasDimensionScores
    ? (feedback.overall_score || 0)
    : ((feedback.total || 0) * 10);

  const verdict = feedback.verdict || 'good';
  const fb = feedback.feedback;
  const suggestedResponse = feedback.suggested_improved_response || feedback.expected_answer;
  const doItems = feedback.do_differently || [];
  const consequences = feedback.consequences;
  const strengths = feedback.strengths || [];
  const improvements = feedback.improvement_areas || [];

  const verdictStyles = {
    excellent: {
      card: 'border-emerald-300 bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      headline: 'Outstanding Response',
      barColor: 'from-emerald-400 to-teal-400',
    },
    good: {
      card: 'border-emerald-300 bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      headline: 'Thoughtful Response',
      barColor: 'from-emerald-400 to-teal-400',
    },
    average: {
      card: 'border-orange-200 bg-orange-50',
      badge: 'bg-orange-100 text-orange-700 border-orange-300',
      headline: 'Solid Practical Instincts',
      barColor: 'from-orange-400 to-orange-600',
    },
    developing: {
      card: 'border-amber-200 bg-amber-50',
      badge: 'bg-amber-100 text-amber-700 border-amber-300',
      headline: 'Good Foundation to Build On',
      barColor: 'from-amber-400 to-orange-500',
    },
    weak: {
      card: 'border-amber-200 bg-amber-50',
      badge: 'bg-amber-100 text-amber-700 border-amber-300',
      headline: 'Good Foundation to Build On',
      barColor: 'from-amber-400 to-orange-500',
    },
  };

  const isZeroScore = overallScore === 0;
  const zeroVerdictStyle = {
    card: 'border-rose-300 bg-rose-50',
    badge: 'bg-rose-100 text-rose-700 border-rose-300',
    headline: 'Non-Substantive Response (0 Pts)',
    barColor: 'from-rose-400 to-amber-400',
  };

  const style = isZeroScore ? zeroVerdictStyle : (verdictStyles[verdict] || verdictStyles.average);

  // Dimension labels for display
  const dimensionLabels = {
    problem_solving: 'Problem Solving',
    decision_making: 'Decision Making',
    communication: 'Communication',
    etiquette: 'Professional Etiquette',
    prioritisation: 'Prioritisation',
    accountability: 'Accountability',
    teamwork: 'Teamwork',
    adaptability: 'Adaptability',
  };

  const MetricPill = ({ label, value, max = 100 }) => (
    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-mono font-bold text-gray-900">{Math.round(value)}<span className="text-gray-400">/{max}</span></span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${style.barColor} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className={`bg-white p-8 sm:p-10 border rounded-2xl shadow-sm ${style.card} space-y-7 transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${style.badge}`}>
              {style.headline}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">
            {Math.round(overallScore)}
            <span className="text-xs font-normal text-gray-400 font-sans"> /100 pts</span>
          </div>
          <div className="text-[10px] text-orange-600 uppercase tracking-wider font-bold">
            Final Score (Sum of Points)
          </div>
        </div>
      </div>

      {/* Point-Wise Marking Breakdown (Directly Deciding the Final Score) */}
      {feedback.criterion_breakdown ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Point-Wise Criteria Evaluation
            </span>
            <span className="text-[11px] text-gray-500 font-mono">
              Individual Points Total: <strong className="text-gray-700">100 Max Points</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(feedback.criterion_breakdown).map(([cId, item]) => (
              <div key={cId} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 truncate pr-2">{item.name}</span>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg border ${
                    item.weighted_points > 0
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                    +{item.weighted_points} / {item.max_points} pts
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Rating: <strong className="text-gray-800 font-mono">{item.rating} / 5</strong></span>
                  <span className="text-gray-400 font-mono">{item.weight}% weight</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, (item.rating / 5) * 100))}%` }}
                  />
                </div>
                {item.evidence && (
                  <p className="text-[10px] text-gray-500 italic line-clamp-2 pt-1 border-t border-gray-200">
                    "{item.evidence}"
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Unified Point-Wise Equation Bar */}
          <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-gray-700 font-semibold flex flex-wrap items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Score Equation:</span>
              <span className="font-mono text-orange-700">
                {Object.values(feedback.criterion_breakdown).map((i) => `${i.weighted_points} pts`).join(' + ')}
              </span>
            </span>
            <span className="font-mono font-black text-emerald-600 text-sm whitespace-nowrap">
              = {Math.round(overallScore)} / 100 Total
            </span>
          </div>
        </div>
      ) : hasDimensionScores ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(dimensionScores).map(([key, value]) => (
              <MetricPill key={key} label={dimensionLabels[key] || key} value={value} max={100} />
            ))}
          </div>
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs font-mono text-gray-500">
            <span>Domain Average deciding Final Score:</span>
            <span className="font-bold text-gray-900">{Math.round(overallScore)} / 100</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricPill label="Practical Solution" value={(feedback.correctness || 8) * 10} max={100} />
          <MetricPill label="Problem Solving" value={(feedback.problem_solving || 8) * 10} max={100} />
          <MetricPill label="Communication" value={(feedback.communication || 8) * 10} max={100} />
        </div>
      )}

      {/* Mentor Feedback */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
          Mentor Coaching Notes
        </p>
        <p className="text-gray-700 text-sm leading-relaxed">
          {fb}
        </p>
      </div>

      {/* Consequences (new) */}
      {consequences && (
        <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-700 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-violet-500" />
            Scenario Consequence
          </p>
          <p className="text-gray-700 text-xs leading-relaxed">
            {consequences}
          </p>
        </div>
      )}

      {/* Strengths (new) */}
      {strengths.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            What You Did Well
          </p>
          <div className="flex flex-wrap gap-1.5">
            {strengths.map((s, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Better Response */}
      {suggestedResponse && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
            Stronger Response Example
          </p>
          <p className="text-gray-700 text-xs leading-relaxed">
            {suggestedResponse}
          </p>
        </div>
      )}

      {/* Growth suggestions */}
      {doItems.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            Actionable Growth Suggestions
          </p>
          <div className="space-y-2">
            {doItems.map((tip, i) => (
              <div key={i} className="text-xs text-gray-700 flex items-start gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-amber-500 font-bold mt-0.5">➔</span>
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Next Scenario Recommendation */}
      {feedback.recommendation && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Recommended Next Scenario: {feedback.recommendation.title}
          </p>
          <p className="text-gray-700 text-xs leading-relaxed">
            {feedback.recommendation.rationale}
          </p>
        </div>
      )}
    </div>
  );
}
