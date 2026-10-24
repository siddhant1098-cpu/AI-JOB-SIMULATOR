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
  ArrowRight,
  User,
  MessageSquare,
  Shield,
  ChevronRight,
  Timer
} from 'lucide-react';

const DOMAINS = [
  'Software Engineering',
  'Marketing',
  'Finance',
  'Healthcare',
  'Human Resources',
  'Sales',
  'Operations',
  'Event Management',
  'Education',
  'Legal',
  'Supply Chain',
  'Customer Success',
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

// Roles of the person being addressed in Workspace Scenario mode
const PERSON_ROLES = [
  { label: 'Direct Manager (Level 3 Authority)', value: 'Direct Manager', authority: 'Manager', tone: 'Values concise explanations, ownership, timelines, risks, and proposed solutions.' },
  { label: 'CEO / Executive Leadership (Level 6 Authority)', value: 'CEO / Executive', authority: 'Executive', tone: 'Values high-level business impact, strategic clarity, risks, and decisive executive choices.' },
  { label: 'Client / External Stakeholder (Level 5 Authority)', value: 'Client / Stakeholder', authority: 'External Client', tone: 'Values high empathy, transparency, clear commitments, reassurance, and calm accountability.' },
  { label: 'Team Leader / Senior Colleague (Level 2 Authority)', value: 'Team Leader', authority: 'Lead / Senior', tone: 'Values accountability, collaborative communication, proactive problem-solving, and clear next steps.' },
  { label: 'Coworker / Teammate (Level 1 Authority)', value: 'Coworker / Teammate', authority: 'Peer', tone: 'Values directness, mutual collaboration, respect, and shared problem ownership.' },
  { label: 'Department Head / Director (Level 4 Authority)', value: 'Department Head', authority: 'Director', tone: 'Values cross-functional coordination, resource optimization, risk mitigation, and escalations.' },
];

const CRISIS_SCENARIOS = {
  'Software Engineering': 'Critical Cloud Database Outage during peak traffic — data corruption suspected.',
  'Event Management': 'Main venue power failure 45 minutes before international summit keynote.',
  'Marketing': 'Major confidential product feature leaked on social media; stock drops 4%.',
  'Finance': 'Automated high-frequency trading algorithm malfunction triggers flash liquidation.',
  'Healthcare': 'Hospital patient triage management network hit by ransomware threat.',
  'Operations': 'Global warehouse logistics automation freezes across 3 international hubs.',
  'Human Resources': 'Sudden walkout threat by core department staff due to severe policy dispute.',
  'Sales': 'Top enterprise account threatening immediate contract cancellation after SLA breach.',
  'Education': 'Campus-wide examination platform failure during final certification week.',
  'Legal': 'Urgent subpoena received regarding intellectual property infringement claim.',
  'Supply Chain': 'Critical overseas component shipment impounded at customs indefinitely.',
  'Customer Success': 'Major enterprise customer escalating severe downtime to C-suite.',
};

/**
 * SetupForm — Spacious Configuration Cockpit
 * Unified modern dark dashboard theme across both modes:
 * - 'scenario': Workspace Scenario (Domain, Person Role, and Pressure Mode toggle)
 * - 'interview': Virtual Interview Studio
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
  const [role, setRole] = useState('Full-Stack Developer');
  const [targetPersonRole, setTargetPersonRole] = useState('Direct Manager');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(3);
  const [durationMin, setDurationMin] = useState(15);
  const [strictMode, setStrictMode] = useState(true);
  const [pressureMode, setPressureMode] = useState(false);

  // Resume Upload State (for interview mode)
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

  // Update role options when domain changes (interview mode)
  useEffect(() => {
    const roles = ROLES[domain] || [];
    if (roles.length && !roles.includes(role)) {
      setRole(roles[0]);
    }
  }, [domain, role]);

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
    if (mode === 'scenario') {
      onStart({
        mode: 'scenario',
        domain,
        company: 'Enterprise Organization',
        role: 'Operations Lead',
        target_person_role: targetPersonRole,
        difficulty: 'medium',
        numQuestions: 3,
        durationMin: 15,
        strictMode: true,
        pressureMode,
        candidate_name: candidateName.trim() || 'Candidate',
        resume_text: null,
        resume_skills: [],
        resume_filename: null,
      });
    } else {
      onStart({
        mode,
        domain,
        company: 'Enterprise Organization',
        role,
        difficulty,
        numQuestions: Number(numQuestions),
        durationMin: Number(durationMin),
        strictMode,
        pressureMode,
        candidate_name: candidateName.trim() || 'Candidate',
        resume_text: resumeData?.resume_text || null,
        resume_skills: resumeData?.key_skills || [],
        resume_filename: resumeData?.filename || null,
      });
    }
  };

  const isInterview = mode === 'interview';
  const selectedPersonMeta = PERSON_ROLES.find((p) => p.value === targetPersonRole) || PERSON_ROLES[0];

  return (
    <div className="w-full min-h-screen py-10 px-6 sm:px-10 lg:px-16 flex flex-col justify-center max-w-7xl mx-auto select-none font-sans text-slate-100">
      
      {/* ── TOP HEADER / MODE SWITCHER (SPACIOUS & UNCLUTTERED) ─────────────── */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#282a3e] pb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <CorporateLogo size="sm" showText={true} subtitle="Enterprise Simulation Engine" />
            <span className="hidden sm:inline-block text-slate-600">•</span>
            <span className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isInterview 
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30' 
                : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
            }`}>
              {isInterview ? 'Corporate Telepresence Suite' : 'Workspace Scenario Suite'}
            </span>
            {pressureMode && (
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/40 animate-pulse flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                60s Pressure Room Active
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {isInterview ? 'Interview Question and Answer' : 'Workspace Scenario Simulation'}
          </h1>
          <p className="text-slate-400 text-base sm:text-lg mt-2 max-w-3xl leading-relaxed">
            {isInterview 
              ? 'Comprehensive role-based interview simulation featuring conversational voice analysis, technical deep-dives, and real-time evaluation.'
              : 'Real-world workplace challenge simulation testing leadership instincts, problem-solving, and role-appropriate communication.'}
          </p>
        </div>

        {/* Mode Switcher Pill */}
        <div className="p-1.5 rounded-2xl bg-[#181928] border border-[#282a3e] flex items-center gap-1.5 shrink-0 self-start md:self-auto shadow-xl">
          <button
            type="button"
            onClick={() => handleModeSwitch('interview')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isInterview
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Interview Mode</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('scenario')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              !isInterview
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Workspace Mode</span>
          </button>
        </div>
      </header>

      {/* ── CONDITIONAL SETUP VIEW ────────────────────────────────────────────── */}
      {!isInterview ? (
        /* ══════════════════════════════════════════════════════════════════════
           WORKSPACE SCENARIO MODE: SPACIOUS & FOCUSED
           Featuring ONLY:
           1. Domain of Company (Dropdown)
           2. Role of the Person We Are Talking To (Dropdown)
           3. Pressure Mode Toggle (60s timer)
           ══════════════════════════════════════════════════════════════════════ */
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8 max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT / MAIN CARD (lg:col-span-7): THE CONFIGURATION COCKPIT */}
            <div className="lg:col-span-7 dash-card p-8 sm:p-10 space-y-7">
              <div className="flex items-center justify-between border-b border-[#282a3e] pb-5">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                    <Sliders className="w-5 h-5 text-purple-400" />
                    <span>Scenario Configuration</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your operational context and target stakeholder.
                  </p>
                </div>
                <span className="text-xs font-mono text-purple-300 bg-purple-500/15 border border-purple-400/25 px-3 py-1 rounded-full">
                  Step 1 of 1
                </span>
              </div>

              {/* ── DROPDOWN 1: DOMAIN OF COMPANY ─────────────────────────── */}
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span>Domain of Company</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">Industry Sector</span>
                </label>
                <div className="relative">
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full dash-input rounded-2xl p-4 text-base font-semibold text-white cursor-pointer appearance-none shadow-sm"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d} className="bg-[#181928] text-white py-2">
                        {d}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-purple-400 font-bold text-xs">
                    ▼
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Defines the operational context, industry challenges, and real-world stakes.
                </p>
              </div>

              {/* ── DROPDOWN 2: ROLE OF THE PERSON WE ARE TALKING TO ───────── */}
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Role of the Person We Are Talking To</span>
                  </span>
                  <span className="text-xs font-mono text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                    {selectedPersonMeta.authority}
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={targetPersonRole}
                    onChange={(e) => setTargetPersonRole(e.target.value)}
                    className="w-full dash-input rounded-2xl p-4 text-base font-semibold text-white cursor-pointer appearance-none shadow-sm"
                  >
                    {PERSON_ROLES.map((p) => (
                      <option key={p.value} value={p.value} className="bg-[#181928] text-white py-2">
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-400 font-bold text-xs">
                    ▼
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calibrates the AI character's expectations, authority dynamics, and conversational pushback.
                </p>
              </div>

              {/* ── PRESSURE MODE TOGGLE ────────────────────────────────────── */}
              <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                pressureMode 
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]' 
                  : 'bg-[#121320] border-[#282a3e]'
              }`}>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${pressureMode ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>Pressure Mode (60s Timer)</span>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                    Enforces an exact 60-second response deadline per round to evaluate decision quality under time pressure.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPressureMode(!pressureMode)}
                  className={`w-14 h-7 rounded-full transition-colors relative shrink-0 p-1 ${
                    pressureMode ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      pressureMode ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Primary Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4.5 rounded-2xl text-base font-extrabold text-white dash-btn-primary flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none shadow-2xl"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Scenario for {targetPersonRole}…</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Workspace Scenario</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN (lg:col-span-5): STAKEHOLDER DOSSIER PREVIEW */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Stakeholder Persona Insight Card */}
              <div className="dash-card p-7 space-y-5">
                <div className="flex items-center justify-between border-b border-[#282a3e] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Target Stakeholder Profile
                    </span>
                  </div>
                  <span className="text-xs font-mono text-purple-300">
                    Authority {selectedPersonMeta.authority}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#121320] border border-[#282a3e] space-y-2">
                  <span className="text-sm font-bold text-white block">
                    {selectedPersonMeta.value}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    "{selectedPersonMeta.tone}"
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Evaluation Priorities:
                  </span>
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Role-appropriate tone & clear communication</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Ownership, mitigation steps & realistic timelines</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Calm decision-making under operational constraints</span>
                  </div>
                </div>
              </div>

              {/* Simulated Domain Crisis Preview */}
              <div className="dash-card p-7 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-400" />
                    Simulated Operational Challenge
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    {domain}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed p-4 rounded-xl bg-[#121320] border border-[#282a3e]">
                  "{CRISIS_SCENARIOS[domain] || 'High-stakes workplace emergency requiring urgent cross-functional mitigation.'}"
                </p>
              </div>

            </div>

          </div>
        </form>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════
           INTERVIEW MODE: UNIFIED SPACIOUS MODERN DASHBOARD THEME
           ══════════════════════════════════════════════════════════════════════ */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto w-full">
          
          {/* ── LEFT PANEL (lg:col-span-6): DOSSIER / RESUME ─────────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-6 w-full">
            <div className="dash-card p-8 sm:p-10 space-y-6">
              <div className="flex items-center justify-between border-b border-[#282a3e] pb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  Candidate Profile & Resume
                </span>
                <button
                  type="button"
                  onClick={handleLoadDemoResume}
                  className="dash-btn-secondary px-3 py-1.5 rounded-xl text-xs text-cyan-300 hover:text-white font-semibold"
                >
                  ⚡ Demo Resume
                </button>
              </div>

              {/* Candidate Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 block">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full dash-input rounded-2xl p-4 text-base placeholder-slate-500"
                />
              </div>

              {/* Resume PDF Drop Zone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 block">
                  Resume (PDF) for Custom Tailored Questions
                </label>

                {resumeData ? (
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight">
                          {resumeData.filename || 'Uploaded Resume'}
                        </p>
                        <p className="text-xs text-cyan-300 mt-0.5">
                          {resumeData.key_skills?.length || 0} skills extracted
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeData(null)}
                      className="px-3 py-1.5 rounded-xl text-xs text-rose-300 hover:text-rose-100 bg-rose-500/10 border border-rose-500/30"
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
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-cyan-400 bg-cyan-500/10' 
                        : 'border-[#282a3e] hover:border-cyan-400/40 bg-[#121320]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    />
                    <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-200">
                      {isParsingResume ? 'Parsing Resume Intelligence...' : 'Upload Candidate Resume PDF'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Drag & drop or click to browse
                    </p>
                  </div>
                )}

                {resumeError && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {resumeError}
                  </p>
                )}
              </div>

              {/* Extracted Skills */}
              {resumeData?.key_skills && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Extracted Candidate Strengths:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.key_skills.slice(0, 8).map((sk, idx) => (
                      <span key={idx} className="text-xs font-mono px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/25 text-cyan-200">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL (lg:col-span-6): INTERVIEW PARAMETERS ────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-6 w-full">
            <div className="dash-card p-8 sm:p-10 space-y-6">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-[#282a3e] pb-4">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Interview Simulation Settings
              </span>

              {/* Domain Selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 block">
                  Industry Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full dash-input rounded-2xl p-4 text-base"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d} className="bg-[#181928] text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Candidate Role */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 block">
                  Target Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full dash-input rounded-2xl p-4 text-base"
                >
                  {(ROLES[domain] || []).map((r) => (
                    <option key={r} value={r} className="bg-[#181928] text-white">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience / Difficulty Tier */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 block">
                  Challenge Tier
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-3 rounded-xl text-xs font-bold capitalize transition-all ${
                        difficulty === lvl
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border border-white/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                          : 'dash-btn-secondary text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pressure Mode Toggle */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                pressureMode ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'bg-[#121320] border-[#282a3e]'
              }`}>
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Zap className={`w-4 h-4 ${pressureMode ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>Pressure Mode (60s Timer)</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Strict 60-second response countdown per challenge.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPressureMode(!pressureMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    pressureMode ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      pressureMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Strict Anti-Cheat Proctor Toggle */}
              <div className="p-4 rounded-2xl bg-[#121320] border border-[#282a3e] flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>On-Device Strict Proctor</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Monitors camera integrity & phone presence with zero cloud recording.
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
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4.5 rounded-2xl text-base font-extrabold text-white flex items-center justify-center gap-2.5 shadow-2xl transition-all dash-btn-primary disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Interview Protocol…</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Interview Studio</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
