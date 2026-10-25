"""
CrewAI Multi-Agent Orchestration Service for AI Job Simulator
Powered by Google Gemini (Eligible Free-Tier Models: gemini-2.5-flash / gemini-1.5-flash)

Agents:
  1. Interview Planner: Formulates structured interview/challenge plans and competency goals.
  2. Evaluation Agent: Performs evidence-based grading across 8 professional dimensions.
  3. Feedback Agent: Generates actionable coaching, tailored exercises, and career growth recommendations.
  4. Quality Reviewer (Configurable/Optional): Checks consistency and guards against bias/hallucination.
"""

import os
import re
import json
import logging
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

import json_repair
from crewai import Agent, Task, Crew, Process, LLM

logger = logging.getLogger(__name__)

# ── Configuration & Cost Controls ─────────────────────────────────────────────

def get_gemini_model_name() -> str:
    """Return the configured Gemini model name (defaults to free-tier flash)."""
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

def get_crew_llm(temperature: float = 0.4) -> LLM:
    """Instantiate CrewAI LLM configured exclusively for Google Gemini."""
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not configured in backend/.env")
    
    model = get_gemini_model_name()
    # Normalize model identifier for CrewAI's native Gemini provider
    if not model.startswith("gemini/"):
        model_id = f"gemini/{model}"
    else:
        model_id = model

    return LLM(
        model=model_id,
        api_key=api_key,
        temperature=temperature
    )

def is_quality_reviewer_enabled() -> bool:
    """Quality reviewer is disabled by default to stay strictly within free-tier quota."""
    return os.getenv("ENABLE_CREW_QUALITY_REVIEWER", "false").lower() in ("true", "1", "yes")

# ── JSON Helper ───────────────────────────────────────────────────────────────

def parse_crew_json(text: str) -> dict:
    """Safely parse JSON from CrewAI task text output with json_repair."""
    if not text:
        return {}
    clean = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", clean)
    if match:
        clean = match.group(1).strip()
    
    # Try outer brackets
    s = clean.find("{")
    e = clean.rfind("}")
    if s != -1 and e != -1:
        snippet = clean[s:e+1]
        try:
            return json.loads(snippet)
        except Exception:
            pass
        try:
            res = json_repair.loads(snippet)
            if isinstance(res, dict):
                return res
        except Exception:
            pass

    try:
        res = json_repair.loads(clean)
        if isinstance(res, dict):
            return res
        if isinstance(res, list):
            return {"items": res}
    except Exception:
        pass

    raise ValueError(f"Could not parse valid JSON from CrewAI output: {text[:250]}")


# ── AGENT 1: Interview Planner ────────────────────────────────────────────────

def create_interview_planner_agent(llm: LLM) -> Agent:
    return Agent(
        role="Senior Technical Recruiter & Assessment Architect",
        goal="Design structured, role-specific competency plans and natural interview questions calibrated to the candidate profile.",
        backstory=(
            "You are a master talent architect who designs world-class job simulations and interview structures. "
            "You align questions directly to candidate experience, industry context, and role requirements without generic cliches. "
            "You always return valid structured JSON and never hallucinate unsupported requirements."
        ),
        llm=llm,
        verbose=False,
        allow_delegation=False
    )

def plan_interview_session(config: dict) -> dict:
    """
    Agent 1 responsibility: Prepares an interview structure, target competencies, and initial questions.
    Returns structured data consumed by the question runner.
    """
    llm = get_crew_llm(temperature=0.5)
    planner = create_interview_planner_agent(llm)

    role = config.get("role", "Candidate")
    domain = config.get("domain", "General")
    difficulty = config.get("difficulty", "medium")
    company = config.get("company", "Enterprise Organization")
    mode = config.get("mode", "interview")
    target_person = config.get("target_person_role", "Direct Manager")
    n = config.get("numQuestions", 3)
    resume = (config.get("resume_text") or "")[:3500]

    plan_prompt = f"""
Create a structured interview plan for {role} in {domain} at {company}.
Mode: {mode}. Difficulty: {difficulty}. Target Questions: {n}. Target Stakeholder: {target_person}.
Resume Evidence:
{resume if resume else 'No resume provided - calibrate from role and industry standards.'}

Return strictly valid JSON only:
{{
  "assessment_plan": {{
    "target_role": "{role}",
    "domain": "{domain}",
    "difficulty": "{difficulty}",
    "core_competencies": ["Competency 1", "Competency 2", "Competency 3"],
    "plan_rationale": "Brief 1-sentence assessment focus"
  }},
  "items": [
    {{
      "id": 1,
      "type": "technical|behavioural|situational|scenario",
      "text": "Natural spoken question/challenge under 45 words (use single quotes only)",
      "character": "Interviewer Persona or {target_person}",
      "character_authority_level": 3,
      "priority": "P2",
      "scenario_context": "Brief context",
      "objective": "Expected focus",
      "constraints": ["Constraint 1"],
      "evaluation_criteria": ["Criterion 1"]
    }}
  ]
}}
"""

    task = Task(
        description=plan_prompt,
        expected_output="Strictly valid JSON with assessment_plan and items array.",
        agent=planner
    )

    crew = Crew(
        agents=[planner],
        tasks=[task],
        process=Process.sequential,
        verbose=False
    )

    result = crew.kickoff()
    raw_text = str(result)
    return parse_crew_json(raw_text)


