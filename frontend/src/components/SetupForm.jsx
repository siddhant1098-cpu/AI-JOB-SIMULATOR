import React, { useState, useEffect, useRef } from 'react';
import { uploadAndParseResume } from '../api';
import CorporateLogo from './CorporateLogo';
import { 
  Video, 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Clock, 
  Zap, 
  Flame, 
  Building2, 
  Briefcase, 
  UserCheck, 
  Layers,
  ArrowRight
} from 'lucide-react';

const DOMAINS = [
  'Software Engineering', 'Event Management', 'Marketing', 'Finance',
  'Healthcare', 'Human Resources', 'Sales', 'Operations', 'Education',
  'Legal', 'Supply Chain', 'Customer Success',
];

const COMPANY_SIZES = [
  'Small high-growth startup', 'Mid-size company', 'Large global enterprise', 'Public sector / Gov',
  'Consulting firm',
];

const ROLES = {
  'Software Engineering': ['Full-Stack Developer', 'Frontend Engineer', 'Backend Engineer', 'DevOps & Reliability Engineer', 'Engineering Manager'],
  'Event Management': ['Operations Manager', 'Event Coordinator', 'Venue Logistics Lead', 'Crisis Response Lead'],
  'Marketing': ['Growth Marketer', 'Brand Strategist', 'Marketing Director', 'PR Crisis Manager'],
  'Finance': ['Financial Analyst', 'Risk Officer', 'CFO Advisor', 'Investment Lead'],
  'Healthcare': ['Clinical Operations Manager', 'Hospital Administrator', 'Health IT Director'],
  'Human Resources': ['People Operations Lead', 'Talent Acquisition Director', 'HR Business Partner'],
  'Sales': ['Enterprise Account Executive', 'Sales Director', 'Business Development Lead'],
  'Operations': ['Operations Director', 'Supply Chain Strategist', 'Process Architect'],
  'Education': ['Academic Coordinator', 'Program Director', 'Curriculum Architect'],
  'Legal': ['Corporate Counsel', 'Compliance Officer', 'Risk Specialist'],
  'Supply Chain': ['Supply Chain Director', 'Global Logistics Lead', 'Procurement Specialist'],
  'Customer Success': ['Customer Success Director', 'Escalations Lead', 'Client Solutions Architect'],
};

const CRISIS_SCENARIOS = {
  'Software Engineering': 'Critical Cloud Database Outage during peak traffic — data corruption suspected.',
  'Event Management': 'Main venue power failure 45 minutes before international summit keynote.',
  'Marketing': 'Major confidential product feature leaked on social media; stock drops 4%.',
  'Finance': 'Automated high-frequency trading algorithm malfunction triggers flash liquidation.',
  'Healthcare': 'Hospital patient triage management network hit by ransomware threat.',
  'Operations': 'Global warehouse logistics automation freezes across 3 international hubs.',
};

/**
 * SetupForm — Futuristic Fullscreen Responsive Configuration Cockpit
 * Adapts its entire layout, options, and aesthetic based on the selected mode:
 * - 'interview': Virtual Interview Studio
 * - 'scenario': Mission Incident Command Center
 */
