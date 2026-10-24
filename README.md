# 🌿 AI Job Simulator — Assessment Platform

A real-time, human-centered job and workplace scenario simulator featuring conversational dialogue, speech interaction, PDF resume-grounded question generation, and on-device integrity proctoring.

---

## ✨ Key Features

- **📄 Resume PDF Upload & Question Generation:**
  - Candidates can submit their resume as a PDF.
  - Automatically parses text and extracts candidate name, domain, target role, and key skills.
  - Generates questions tailored to the candidate's actual projects, technical stack, past decisions, and achievements.

- **🛡️ Strict Proctoring & Integrity Auditing:**
  - 📱 Real-time on-device Mobile Phone detection (MediaPipe Vision Object Detector).
  - 🚫 Clipboard lock (no copy/paste of questions or answers).
  - ⌨️ Keyboard shortcut blocking (`Ctrl+C`, `Ctrl+V`, `F12`, `PrintScreen`).
  - 📑 Tab-switch & window blur tracking.
  - 👤 Face presence & multi-face verification.
  - 📊 Complete integrity violation timeline presented in the final evaluation debrief.

- **📊 Comprehensive Performance Debrief:**
  - Overall rating, letter grade, and radar chart across core competencies (technical clarity, composure, problem-solving, empathy, initiative).
  - Categorized strengths, actionable growth areas, and recommended next steps.

- **Empathetic Human Coaching:** Evaluates practical common sense, composure, empathy, and initiative with generous, constructive feedback.
- **Natural Voice:** Speaks conversationally like a trusted senior colleague over coffee.
- **Minimal Pastel Aesthetics:** Elegant alabaster cream design with subtle frosted glass and soft accents.
- **Zero Database Required:** Runs fully stateless with resilient `localStorage` session recovery.

---

## 🚀 Quick Start

### Prerequisites
Make sure you have installed on your computer:
1. **Python 3.10+** (check *"Add Python to PATH"* during install)
2. **Node.js 18+**

### Running the App (1-Click)
Just double-click:
```
start.bat
```
*(The script launches both the FastAPI backend on port 8000 and the Vite frontend on port 5173).*

Then open **http://localhost:5173** in **Google Chrome** or **Microsoft Edge**.

---

## 🔑 Environment Configuration (`backend/.env`)

```env
GOOGLE_API_KEY=your_google_ai_studio_key_here
```

---

## 📦 Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Recharts, Lucide, MediaPipe Tasks Vision
- **Backend:** FastAPI, Python, Google Generative AI, `json-repair`, `pdfplumber`, `python-multipart`
- **Audio:** Browser SpeechSynthesis (TTS) & Web Speech API (STT)