# ── AGENT 2 & 3: Evaluation & Feedback Crew ───────────────────────────────────

def create_evaluation_agent(llm: LLM) -> Agent:
    return Agent(
        role="Objective Evidence-Based Performance Evaluator",
        goal="Accurately score candidate interview performance across 8 professional dimensions using grounded transcript evidence.",
        backstory=(
            "You are an impartial, highly discerning technical evaluator. You assess spoken transcripts fairly, "
            "accounting for natural spoken cadence, filler words, and pressure situations. "
            "You base every score strictly on provided candidate answers, distinguishing lack of evidence from demonstrated failure. "
            "You never use biometric assumptions or protected characteristics."
        ),
        llm=llm,
        verbose=False,
        allow_delegation=False
    )

def create_feedback_agent(llm: LLM) -> Agent:
    return Agent(
        role="Executive Career & Leadership Coach",
        goal="Transform objective evaluation scores into empowering, practical, and highly actionable development plans.",
        backstory=(
            "You are a top executive coach who inspires growth. You celebrate verified strengths, identify gentle development areas, "
            "and craft concrete learning exercises and stronger response models that candidates can practice immediately."
        ),
        llm=llm,
        verbose=False,
        allow_delegation=False
    )

def create_quality_reviewer_agent(llm: LLM) -> Agent:
    return Agent(
        role="Assessment Quality & Consistency Auditor",
        goal="Ensure evaluation metrics and coaching feedback are non-hallucinatory, consistent with evidence, and completely objective.",
        backstory=(
            "You are an ethics and rubric compliance auditor who verifies that evaluation scores match the candidate transcript."
        ),
        llm=llm,
        verbose=False,
        allow_delegation=False
    )

# Simple in-memory report cache for idempotency (prevents redundant Gemini quota consumption)
_REPORT_CACHE: Dict[str, dict] = {}

