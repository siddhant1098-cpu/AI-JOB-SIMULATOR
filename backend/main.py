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
import logging
import subprocess
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from dotenv import load_dotenv
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai
import pdfplumber
import json_repair

logger = logging.getLogger("ai_job_sim")

load_dotenv()

app = FastAPI(title="AI Job Simulator API", version="1.1.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow local development, Vercel deployments (*.vercel.app), and custom origins via ALLOWED_ORIGINS
cors_env = os.getenv("ALLOWED_ORIGINS", "*").strip()
origins_list = [o.strip() for o in cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list if "*" not in origins_list else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
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

    models_to_try = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"]
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
    company: str = "Enterprise Organization"
    role: str = "Candidate"
    target_person_role: Optional[str] = "Manager"
    difficulty: str = "medium"
    numQuestions: int = 5
    durationMin: int = 20
    strictMode: bool = True
    pressureMode: bool = False          # Pressure Room 60s mode
    candidate_name: Optional[str] = "Candidate"
    resume_text: Optional[str] = None
    resume_skills: Optional[List[str]] = []
    resume_filename: Optional[str] = None


class ScenarioEvaluateRequest(BaseModel):
    scenario_id: str
    candidate_answer: str
    turn_id: int = 1
    completed_scenarios: Optional[List[str]] = []
    skill_scores: Optional[dict] = None


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


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    character: str = "Interviewer"
    character_authority_level: int = 3
    priority: str = "P2"
    model_id: Optional[str] = None


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

QUESTIONS_USER_SCENARIO = """You are generating realistic workplace scenario challenges in the domain of {domain}.
The candidate is directly addressing and interacting with: {target_person_role}.
Difficulty: {difficulty}. Pressure Mode: {pressure_mode}.
Generate {n} realistic workplace scenario challenges where the candidate must formulate an action plan and respond to this person ({target_person_role}).

For each scenario:
- The character must be: {target_person_role}
- Assign an appropriate priority level (P1-P4)
- Include clear context, constraints, and objective
- Ensure the interaction reflects the exact authority level and expectations of a {target_person_role}

Keep each under 50 words so it sounds natural when spoken aloud.
Do not use double quotes inside scenario text; use single quotes.
{pressure_note}

Return JSON: {{"items":[{{"id":1,"type":"scenario","text":"...","character":"{target_person_role}","character_authority_level":3,"priority":"P3","scenario_context":"...","objective":"...","constraints":[],"evaluation_criteria":[]}}]}}"""

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
        target_person = c.target_person_role or c.role or "Direct Manager"
        user_msg = QUESTIONS_USER_SCENARIO.format(
            company=c.company or "Enterprise Organization",
            role=c.role or "Lead Operator",
            target_person_role=target_person,
            domain=c.domain,
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

## UNIFIED POINT-WISE EVIDENCE-BASED MARKING (100 Total Points)
You evaluate the candidate's spoken response across 5 explicit competency criteria totaling 100 points:
1. problem_solving (25 pts): Did they understand the core domain problem and propose a sound, realistic solution?
2. decision_making (25 pts): Did they make sound, practical decisions given the operational constraints?
3. communication (20 pts): Was their explanation clear, concise, and appropriate for the listener's authority?
4. etiquette (15 pts): Did they communicate with appropriate respect, poise, and professional etiquette?
5. accountability (15 pts): Did they take direct ownership and provide actionable next steps rather than deflecting?

Assign an integer rating from 0 to 5 for each criterion based strictly on observable behavioral evidence:
- 5: Exemplary / Outstanding (100% of points)
- 4: Strong / Proficient (80% of points)
- 3: Competent / Acceptable (60% of points)
- 2: Needs Improvement / Developing (40% of points)
- 1: Poor / Highly Deficient (20% of points)
- 0: Non-responsive / Trivial Greeting (e.g. 'hello') / Off-topic / Non-substantive (0% of points)

The individual point-wise marking directly and authoritatively decides the final score:
Points Earned = (Rating / 5.0) * Max Points
Final Score = Sum of all 5 Criteria Points Earned

MARKING PHILOSOPHY & CALIBRATION:
- Rigorous, evidence-based assessment: Candidates must demonstrate concrete problem diagnosis, realistic decision-making, and professional communication to earn points.
- Default to 0: If a response is missing, trivial, greeting-only (e.g., 'hello', 'hi', 'hey'), off-topic, or avoids solving the dilemma, assign a rating of 0 for that criterion (0 points earned).
- High standards: Do NOT grade generously. A score of 70+ requires a well-structured, actionable response with clear prioritization, risk awareness, and stakeholder management.
- Rating Calibration (0 to 5):
  * 0 (0% pts): Non-responsive, trivial greeting, gibberish, evasive, or completely missing.
  * 1 (20% pts): Highly deficient, counter-productive, or shows dangerous lack of judgment.
  * 2 (40% pts): Developing / superficial; vague ideas without concrete implementation steps.
  * 3 (60% pts): Competent / acceptable baseline; solves the immediate issue but lacks depth or foresight.
  * 4 (80% pts): Strong / proactive; well-structured plan, good empathy, and clear timelines.
  * 5 (100% pts): Exemplary; outstanding strategic leadership, risk mitigation, and communication.
- Deterministic Math: Points Earned = (Rating / 5.0) * Max Points. Total Score = Sum of all 5 Criteria Points Earned.
"""

EVALUATE_USER = """Evaluate this candidate's response with rigorous, evidence-based scoring against the 5 criteria.
The response was transcribed from speech.

Question: {question}
Candidate's response: {answer}
Role: {role} | Domain: {domain} | Difficulty: {difficulty} | Mode: {mode}
Character interacting with: {character} (Authority Level: {authority_level})
Scenario Priority: {priority}
{pressure_note}
{state_context}

Return strictly valid JSON with ratings (integer 0 to 5) and evidence for each of the 5 criteria.
If the candidate's answer is a trivial greeting (such as 'hello'), off-topic, or non-substantive, rate all criteria 0:
{{
  "criterion_ratings": {{
    "problem_solving": <integer 0 to 5>,
    "decision_making": <integer 0 to 5>,
    "communication": <integer 0 to 5>,
    "etiquette": <integer 0 to 5>,
    "accountability": <integer 0 to 5>
  }},
  "criterion_evidence": {{
    "problem_solving": "<specific quote or observation>",
    "decision_making": "<specific quote or observation>",
    "communication": "<specific quote or observation>",
    "etiquette": "<specific quote or observation>",
    "accountability": "<specific quote or observation>"
  }},
  "feedback": "<concise 2-3 sentence coaching feedback addressed to 'you'>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvement_areas": ["<area 1>", "<area 2>"],
  "consequences": "<realistic operational consequence based on candidate's decisions>",
  "suggested_improved_response": "<a practical example of a stronger response in 2-3 sentences>",
  "do_differently": ["<actionable tip 1>", "<practical tip 2>"],
  "follow_up": "<one friendly conversational follow-up question or null>"
}}"""


@app.post("/api/evaluate")
async def evaluate_answer(req: EvaluateRequest):
    c = req.config
    question_data = req.question
    character = question_data.get("character", "Hiring Manager")
    authority_level = question_data.get("character_authority_level", 3)
    priority = question_data.get("priority", "P2")

    point_definitions = [
        ("problem_solving", "Domain Knowledge & Problem Solving", 25.0),
        ("decision_making", "Decision Quality & Practicality", 25.0),
        ("communication", "Communication Clarity & Tone", 20.0),
        ("etiquette", "Authority Awareness & Etiquette", 15.0),
        ("accountability", "Ownership & Actionable Next Steps", 15.0),
    ]

    # Detect if candidate failed to answer or submitted a trivial / non-substantive response
    answer_text = (req.answer or "").strip()
    words = [w for w in re.findall(r'\b\w+\b', answer_text.lower())]
    TRIVIAL_WORDS = {
        "hello", "hi", "hey", "hola", "howdy", "test", "testing",
        "ok", "okay", "yes", "no", "pass", "skip", "idk", "nothing",
        "none", "good", "fine", "cool", "thanks", "thank you"
    }

    is_failed_answer = (
        not answer_text
        or "NO ANSWER PROVIDED" in answer_text.upper()
        or answer_text == "No answer provided."
    )

    is_trivial_answer = (
        len(words) < 3 and all(w in TRIVIAL_WORDS or len(w) <= 2 for w in words)
    ) or (len(words) == 1 and words[0] in TRIVIAL_WORDS)

    if is_failed_answer or is_trivial_answer:
        failure_breakdown = {}
        failure_dim_scores = {}

        for key, name, max_pts in point_definitions:
            failure_breakdown[key] = {
                "name": name,
                "weight": max_pts,
                "rating": 0,
                "weighted_points": 0.0,
                "max_points": max_pts,
                "evidence": f"Candidate provided non-substantive/unresponsive input ('{answer_text[:50]}'). Zero points awarded." if is_trivial_answer else "Candidate failed to submit response within operational window."
            }
            failure_dim_scores[key] = 0.0

        failure_dim_scores["prioritisation"] = 0.0
        failure_dim_scores["teamwork"] = 0.0
        failure_dim_scores["adaptability"] = 0.0

        return {
            "criterion_breakdown": failure_breakdown,
            "dimension_scores": failure_dim_scores,
            "overall_score": 0.0,
            "verdict": "developing",
            "evidence_for_scores": (
                f"NON-SUBSTANTIVE RESPONSE: Candidate submitted '{answer_text}' without addressing the operational scenario, stakeholder communication, or problem resolution. A substantive action plan is required to earn points."
                if is_trivial_answer else
                "CRITICAL SLA BREACH: Candidate failed to submit any response or decision within the mandatory operational window."
            ),
            "feedback": (
                f"Your response '{answer_text}' was trivial or greeting-only and did not address the workplace dilemma. In professional workplace and high-stakes interview scenarios, a substantive response detailing situational awareness, actionable decisions, and stakeholder management is required."
                if is_trivial_answer else
                "CRITICAL SLA BREACH: You did not provide any response within the mandatory deadline. Total silence paralyzes the team and destroys executive and stakeholder confidence."
            ),
            "strengths": [],
            "improvement_areas": [
                "Provide concrete, actionable solutions to the question rather than trivial greetings or filler",
                "Explicitly outline problem diagnosis and stakeholder containment steps",
                "Demonstrate ownership and situational awareness"
            ],
            "consequences": "With no substantive response or mitigation provided, the workplace incident escalated immediately.",
            "suggested_improved_response": "Provide a structured 3-part response: 1. Acknowledge and isolate the problem, 2. Present immediate containment and escalation steps, 3. Commit to realistic stakeholder update cadence.",
            "do_differently": [
                "Always deliver a concrete action plan addressing the core dilemma",
                "Never submit only conversational filler or greetings when an operational solution is requested"
            ],
            "follow_up": None,
            "correctness": 0.0,
            "problem_solving": 0.0,
            "communication": 0.0,
            "total": 0.0,
        }

    pressure_note = (
        "PRESSURE MODE is ON (60-second hard deadline). "
        "If the candidate provided an inadequate, shallow, or evasive answer under pressure, penalise their decision quality and problem-solving severely. "
        "Reflect realistic operational consequences for poor time management."
        if c.pressureMode else ""
    )

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
            temperature=0.3
        )
        data = extract_json(raw)

        ratings_data = data.get("criterion_ratings", {})
        evidence_data = data.get("criterion_evidence", {})
        legacy_dims = data.get("dimension_scores", {})

        criterion_breakdown = {}
        dimension_scores = {}
        total_points = 0.0

        for key, name, max_pts in point_definitions:
            if key in ratings_data:
                try:
                    rating = max(0, min(5, int(ratings_data[key])))
                except (ValueError, TypeError):
                    rating = 0
            elif key in legacy_dims:
                try:
                    rating = max(0, min(5, round(float(legacy_dims[key]) / 20.0)))
                except (ValueError, TypeError):
                    rating = 0
            else:
                rating = 0

            pts = round((rating / 5.0) * max_pts, 1)
            total_points += pts
            dimension_scores[key] = round((rating / 5.0) * 100, 1)

            criterion_breakdown[key] = {
                "name": name,
                "weight": max_pts,
                "rating": rating,
                "weighted_points": pts,
                "max_points": max_pts,
                "evidence": evidence_data.get(key, "")
            }

        # Populate secondary dimensions for compatibility with default 0.0
        dimension_scores["prioritisation"] = dimension_scores.get("decision_making", 0.0)
        dimension_scores["teamwork"] = dimension_scores.get("etiquette", 0.0)
        dimension_scores["adaptability"] = dimension_scores.get("accountability", 0.0)

        # TOTAL SCORE IS STRICTLY DECIDED BY THE SUM OF POINT-WISE MARKS
        overall = round(total_points, 1)
        data["overall_score"] = overall
        data["criterion_breakdown"] = criterion_breakdown
        data["dimension_scores"] = dimension_scores
        data["verdict"] = "excellent" if overall >= 85 else ("good" if overall >= 70 else ("average" if overall >= 50 else "developing"))

        # Backward compatibility: map to 0-10 scale for old components
        data["correctness"] = round(dimension_scores.get("problem_solving", 0.0) / 10, 1)
        data["problem_solving"] = round(dimension_scores.get("decision_making", 0.0) / 10, 1)
        data["communication"] = round(dimension_scores.get("communication", 0.0) / 10, 1)
        data["total"] = round(overall / 10, 1)

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

GRADE_MAP = [(88, "A+"), (78, "A"), (68, "B"), (58, "C"), (40, "Developing")]


def score_to_grade(score_0_to_100: float) -> str:
    for threshold, grade in GRADE_MAP:
        if score_0_to_100 >= threshold:
            return grade
    return "Needs Work"


@app.post("/api/report")
async def generate_report(req: ReportRequest):
    pairs = req.qa_pairs
    if not pairs:
        raise HTTPException(status_code=400, detail="No Q&A pairs provided")

    # Try multi-agent evaluation & coaching report using CrewAI + Google Gemini
    try:
        from crew_service import evaluate_and_generate_report
        crew_report = evaluate_and_generate_report(
            config=req.config.dict() if hasattr(req.config, "dict") else dict(req.config),
            qa_pairs=pairs,
            flags=req.flags
        )
        if crew_report and "overall_score" in crew_report:
            return crew_report
    except Exception as crew_err:
        logger.warning(f"CrewAI report generation bypassed or failed ({crew_err}), using direct LLM report.")

    # Compute averages from dimension_scores (0-100 scale) or criterion_breakdown
    dim_keys = ["problem_solving", "decision_making", "communication", "etiquette", "prioritisation", "accountability", "teamwork", "adaptability"]
    dim_averages = {}

    for key in dim_keys:
        vals = []
        for p in pairs:
            scores = p.get("scores", {})
            dims = scores.get("dimension_scores", {})
            if key in dims:
                vals.append(float(dims[key]))
            # Also check criterion_breakdown from prebuilt scenarios
            cb = scores.get("criterion_breakdown", {})
            for c_id, c_data in cb.items():
                c_skill = str(c_data.get("skill_id", "")).lower().replace("-", "_")
                if c_skill == key:
                    vals.append(float((c_data.get("rating", 0) / 5.0) * 100.0))
        if vals:
            dim_averages[key] = round(sum(vals) / len(vals), 1)
        else:
            dim_averages[key] = 0.0

    # Overall score: strictly driven by actual turn scores
    overall_candidates = []
    for p in pairs:
        sc = p.get("scores", {})
        if "overall_score" in sc and isinstance(sc["overall_score"], (int, float)):
            overall_candidates.append(float(sc["overall_score"]))
        elif "score" in sc and isinstance(sc["score"], (int, float)):
            overall_candidates.append(float(sc["score"]))
        elif "total" in sc and isinstance(sc["total"], (int, float)):
            overall_candidates.append(float(sc["total"]) * 10.0)

    if overall_candidates:
        overall = round(sum(overall_candidates) / len(overall_candidates), 1)
    elif any(v > 0 for v in dim_averages.values()):
        overall = round(sum(dim_averages.values()) / max(1, len(dim_averages)), 1)
    else:
        overall = 0.0

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

        # Proctor & Integrity Report
        flags = req.flags or []
        integrity_score = max(0, 100 - len(flags) * 15) if flags else 100
        proctor_verdict = "Verified Clean" if not flags else ("Integrity Warning" if len(flags) <= 2 else "Critical Proctor Violation")
        data["proctor_report"] = {
            "integrity_score": integrity_score,
            "verdict": proctor_verdict,
            "flags_detected": len(flags),
            "flag_events": flags,
            "strict_proctor_active": req.config.strictMode,
            "face_tracking": "Verified Active" if not any("face" in f.lower() for f in flags) else "Discrepancy Logged",
            "device_detection": "Clean" if not any("phone" in f.lower() for f in flags) else "Secondary Device Alert",
            "clipboard_guard": "Clean" if not any("copy" in f.lower() or "paste" in f.lower() for f in flags) else "Clipboard Lock Triggered",
            "focus_monitoring": "Continuous" if not any("window" in f.lower() or "tab" in f.lower() for f in flags) else "Focus Loss Detected",
            "summary": data.get("integrity_note") or ("All automated proctoring telemetry verified clean. Continuous multi-modal proctor verified clean." if not flags else f"{len(flags)} integrity events recorded during the assessment.")
        }

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


# ── Endpoint: /api/tts ────────────────────────────────────────────────────────

@app.post("/api/tts")
async def text_to_speech(req: TTSRequest):
    """Stream ElevenLabs TTS audio for the given text and character."""
    from tts_service import generate_speech_stream, TTSError, is_tts_configured

    if not is_tts_configured():
        raise HTTPException(
            status_code=503,
            detail="Voice service is not configured. Set ELEVENLABS_API_KEY in backend/.env"
        )

    try:
        audio_stream = generate_speech_stream(
            text=req.text,
            character=req.character,
            authority_level=req.character_authority_level,
            priority=req.priority,
            model_id=req.model_id,
        )
        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline",
                "Cache-Control": "no-cache",
            },
        )
    except TTSError as e:
        status = 503 if e.retry else 400
        raise HTTPException(status_code=status, detail=e.user_message)
    except Exception:
        raise HTTPException(status_code=500, detail="Voice generation failed. Text is still available.")


@app.get("/api/tts/status")
async def tts_status():
    """Check if TTS service is configured and available."""
    from tts_service import is_tts_configured, get_available_characters

    configured = is_tts_configured()
    return {
        "configured": configured,
        "characters": get_available_characters() if configured else {},
        "message": "ElevenLabs TTS is ready" if configured else "TTS not configured - set ELEVENLABS_API_KEY",
    }


# ── Endpoint: /api/crew/status ────────────────────────────────────────────────
@app.get("/api/crew/status")
async def crew_status():
    """Returns CrewAI orchestration status and active Gemini model."""
    from crew_service import get_gemini_model_name, is_quality_reviewer_enabled
    has_gemini_key = bool(os.getenv("GOOGLE_API_KEY", "").strip())
    return {
        "status": "ready" if has_gemini_key else "missing_google_api_key",
        "orchestrator": "CrewAI 1.15",
        "gemini_model": get_gemini_model_name(),
        "quality_reviewer_enabled": is_quality_reviewer_enabled(),
        "free_tier_safe": True
    }


# ── Endpoint: Scenario Library ─────────────────────────────────────────────

@app.get("/api/scenarios")
async def list_scenarios(
    industry: Optional[str] = None,
    difficulty: Optional[str] = None,
    skill: Optional[str] = None,
):
    """
    List predefined workspace scenarios from the library.
    Supports filtering by industry, difficulty, and skill category.
    """
    from scenario_library import get_all_scenarios_catalog

    catalog = get_all_scenarios_catalog()
    filtered = []

    for sc in catalog:
        if industry and not any(industry.lower() in tag.lower() for tag in sc.get("industry_tags", [])):
            continue
        if difficulty and sc.get("difficulty", "").lower() != difficulty.lower():
            continue
        if skill and not any(skill.lower() in tag.lower() for tag in sc.get("skill_tags", [])):
            continue
        filtered.append(sc)

    return {
        "scenarios": filtered,
        "total_count": len(catalog),
        "filtered_count": len(filtered),
    }


@app.get("/api/scenarios/{scenario_id}")
async def get_scenario(scenario_id: str):
    """Get detailed information for a single prebuilt scenario."""
    from scenario_library import PREDEFINED_SCENARIOS

    sc = PREDEFINED_SCENARIOS.get(scenario_id)
    if not sc:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found in library")

    return {
        "scenario": {
            "id": sc.id,
            "title": sc.title,
            "description": sc.description,
            "difficulty": sc.difficulty,
            "industry_tags": sc.industry_tags,
            "compatible_roles": sc.compatible_roles,
            "skill_tags": sc.skill_tags,
            "character": {
                "name": sc.character.name,
                "role": sc.character.role,
                "authority_level": sc.character.authority_level,
                "communication_style": sc.character.communication_style,
                "voice_profile": sc.character.voice_profile,
            },
            "opening_message": sc.opening_message,
            "expected_behaviours": sc.expected_behaviours,
            "critical_mistakes": sc.critical_mistakes,
            "time_limit_seconds": sc.time_limit_seconds,
            "pressure_room_compatible": sc.pressure_room_compatible,
            "rubric": [
                {
                    "id": c.id,
                    "name": c.name,
                    "weight": c.weight,
                    "description": c.description,
                    "skill_id": c.skill_id,
                }
                for c in sc.rubric
            ],
            "version": sc.version,
        }
    }


@app.post("/api/scenarios/evaluate")
async def evaluate_scenario(req: ScenarioEvaluateRequest):
    """
    Evaluates a candidate's response to a prebuilt scenario using the BARS rubric.
    Deterministically calculates the weighted score, selects the conversational branch,
    and returns personalized next-step recommendations.
    """
    from scenario_library import evaluate_scenario_response, get_scenario_recommendation, PREDEFINED_SCENARIOS

    if req.scenario_id not in PREDEFINED_SCENARIOS:
        raise HTTPException(status_code=404, detail=f"Scenario '{req.scenario_id}' not found")

    try:
        eval_result = evaluate_scenario_response(
            scenario_id=req.scenario_id,
            candidate_answer=req.candidate_answer,
            turn_id=req.turn_id,
            chat_fn=chat,
        )

        # Append personalized recommendation
        recommendation = get_scenario_recommendation(
            completed_scenarios=req.completed_scenarios or [req.scenario_id],
            skill_scores=req.skill_scores,
        )
        eval_result["recommendation"] = recommendation

        return eval_result
    except Exception as e:
        logger.error(f"Scenario evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Scenario evaluation failed: {str(e)}")


@app.get("/api/scenarios/recommendations")
async def recommend_scenario(completed: Optional[str] = None):
    """Returns a personalized scenario recommendation based on completed scenarios."""
    from scenario_library import get_scenario_recommendation

    completed_list = [c.strip() for c in completed.split(",") if c.strip()] if completed else []
    return get_scenario_recommendation(completed_scenarios=completed_list)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Job Simulator API v1.1.0"}
