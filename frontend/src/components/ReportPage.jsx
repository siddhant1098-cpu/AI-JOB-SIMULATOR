import React, { useEffect, useState } from 'react';
import { generateReport } from '../api';
import CorporateLogo from './CorporateLogo';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { 
  Trophy, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  BarChart3, 
  Sparkles, 
  Compass, 
  Target 
} from 'lucide-react';

const GRADE_STYLES = {
  'A+': { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-400/40', desc: 'Exceptional Mastery & Readiness' },
  A: { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-400/40', desc: 'Strong Practical Acumen' },
  B: { text: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-400/40', desc: 'Solid Foundation & Competence' },
  C: { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-400/40', desc: 'Growing Competence' },
  Developing: { text: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-400/40', desc: 'Great Potential to Build' },
  'Needs Work': { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-400/40', desc: 'Great Potential to Build' },
};

const GLOW_BARS = ['#22d3ee', '#818cf8', '#c084fc'];

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
      <div className="w-full h-full min-h-screen flex items-center justify-center p-4 bg-futuristic-mesh">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto text-2xl animate-pulse shadow-[0_0_25px_rgba(99,102,241,0.4)]">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <p className="text-slate-300 font-mono text-sm tracking-wide">
            Synthesizing Performance Evaluation & Telemetry…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center p-4 bg-futuristic-mesh">
        <div className="ios-glass-card rounded-3xl p-8 max-w-md text-center shadow-2xl space-y-4 border-rose-500/30">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-white font-bold text-lg">Evaluation Generation Notice</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{error}</p>
          <button
            onClick={onReset}
            className="w-full py-3 ios-glass-btn-primary text-white rounded-2xl text-xs font-bold"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  const {
    overall_score = 75,
    grade = 'A',
    strengths = [],
    weaknesses = [],
    next_steps = [],
    integrity_note,
    next_scenario_direction,
    skill_breakdown = {},
  } = report || {};

  const gStyle = GRADE_STYLES[grade] || GRADE_STYLES.A;
  const flagList = session.flags || [];
  const hasCheating = flagList.length > 0;
  const isInterview = session.config.mode === 'interview';

  // 8-dimension radar data (0-100 scale)
  const dimensionLabels = {
    problem_solving: 'Problem Solving',
    decision_making: 'Decision Making',
    communication: 'Communication',
    etiquette: 'Etiquette',
    prioritisation: 'Prioritisation',
    accountability: 'Accountability',
    teamwork: 'Teamwork',
    adaptability: 'Adaptability',
  };

  const radarData = Object.entries(dimensionLabels).map(([key, label]) => ({
    subject: label,
    A: skill_breakdown?.[key] || 0,
    fullMark: 100,
  }));

  const barData = Object.entries(dimensionLabels).map(([key, label]) => ({
    name: label,
    score: skill_breakdown?.[key] || 0,
  }));

  return (
    <div className="w-full min-h-screen p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto flex flex-col justify-start select-none font-sans dash-bg">
      
      {/* ── TOP CORPORATE HEADER ───────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-3.5">
          <CorporateLogo size="md" showText={true} subtitle="Confidential Talent Evaluation Dossier" />
        </div>

        <button
          onClick={onReset}
          className="ios-glass-btn-primary px-5 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Simulation</span>
        </button>
      </header>

      {/* ── MAIN CONTENT (Wide responsive grid) ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* ── LEFT SUMMARY COCKPIT (lg:col-span-5) ────────────────────────────── */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* Overall Grade Card */}
          <div className="ios-glass-card rounded-3xl p-6 sm:p-8 text-center space-y-4 border-white/15 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full ios-glass text-xs font-mono text-slate-300">
              <span>{isInterview ? '🎙️ Studio Interview' : '⚡ Incident Workspace'}</span>
              <span>•</span>
              <span className="capitalize">{session.config.difficulty} Tier</span>
            </div>

            <div className="py-2">
              <div className={`text-6xl sm:text-7xl font-black tracking-tight ${gStyle.text} drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]`}>
                {grade}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">
                {gStyle.desc}
              </div>
            </div>

            <div className="text-3xl font-extrabold text-white">
              {Math.round(overall_score)}
              <span className="text-base font-normal text-slate-400"> / 100 overall</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
              Scored on practical initiative, calm crisis problem-solving, and conversational clarity.
            </p>

            {integrity_note && (
              <div className="pt-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full border ${
                  hasCheating 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                }`}>
                  {hasCheating ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{integrity_note}</span>
                </span>
              </div>
            )}
          </div>

          {/* Competency Radar & Distribution */}
          <div className="ios-glass-card rounded-3xl p-6 border-white/10 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Competency Radar Telemetry
            </span>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                  <Radar dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── RIGHT DEEP-DIVE PANELS (lg:col-span-7) ─────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          
          {/* Navigation Tabs */}
          <div className="ios-glass p-1.5 rounded-2xl flex items-center gap-1 max-w-md">
            <button
              onClick={() => setTab('overview')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-white/30 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📈 Strategic Summary
            </button>
            <button
              onClick={() => setTab('questions')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'questions'
                  ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-white/30 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📝 Per-Question Review
            </button>
          </div>

          {tab === 'overview' ? (
            <div className="space-y-6">
              {/* Standout Strengths */}
              <div className="ios-glass-card rounded-3xl p-6 border-emerald-500/20 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Key Demonstrated Strengths
                </span>
                <div className="space-y-2">
                  {strengths.map((str, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-200 flex items-start gap-2.5">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <span className="leading-relaxed">{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gentle Growth Areas */}
              <div className="ios-glass-card rounded-3xl p-6 border-amber-500/20 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Empathetic Growth Opportunities
                </span>
                <div className="space-y-2">
                  {weaknesses.map((w, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-200 flex items-start gap-2.5">
                      <span className="text-amber-400 font-bold mt-0.5">💡</span>
                      <span className="leading-relaxed">{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Next Steps */}
              {next_steps && next_steps.length > 0 && (
                <div className="ios-glass-card rounded-3xl p-6 border-indigo-500/20 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    Recommended Development Next Steps
                  </span>
                  <div className="space-y-2">
                    {next_steps.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-200 flex items-start gap-2.5">
                        <span className="text-indigo-400 font-bold mt-0.5">➔</span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Next Scenario Direction */}
              {next_scenario_direction && (
                <div className="ios-glass-card rounded-3xl p-6 border-fuchsia-500/20 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-fuchsia-400" />
                    Recommended Next Scenario
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                    {next_scenario_direction}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Per-Question Breakdown */
            <div className="space-y-4">
              {session.answers.map((item, idx) => {
                const s = session.scores[idx] || {};
                return (
                  <div key={idx} className="ios-glass-card rounded-3xl p-6 border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        Part {idx + 1}
                      </span>
                      {(s.overall_score || s.score) && (
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                          {Math.round(s.overall_score || (s.score * 10) || 0)} / 100
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white">
                      "{item.question}"
                    </p>
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 leading-relaxed font-mono">
                      {item.answer}
                    </div>
                    {s.feedback && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Feedback:</strong> {s.feedback}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
