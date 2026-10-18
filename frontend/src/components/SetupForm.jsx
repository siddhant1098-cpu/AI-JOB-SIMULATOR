import React from 'react';

/**
 * SetupForm — Minimal, Premium Pastel Theme
 * 6 config inputs + mode toggle + strict mode switch
 */
const DOMAINS = [
  'Event Management', 'Software Engineering', 'Marketing', 'Finance',
  'Healthcare', 'Human Resources', 'Sales', 'Operations', 'Education',
  'Legal', 'Supply Chain', 'Customer Success',
];

const COMPANY_SIZES = [
  'Small startup', 'Mid-size company', 'Large enterprise', 'Government / public sector',
  'Non-profit', 'Consulting firm',
];

const ROLES = {
  'Event Management': ['Operations Manager', 'Event Coordinator', 'Venue Manager', 'Logistics Lead'],
  'Software Engineering': ['Frontend Engineer', 'Backend Engineer', 'Full-Stack Developer', 'DevOps Engineer', 'Engineering Manager'],
  'Marketing': ['Marketing Manager', 'Brand Strategist', 'Growth Marketer', 'Content Lead'],
  'Finance': ['Financial Analyst', 'CFO', 'Accountant', 'Investment Analyst'],
  'Healthcare': ['Hospital Administrator', 'Clinical Manager', 'Health IT Specialist'],
  'Human Resources': ['HR Manager', 'Recruiter', 'People Operations Lead'],
  'Sales': ['Account Executive', 'Sales Manager', 'Business Development Rep'],
  'Operations': ['Operations Manager', 'Process Improvement Specialist', 'Supply Chain Analyst'],
  'Education': ['School Principal', 'Curriculum Designer', 'Academic Coordinator'],
  'Legal': ['Legal Counsel', 'Compliance Officer', 'Paralegal'],
  'Supply Chain': ['Supply Chain Manager', 'Procurement Specialist', 'Logistics Coordinator'],
  'Customer Success': ['Customer Success Manager', 'Support Lead', 'Account Manager'],
};

export default function SetupForm({ onStart, isLoading }) {
  const [mode, setMode] = React.useState('interview');
  const [domain, setDomain] = React.useState('Event Management');
  const [company, setCompany] = React.useState('Mid-size company');
  const [role, setRole] = React.useState('Operations Manager');
  const [difficulty, setDifficulty] = React.useState('medium');
  const [numQuestions, setNumQuestions] = React.useState(3);
  const [durationMin, setDurationMin] = React.useState(15);
  const [strictMode, setStrictMode] = React.useState(true);

  // After a few seconds of loading, tell the user the server may be waking up
  const [isSlow, setIsSlow] = React.useState(false);
  React.useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return undefined;
    }
    const t = setTimeout(() => setIsSlow(true), 6000);
    return () => clearTimeout(t);
  }, [isLoading]);

  // Update role when domain changes
  React.useEffect(() => {
    const roles = ROLES[domain] || [];
    if (roles.length) setRole(roles[0]);
  }, [domain]);

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
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Delicate pastel atmospheric ambient glows */}
      <div className="absolute top-[-8%] left-[-8%] w-96 h-96 bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-8%] right-[-8%] w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[35%] right-[10%] w-72 h-72 bg-amber-50/60 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Minimal Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/80 text-stone-600 text-xs font-medium mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Human-Centered AI Job Simulation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Practice with Confidence
          </h1>
          <p className="text-stone-500 text-sm mt-1.5 font-normal max-w-sm mx-auto">
            Real conversations, empathetic feedback, and real-time guidance.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/85 backdrop-blur-xl border border-stone-200/80 rounded-3xl p-6 sm:p-7 space-y-5 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
        >
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Simulation Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('interview')}
                className={`py-3 px-4 rounded-2xl font-medium text-sm transition-all text-left flex items-center justify-between border ${
                  mode === 'interview'
                    ? 'bg-[#F2EDFD] border-[#DDD5F7] text-[#553C9A] shadow-xs'
                    : 'bg-stone-50/80 border-stone-200/60 text-stone-600 hover:bg-stone-100/70'
                }`}
              >
                <div>
                  <div className="font-semibold">💼 Interview Q&A</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Technical & Situational</div>
                </div>
                {mode === 'interview' && <span className="text-xs">✓</span>}
              </button>

              <button
                type="button"
                onClick={() => setMode('scenario')}
                className={`py-3 px-4 rounded-2xl font-medium text-sm transition-all text-left flex items-center justify-between border ${
                  mode === 'scenario'
                    ? 'bg-[#EEF7F2] border-[#CDE5D7] text-[#22543D] shadow-xs'
                    : 'bg-stone-50/80 border-stone-200/60 text-stone-600 hover:bg-stone-100/70'
                }`}
              >
                <div>
                  <div className="font-semibold">🏢 Workplace Challenge</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Real Problem Solving</div>
                </div>
                {mode === 'scenario' && <span className="text-xs">✓</span>}
              </button>
            </div>
          </div>

          {/* Domain & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Industry / Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-stone-50/90 border border-stone-200 text-stone-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all font-medium"
              >
                {DOMAINS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Role Title
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-stone-50/90 border border-stone-200 text-stone-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all font-medium"
              >
                {(ROLES[domain] || []).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Company Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Organization Context
            </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-stone-50/90 border border-stone-200 text-stone-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all font-medium"
            >
              {COMPANY_SIZES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['easy', 'Easy', 'bg-[#EEF7F2]', 'text-emerald-800', 'border-[#CDE5D7]'],
                ['medium', 'Balanced', 'bg-[#FEF7EC]', 'text-amber-800', 'border-[#F8E1C2]'],
                ['hard', 'Challenging', 'bg-[#FDF0ED]', 'text-rose-800', 'border-[#F8D2CA]'],
              ].map(([d, label, bg, text, border]) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-3 rounded-xl font-medium text-xs capitalize transition-all border ${
                    difficulty === d
                      ? `${bg} ${text} ${border} shadow-xs font-bold ring-2 ring-stone-300`
                      : 'bg-stone-50/70 border-stone-200/80 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Questions & Duration */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Questions
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="w-full bg-stone-50/90 border border-stone-200 text-stone-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Duration (min)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                className="w-full bg-stone-50/90 border border-stone-200 text-stone-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 font-medium"
              />
            </div>
          </div>

          {/* Strict Proctored Mode Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              strictMode
                ? 'bg-[#F3EEFD]/60 border-[#DED4FA]'
                : 'bg-stone-50/70 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🛡️</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-stone-800">Strict Anti-Cheat Proctor</p>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-purple-100 text-purple-700">
                      AI Guard
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Camera device detection & clipboard copy/paste lock
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStrictMode(!strictMode)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  strictMode ? 'bg-[#7C6BB5] justify-end' : 'bg-stone-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
              </button>
            </div>
            {strictMode && (
              <div className="mt-3 pt-3 border-t border-purple-200/50 grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-purple-600">🚫</span> Copy & Paste Blocked
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-purple-600">📱</span> AI Mobile Detection
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-purple-600">👤</span> Face Presence Lock
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-purple-600">📑</span> Tab Switch Sensor
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Preparing your conversation…</span>
              </>
            ) : (
              <span>Start Assessment →</span>
            )}
          </button>
          {isLoading && isSlow && (
            <p className="text-center text-[11px] text-stone-500 -mt-2">
              Waking up the server — the first start can take up to a minute.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
