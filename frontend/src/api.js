// API base URL — in prod this is set via VITE_API_URL env variable (strips trailing slash if provided)
const RAW_BASE = import.meta.env.VITE_API_URL || '';
const BASE = RAW_BASE.replace(/\/+$/, '');

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'API error');
  }
  return res.json();
}

export const generateQuestions = (config) => post('/api/questions', { config });

export const evaluateAnswer = ({
  question_id,
  question_text,
  candidate_answer,
  domain,
  role,
  difficulty,
  mode,
  strict_mode,
  candidate_name,
  resume_text,
  character,
  character_authority_level,
  priority,
  scenario_state,
  pressureMode,
}) => post('/api/evaluate', {
  config: {
    mode,
    domain,
    company: '',
    role,
    difficulty,
    strictMode: strict_mode,
    candidate_name,
    resume_text,
    pressureMode: pressureMode || false,
  },
  question: {
    id: question_id,
    text: question_text,
    character: character || 'Hiring Manager',
    character_authority_level: character_authority_level || 3,
    priority: priority || 'P2',
  },
  answer: candidate_answer,
  questionIndex: 0,
  scenario_state: scenario_state || null,
});

export const generateReport = (config, qa_pairs, flags) =>
  post('/api/report', { config, qa_pairs, flags });

export async function uploadAndParseResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE}/api/resume/parse`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to parse resume PDF');
  }
  return res.json();
}

export const checkTTSStatus = async () => {
  const res = await fetch(`${BASE}/api/tts/status`);
  if (!res.ok) return { configured: false };
  return res.json();
};

export const fetchScenarios = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.industry) query.append('industry', params.industry);
  if (params.difficulty) query.append('difficulty', params.difficulty);
  if (params.skill) query.append('skill', params.skill);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`${BASE}/api/scenarios${qStr}`);
  if (!res.ok) throw new Error('Failed to load scenarios');
  return res.json();
};

export const fetchScenarioById = async (scenarioId) => {
  const res = await fetch(`${BASE}/api/scenarios/${encodeURIComponent(scenarioId)}`);
  if (!res.ok) throw new Error('Scenario not found');
  return res.json();
};

export const evaluatePrebuiltScenario = ({
  scenario_id,
  candidate_answer,
  turn_id = 1,
  completed_scenarios = [],
  skill_scores = null,
}) => post('/api/scenarios/evaluate', {
  scenario_id,
  candidate_answer,
  turn_id,
  completed_scenarios,
  skill_scores,
});

export const fetchScenarioRecommendations = async (completed = []) => {
  const qStr = completed.length > 0 ? `?completed=${encodeURIComponent(completed.join(','))}` : '';
  const res = await fetch(`${BASE}/api/scenarios/recommendations${qStr}`);
  if (!res.ok) throw new Error('Failed to get recommendations');
  return res.json();
};