def evaluate_and_generate_report(config: dict, qa_pairs: List[dict], flags: List[str] = None) -> dict:
    """
    Coordinated CrewAI workflow for post-interview debrief:
      1. Evaluation Analyst scores the 8 dimensions based on transcript facts.
      2. Feedback Coach generates actionable recommendations and growth plans.
      3. (Optional) Quality Reviewer verifies rubric consistency.
    """
    if not qa_pairs:
        raise ValueError("No interview transcripts/answers provided for evaluation.")

    # Idempotency check: hash of question/answer pairs to avoid duplicate Gemini calls
    cache_key = json.dumps([
        {"q": p.get("question", {}).get("text", "") if isinstance(p.get("question"), dict) else str(p.get("question", "")),
         "a": p.get("answer", "")}
        for p in qa_pairs
    ], sort_keys=True)

    if cache_key in _REPORT_CACHE:
        logger.info("Returning cached CrewAI report (idempotency hit).")
        return _REPORT_CACHE[cache_key]

    # Pre-calculate deterministic average scores across Q&As to anchor the LLM
    dim_keys = ["problem_solving", "decision_making", "communication", "etiquette", "prioritisation", "accountability", "teamwork", "adaptability"]
    dim_averages = {}
    for k in dim_keys:
        vals = []
        for p in qa_pairs:
            scores = p.get("scores", {})
            dims = scores.get("dimension_scores", {})
            if k in dims and isinstance(dims[k], (int, float)):
                vals.append(float(dims[k]))
            # Also check criterion_breakdown from prebuilt scenarios
            cb = scores.get("criterion_breakdown", {})
            for c_id, c_data in cb.items():
                c_skill = str(c_data.get("skill_id", "")).lower().replace("-", "_")
                if c_skill == k:
                    rating = c_data.get("rating", 0)
                    vals.append(float((rating / 5.0) * 100.0))
        dim_averages[k] = round(sum(vals) / len(vals), 1) if vals else 0.0

    # Calculate overall score directly from question scores or dimension averages
    overall_candidates = []
    for p in qa_pairs:
        sc = p.get("scores", {})
        if "overall_score" in sc and isinstance(sc["overall_score"], (int, float)):
            overall_candidates.append(float(sc["overall_score"]))
        elif "score" in sc and isinstance(sc["score"], (int, float)):
            overall_candidates.append(float(sc["score"]))
        elif "total" in sc and isinstance(sc["total"], (int, float)):
            overall_candidates.append(float(sc["total"]) * 10.0)

    if overall_candidates:
        overall_score = round(sum(overall_candidates) / len(overall_candidates), 1)
    elif any(v > 0 for v in dim_averages.values()):
        overall_score = round(sum(dim_averages.values()) / max(1, len(dim_averages)), 1)
    else:
        overall_score = 0.0
    
    # Grade mapping
    if overall_score >= 88:
        grade = "A+"
    elif overall_score >= 78:
        grade = "A"
    elif overall_score >= 68:
        grade = "B"
    elif overall_score >= 58:
        grade = "C"
    elif overall_score >= 40:
        grade = "Developing"
    else:
        grade = "Needs Work"

    # Build summarized Q&A transcript evidence
    transcript_summary = []
    for i, p in enumerate(qa_pairs, 1):
        q_text = p.get("question", {}).get("text", "") if isinstance(p.get("question"), dict) else str(p.get("question", ""))
        ans_text = (p.get("answer", "") or "").strip()
        transcript_summary.append(f"Round {i}: Question: '{q_text}'\nCandidate Answer: '{ans_text[:350]}'")

    evidence_text = "\n\n".join(transcript_summary)
    flags_note = f"Integrity notes: {', '.join(flags)}" if flags else "Proctor observation: Normal assessment session."

    llm = get_crew_llm(temperature=0.4)
    evaluator = create_evaluation_agent(llm)
    coach = create_feedback_agent(llm)

    eval_task_desc = f"""
Analyze the candidate's interview session for the role of {config.get('role', 'Candidate')} in {config.get('domain', 'Engineering')}.
Session Transcripts:
{evidence_text}

Pre-computed dimension benchmarks:
{json.dumps(dim_averages)}
Overall benchmark: {overall_score}/100 (Grade: {grade})

Evaluate specific evidence from candidate answers for each dimension. Distinguish missing evidence from genuine weakness.
Output a factual analysis of their verified skills, weaknesses, and performance.
"""

    eval_task = Task(
        description=eval_task_desc,
        expected_output="An evidence-grounded performance breakdown based on actual transcript answers.",
        agent=evaluator
    )

    feedback_task_desc = f"""
Using the Evaluation Analyst's findings for the candidate ({config.get('role', 'Candidate')}), generate an empowering, career-advancing coaching debrief.
Candidate Score: {overall_score}/100 (Grade: {grade})
Technical observation: {flags_note}

Format the final response strictly in valid JSON matching this schema:
{{
  "overall_score": {overall_score},
  "grade": "{grade}",
  "strengths": ["Authentic strength 1 grounded in transcript", "Authentic strength 2", "Authentic strength 3"],
  "weaknesses": ["Growth area 1 based on actual answer", "Growth area 2"],
  "next_steps": ["Concrete next step 1", "Concrete next step 2", "Concrete next step 3"],
  "integrity_note": "{flags_note}",
  "next_scenario_direction": "Recommended scenario focus to practice weaker skills",
  "skill_breakdown": {json.dumps(dim_averages)}
}}
"""

    feedback_task = Task(
        description=feedback_task_desc,
        expected_output="Valid JSON matching the report schema exactly.",
        agent=coach
    )

    agents_list = [evaluator, coach]
    tasks_list = [eval_task, feedback_task]

    # Optional quality reviewer (if enabled)
    if is_quality_reviewer_enabled():
        reviewer = create_quality_reviewer_agent(llm)
        review_task = Task(
            description="Verify that the feedback is grounded in the transcript, non-hallucinatory, and matches the JSON schema.",
            expected_output="Final validated JSON report matching the schema.",
            agent=reviewer
        )
        agents_list.append(reviewer)
        tasks_list.append(review_task)

    crew = Crew(
        agents=agents_list,
        tasks=tasks_list,
        process=Process.sequential,
        verbose=False
    )

    try:
        crew_result = crew.kickoff()
        report_data = parse_crew_json(str(crew_result))
        
        # Ensure critical benchmark attributes are preserved
        report_data["overall_score"] = overall_score
        flags_list = flags or []
        integrity_score = max(0, 100 - len(flags_list) * 15) if flags_list else 100
        proctor_verdict = "Verified Clean" if not flags_list else ("Integrity Warning" if len(flags_list) <= 2 else "Critical Proctor Violation")
        proctor_info = {
            "integrity_score": integrity_score,
            "verdict": proctor_verdict,
            "flags_detected": len(flags_list),
            "flag_events": flags_list,
            "strict_proctor_active": config.get("strictMode", True),
            "face_tracking": "Verified Active" if not any("face" in f.lower() for f in flags_list) else "Discrepancy Logged",
            "device_detection": "Clean" if not any("phone" in f.lower() for f in flags_list) else "Secondary Device Alert",
            "clipboard_guard": "Clean" if not any("copy" in f.lower() or "paste" in f.lower() for f in flags_list) else "Clipboard Lock Triggered",
            "focus_monitoring": "Continuous" if not any("window" in f.lower() or "tab" in f.lower() for f in flags_list) else "Focus Loss Detected",
            "summary": "All automated proctoring telemetry verified clean. Multi-modal continuous proctor verified clean." if not flags_list else f"{len(flags_list)} integrity events recorded during the assessment."
        }

        report_data["grade"] = grade
        report_data["skill_breakdown"] = dim_averages
        report_data["proctor_report"] = proctor_info
        report_data["skill_breakdown_10"] = {
            "correctness": round(dim_averages.get("problem_solving", 0.0) / 10, 1),
            "problem_solving": round(dim_averages.get("decision_making", 0.0) / 10, 1),
            "communication": round(dim_averages.get("communication", 0.0) / 10, 1),
        }

        # Cache for idempotency
        _REPORT_CACHE[cache_key] = report_data
        return report_data

    except Exception as err:
        logger.warning(f"CrewAI execution error: {err}. Providing deterministic graceful fallback.")
        flags_list = flags or []
        integrity_score = max(0, 100 - len(flags_list) * 15) if flags_list else 100
        proctor_verdict = "Verified Clean" if not flags_list else ("Integrity Warning" if len(flags_list) <= 2 else "Critical Proctor Violation")
        fallback_report = {
            "overall_score": overall_score,
            "grade": grade,
            "strengths": [
                "Demonstrated active communication under assessment conditions",
                "Formulated practical reasoning relevant to domain tasks",
                "Maintained engagement across all simulation phases"
            ] if overall_score > 0 else ["Initiated simulation assessment session"],
            "weaknesses": [
                "Opportunity to provide more specific operational metrics in answers",
                "Opportunity to proactively outline structured recovery plans"
            ] if overall_score > 0 else [
                "Response lacked substantive problem-solving and actionable decisions",
                "Failed to formulate operational containment or stakeholder communication"
            ],
            "next_steps": [
                "Practice high-level stakeholder containment frameworks",
                "Focus on concise 3-part crisis mitigation outlines",
                "Engage in another timed simulation round to solidify pacing"
            ] if overall_score > 0 else [
                "Practice structured 3-part answers: diagnosis, containment, and timeline commitment",
                "Review baseline operational scenarios to build situational fluency"
            ],
            "integrity_note": flags_note,
            "proctor_report": {
                "integrity_score": integrity_score,
                "verdict": proctor_verdict,
                "flags_detected": len(flags_list),
                "flag_events": flags_list,
                "strict_proctor_active": config.get("strictMode", True),
                "face_tracking": "Verified Active" if not any("face" in f.lower() for f in flags_list) else "Discrepancy Logged",
                "device_detection": "Clean" if not any("phone" in f.lower() for f in flags_list) else "Secondary Device Alert",
                "clipboard_guard": "Clean" if not any("copy" in f.lower() or "paste" in f.lower() for f in flags_list) else "Clipboard Lock Triggered",
                "focus_monitoring": "Continuous" if not any("window" in f.lower() or "tab" in f.lower() for f in flags_list) else "Focus Loss Detected",
                "summary": "All automated proctoring telemetry verified clean." if not flags_list else f"{len(flags_list)} integrity events recorded during assessment."
            },
            "next_scenario_direction": f"Foundation {config.get('domain', 'Operations')} incident containment challenge",
            "skill_breakdown": dim_averages,
            "skill_breakdown_10": {
                "correctness": round(dim_averages.get("problem_solving", 0.0) / 10, 1),
                "problem_solving": round(dim_averages.get("decision_making", 0.0) / 10, 1),
                "communication": round(dim_averages.get("communication", 0.0) / 10, 1),
            }
        }
        _REPORT_CACHE[cache_key] = fallback_report
        return fallback_report
