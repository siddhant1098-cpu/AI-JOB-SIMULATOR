import React, { useEffect, useState } from 'react';
import { generateReport } from '../api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';

/**
 * ReportPage — Minimal Pastel Theme
 * Comprehensive, encouraging career debrief with fair evaluations
 */
const GRADE_STYLES = {
  'A+': { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Outstanding Readiness' },
  A: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Strong Practical Acumen' },
  B: { text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', desc: 'Solid Foundation' },
  C: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Growing Competence' },
  Developing: { text: 'text-stone-700', bg: 'bg-stone-100', border: 'border-stone-200', desc: 'Great Potential to Build' },
  'Needs Work': { text: 'text-stone-700', bg: 'bg-stone-100', border: 'border-stone-200', desc: 'Great Potential to Build' },
};

const PASTEL_BARS = ['#9D8EC9', '#7DAF92', '#85B7EB'];

export default function ReportPage({ session, onReset }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview'); // overview | questions

  useEffect(() => {
    const qa_pairs = session.answers.map((a, i) => ({
      question: a.question,
      answer: a.answer,
      scores: session.scores[i] || {},
      feedback: session.scores[i]?.feedback || '',
    }));

    generateReport(session.config, qa_pairs, session.flags || [])
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto text-xl animate-pulse">
            🌱
          </div>
          <p className="text-stone-600 font-medium text-sm">Preparing your personal performance debrief…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white border border-rose-200 rounded-3xl p-7 max-w-md text-center shadow-sm space-y-4">
          <span className="text-3xl">⚠️</span>
          <p className="text-stone-800 font-bold text-base">Debrief generation notice</p>
          <p className="text-stone-500 text-xs leading-relaxed">{error}</p>
          <button
            onClick={onReset}
            className="w-full py-3 bg-stone-900 text-white rounded-2xl text-xs font-semibold"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  const {
    overall_score = 8.5,
    grade = 'A',
    strengths = [],
    weaknesses = [],
    next_steps = [],
    integrity_note,
    skill_breakdown = { correctness: 8.5, problem_solving: 8.2, communication: 8.7 },
  } = report || {};

  const gStyle = GRADE_STYLES[grade] || GRADE_STYLES.A;

  const radarData = [
    { subject: 'Solution Quality', A: (skill_breakdown?.correctness || 8) * 10, fullMark: 100 },
    { subject: 'Problem Solving', A: (skill_breakdown?.problem_solving || 8) * 10, fullMark: 100 },
    { subject: 'Communication', A: (skill_breakdown?.communication || 8) * 10, fullMark: 100 },
  ];

  const barData = [
    { name: 'Practical Solution', score: skill_breakdown?.correctness || 8 },
    { name: 'Problem Solving', score: skill_breakdown?.problem_solving || 8 },
    { name: 'Communication', score: skill_breakdown?.communication || 8 },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 relative pb-16">
      {/* Background ambient pastel tones */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="bg-white/85 backdrop-blur-md border-b border-stone-200/80 px-4 py-3.5 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h1 className="text-sm font-bold text-stone-900 leading-tight">Simulation Performance Debrief</h1>
              <p className="text-[11px] text-stone-500 font-medium">{session.config.role} • {session.config.company}</p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold transition-all shadow-xs"
          >
            + New Simulation
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-7 space-y-6 relative z-10">
        {/* Overall Grade Banner */}
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-3xl p-6 sm:p-8 text-center shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
            <span>{session.config.mode === 'interview' ? '💼 Interview Simulation' : '🏢 Workplace Challenge'}</span>
            <span>•</span>
            <span className="capitalize">{session.config.difficulty} Level</span>
          </div>

          <div className="pt-2">
            <div className={`text-6xl sm:text-7xl font-black tracking-tight ${gStyle.text}`}>
              {grade}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 mt-1">
              {gStyle.desc}
            </div>
          </div>

          <div className="text-3xl font-extrabold text-stone-900 pt-1">
            {overall_score.toFixed(1)}
            <span className="text-base font-normal text-stone-400"> / 10 overall</span>
          </div>

          <p className="text-stone-500 text-xs max-w-md mx-auto leading-relaxed pt-1">
            Evaluated on practical common sense, composed problem-solving, and conversational clarity.
          </p>

          {integrity_note && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                🛡️ {integrity_note}
              </span>
            </div>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex bg-stone-200/60 p-1 rounded-2xl max-w-sm mx-auto">
          {['overview', 'questions'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                tab === t
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t === 'overview' ? '📈 Executive Summary' : '📝 Per-Question Review'}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Skills Charts */}
            <div className="bg-white/90 border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Competency Breakdown
                </p>
                <span className="text-xs text-stone-400 font-medium">Weighted Balance</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-stone-50/70 rounded-2xl p-3 border border-stone-100">
                  <p className="text-[11px] font-bold text-stone-400 text-center uppercase tracking-wider mb-1">
                    Radar Profile
                  </p>
                  <ResponsiveContainer width="100%" height={170}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E2DED5" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717A', fontSize: 10, fontWeight: 500 }} />
                      <Radar dataKey="A" stroke="#9D8EC9" fill="#9D8EC9" fillOpacity={0.35} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-stone-50/70 rounded-2xl p-3 border border-stone-100">
                  <p className="text-[11px] font-bold text-stone-400 text-center uppercase tracking-wider mb-1">
                    Score Distribution
                  </p>
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={barData} layout="vertical">
                      <XAxis type="number" domain={[0, 10]} tick={{ fill: '#71717A', fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#71717A', fontSize: 9, fontWeight: 500 }} width={85} />
                      <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2DED5', borderRadius: 12, fontSize: 11 }} />
                      <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                        {barData.map((_, i) => (
                          <Cell key={i} fill={PASTEL_BARS[i % PASTEL_BARS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#F2FAF5] border border-[#D4EDE0] rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <span>🌿</span>
                  <span>Standout Strengths</span>
                </div>
                <div className="space-y-2">
                  {strengths.map((s, i) => (
                    <div key={i} className="text-xs text-stone-700 leading-relaxed flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FFF9F2] border border-[#FDE5CA] rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <span>☀️</span>
                  <span>Growth Opportunities</span>
                </div>
                <div className="space-y-2">
                  {weaknesses.map((w, i) => (
                    <div key={i} className="text-xs text-stone-700 leading-relaxed flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-100">
                      <span className="text-amber-600 font-bold">→</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Next Steps */}
            <div className="bg-[#F6F3FE] border border-[#E2DBFA] rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
                <span>🚀</span>
                <span>Actionable Development Steps</span>
              </div>
              <div className="space-y-2">
                {next_steps.map((step, i) => (
                  <div key={i} className="text-xs text-stone-700 leading-relaxed flex items-start gap-2.5 bg-white/80 p-3 rounded-2xl border border-purple-100/80">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strict Proctoring Integrity Audit */}
            <div className="bg-white/90 border border-stone-200/90 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Anti-Cheat Proctor Audit
                    </p>
                    <p className="text-[11px] text-stone-400">Continuous AI surveillance log</p>
                  </div>
                </div>
                {(session.flags || []).length === 0 ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ✓ Verified Clean (0 flags)
                  </span>
                ) : (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    ⚠️ {session.flags.length} Flag{session.flags.length > 1 ? 's' : ''} Logged
                  </span>
                )}
              </div>

              {/* Categorized observation counters */}
              {(() => {
                const flags = session.flags || [];
                const phoneCount = flags.filter((f) => f.toLowerCase().includes('phone') || f.toLowerCase().includes('mobile')).length;
                const copyCount = flags.filter((f) => f.toLowerCase().includes('copy') || f.toLowerCase().includes('paste') || f.toLowerCase().includes('shortcut')).length;
                const tabCount = flags.filter((f) => f.toLowerCase().includes('tab') || f.toLowerCase().includes('focus')).length;
                const faceCount = flags.filter((f) => f.toLowerCase().includes('face') || f.toLowerCase().includes('dark')).length;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className={`p-3 rounded-2xl border ${phoneCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-stone-50/70 border-stone-200/80 text-stone-600'}`}>
                      <div className="text-lg mb-0.5">📱</div>
                      <div className="font-extrabold text-sm">{phoneCount}</div>
                      <div className="text-[10px] text-stone-400 font-medium">Mobile Phone</div>
                    </div>
                    <div className={`p-3 rounded-2xl border ${copyCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-stone-50/70 border-stone-200/80 text-stone-600'}`}>
                      <div className="text-lg mb-0.5">📋</div>
                      <div className="font-extrabold text-sm">{copyCount}</div>
                      <div className="text-[10px] text-stone-400 font-medium">Clipboard Lock</div>
                    </div>
                    <div className={`p-3 rounded-2xl border ${tabCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-stone-50/70 border-stone-200/80 text-stone-600'}`}>
                      <div className="text-lg mb-0.5">📑</div>
                      <div className="font-extrabold text-sm">{tabCount}</div>
                      <div className="text-[10px] text-stone-400 font-medium">Tab Switch</div>
                    </div>
                    <div className={`p-3 rounded-2xl border ${faceCount > 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-stone-50/70 border-stone-200/80 text-stone-600'}`}>
                      <div className="text-lg mb-0.5">👤</div>
                      <div className="font-extrabold text-sm">{faceCount}</div>
                      <div className="text-[10px] text-stone-400 font-medium">Face Check</div>
                    </div>
                  </div>
                );
              })()}

              {(session.flags || []).length > 0 && (
                <div className="bg-stone-50/80 border border-stone-200/70 rounded-2xl p-3 max-h-36 overflow-y-auto space-y-1">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Session Proctor Log
                  </p>
                  {session.flags.map((f, i) => (
                    <div key={i} className="text-[11px] text-stone-600 font-mono flex items-start gap-1.5">
                      <span className="text-amber-500">•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'questions' && (
          <div className="space-y-4">
            {session.answers.map((a, i) => {
              const score = session.scores[i] || {};
              return (
                <div key={i} className="bg-white/90 border border-stone-200/90 rounded-3xl p-5 sm:p-6 space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-stone-800 leading-snug">
                      {i + 1}. {a.question?.text}
                    </p>
                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-black text-xs">
                        {score.total?.toFixed(1) || '8.5'}/10
                      </span>
                    </div>
                  </div>

                  <div className="bg-stone-50/80 border border-stone-200/60 rounded-2xl p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                      Your Spoken Answer
                    </p>
                    <p className="text-xs text-stone-700 italic leading-relaxed">
                      "{a.answer}"
                    </p>
                  </div>

                  {score.feedback && (
                    <div className="bg-[#F2FAF5] border border-[#D4EDE0] rounded-2xl p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                        Mentor Feedback
                      </p>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {score.feedback}
                      </p>
                    </div>
                  )}

                  {score.expected_answer && (
                    <div className="bg-[#F0F5FD] border border-[#D5E3FA] rounded-2xl p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800 mb-1">
                        Ideal Framing
                      </p>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {score.expected_answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
