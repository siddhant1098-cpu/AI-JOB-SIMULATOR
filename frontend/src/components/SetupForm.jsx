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
  ChevronRight
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
 * SetupForm — Configuration Cockpit
 * Adapts its layout, options, and aesthetic based on the selected mode:
 * - 'interview': Virtual Interview Studio
 * - 'scenario': ProdAI Theme Workspace Scenario (with ONLY Domain & Person Role dropdowns)
 */
export default function SetupForm({ 
  onStart, 
  isLoading, 
  activeMode = 'interview', 
  onModeChange 
}) {
  const [candidateName, setCandidateName] = useState('Melinda G.');
  const [mode, setMode] = useState(activeMode);
  const [domain, setDomain] = useState('Software Engineering');
  const [company, setCompany] = useState('Large global enterprise');
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
      if (data.candidate_name && (!candidateName || candidateName === 'Candidate' || candidateName === 'Melinda G.')) {
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
      // Clean, focused workspace scenario configuration
      onStart({
        mode: 'scenario',
        domain,
        company: 'Enterprise Organization',
        role: 'Operations Lead',
        target_person_role: targetPersonRole,
        difficulty: 'medium',
        numQuestions: 3,
        durationMin: 15,
        strictMode: false,
        pressureMode: false,
        candidate_name: candidateName.trim() || 'Candidate',
        resume_text: null,
        resume_skills: [],
        resume_filename: null,
      });
    } else {
      // Interview mode configuration
      onStart({
        mode,
        domain,
        company,
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
    <div className={`w-full min-h-screen py-8 px-4 sm:px-8 lg:px-12 flex flex-col justify-center max-w-7xl mx-auto select-none ${
      !isInterview ? 'font-sans' : ''
    }`}>
      
      {/* ── TOP HEADER / MODE SWITCHER ────────────────────────────────────────── */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <CorporateLogo size="sm" showText={true} subtitle="Enterprise Simulation Engine" />
            <span className="hidden sm:inline-block text-slate-500">•</span>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
              isInterview 
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30' 
                : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
            }`}>
              {isInterview ? 'Corporate Telepresence Suite' : 'Workspace Scenario Dashboard'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ⚡ System Ready
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {isInterview ? 'Interview Question and Answer' : 'Workspace Scenario'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
            {isInterview 
              ? 'Standardized enterprise interview protocol featuring generative AI telepresence, real-time voice analysis, and on-device integrity auditing.'
              : 'Interactive workplace challenge simulator tailored to your company domain and stakeholder relationship.'}
          </p>
        </div>

        {/* Mode Switcher Pill on Top */}
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
                ? 'bg-purple-600/30 border border-purple-400/50 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Workspace Mode</span>
          </button>
        </div>
      </header>

      {/* ── CONDITIONAL SETUP VIEW ────────────────────────────────────────────── */}
      {!isInterview ? (
        /* ══════════════════════════════════════════════════════════════════════
           WORKSPACE SCENARIO MODE: PRODAI DARK PURPLE DASHBOARD THEME
           Featuring ONLY TWO DROPDOWNS:
           1. Domain of Company
           2. Role of the Person We Are Talking To
           ══════════════════════════════════════════════════════════════════════ */
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 max-w-5xl mx-auto">
          
          {/* Top Greeting Banner (matches ProdAI screenshot "Good evening, Melinda! Here is today's progress bar") */}
          <div className="prodai-card p-6 sm:p-7 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1.5px] shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                  <div className="w-full h-full rounded-[14px] bg-[#161726] flex items-center justify-center text-purple-300 font-bold text-sm">
                    MG
                  </div>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Good evening, {candidateName}!
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure your workplace crisis scenario below to begin the simulation.
                  </p>
                </div>
              </div>

              {/* Pill tabs matching the top-right of ProdAI screenshot */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#161726] border border-[#2b2d42] self-start sm:self-auto text-xs">
                <span className="prodai-pill-active px-3 py-1 rounded-lg text-xs">
                  Scenario
                </span>
                <span className="prodai-pill-inactive px-3 py-1 rounded-lg text-xs">
                  Active
                </span>
              </div>
            </div>

            {/* Slim neon purple progress bar matching screenshot */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Simulation Readiness</span>
                <span className="text-purple-300 font-bold">100% Prepared</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#161726] overflow-hidden border border-[#2b2d42]">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400 rounded-full shadow-[0_0_12px_#8b5cf6]"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Main 2-Column Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT CARD (lg:col-span-7): ONLY THE TWO REQUESTED DROPDOWNS */}
            <div className="lg:col-span-7 prodai-card p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-[#2b2d42] pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Workspace Scenario Setup
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 border border-purple-400/25 px-2.5 py-0.5 rounded-full">
                  2 Selections Required
                </span>
              </div>

              {/* ── DROPDOWN 1: DOMAIN OF COMPANY ─────────────────────────── */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span>Domain of Company</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Industry Context</span>
                </label>
                <div className="relative">
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full prodai-input rounded-xl p-3.5 text-sm font-semibold text-white cursor-pointer appearance-none"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d} className="bg-[#1c1d2c] text-white py-2">
                        {d}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-purple-400 font-bold text-xs">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Defines the operational context, industry challenges, and real-world stakes for the scenario.
                </p>
              </div>

              {/* ── DROPDOWN 2: ROLE OF THE PERSON WE ARE TALKING TO ───────── */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Role of the Person We Are Talking To</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-full">
                    {selectedPersonMeta.authority}
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={targetPersonRole}
                    onChange={(e) => setTargetPersonRole(e.target.value)}
                    className="w-full prodai-input rounded-xl p-3.5 text-sm font-semibold text-white cursor-pointer appearance-none"
                  >
                    {PERSON_ROLES.map((p) => (
                      <option key={p.value} value={p.value} className="bg-[#1c1d2c] text-white py-2">
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-400 font-bold text-xs">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tailors the AI stakeholder's communication style, expectations, and authority response dynamics.
                </p>
              </div>

              {/* Primary Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl text-sm font-bold text-white prodai-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Scenario for {targetPersonRole}…</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Workspace Scenario</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT CARDS (lg:col-span-5): STAKEHOLDER & SCENARIO PREVIEW */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Stakeholder Persona Insight Card (styled like "AI Chat & Recommendations" in screenshot) */}
              <div className="prodai-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2b2d42] pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Target Stakeholder Brief
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300">
                    Live Role
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161726] border border-[#2b2d42] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {selectedPersonMeta.value}
                    </span>
                    <span className="text-[10px] font-mono text-purple-300">
                      Authority Level
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    "{selectedPersonMeta.tone}"
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Key Evaluation Focus:
                  </span>
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Role-appropriate tone & communication</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Clear accountability & realistic mitigation</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Decision quality under operational constraints</span>
                  </div>
                </div>
              </div>

              {/* Simulated Emergency Context Card */}
              <div className="prodai-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Crisis Domain Preview
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    {domain}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-[#161726] border border-[#2b2d42]">
                  "{CRISIS_SCENARIOS[domain] || 'High-stakes workplace emergency requiring urgent cross-functional mitigation.'}"
                </p>
              </div>

            </div>

          </div>
        </form>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════
           INTERVIEW MODE: FULL TELEPRESENCE STUDIO SETUP
           ══════════════════════════════════════════════════════════════════════ */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT PANEL (lg:col-span-6): DOSSIER / RESUME ─────────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-6 w-full">
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
                  Resume (PDF) for Tailored Questions
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
          </div>

          {/* ── RIGHT PANEL (lg:col-span-6): INTERVIEW PARAMETERS ────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-6 w-full">
            <div className="ios-glass-card rounded-3xl p-6 sm:p-7 border-white/15 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Interview Simulation Settings
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

              {/* Target Candidate Role */}
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

              {/* Strict Anti-Cheat Proctor Toggle */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    On-Device Strict Proctor
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Detects mobile phones, disables copy-paste, and checks camera presence.
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
                className="w-full py-4 rounded-2xl text-base font-extrabold text-white flex items-center justify-center gap-2 shadow-2xl transition-all ios-glass-btn-primary disabled:opacity-40 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Interview Protocol…</span>
                  </>
                ) : (
                  <>
                    <span>Enter Virtual Interview Studio</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
