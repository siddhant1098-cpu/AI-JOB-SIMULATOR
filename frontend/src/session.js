// Session management via localStorage
const SESSION_KEY = 'jobsim_session';

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Could not save session', e);
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function createSession(config) {
  return {
    id: crypto.randomUUID(),
    config,
    questions: [],
    currentIndex: 0,
    answers: [],
    scores: [],
    startedAt: Date.now(),
    durationMin: config.durationMin,
    elapsedMs: 0,
    stage: 'running',
    flags: [],
  };
}

// Voice settings saved separately
const VOICE_KEY = 'jobsim_voice';
export function loadVoiceSettings() {
  try {
    return JSON.parse(localStorage.getItem(VOICE_KEY) || '{}');
  } catch {
    return {};
  }
}
export function saveVoiceSettings(settings) {
  localStorage.setItem(VOICE_KEY, JSON.stringify(settings));
}
