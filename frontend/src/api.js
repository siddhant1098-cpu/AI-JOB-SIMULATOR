// API base URL — in prod this is set via VITE_API_URL env variable
const BASE = import.meta.env.VITE_API_URL || '';

// Longest we wait for one request before showing an error instead of spinning forever.
// Generous enough to cover a Render free-tier cold start (~30-60s) plus the LLM call.
const REQUEST_TIMEOUT_MS = 75000;

async function post(path, body, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'API error');
    }
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error('The server took too long to respond. Please try again.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fire-and-forget ping that wakes a sleeping backend (e.g. Render free tier)
 * while the user is still filling in the setup form.
 */
export function warmUpBackend() {
  fetch(`${BASE}/health`, { method: 'GET' }).catch(() => {});
}

export const generateQuestions = (config) => post('/api/questions', { config });
export const evaluateAnswer = (config, question, answer, questionIndex) =>
  post('/api/evaluate', { config, question, answer, questionIndex });
export const generateReport = (config, qa_pairs, flags) =>
  post('/api/report', { config, qa_pairs, flags });
