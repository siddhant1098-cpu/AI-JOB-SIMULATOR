"""
AI Job Simulator – FastAPI Backend
Endpoints:
  POST /api/questions     → generate interview/scenario questions (supports resume-grounded questions)
  POST /api/evaluate      → score a single answer
  POST /api/report        → generate final session report
  POST /api/resume/parse  → extract text from PDF resume via pdfplumber + parse with Gemini LLM
"""

import io
import json
import os
import re
import subprocess
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from dotenv import load_dotenv
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai
import pdfplumber
import json_repair

load_dotenv()

app = FastAPI(title="AI Job Simulator API", version="1.1.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


def chat(system: str, user: str, temperature: float = 0.7) -> str:
    """Call Gemini and return the text response (always JSON per mime type config)."""
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set in backend/.env")
    genai.configure(api_key=api_key)

    prompt = f"{system}\n\n{user}"
    gen_config = genai.GenerationConfig(
        response_mime_type="application/json",
        temperature=temperature,
    )

    models_to_try = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite"]
    last_err = None
    for m_name in models_to_try:
        try:
            m = genai.GenerativeModel(model_name=m_name)
            resp = m.generate_content(prompt, generation_config=gen_config)
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
    pressureMode: bool = False          # Pressure Room 60s mode
    candidate_name: Optional[str] = "Candidate"
    resume_text: Optional[str] = None
    resume_skills: Optional[List[str]] = []
    resume_filename: Optional[str] = None


class QuestionsRequest(BaseModel):
    config: Config


class EvaluateRequest(BaseModel):
    config: Config
    question: dict          # {id, type, text, character, character_authority_level, priority}
    answer: str
    questionIndex: int = 0
    scenario_state: Optional[dict] = None  # consequence engine state


class ReportRequest(BaseModel):
    config: Config
    qa_pairs: List[dict]    # [{question, answer, scores, feedback}]
    flags: List[str] = []   # camera integrity flags


# ── Endpoint: /api/questions ──────────────────────────────────────────────────

QUESTIONS_SYSTEM = """You are the AI engine for AI Job Simulator, a realistic workplace simulation and professional skills assessment platform.

You are NOT a generic chatbot. You must behave as a workplace simulation engine, scenario generator, character simulator, and evidence-based evaluator.

CRITICAL: Return strictly valid JSON only. No prose, no markdown fences. Never put unescaped double quotes inside text values; use single quotes if quoting.

## WORKPLACE SCENARIO GENERATION
Generate realistic, role-specific workplace challenges relevant to the selected industry and domain.
Scenarios may involve:
- Incomplete tasks and missed deadlines
- Conflicts between coworkers
- Unhappy clients
- Unexpected technical or operational problems
- Conflicting priorities
- Budget or resource limitations
- Project delays
- Difficult conversations with managers
- Executive-level decisions
- Critical incidents requiring escalation

Every scenario must contain a clear context, the candidate's role, a specific problem, relevant constraints, and a decision or response the candidate must provide.
Avoid repetitive, generic interview questions.

## AUTHORITY-AWARE CHARACTERS
Each scenario should feature a character the candidate interacts with. Select from:
1. Coworker or teammate (authority_level: 1)
2. Team leader or senior colleague (authority_level: 2)
3. Manager (authority_level: 3)
4. Department head (authority_level: 4)
5. Client or external stakeholder (authority_level: 5)
6. CEO or executive (authority_level: 6)

Each character must have a distinct communication style, expectations, and relevant knowledge of the situation.

## PRIORITY LEVELS
Assign each scenario a priority:
P1 — Low: Routine work or a normal update.
P2 — Medium: A delayed task or a manageable problem.
P3 — High: A major deadline, dissatisfied client, or significant operational risk.
P4 — Critical: A serious incident requiring immediate action or escalation.

## DIFFICULTY
EASY: Straightforward problems, clear objectives, limited competing priorities.
MEDIUM: Ambiguous information, competing tasks, follow-up questions, moderate consequences.
HARD: Multiple stakeholders, incomplete information, competing priorities, difficult trade-offs, unexpected developments.

Return the questions in this EXACT JSON format:
{"items":[{"id":1,"type":"technical|behavioural|situational|scenario","text":"...","character":"<character name and role>","character_authority_level":<1-6>,"priority":"P1|P2|P3|P4","scenario_context":"<brief context>","objective":"<what candidate must do>","constraints":["<constraint 1>","<constraint 2>"],"evaluation_criteria":["<criterion 1>","<criterion 2>"]}]}
"""

QUESTIONS_USER_INTERVIEW = """You are conducting a professional interview at {company} for a {role} in {domain}.
Difficulty: {difficulty}. Pressure Mode: {pressure_mode}.
Generate {n} interview questions (mix of technical, behavioural, situational).

For each question, create a realistic character (interviewer persona) with a specific authority level.
Vary the characters — do NOT make every interviewer sound identical.
Mix the priority levels across questions.

Keep each question under 40 words so it sounds natural when spoken aloud.
Do not use double quotes inside question text; use single quotes.
{pressure_note}

Return JSON: {{"items":[{{"id":1,"type":"...","text":"...","character":"...","character_authority_level":...,"priority":"...","scenario_context":"...","objective":"...","constraints":[],"evaluation_criteria":[]}}]}}"""

QUESTIONS_USER_SCENARIO = """You are generating realistic workplace scenario challenges at {company} for a {role} in {domain}.
Difficulty: {difficulty}. Pressure Mode: {pressure_mode}.
Generate {n} realistic workplace crisis/challenge scenarios.

For each scenario:
- Create a realistic character the candidate must interact with (vary authority levels 1-6)
- Assign an appropriate priority level (P1-P4)
- Include clear context, constraints, and objectives
- Make the candidate feel like they are IN the situation, not answering an exam

Keep each under 50 words so it sounds natural when spoken aloud.
Do not use double quotes inside scenario text; use single quotes.
{pressure_note}

Return JSON: {{"items":[{{"id":1,"type":"scenario","text":"...","character":"...","character_authority_level":...,"priority":"...","scenario_context":"...","objective":"...","constraints":[],"evaluation_criteria":[]}}]}}"""

QUESTIONS_USER_RESUME = """You are conducting a personalized interview at {company} for a {role} in {domain}.
Difficulty: {difficulty}. Pressure Mode: {pressure_mode}.

The candidate submitted their resume below. Base your interview questions directly on their specific projects, technologies, and career experiences:
---
CANDIDATE RESUME:
{resume_text}
---

Generate {n} conversational questions (mix of technical deep-dives into their listed projects, behavioural questions about their past responsibilities, and situational challenges).

For each question, create a realistic interviewer character with a specific authority level.
Vary the characters and priority levels.

Keep each under 40 words so it sounds natural when spoken aloud.
Do not use double quotes inside question text; use single quotes.
{pressure_note}

Return JSON: {{"items":[{{"id":1,"type":"...","text":"...","character":"...","character_authority_level":...,"priority":"...","scenario_context":"...","objective":"...","constraints":[],"evaluation_criteria":[]}}]}}"""


@app.post("/api/questions")
async def generate_questions(req: QuestionsRequest):
    c = req.config
    pressure_mode = "ON" if c.pressureMode else "OFF"
    pressure_note = "Every challenge has a 60-second response deadline. Increase urgency." if c.pressureMode else ""

    if c.resume_text and len(c.resume_text.strip()) > 30:
        user_msg = QUESTIONS_USER_RESUME.format(
            company=c.company, role=c.role, domain=c.domain,
            difficulty=c.difficulty, n=c.numQuestions,
            resume_text=c.resume_text[:4000],
            pressure_mode=pressure_mode, pressure_note=pressure_note
        )
    elif c.mode == "scenario":
        user_msg = QUESTIONS_USER_SCENARIO.format(
            company=c.company, role=c.role, domain=c.domain,
            difficulty=c.difficulty, n=c.numQuestions,
            pressure_mode=pressure_mode, pressure_note=pressure_note
        )
    else:
        user_msg = QUESTIONS_USER_INTERVIEW.format(
            company=c.company, role=c.role, domain=c.domain,
            difficulty=c.difficulty, n=c.numQuestions,
            pressure_mode=pressure_mode, pressure_note=pressure_note
        )

    try:
        raw = chat(QUESTIONS_SYSTEM, user_msg, temperature=0.7)
        data = extract_json(raw)
        return {"items": data.get("items", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")


# ── Endpoint: /api/resume/parse (pdfplumber + LLM) ────────────────────────────

RESUME_PARSE_SYSTEM = """You are an expert HR recruiter and technical talent specialist.
Analyze the provided resume text extracted from a candidate's PDF and extract candidate profile information in strictly valid JSON format.
Return JSON only:
{
  "candidate_name": "<Full Name or 'Candidate'>",
  "candidate_email": "<Email address found on resume or null>",
  "inferred_role": "<Best matching role title, e.g. Frontend Engineer, Backend Engineer, Full-Stack Developer, Operations Manager, Marketing Manager, Financial Analyst>",
  "inferred_domain": "<Best matching domain from: Event Management, Software Engineering, Marketing, Finance, Healthcare, Human Resources, Sales, Operations, Education, Legal, Supply Chain, Customer Success>",
  "key_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "experience_summary": "<1-2 sentence summary of experience and key accomplishments>",
  "education": "<Highest degree or institution>",
  "projects": ["<Project 1>", "<Project 2>"]
}"""


@app.post("/api/resume/parse")
async def parse_resume(file: UploadFile = File(...)):
    """Extract text from uploaded PDF resume via pdfplumber and extract structured candidate profile with Gemini LLM."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded PDF file is empty.")

    # Extract text with pdfplumber
    extracted_text = ""
    try:
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")

    extracted_text = extracted_text.strip()
    if not extracted_text or len(extracted_text) < 15:
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from this PDF. Please ensure it contains selectable text rather than scanned images."
        )

    # Use LLM to structure resume data
    try:
        raw = chat(
            RESUME_PARSE_SYSTEM,
            f"Resume Text:\n\n{extracted_text[:6000]}",
            temperature=0.2
        )
        parsed = extract_json(raw)
    except Exception:
        # Fallback if LLM extraction has an issue
        parsed = {
            "candidate_name": "Candidate",
            "candidate_email": None,
            "inferred_role": "Full-Stack Developer",
            "inferred_domain": "Software Engineering",
            "key_skills": [],
            "experience_summary": "Extracted resume content ready for question generation.",
            "education": "",
            "projects": [],
        }

    # Attach raw extracted text for downstream question generation
    parsed["resume_text"] = extracted_text[:8000]
    parsed["filename"] = file.filename
    return parsed


# ── Endpoint: /api/evaluate ───────────────────────────────────────────────────

EVALUATE_SYSTEM = """You are the AI evaluation engine for AI Job Simulator. You MUST return valid JSON only.
No prose, no markdown fences.

## PROFESSIONAL COMMUNICATION EVALUATION
Evaluate whether the candidate communicates appropriately for the person they are addressing.
- For a coworker: value clarity, collaboration, directness, and respect.
- For a team leader: value accountability, respectful communication, and clear next steps.
- For a manager: value concise explanations, ownership, timelines, risks, and proposed solutions.
- For a CEO/executive: value concise business-relevant communication, impact, risks, decisions needed, strategic awareness.
- For a client: value professionalism, empathy, clarity, transparency, and suitable commitments.

Do not require excessively formal language in every situation. Evaluate whether tone and content fit the relationship and context.
Do not penalise for simple English, accent, or minor grammatical errors if meaning and professional judgement are clear.

## CONSEQUENCE ENGINE
Candidate decisions must influence what happens next.
If a candidate communicates early and proposes a sensible recovery plan, reflect the potential improvement.
If a candidate hides information, ignores an urgent risk, or makes an unreasonable commitment, introduce plausible consequences.
Do not make consequences arbitrary. Base them on the scenario facts and the candidate's actual decisions.
Not every imperfect answer should cause failure. Allow reasonable alternative approaches.

## FAIR SCORING (0-100 scale)
Evaluate each response using evidence from the candidate's actual answer.
Score each dimension from 0 to 100:
- problem_solving: Did they identify the core issue and propose sensible steps?
- decision_making: Did they make sound, timely decisions given the constraints?
- communication: Was their explanation clear, authentic, and appropriate for the audience?
- etiquette: Did they communicate appropriately for the character's authority level?
- prioritisation: Did they address the most urgent aspects first?
- accountability: Did they take ownership rather than deflecting?
- teamwork: Did they consider others and collaborative solutions?
- adaptability: Did they show flexibility and resilience?

MARKING PHILOSOPHY:
- Respect human speech: Candidates speak their answers in real-time. Spoken answers are conversational, imperfect, practical.
- Do NOT be harsh, academic, or pedantic. Value common sense, practical initiative, calm judgment, and empathy.
- If a candidate gives a thoughtful, realistic answer, grade generously (typically 70-95 out of 100).
- A sensible practical plan deserves high praise.
- Do not reward authority-based flattery, unnecessary jargon, excessive formality, or lengthy answers by themselves.
"""

EVALUATE_USER = """Evaluate this candidate's response with empathy, fairness, and evidence-based scoring.
The response was transcribed from speech — ignore natural filler words, repetitions, and minor transcription quirks.

Question: {question}
Candidate's response: {answer}
Role: {role} | Domain: {domain} | Difficulty: {difficulty} | Mode: {mode}
Character interacting with: {character} (Authority Level: {authority_level})
Scenario Priority: {priority}
{pressure_note}
{state_context}

Score each dimension from 0 to 100 using evidence from the candidate's actual answer:

Return JSON:
{{
  "dimension_scores": {{
    "problem_solving": <0-100>,
    "decision_making": <0-100>,
    "communication": <0-100>,
    "etiquette": <0-100>,
    "prioritisation": <0-100>,
    "accountability": <0-100>,
    "teamwork": <0-100>,
    "adaptability": <0-100>
  }},
  "overall_score": <weighted average 0-100>,
  "verdict": "excellent|good|average|developing",
  "evidence_for_scores": "<brief evidence justifying the scores>",
  "feedback": "<warm 2-3 sentence conversational coaching feedback addressed to 'you'>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvement_areas": ["<area 1>", "<area 2>"],
  "consequences": "<what happens next based on this answer — realistic consequence>",
  "suggested_improved_response": "<a practical example of a stronger response in 2-3 sentences>",
  "do_differently": ["<encouraging tip 1>", "<practical tip 2>"],
  "follow_up": "<one friendly conversational follow-up question or null>"
}}"""


@app.post("/api/evaluate")
async def evaluate_answer(req: EvaluateRequest):
    c = req.config
    question_data = req.question
    character = question_data.get("character", "Hiring Manager")
    authority_level = question_data.get("character_authority_level", 3)
    priority = question_data.get("priority", "P2")
    pressure_note = "PRESSURE MODE is ON — the candidate had only 60 seconds to respond. Evaluate their decision quality under time pressure." if c.pressureMode else ""

    # Build scenario state context if available
    state_context = ""
    if req.scenario_state:
        state_context = f"Previous scenario state: {json.dumps(req.scenario_state)}"

    try:
        raw = chat(
            EVALUATE_SYSTEM,
            EVALUATE_USER.format(
                question=question_data.get("text", ""),
                answer=req.answer,
                role=c.role, domain=c.domain,
                difficulty=c.difficulty, mode=c.mode,
                character=character,
                authority_level=authority_level,
                priority=priority,
                pressure_note=pressure_note,
                state_context=state_context
            ),
            temperature=0.4
        )
        data = extract_json(raw)

        # Compute backward-compatible scores for frontend
        dims = data.get("dimension_scores", {})
        if dims:
            # Calculate overall as average of all dimensions
            all_scores = [v for v in dims.values() if isinstance(v, (int, float))]
            overall = round(sum(all_scores) / len(all_scores), 1) if all_scores else 70
            data["overall_score"] = overall

            # Backward compatibility: map to 0-10 scale for old components
            data["correctness"] = round(dims.get("problem_solving", 70) / 10, 1)
            data["problem_solving"] = round(dims.get("decision_making", 70) / 10, 1)
            data["communication"] = round(dims.get("communication", 70) / 10, 1)
            data["total"] = round(overall / 10, 1)
        else:
            # Fallback if dimension_scores not returned
            data["total"] = round(float(data.get("overall_score", 70)) / 10, 1)

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


# ── Endpoint: /api/report ─────────────────────────────────────────────────────

REPORT_SYSTEM = """You are an encouraging executive coach and senior hiring partner for AI Job Simulator. Return valid JSON only. No prose.
Use previous scenario results to identify demonstrated strengths and weaknesses.
Recommend future scenarios that practise weaker skills while gradually increasing complexity.
Do not claim improvement unless comparable previous results support it.
Do not infer a candidate's personality, honesty, intelligence, or suitability for employment from a single answer.
Focus on celebrating authentic potential, practical instincts, and real-world readiness."""

REPORT_USER = """Generate an encouraging, constructive career development debrief for a candidate who completed their simulation.

Role: {role} | Domain: {domain} | Company type: {company} | Mode: {mode}
Overall score: {overall_score}/100
Grade: {grade}

Q&A summary:
{qa_summary}

Camera integrity flags: {flags}

Guidelines:
- Celebrate 3 authentic strengths they demonstrated.
- Highlight 2 gentle growth opportunities.
- Provide 3 empowering next steps for their career journey.
- Include a recommended next scenario direction based on their weak areas.

Return JSON:
{{
  "overall_score": <number 0-100>,
  "grade": "<A+|A|B|C|Developing>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<gentle area 1>", "<gentle area 2>"],
  "next_steps": ["<next step 1>", "<next step 2>", "<next step 3>"],
  "integrity_note": "<brief note about camera integrity>",
  "next_scenario_direction": "<recommended next scenario type and focus area>",
  "skill_breakdown": {{
    "problem_solving": <0-100>,
    "decision_making": <0-100>,
    "communication": <0-100>,
    "etiquette": <0-100>,
    "prioritisation": <0-100>,
    "accountability": <0-100>,
    "teamwork": <0-100>,
    "adaptability": <0-100>
  }}
}}"""

GRADE_MAP = [(88, "A+"), (78, "A"), (68, "B"), (58, "C")]


def score_to_grade(score_0_to_100: float) -> str:
    for threshold, grade in GRADE_MAP:
        if score_0_to_100 >= threshold:
            return grade
    return "Developing"


@app.post("/api/report")
async def generate_report(req: ReportRequest):
    pairs = req.qa_pairs
    if not pairs:
        raise HTTPException(status_code=400, detail="No Q&A pairs provided")

    # Compute averages from dimension_scores (0-100 scale) or fall back to old 0-10 scores
    dim_keys = ["problem_solving", "decision_making", "communication", "etiquette", "prioritisation", "accountability", "teamwork", "adaptability"]
    dim_averages = {}

    for key in dim_keys:
        vals = []
        for p in pairs:
            dims = p.get("scores", {}).get("dimension_scores", {})
            if key in dims:
                vals.append(float(dims[key]))
        if vals:
            dim_averages[key] = round(sum(vals) / len(vals), 1)
        else:
            dim_averages[key] = 0

    # Overall score: average of all dimension averages, or fallback to old total
    if any(v > 0 for v in dim_averages.values()):
        overall = round(sum(v for v in dim_averages.values() if v > 0) / max(1, sum(1 for v in dim_averages.values() if v > 0)), 1)
    else:
        # Fallback: use old 0-10 total scores, multiply by 10
        totals = [p.get("scores", {}).get("total", 0) for p in pairs]
        overall = round((sum(totals) / len(totals)) * 10, 1) if totals else 0

    grade = score_to_grade(overall)

    # Build a text summary for the LLM
    qa_lines = []
    for i, p in enumerate(pairs, 1):
        q = p.get("question", {}).get("text", "") if isinstance(p.get("question"), dict) else str(p.get("question", ""))
        a = p.get("answer", "")[:200]
        score = p.get("scores", {}).get("overall_score", p.get("scores", {}).get("total", 0))
        verdict = p.get("scores", {}).get("verdict", "")
        qa_lines.append(f"Q{i} [{verdict}, {score}/100]: {q[:80]} | Answer: {a}")

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
        data["skill_breakdown"] = dim_averages

        # Backward compatibility: also provide 0-10 versions
        data["skill_breakdown_10"] = {
            "correctness": round(dim_averages.get("problem_solving", 0) / 10, 1),
            "problem_solving": round(dim_averages.get("decision_making", 0) / 10, 1),
            "communication": round(dim_averages.get("communication", 0) / 10, 1),
        }

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Job Simulator API v1.1.0"}
