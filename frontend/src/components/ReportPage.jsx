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
  ShieldAlert,
  Shield,
  TrendingUp, 
  FileText, 
  BarChart3, 
  Sparkles, 
  Compass, 
  Target,
  Eye,
  Smartphone,
  Lock,
  Video,
  Activity
} from 'lucide-react';

const GRADE_STYLES = {
  'A+': { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300', desc: 'Exceptional Mastery & Readiness' },
  A: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300', desc: 'Strong Practical Acumen' },
  B: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300', desc: 'Solid Foundation & Competence' },
  C: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300', desc: 'Growing Competence' },
  Developing: { text: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-300', desc: 'Developing Competence' },
  'Needs Work': { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-300', desc: 'Substantive Preparation Required' },
};

const GLOW_BARS = ['#ea580c', '#f97316', '#fb923c'];

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
      <div className="w-full h-full min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center mx-auto text-2xl animate-pulse">
            <Sparkles className="w-7 h-7 text-orange-600" />
          </div>
          <p className="text-gray-500 font-mono text-sm tracking-wide">
            Synthesizing Performance Evaluation & Telemetry…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-md text-center shadow-md space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-gray-900 font-bold text-lg">Evaluation Generation Notice</h3>
          <p className="text-gray-500 text-xs leading-relaxed">{error}</p>
          <button
            onClick={onReset}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold transition-all"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  const {
    overall_score = 0,
    grade = 'Developing',
    strengths = [],
    weaknesses = [],
    next_steps = [],
    integrity_note,
    next_scenario_direction,
    skill_breakdown = {},
  } = report || {};

  const gStyle = GRADE_STYLES[grade] || GRADE_STYLES.Developing;
  const flagList = session.flags || [];
  const hasCheating = flagList.length > 0;
  const isInterview = session.config.mode === 'interview';

  // Structured Proctor Report (from backend report or normalized from session flags)
  const proctor = report?.proctor_report || {
    integrity_score: Math.max(0, 100 - flagList.length * 15),
    verdict: flagList.length === 0 ? 'Verified Clean' : (flagList.length <= 2 ? 'Integrity Warning' : 'Critical Proctor Violation'),
    flags_detected: flagList.length,
    flag_events: flagList,
    strict_proctor_active: session.config.strictMode !== false,
    face_tracking: !flagList.some((f) => f.toLowerCase().includes('face')) ? 'Verified Active' : 'Discrepancy Logged',
    device_detection: !flagList.some((f) => f.toLowerCase().includes('phone')) ? 'Clean' : 'Secondary Device Alert',
    clipboard_guard: !flagList.some((f) => f.toLowerCase().includes('copy') || f.toLowerCase().includes('paste')) ? 'Clean' : 'Clipboard Lock Triggered',
    focus_monitoring: !flagList.some((f) => f.toLowerCase().includes('window') || f.toLowerCase().includes('tab')) ? 'Continuous' : 'Focus Loss Detected',
    summary: integrity_note || (flagList.length === 0 
      ? 'All automated proctoring telemetry verified clean. Continuous multi-modal on-device proctor verified clean.' 
      : `${flagList.length} integrity events were recorded during the assessment.`)
  };

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
    <div className="w-full min-h-screen p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto flex flex-col justify-start select-none font-sans bg-gray-50">
      
      {/* ── TOP CORPORATE HEADER ───────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
        <div className="flex items-center gap-3.5">
          <CorporateLogo size="md" showText={true} subtitle="Confidential Talent Evaluation Dossier" />
        </div>

        <button
          onClick={onReset}
          className="bg-orange-600 hover:bg-orange-700 transition-all px-5 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2"
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
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-mono text-gray-600">
              <span>{isInterview ? '🎙️ Studio Interview' : '⚡ Incident Workspace'}</span>
              <span>•</span>
              <span className="capitalize">{session.config.difficulty} Tier</span>
            </div>

            <div className="py-2">
              <div className={`text-6xl sm:text-7xl font-black tracking-tight ${gStyle.text}`}>
                {grade}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-2">
                {gStyle.desc}
              </div>
            </div>

            <div className="text-3xl font-extrabold text-gray-900 font-mono">
              {Math.round(overall_score)}
              <span className="text-base font-normal text-gray-400 font-sans"> / 100 pts</span>
            </div>

            <p className="text-orange-600 font-semibold text-xs leading-relaxed max-w-sm mx-auto">
              Final score decided directly by the deterministic sum of individual point-wise marks across all evaluated turns.
            </p>

            {integrity_note && (
              <div className="pt-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full border ${
                  hasCheating 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {hasCheating ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{integrity_note}</span>
                </span>
              </div>
            )}
          </div>

          {/* Competency Radar & Distribution */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              Competency Radar Telemetry
            </span>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(0,0,0,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 600 }} />
                  <Radar dataKey="A" stroke="#ea580c" fill="#ea580c" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Proctor Integrity Snapshot Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Proctor Telemetry Audit
              </span>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                proctor.flags_detected === 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {proctor.verdict}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-orange-500" /> Face Tracking
                </span>
                <span className={`font-semibold text-xs block ${proctor.face_tracking.includes('Verified') || proctor.face_tracking === 'Clean' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {proctor.face_tracking}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-orange-500" /> Device Detector
                </span>
                <span className={`font-semibold text-xs block ${proctor.device_detection === 'Clean' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {proctor.device_detection}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-orange-500" /> Clipboard Guard
                </span>
                <span className={`font-semibold text-xs block ${proctor.clipboard_guard === 'Clean' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {proctor.clipboard_guard}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-amber-500" /> Focus Tracker
                </span>
                <span className={`font-semibold text-xs block ${proctor.focus_monitoring === 'Continuous' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {proctor.focus_monitoring}
                </span>
              </div>
            </div>

            <button
              onClick={() => setTab('proctor')}
              className="w-full py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition-all text-center flex items-center justify-center gap-1"
            >
              <span>View Detailed Proctor Dossier ({proctor.flags_detected} events)</span>
              <span>➔</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT DEEP-DIVE PANELS (lg:col-span-7) ─────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          
          {/* Navigation Tabs */}
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-1.5 flex items-center gap-1 max-w-lg">
            <button
              onClick={() => setTab('overview')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                tab === 'overview'
                  ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📈 Strategic Summary
            </button>
            <button
              onClick={() => setTab('proctor')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'proctor'
                  ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              <span>Proctor & Integrity</span>
              {hasCheating && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setTab('questions')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                tab === 'questions'
                  ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 Question Review
            </button>
          </div>

          {tab === 'overview' ? (
            <div className="space-y-6">
              {/* Standout Strengths */}
              <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm p-6 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Key Demonstrated Strengths
                </span>
                <div className="space-y-2">
                  {strengths.map((str, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-gray-700 flex items-start gap-2.5">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span className="leading-relaxed">{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gentle Growth Areas */}
              <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-6 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  Empathetic Growth Opportunities
                </span>
                <div className="space-y-2">
                  {weaknesses.map((w, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-gray-700 flex items-start gap-2.5">
                      <span className="text-amber-500 font-bold mt-0.5">💡</span>
                      <span className="leading-relaxed">{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Next Steps */}
              {next_steps && next_steps.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-2xl shadow-sm p-6 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Recommended Development Next Steps
                  </span>
                  <div className="space-y-2">
                    {next_steps.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-gray-700 flex items-start gap-2.5">
                        <span className="text-blue-500 font-bold mt-0.5">➔</span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Next Scenario Direction */}
              {next_scenario_direction && (
                <div className="bg-white border border-orange-200 rounded-2xl shadow-sm p-6 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-orange-500" />
                    Recommended Next Scenario
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed p-3 rounded-2xl bg-orange-50 border border-orange-100">
                    {next_scenario_direction}
                  </p>
                </div>
              )}
            </div>
          ) : tab === 'proctor' ? (
            /* Proctoring & Integrity Audit Tab */
            <div className="space-y-6">
              {/* Proctor Header Card */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-4 h-4 text-orange-500" />
                      Session Integrity & Anti-Cheat Audit
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                      Automated Proctor Dossier
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-2xl font-mono font-black text-gray-900">
                        {proctor.integrity_score}
                        <span className="text-xs text-gray-400 font-sans font-normal"> / 100</span>
                      </span>
                      <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">Integrity Index</span>
                    </div>

                    <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${
                      proctor.flags_detected === 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {proctor.flags_detected === 0 ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{proctor.verdict}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-xs leading-relaxed">
                  {proctor.summary}
                </p>

                {/* 4 Telemetry Checkpoints */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-orange-500" />
                        Biometric Face Presence
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        proctor.face_tracking.includes('Verified') || proctor.face_tracking === 'Clean'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {proctor.face_tracking}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Continuous MediaPipe face verification ensuring candidate presence and zero unauthorized third-party intervention.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-orange-500" />
                        Secondary Device Detection
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        proctor.device_detection === 'Clean'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {proctor.device_detection}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Neural object detection scanning for unauthorized secondary screens, smartphones, and cheating devices.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-500" />
                        Anti-Cheat Clipboard Guard
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        proctor.clipboard_guard === 'Clean'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {proctor.clipboard_guard}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Active event listeners intercepting unauthorized clipboard pasting, cutting, and devtools inspection attempts.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-500" />
                        Focus & Tab Watchdog
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        proctor.focus_monitoring === 'Continuous'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {proctor.focus_monitoring}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Page Visibility API telemetry tracking window blur events, application switching, and backgrounding.
                    </p>
                  </div>
                </div>
              </div>

              {/* Complete Event Audit Log Card */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    Proctor Event Audit Log ({proctor.flag_events?.length || 0} Events Logged)
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Chronological Telemetry</span>
                </div>

                {(!proctor.flag_events || proctor.flag_events.length === 0) ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div className="text-xs leading-relaxed">
                      <span className="font-bold block text-sm text-emerald-700">Clean Session Verified</span>
                      Zero integrity flags or suspicious behavioral anomalies were detected throughout this simulation. The candidate maintained full focus and environmental compliance.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {proctor.flag_events.map((evt, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-mono text-[10px] text-rose-500 block mb-0.5">FLAG #{idx + 1}</span>
                          <span className="leading-relaxed">{evt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Per-Question Point-Wise Breakdown */
            <div className="space-y-4">
              {session.answers.map((item, idx) => {
                const s = session.scores[idx] || {};
                const qScore = Math.round(s.overall_score || (s.score * 10) || 0);
                const hasBreakdown = s.criterion_breakdown && Object.keys(s.criterion_breakdown).length > 0;

                return (
                  <div key={idx} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-orange-600">
                        Challenge / Turn {idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        Turn Score: {qScore} / 100 pts
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-900">
                      "{item.question}"
                    </p>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed font-mono">
                      {item.answer}
                    </div>

                    {/* Point-Wise Criteria deciding this turn's score */}
                    {hasBreakdown && (
                      <div className="space-y-2 pt-1 border-t border-gray-200">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block">
                          Point-Wise Marks deciding Turn Score:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {Object.entries(s.criterion_breakdown).map(([cId, c]) => (
                            <div key={cId} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                              <span className="text-gray-600 font-medium truncate pr-2">{c.name}</span>
                              <span className="font-mono font-bold text-emerald-600 text-xs shrink-0">
                                +{c.weighted_points} / {c.max_points} pts
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[11px] font-mono text-gray-500 text-right pt-0.5">
                          Sum of Points = <strong className="text-emerald-600">{qScore} / 100 pts</strong>
                        </div>
                      </div>
                    )}

                    {s.feedback && (
                      <p className="text-xs text-gray-500 leading-relaxed pt-1">
                        <strong className="text-gray-700">Feedback:</strong> {s.feedback}
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
