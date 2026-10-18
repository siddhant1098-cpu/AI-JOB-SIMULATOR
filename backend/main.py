"""
AI Job Simulator – FastAPI Backend
Endpoints:
  POST /api/questions  → generate interview/scenario questions
  POST /api/evaluate   → score a single answer
  POST /api/report     → generate final session report
"""

import json
import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()



app = FastAPI(title="AI Job Simulator API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import json_repair

# ── helpers ───────────────────────────────────────────────────────────────────
def extract_json(text: str) -> dict:
    """Parse JSON from model output, tolerating markdown code fences and malformed syntax."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        text = match.group(1).strip()
    
    try:
        return json.loads(text)
    except Exception:
        pass

    # Extract JSON slice between outer braces
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        snippet = text[start:end+1]
        try:
            return json.loads(snippet)
        except Exception:
            pass
        try:
            repaired = json_repair.loads(snippet)
            if isinstance(repaired, dict):
                return repaired
        except Exception:
            pass

    try:
        repaired = json_repair.loads(text)
        if isinstance(repaired, dict):
            return repaired
        if isinstance(repaired, list):
            return {"items": repaired}
    except Exception:
        pass

    raise ValueError(f"Could not parse valid JSON from text: {text[:200]}")


# Models are tried in order. Override with GEMINI_MODELS="model-a,model-b" on Render
# so a wrong/unavailable model name never costs a slow failed attempt.
MODELS_TO_TRY = [
    m.strip()
    for m in os.getenv(
        "GEMINI_MODELS", "gemini-3.8-flash,gemini-3.7-flash,gemini-3.5-flash-lite"
    ).split(",")
    if m.strip()
]
# Max seconds to wait on ONE model before falling through to the next one.
LLM_TIMEOUT_SEC = float(os.getenv("LLM_TIMEOUT_SEC", "20"))

_configured_key = None
_model_cache: dict = {}


def _get_model(name: str, api_key: str):
    """Configure the SDK once and reuse model objects instead of rebuilding per call."""
    global _configured_key
    if _configured_key != api_key:
        genai.configure(api_key=api_key)
        _configured_key = api_key
        _model_cache.clear()
    if name not in _model_cache:
        _model_cache[name] = genai.GenerativeModel(model_name=name)
    return _model_cache[name]


def chat(system: str, user: str, temperature: float = 0.7, max_tokens: int = 2048) -> str:
    """Call Gemini and return the text response (always JSON per mime type config)."""
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set in backend/.env")

    prompt = f"{system}\n\n{user}"
    gen_config = genai.GenerationConfig(
        response_mime_type="application/json",
        temperature=temperature,
        max_output_tokens=max_tokens,
    )

    last_err = None
    for m_name in MODELS_TO_TRY:
        try:
            m = _get_model(m_name, api_key)
            resp = m.generate_content(
                prompt,
                generation_config=gen_config,
                request_options={"timeout": LLM_TIMEOUT_SEC},
            )
            if resp.text:
                return resp.text
        except Exception as e:
            last_err = e
            continue
    raise last_err or RuntimeError("Failed to generate response from Gemini")


# ── Request / Response models ──────────────────────────────────────────────────

class Config(BaseModel):
    mode: str = Field(..., description="'interview' or 'scenario'")
    domain: str
    company: str
    role: str
    difficulty: str = "medium"
    numQuestions: int = 5
    durationMin: int = 20
    strictMode: bool = True


class QuestionsRequest(BaseModel):
    config: Config


class EvaluateRequest(BaseModel):
    config: Config
    question: dict          # {id, type, text}
    answer: str
    questionIndex: int = 0


class ReportRequest(BaseModel):
    config: Config
    qa_pairs: List[dict]    # [{question, answer, scores, feedback}]
    flags: List[str] = []   # camera integrity flags


# ── Endpoint: /api/questions ──────────────────────────────────────────────────

QUESTIONS_SYSTEM = """You are a warm, experienced hiring manager and team lead. You MUST return strictly valid JSON only.
No prose, no markdown fences.
CRITICAL: Never put unescaped double quotes inside text values; use single quotes ('like this') if quoting.
Make questions sound natural and spoken by an actual human colleague in a friendly interview, not a cold exam paper.
Return exactly:
{{"items":[{{"id":1,"type":"technical|behavioural|situational|scenario","text":"..."}}]}}"""

QUESTIONS_USER_INTERVIEW = """You are a friendly hiring manager at {company} having a conversational interview for a {role} in {domain}.
Difficulty: {difficulty}.
Generate {n} questions (mix of technical, behavioural, situational).
Speak naturally and warmly, like a real person in a comfortable conversation (e.g. 'I'd love to hear how you'd handle...', 'Tell me about a time when...').
Keep each under 35 words so it sounds natural when spoken aloud.
Do not use double quotes inside question text; use single quotes.
Return JSON: {{"items":[{{"id":1,"type":"...","text":"..."}}]}}"""

QUESTIONS_USER_SCENARIO = """You are an experienced, supportive colleague at {company} describing a realistic workplace challenge for a {role} in {domain}.
Difficulty: {difficulty}.
Generate {n} realistic workplace scenario challenges.
Phrase them in a relatable, spoken human way (e.g. 'Imagine it is two days before our big launch and the lead vendor calls in an emergency... how would you take charge?').
Keep each under 40 words so it sounds natural when spoken aloud.
Do not use double quotes inside scenario text; use single quotes.
Return JSON: {{"items":[{{"id":1,"type":"scenario","text":"..."}}]}}"""


# NOTE: endpoints are plain `def` (not `async def`) on purpose. The Gemini call is
# blocking; FastAPI runs `def` endpoints in a threadpool so one slow call no longer
# freezes the whole server (including health checks and other users' requests).
@app.post("/api/questions")
def generate_questions(req: QuestionsRequest):
    c = req.config
    if c.mode == "scenario":
        user_msg = QUESTIONS_USER_SCENARIO.format(
            company=c.company, role=c.role, domain=c.domain,
            difficulty=c.difficulty, n=c.numQuestions
        )
    else:
        user_msg = QUESTIONS_USER_INTERVIEW.format(
            company=c.company, role=c.role, domain=c.domain,
            difficulty=c.difficulty, n=c.numQuestions
        )

    try:
        raw = chat(QUESTIONS_SYSTEM, user_msg, temperature=0.7, max_tokens=1024)
        data = extract_json(raw)
        return {"items": data.get("items", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")


# ── Endpoint: /api/evaluate ───────────────────────────────────────────────────

EVALUATE_SYSTEM = """You are an encouraging, empathetic mentor and senior leader. You MUST return valid JSON only.
No prose, no markdown fences.
MARKING PHILOSOPHY:
- Respect human speech: Candidates speak their answers in real-time. Spoken answers are conversational, imperfect, and practical.
- Do NOT be harsh, academic, or pedantic. Value common sense, practical initiative, calm judgment, and empathy over textbook jargon.
- If a candidate gives a thoughtful, realistic, or well-intentioned answer, grade them generously (typically 7.5 to 9.5 out of 10). A sensible plan deserves high praise.
- Speak in a warm, encouraging human tone — like a trusted colleague giving supportive feedback over coffee. Never sound robotic or clinical."""

EVALUATE_USER = """Listen to this candidate's spoken response and evaluate it with empathy, fairness, and encouragement.
The response was transcribed from speech — ignore natural filler words, repetitions, and minor transcription quirks.

Question: {question}
Candidate's response: {answer}
Role: {role} | Domain: {domain} | Difficulty: {difficulty} | Mode: {mode}

Scoring criteria (be fair, generous to good practical thinking, and encouraging):
- correctness (0-10): Did they grasp the situation and propose sensible steps? (A practical common-sense answer deserves 7.5 - 9)
- problem_solving (0-10): Did they show good instincts, calm decision-making, and teamwork?
- communication (0-10): Was their explanation authentic, clear, and relatable?

Tone of feedback:
- Write feedback as if you are speaking directly to the candidate as a supportive human mentor.
- Start with a genuine, warm compliment about what they handled well.
- Then offer one gentle, practical tip for extra polish.
- Keep the spoken tone natural, conversational, and uplifting.

Return JSON:
{{
  "correctness": <number 6-10 for sensible answers>,
  "problem_solving": <number 6-10 for sensible answers>,
  "communication": <number 6-10 for sensible answers>,
  "verdict": "good|average|weak",
  "feedback": "<warm 2-3 sentence conversational coaching feedback addressed to 'you'>",
  "expected_answer": "<a friendly, practical example of how an experienced colleague would handle this in 2 sentences>",
  "do_differently": ["<encouraging positive tip 1>", "<practical tip 2>"],
  "follow_up": "<one friendly, natural conversational follow-up question or null>"
}}"""


@app.post("/api/evaluate")
def evaluate_answer(req: EvaluateRequest):
    c = req.config
    try:
        raw = chat(
            EVALUATE_SYSTEM,
            EVALUATE_USER.format(
                question=req.question.get("text", ""),
                answer=req.answer,
                role=c.role, domain=c.domain,
                difficulty=c.difficulty, mode=c.mode
            ),
            temperature=0.4
        )
        data = extract_json(raw)
        # Compute weighted total (40% correctness, 30% problem_solving, 30% communication)
        correctness = float(data.get("correctness", 0))
        ps = float(data.get("problem_solving", 0))
        comm = float(data.get("communication", 0))
        total = round(correctness * 0.4 + ps * 0.3 + comm * 0.3, 2)
        data["total"] = total
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


# ── Endpoint: /api/report ─────────────────────────────────────────────────────

REPORT_SYSTEM = """You are a warm, encouraging executive coach and senior hiring partner. Return valid JSON only. No prose.
Focus on celebrating the candidate's authentic potential, practical instincts, and real-world readiness."""

REPORT_USER = """Generate an encouraging, constructive career development debrief for a candidate who completed their simulation.

Role: {role} | Domain: {domain} | Company type: {company} | Mode: {mode}
Overall score: {overall_score}/10
Grade: {grade}

Q&A summary:
{qa_summary}

Camera integrity flags: {flags}

Guidelines:
- Celebrate 3 authentic strengths they demonstrated (e.g. composure under pressure, practical common sense, clear empathy).
- Highlight 2 gentle growth opportunities ("areas to explore" rather than harsh criticisms).
- Provide 3 empowering next steps for their career journey.

Return JSON:
{{
  "overall_score": <number>,
  "grade": "<A+|A|B|C|Needs Work>",
  "strengths": ["<warmly worded strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<gentle area to polish 1>", "<gentle area to polish 2>"],
  "next_steps": ["<empowering next step 1>", "<next step 2>", "<next step 3>"],
  "integrity_note": "<brief constructive note about camera integrity, e.g. 'Session completed smoothly with 0 flags'>",
  "skill_breakdown": {{
    "correctness": <average 0-10>,
    "problem_solving": <average 0-10>,
    "communication": <average 0-10>
  }}
}}"""

GRADE_MAP = [(88, "A+"), (78, "A"), (68, "B"), (58, "C")]


def score_to_grade(score_0_to_10: float) -> str:
    pct = score_0_to_10 * 10
    for threshold, grade in GRADE_MAP:
        if pct >= threshold:
            return grade
    return "Developing"


@app.post("/api/report")
def generate_report(req: ReportRequest):
    pairs = req.qa_pairs
    if not pairs:
        raise HTTPException(status_code=400, detail="No Q&A pairs provided")

    # Compute averages
    totals = [p.get("scores", {}).get("total", 0) for p in pairs]
    overall = round(sum(totals) / len(totals), 2) if totals else 0
    grade = score_to_grade(overall)

    avg_correctness = round(sum(p.get("scores", {}).get("correctness", 0) for p in pairs) / len(pairs), 2)
    avg_ps = round(sum(p.get("scores", {}).get("problem_solving", 0) for p in pairs) / len(pairs), 2)
    avg_comm = round(sum(p.get("scores", {}).get("communication", 0) for p in pairs) / len(pairs), 2)

    # Build a text summary for the LLM
    qa_lines = []
    for i, p in enumerate(pairs, 1):
        q = p.get("question", {}).get("text", "")
        a = p.get("answer", "")[:200]  # truncate for prompt length
        score = p.get("scores", {}).get("total", 0)
        verdict = p.get("scores", {}).get("verdict", "")
        qa_lines.append(f"Q{i} [{verdict}, {score}/10]: {q[:80]} | Answer: {a}")

    try:
        raw = chat(
            REPORT_SYSTEM,
            REPORT_USER.format(
                role=req.config.role, domain=req.config.domain,
                company=req.config.company, mode=req.config.mode,
                overall_score=overall, grade=grade,
                qa_summary="\n".join(qa_lines),
                flags=", ".join(req.flags) if req.flags else "None"
            ),
            temperature=0.5
        )
        data = extract_json(raw)
        # Override computed values so they're exact
        data["overall_score"] = overall
        data["grade"] = grade
        data["skill_breakdown"] = {
            "correctness": avg_correctness,
            "problem_solving": avg_ps,
            "communication": avg_comm,
        }
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Job Simulator API"}


@app.get("/health")
async def health():
    """Lightweight endpoint used by the frontend to wake a sleeping Render instance."""
    return {"status": "ok"}
