# 🌿 AI Job Simulator — Hackathon Edition

A real-time, human-centered job and workplace scenario simulator with conversational AI, speech interaction, and on-device computer vision anti-cheat proctoring.

---

## ✨ Features

- **Empathetic Human Coaching:** Evaluates practical common sense, composure, empathy, and initiative with generous, constructive feedback.
- **Natural Voice:** Speaks conversationally like a trusted senior colleague over coffee.
- **Strict Anti-Cheat Proctoring:**
  - 📱 Real-time on-device Mobile Phone detection (MediaPipe Vision Object Detector).
  - 🚫 Clipboard lock (no copy/paste of questions or answers).
  - ⌨️ Keyboard shortcut blocking (`Ctrl+C`, `Ctrl+V`, `F12`, `PrintScreen`).
  - 📑 Tab-switch & window blur tracking.
  - 👤 Face presence & multi-face verification.
- **Minimal Pastel Aesthetics:** Elegant alabaster cream design with subtle frosted glass and soft accents.
- **Zero Database Required:** Runs fully stateless with resilient `localStorage` session recovery.

---

## 🚀 Quick Start (For You & Your Friends)

### Prerequisites
Make sure you have installed on your computer:
1. **Python 3.10+** (check *"Add Python to PATH"* during install)
2. **Node.js 18+**

### Running the App (1-Click)
Just double-click:
```
start.bat
```
*(The script automatically installs any missing dependencies, checks your Google API key, and launches both frontend and backend servers).*

Then open **http://localhost:5173** in **Google Chrome** or **Microsoft Edge**.

---

## 🔑 API Key
Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and put it inside `backend/.env`:
```env
GOOGLE_API_KEY=your_key_here
```

---

## 📦 Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Recharts, Lucide, MediaPipe Tasks Vision
- **Backend:** FastAPI, Python, Google Generative AI (Gemini), `json-repair`
- **Audio:** Browser SpeechSynthesis (TTS) & Web Speech API (STT)