export default function SetupForm({ 
  onStart, 
  isLoading, 
  activeMode = 'interview', 
  onModeChange 
}) {
  const [candidateName, setCandidateName] = useState('');
  const [mode, setMode] = useState(activeMode);
  const [domain, setDomain] = useState('Software Engineering');
  const [company, setCompany] = useState('Large global enterprise');
  const [role, setRole] = useState('Full-Stack Developer');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(3);
  const [durationMin, setDurationMin] = useState(15);
  const [strictMode, setStrictMode] = useState(true);

  // Resume Upload State
  const [resumeData, setResumeData] = useState(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeError, setResumeError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Sync mode with parent activeMode when updated via left rail
  useEffect(() => {
    if (activeMode && activeMode !== mode) {
      setMode(activeMode);
    }
  }, [activeMode]);

  // Notify parent on internal mode switch
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  // Update role options when domain changes
  useEffect(() => {
    const roles = ROLES[domain] || [];
    if (roles.length && !roles.includes(role)) {
      setRole(roles[0]);
    }
  }, [domain]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Please upload a PDF document (.pdf)');
      return;
    }
    setResumeError(null);
    setIsParsingResume(true);
    try {
      const data = await uploadAndParseResume(file);
      setResumeData(data);
      if (data.candidate_name && (!candidateName || candidateName === 'Candidate')) {
        setCandidateName(data.candidate_name);
      }
      if (data.inferred_domain && DOMAINS.includes(data.inferred_domain)) {
        setDomain(data.inferred_domain);
      }
      if (data.inferred_role) {
        setRole(data.inferred_role);
      }
    } catch (err) {
      setResumeError(err.message || 'Failed to parse resume PDF.');
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadDemoResume = () => {
    const demo = {
      candidate_name: 'Alex Vance',
      inferred_role: 'Full-Stack Developer',
      inferred_domain: 'Software Engineering',
      key_skills: ['React.js', 'FastAPI', 'Python', 'Docker', 'Distributed Systems', 'Tailwind CSS'],
      experience_summary: 'Experienced Full-Stack Engineer specializing in high-concurrency cloud services, responsive client interfaces, and real-time architectures.',
      filename: 'Alex_Vance_Resume.pdf',
      resume_text: `Alex Vance - Full Stack Developer
Skills: React, Next.js, Node.js, Python, FastAPI, Docker, Microservices, PostgreSQL
Projects:
- IncidentFlow: Automated crisis mitigation and reliability monitoring console.
- HyperScale: Distributed real-time stream processing architecture with sub-second latency.`,
    };
    setResumeData(demo);
    setCandidateName(demo.candidate_name);
    setDomain(demo.inferred_domain);
    setRole(demo.inferred_role);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart({
      mode,
      domain,
      company,
      role,
      difficulty,
      numQuestions: Number(numQuestions),
      durationMin: Number(durationMin),
      strictMode,
      candidate_name: candidateName.trim() || 'Candidate',
      resume_text: resumeData?.resume_text || null,
      resume_skills: resumeData?.key_skills || [],
      resume_filename: resumeData?.filename || null,
    });
  };

  const isInterview = mode === 'interview';

  return (
    <div className="w-full min-h-screen py-8 px-4 sm:px-8 lg:px-12 flex flex-col justify-center max-w-7xl mx-auto select-none">
      
      {/* ── TOP CORPORATE HEADER & MODE INDICATOR ──────────────────────────── */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <CorporateLogo size="sm" showText={true} subtitle="Workforce Intelligence Division" />
            <span className="hidden sm:inline-block text-slate-500">•</span>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
              isInterview 
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30' 
                : 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30'
            }`}>
              {isInterview ? 'Corporate Telepresence Suite' : 'Workspace Mode'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              🛡️ Integrity Protocol Active
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {isInterview ? 'Corporate Candidate Assessment' : 'Workspace Scenario'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
            {isInterview 
              ? 'Standardized enterprise interview protocol featuring generative AI telepresence, real-time voice analysis, and on-device integrity auditing.'
              : 'Real-world workplace scenario challenges testing practical problem-solving, operational judgment, and situational decision-making.'}
          </p>
        </div>

        {/* Mode Switcher Pill on Top (also accessible via Left Rail) */}
        <div className="ios-glass p-1.5 rounded-2xl flex items-center gap-1 shrink-0 self-start md:self-auto border-white/15">
          <button
            type="button"
            onClick={() => handleModeSwitch('interview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isInterview
                ? 'bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Interview Mode</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('scenario')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              !isInterview
                ? 'bg-fuchsia-500/25 border border-fuchsia-400/40 text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Workspace Mode</span>
          </button>
        </div>
      </header>

      {/* ── EXPANSIVE MULTI-COLUMN FORM (Wide screen: 2 columns; Phone: 1 column) ─ */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT PANEL (lg:col-span-6): DOSSIER / RESUME / SCENARIO PRESETS ── */}
        <div className="lg:col-span-6 flex flex-col gap-6 w-full">
          
          {isInterview ? (
            /* Interview Mode: Candidate Dossier & Resume Intelligence */
            <div className="ios-glass-card rounded-3xl p-6 sm:p-7 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.06)] space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  Candidate Profile & Resume
                </span>
                <button
                  type="button"
                  onClick={handleLoadDemoResume}
                  className="ios-glass-btn px-2.5 py-1 rounded-xl text-[11px] text-cyan-300 hover:text-white font-semibold"
                >
                  ⚡ Fill Demo Resume
                </button>
              </div>

              {/* Candidate Name Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full ios-glass-input rounded-2xl p-3 text-sm placeholder-slate-500"
                />
              </div>

              {/* Resume PDF Drop Zone */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Resume (PDF) for Custom Tailored Questions
                </label>

                {resumeData ? (
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">
                          {resumeData.filename || 'Uploaded Resume'}
                        </p>
                        <p className="text-[11px] text-cyan-300 mt-0.5">
                          {resumeData.key_skills?.length || 0} skills extracted
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeData(null)}
                      className="ios-glass-btn px-3 py-1 rounded-xl text-xs text-rose-300 hover:text-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-cyan-400 bg-cyan-500/10' 
                        : 'border-white/15 hover:border-cyan-400/40 bg-white/[0.02]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    />
                    <Upload className="w-7 h-7 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-200">
                      {isParsingResume ? 'Parsing Resume Intelligence...' : 'Drag & Drop your Resume PDF'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      or click to browse (.pdf format)
                    </p>
                  </div>
                )}

                {resumeError && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {resumeError}
                  </p>
                )}
              </div>

              {/* Extracted Skills Pills */}
              {resumeData?.key_skills && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Extracted Candidate Strengths:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.key_skills.slice(0, 8).map((sk, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-400/25 text-cyan-200">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Workspace Mode: Crisis Scenario Dossier */
            <div className="ios-glass-card rounded-3xl p-6 sm:p-7 border-fuchsia-500/20 shadow-[0_0_30px_rgba(217,70,239,0.06)] space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-fuchsia-400" />
                  Workplace Crisis Scenario Dossier
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  Live Incident
                </span>
              </div>

              {/* Scenario Context Card */}
              <div className="p-4 rounded-2xl bg-fuchsia-950/20 border border-fuchsia-500/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-300">
                  Simulated Emergency:
                </span>
                <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                  "{CRISIS_SCENARIOS[domain] || 'High-stakes workplace emergency requiring urgent cross-functional mitigation.'}"
                </p>
              </div>

              {/* Company Environment */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Target Company Scale & Environment
                </label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full ios-glass-input rounded-2xl p-3 text-sm"
                >
                  {COMPANY_SIZES.map((cs) => (
                    <option key={cs} value={cs} className="bg-slate-900 text-white">
                      {cs}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Tools Included */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                <span className="font-bold text-slate-300 block">Workspace Capabilities:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Stakeholder Comms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Action Plan Editor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Voice Command Input</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>SLA Risk Countdown</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL (lg:col-span-6): ROLE & SIMULATION PARAMETERS ─────── */}
        <div className="lg:col-span-6 flex flex-col gap-6 w-full">
          <div className="ios-glass-card rounded-3xl p-6 sm:p-7 border-white/15 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Simulation Settings
            </span>

            {/* Domain Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Industry Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full ios-glass-input rounded-2xl p-3 text-sm"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full ios-glass-input rounded-2xl p-3 text-sm"
              >
                {(ROLES[domain] || []).map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience / Difficulty Tier */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Challenge Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      difficulty === lvl
                        ? 'bg-gradient-to-r from-indigo-500/40 to-purple-500/40 border border-white/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                        : 'ios-glass-btn text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Rounds & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Questions / Scenarios
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full ios-glass-input rounded-2xl p-2.5 text-sm"
                >
                  <option value={2} className="bg-slate-900">2 Rounds (Quick)</option>
                  <option value={3} className="bg-slate-900">3 Rounds (Standard)</option>
                  <option value={5} className="bg-slate-900">5 Rounds (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Time Cap
                </label>
                <select
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  className="w-full ios-glass-input rounded-2xl p-2.5 text-sm"
                >
                  <option value={10} className="bg-slate-900">10 Minutes</option>
                  <option value={15} className="bg-slate-900">15 Minutes</option>
                  <option value={25} className="bg-slate-900">25 Minutes</option>
                </select>
              </div>
            </div>

            {/* Strict Anti-Cheat Proctor Toggle */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  On-Device Strict Proctor
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Detects mobile phones, disables copy-paste, and checks camera presence without cloud video recording.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStrictMode(!strictMode)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  strictMode ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    strictMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Launch Primary Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl text-base font-extrabold text-white flex items-center justify-center gap-2 shadow-2xl transition-all ${
                isInterview ? 'ios-glass-btn-primary' : 'bg-gradient-to-r from-fuchsia-600/70 via-purple-600/70 to-indigo-600/70 border border-fuchsia-400/50 hover:brightness-110'
              } disabled:opacity-40 disabled:pointer-events-none`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Role Challenges…</span>
                </>
              ) : (
                <>
                  <span>
                    {isInterview ? 'Enter Virtual Interview Studio' : 'Enter Workspace Scenario'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
