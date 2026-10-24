// API base URL — in prod this is set via VITE_API_URL env variable
const BASE = import.meta.env.VITE_API_URL || '';

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
export const evaluateAnswer = (config, question, answer, questionIndex) =>
  post('/api/evaluate', { config, question, answer, questionIndex });
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
