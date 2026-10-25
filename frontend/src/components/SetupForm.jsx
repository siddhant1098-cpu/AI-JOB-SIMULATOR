import React, { useState, useEffect, useRef, useMemo } from 'react';
import { uploadAndParseResume, fetchScenarios } from '../api';
import { PREDEFINED_SCENARIOS_CATALOG } from '../scenarioCatalog';
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
  Timer,
  HelpCircle,
  BookOpen,
  Filter,
  Search,
  Award
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
 * SetupForm — Light Orange Configuration Cockpit
 * Clean modern light theme across both modes:
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

  // Prebuilt Workspace Scenario Library State
  const [workspaceTab, setWorkspaceTab] = useState('library'); // 'library' | 'custom'
  const [scenariosList, setScenariosList] = useState(PREDEFINED_SCENARIOS_CATALOG);
  const [selectedScenarioId, setSelectedScenarioId] = useState('angry-client');
  const [filterIndustry, setFilterIndustry] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterSkill, setFilterSkill] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchScenarios().then((res) => {
      if (res?.scenarios?.length > 0) {
        setScenariosList(res.scenarios);
      }
    }).catch(() => {
      // Use local catalog
    });
  }, []);

  const filteredScenarios = useMemo(() => {
    return scenariosList.filter((sc) => {
      if (filterIndustry !== 'All' && !sc.industry_tags?.some((t) => t.toLowerCase().includes(filterIndustry.toLowerCase()))) {
        return false;
      }
      if (filterDifficulty !== 'All' && sc.difficulty.toLowerCase() !== filterDifficulty.toLowerCase()) {
        return false;
      }
      if (filterSkill !== 'All' && !sc.skill_tags?.some((s) => s.toLowerCase().includes(filterSkill.toLowerCase()))) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = sc.title.toLowerCase().includes(q);
        const matchesDesc = sc.description.toLowerCase().includes(q);
        const matchesChar = sc.character?.name?.toLowerCase().includes(q) || sc.character?.role?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesChar) return false;
      }
      return true;
    });
  }, [scenariosList, filterIndustry, filterDifficulty, filterSkill, searchQuery]);

  const selectedScenario = scenariosList.find((s) => s.id === selectedScenarioId) || scenariosList[0] || PREDEFINED_SCENARIOS_CATALOG[0];

  const handleStartPrebuilt = (scenarioToStart = selectedScenario) => {
    if (!scenarioToStart) return;
    onStart({
      mode: 'scenario',
      domain: scenarioToStart.industry_tags?.[0] || 'Software Engineering',
      company: 'Enterprise Organization',
      role: scenarioToStart.compatible_roles?.[0] || 'Operations Lead',
      target_person_role: `${scenarioToStart.character?.name} (${scenarioToStart.character?.role})`,
      difficulty: scenarioToStart.difficulty?.toLowerCase() || 'medium',
      numQuestions: 1,
      durationMin: 15,
      strictMode: true,
      pressureMode,
      candidate_name: candidateName.trim() || 'Candidate',
      prebuiltScenario: scenarioToStart,
    });
  };

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
    <div className="w-full min-h-screen bg-white select-none font-sans">

      {/* ── STICKY WHITE HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 sm:px-10 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <CorporateLogo size="sm" showText={true} subtitle="Enterprise Simulation Engine" />
            <span className="hidden sm:inline-block text-gray-300">•</span>
            <span className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isInterview 
                ? 'bg-orange-50 text-orange-600 border-orange-200' 
                : 'bg-orange-50 text-orange-600 border-orange-200'
            }`}>
              {isInterview ? 'Interview Studio' : 'Workspace Scenarios'}
            </span>
            {pressureMode && (
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-300 animate-pulse flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-amber-500" />
                60s Pressure Room Active
              </span>
            )}
          </div>

          {/* Mode Switcher Pill */}
          <div className="p-1.5 rounded-2xl bg-gray-100 border border-gray-200 flex items-center gap-1.5 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => handleModeSwitch('interview')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isInterview
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
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
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Workspace Mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFAF7] bg-[radial-gradient(circle,#F3D5C0_1px,transparent_1px)] bg-[length:24px_24px] py-12 px-6 sm:px-10 border-b border-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-600 text-white">
              {isInterview ? 'Interview Simulator' : 'Workspace Simulator'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
            {isInterview ? (
              <>Interview <span className="text-orange-600">Question & Answer</span></>
            ) : (
              <>Workspace <span className="text-orange-600">Scenario Simulation</span></>
            )}
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-3xl leading-relaxed">
            {isInterview 
              ? 'Comprehensive role-based interview simulation featuring conversational voice analysis, technical deep-dives, and real-time evaluation.'
              : 'Real-world workplace challenge simulation testing leadership instincts, problem-solving, and role-appropriate communication.'}
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12">

        {!isInterview ? (
          /* ══════════════════════════════════════════════════════════════════════
             WORKSPACE SCENARIO MODE: PREBUILT LIBRARY & CUSTOM AI INCIDENTS
             ══════════════════════════════════════════════════════════════════════ */
          <div className="w-full flex flex-col gap-6">
            
            {/* Sub-header Bar: Candidate Name + Sub-Tab Toggle + Pressure Room */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200">
              {/* Candidate Name Input */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <User className="w-4 h-4 text-orange-500" />
                  Candidate:
                </span>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter Candidate Name"
                  className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-orange-400 w-44 sm:w-56"
                />
              </div>

              {/* Segmented Sub-Tab Switcher */}
              <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setWorkspaceTab('library')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    workspaceTab === 'library'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Scenario Library (10 Prebuilt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkspaceTab('custom')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    workspaceTab === 'custom'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>AI-Generated Incident</span>
                </button>
              </div>

              {/* 60s Pressure Room Toggle */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-gray-900 block">60s Pressure Room</span>
                  <span className="text-[10px] text-gray-400 block">Strict operational timer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPressureMode(!pressureMode)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    pressureMode ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                  title="Toggle 60s response deadline"
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      pressureMode ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
               SUB-VIEW 1: PREBUILT SCENARIO LIBRARY (10 PREDEFINED SCENARIOS)
               ══════════════════════════════════════════════════════════════════════ */}
            {workspaceTab === 'library' ? (
              <div className="flex flex-col gap-6">
                
                {/* Filter Controls Row */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Search Box */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search scenarios by title, role, or situation..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-orange-400"
                    />
                  </div>

                  {/* Difficulty Filters */}
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
                    <span className="text-gray-500 px-2 text-[11px] font-bold">Difficulty:</span>
                    {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setFilterDifficulty(diff)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          filterDifficulty === diff
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>

                  {/* Skill Filter Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-[11px] font-bold">Skill:</span>
                    <select
                      value={filterSkill}
                      onChange={(e) => setFilterSkill(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-orange-400 cursor-pointer"
                    >
                      <option value="All">All Practice Skills</option>
                      <option value="Communication">Communication</option>
                      <option value="Problem-solving">Problem-solving</option>
                      <option value="Prioritisation">Prioritisation</option>
                      <option value="Accountability">Accountability</option>
                      <option value="Teamwork">Teamwork</option>
                      <option value="Adaptability">Adaptability</option>
                      <option value="Conflict resolution">Conflict resolution</option>
                      <option value="Decision-making">Decision-making</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Interview communication">Interview communication</option>
                    </select>
                  </div>

                  {/* Industry Filter Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-[11px] font-bold">Industry:</span>
                    <select
                      value={filterIndustry}
                      onChange={(e) => setFilterIndustry(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-orange-400 cursor-pointer"
                    >
                      <option value="All">All Industries</option>
                      <option value="Technology and IT">Technology and IT</option>
                      <option value="Business and Management">Business and Management</option>
                      <option value="Operations and Project Management">Operations & PM</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales and Customer Success">Sales & CS</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="General Corporate">General Corporate</option>
                    </select>
                  </div>
                </div>

                {/* Main 2-Column Cockpit: Scenario Catalog List + Selected Scenario Dossier */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COLUMN (lg:col-span-5): 10 SCENARIO CARDS */}
                  <div className="lg:col-span-5 flex flex-col gap-3 max-h-[720px] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between px-1 pb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-orange-500" />
                        Prebuilt Scenarios ({filteredScenarios.length} of {scenariosList.length})
                      </span>
                      <span className="text-[10px] font-mono text-orange-600">OPM BARS Rubric Ready</span>
                    </div>

                    {filteredScenarios.length === 0 ? (
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center space-y-2">
                        <p className="text-sm font-semibold text-gray-700">No scenarios match your filters.</p>
                        <button
                          type="button"
                          onClick={() => { setFilterIndustry('All'); setFilterDifficulty('All'); setFilterSkill('All'); setSearchQuery(''); }}
                          className="text-xs text-orange-600 underline font-semibold"
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      filteredScenarios.map((sc) => {
                        const isSelected = sc.id === selectedScenario.id;
                        const diffColor = 
                          sc.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          sc.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200';

                        return (
                          <div
                            key={sc.id}
                            onClick={() => setSelectedScenarioId(sc.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                              isSelected
                                ? 'bg-orange-50 border-orange-400 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                {isSelected && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />}
                                <span>{sc.title}</span>
                              </span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${diffColor}`}>
                                {sc.difficulty}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {sc.description}
                            </p>

                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
                              <span className="text-orange-600 font-semibold truncate max-w-[200px]">
                                👤 {sc.character?.name} ({sc.character?.authority_level})
                              </span>
                              <div className="flex items-center gap-1">
                                {sc.skill_tags?.slice(0, 2).map((st) => (
                                  <span key={st} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                    {st}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* RIGHT COLUMN (lg:col-span-7): SELECTED SCENARIO DOSSIER */}
                  <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl shadow-sm p-7 sm:p-8 space-y-6">
                    
                    {/* Header: Title + Difficulty + Roles */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                            Predefined Scenario #{scenariosList.findIndex((s) => s.id === selectedScenario.id) + 1}
                          </span>
                          <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            selectedScenario.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            selectedScenario.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {selectedScenario.difficulty} Difficulty
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                          {selectedScenario.title}
                        </h2>
                      </div>

                      {pressureMode && (
                        <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                          <Timer className="w-3.5 h-3.5 text-amber-500" />
                          60s Pressure Room
                        </span>
                      )}
                    </div>

                    {/* Character Profile Card */}
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-orange-700 text-sm">
                          {selectedScenario.character?.name?.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-900 block">
                            {selectedScenario.character?.name}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            {selectedScenario.character?.role} • Authority: <strong className="text-orange-600">{selectedScenario.character?.authority_level}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200 self-start sm:self-auto">
                        Voice: <span className="text-orange-600 font-semibold">{selectedScenario.character?.voice_profile || 'Default'}</span>
                      </div>
                    </div>

                    {/* Opening Incident Dialogue (Speech Balloon) */}
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                        Opening Incident Dialogue (Direct Stakeholder Challenge):
                      </p>
                      <blockquote className="text-gray-900 text-sm font-medium italic leading-relaxed">
                        "{selectedScenario.opening_message}"
                      </blockquote>
                    </div>

                    {/* OPM BARS Rubric Criteria Breakdown (100% Weight Matrix) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-orange-500" />
                          Evidence-Based Evaluation Rubric (OPM Principles)
                        </span>
                        <span className="text-[11px] font-mono text-emerald-600 font-bold">
                          Weights Total: 100%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {selectedScenario.rubric?.map((c) => (
                          <div key={c.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-800">{c.name}</span>
                              <span className="font-mono text-orange-700 font-bold bg-orange-50 px-1.5 py-0.5 rounded text-[10px] border border-orange-200">
                                {c.weight}%
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-snug">
                              {c.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Desirable Expected Behaviors */}
                    <div className="space-y-2 text-xs text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1">
                        Target Competency Indicators:
                      </span>
                      {selectedScenario.expected_behaviours?.slice(0, 3).map((beh, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{beh}</span>
                        </div>
                      ))}
                    </div>

                    {/* Big Primary Start Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleStartPrebuilt(selectedScenario)}
                        disabled={isLoading}
                        className="w-full py-4 rounded-2xl text-base font-extrabold text-white bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2.5 shadow-sm transition-all hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Initializing Simulation Session…</span>
                          </>
                        ) : (
                          <>
                            <span>Start Selected Scenario: {selectedScenario.title}</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-center text-gray-400 mt-2">
                        Launches direct incident dialog with {selectedScenario.character?.name}. AI scenario generation is bypassed.
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            ) : (
              /* ══════════════════════════════════════════════════════════════════════
                 SUB-VIEW 2: AI-GENERATED INCIDENT (CUSTOM DOMAIN & STAKEHOLDER)
                 ══════════════════════════════════════════════════════════════════════ */
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT / MAIN CARD (lg:col-span-7): THE CONFIGURATION COCKPIT */}
                  <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 space-y-7">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                          <Sliders className="w-5 h-5 text-orange-500" />
                          <span>AI Incident Configuration</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Gemini will synthesize a custom high-stakes workplace incident.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                        Custom Generator
                      </span>
                    </div>

                    {/* DROPDOWN 1: DOMAIN OF COMPANY */}
                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-orange-500" />
                          <span>Domain of Company</span>
                        </span>
                        <span className="text-xs font-mono text-gray-400">Industry Sector</span>
                      </label>
                      <div className="relative">
                        <select
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-base font-semibold text-gray-900 cursor-pointer appearance-none shadow-sm focus:outline-none focus:border-orange-400"
                        >
                          {DOMAINS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-orange-500 font-bold text-xs">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* DROPDOWN 2: ROLE OF THE PERSON WE ARE TALKING TO */}
                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-500" />
                          <span>Role of the Person We Are Talking To</span>
                        </span>
                        <span className="text-xs font-mono text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                          {selectedPersonMeta.authority}
                        </span>
                      </label>
                      <div className="relative">
                        <select
                          value={targetPersonRole}
                          onChange={(e) => setTargetPersonRole(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-base font-semibold text-gray-900 cursor-pointer appearance-none shadow-sm focus:outline-none focus:border-orange-400"
                        >
                          {PERSON_ROLES.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-orange-500 font-bold text-xs">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Primary Submit Button */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-2xl text-base font-extrabold text-white bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none shadow-sm transition-all"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Synthesizing Scenario for {targetPersonRole}…</span>
                          </>
                        ) : (
                          <>
                            <span>Synthesize and Launch AI Incident</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* RIGHT COLUMN (lg:col-span-5): STAKEHOLDER DOSSIER PREVIEW */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-7 space-y-5">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3.5">
                        <div className="flex items-center gap-2.5">
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                            Target Stakeholder Profile
                          </span>
                        </div>
                        <span className="text-xs font-mono text-orange-600">
                          Authority {selectedPersonMeta.authority}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-2">
                        <span className="text-sm font-bold text-gray-900 block">
                          {selectedPersonMeta.value}
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          "{selectedPersonMeta.tone}"
                        </p>
                      </div>

                      <div className="space-y-2 text-xs text-gray-500">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1">
                          Evaluation Priorities:
                        </span>
                        <div className="flex items-start gap-2.5 text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Role-appropriate tone & clear communication</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Ownership, mitigation steps & realistic timelines</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Calm decision-making under operational constraints</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-7 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2">
                          <Flame className="w-4 h-4 text-rose-500" />
                          Simulated Operational Challenge
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                          {domain}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed p-4 rounded-xl bg-gray-50 border border-gray-200">
                        "{CRISIS_SCENARIOS[domain] || 'High-stakes workplace emergency requiring urgent cross-functional mitigation.'}"
                      </p>
                    </div>
                  </div>

                </div>
              </form>
            )}

          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════════
             INTERVIEW MODE: UNIFIED SPACIOUS MODERN LIGHT THEME
             ══════════════════════════════════════════════════════════════════════ */
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto w-full">
            
            {/* ── LEFT PANEL (lg:col-span-6): DOSSIER / RESUME ─────────────────── */}
            <div className="lg:col-span-6 flex flex-col gap-6 w-full">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-orange-500" />
                    Candidate Profile & Resume
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadDemoResume}
                    className="px-3 py-1.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 font-semibold transition-all"
                  >
                    ⚡ Demo Resume
                  </button>
                </div>

                {/* Candidate Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-all"
                  />
                </div>

                {/* Resume PDF Drop Zone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Resume (PDF) for Custom Tailored Questions
                  </label>

                  {resumeData ? (
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">
                            {resumeData.filename || 'Uploaded Resume'}
                          </p>
                          <p className="text-xs text-orange-600 mt-0.5">
                            {resumeData.key_skills?.length || 0} skills extracted
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResumeData(null)}
                        className="px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 transition-all"
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
                          ? 'border-orange-400 bg-orange-50' 
                          : 'border-gray-300 hover:border-orange-400 bg-gray-50 hover:bg-orange-50/50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files?.[0])}
                      />
                      <Upload className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-700">
                        {isParsingResume ? 'Parsing Resume Intelligence...' : 'Upload Candidate Resume PDF'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Drag & drop or click to browse
                      </p>
                    </div>
                  )}

                  {resumeError && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {resumeError}
                    </p>
                  )}
                </div>

                {/* Extracted Skills */}
                {resumeData?.key_skills && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                      Extracted Candidate Strengths:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.key_skills.slice(0, 8).map((sk, idx) => (
                        <span key={idx} className="text-xs font-mono px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-700">
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
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 space-y-6">
                <span className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2 border-b border-gray-200 pb-4">
                  <Sliders className="w-4 h-4 text-orange-500" />
                  Interview Simulation Settings
                </span>

                {/* Domain Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Industry Domain
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-base text-gray-900 focus:outline-none focus:border-orange-400 transition-all"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Candidate Role */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Target Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-base text-gray-900 focus:outline-none focus:border-orange-400 transition-all"
                  >
                    {(ROLES[domain] || []).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience / Difficulty Tier */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
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
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Interview Questions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-orange-500" />
                      <span>Number of Questions</span>
                    </label>
                    <span className="text-xs font-mono text-orange-600 font-bold">{numQuestions} Questions</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { val: 3, label: '3 Qs', sub: 'Quick (~10m)' },
                      { val: 5, label: '5 Qs', sub: 'Standard (~15m)' },
                      { val: 8, label: '8 Qs', sub: 'In-Depth (~25m)' },
                      { val: 10, label: '10 Qs', sub: 'Mastery (~35m)' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setNumQuestions(opt.val)}
                        className={`p-3 rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                          Number(numQuestions) === opt.val
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[10px] opacity-75 mt-0.5">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assessment Duration */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Assessment Duration</span>
                    </label>
                    <span className="text-xs font-mono text-orange-600 font-bold">{durationMin} Minutes</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { val: 10, label: '10m' },
                      { val: 15, label: '15m' },
                      { val: 20, label: '20m' },
                      { val: 30, label: '30m' },
                      { val: 45, label: '45m' }
                    ].map((dur) => (
                      <button
                        key={dur.val}
                        type="button"
                        onClick={() => setDurationMin(dur.val)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                          Number(durationMin) === dur.val
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pressure Mode Toggle */}
                <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  pressureMode ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Zap className={`w-4 h-4 ${pressureMode ? 'text-amber-500' : 'text-gray-400'}`} />
                      <span>Pressure Mode (60s Timer)</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Strict 60-second response countdown per challenge.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPressureMode(!pressureMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      pressureMode ? 'bg-amber-500' : 'bg-gray-300'
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
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>On-Device Strict Proctor</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Monitors camera integrity & phone presence with zero cloud recording.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStrictMode(!strictMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      strictMode ? 'bg-emerald-500' : 'bg-gray-300'
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
                    className="w-full py-4 rounded-2xl text-base font-extrabold text-white flex items-center justify-center gap-2.5 shadow-sm transition-all bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:pointer-events-none"
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

      </main>
    </div>
  );
}
