"""
AI Job Simulator — Predefined Workspace Scenario Library
Provides 10 prebuilt workplace scenarios with evidence-based BARS rubrics,
authoritative deterministic scoring, interactive branching, and personalized recommendations.
"""

import os
import re
import json
import logging
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

logger = logging.getLogger("ai_job_sim.scenarios")

# ── Pydantic Models ────────────────────────────────────────────────────────────

class RubricCriterion(BaseModel):
    id: str
    name: str
    weight: float = Field(..., description="Percentage weight (sum for scenario must be 100.0)")
    description: str
    skill_id: str
    indicators: Dict[int, str] = Field(
        default_factory=dict,
        description="Behaviorally anchored rating definitions for scores 1 through 5"
    )


class CharacterMeta(BaseModel):
    name: str
    role: str
    authority_level: str  # e.g., "Manager", "Senior Executive", "Peer", "Client", "Interviewer"
    communication_style: str
    voice_profile: str   # maps to tts_service voice key (e.g., 'upset_client', 'manager', 'executive')


class BranchRule(BaseModel):
    branch_id: str
    trigger_condition: str  # "score_gte_70", "score_lt_70", "fallback"
    dialogue: str
    follow_up_prompt: str
    character_reaction: str


class WorkspaceScenario(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str  # "Easy", "Medium", "Hard"
    industry_tags: List[str]
    compatible_roles: List[str]
    skill_tags: List[str]
    character: CharacterMeta
    opening_message: str
    rubric: List[RubricCriterion]
    branching_rules: List[BranchRule]
    expected_behaviours: List[str]
    critical_mistakes: List[str]
    time_limit_seconds: int = 60
    pressure_room_compatible: bool = True
    feedback_guidance: str
    version: str = "1.0.0"


# ── The 10 Predefined Scenarios ────────────────────────────────────────────────

PREDEFINED_SCENARIOS: Dict[str, WorkspaceScenario] = {
    # ── Scenario 1: The Angry Client ──────────────────────────────────────────
    "angry-client": WorkspaceScenario(
        id="angry-client",
        title="The Angry Client",
        description="A key enterprise client discovers a critical deliverable promised for this morning is delayed and demands an immediate explanation and concrete recovery.",
        difficulty="Medium",
        industry_tags=["General Corporate", "Technology and IT", "Sales and Customer Success", "Business and Management"],
        compatible_roles=["Account Manager", "Customer Success Manager", "Project Manager", "Consultant", "Client Lead"],
        skill_tags=["Communication", "Problem-solving", "Accountability", "Adaptability"],
        character=CharacterMeta(
            name="Elena Rostova",
            role="VP of Operations, Client Enterprise",
            authority_level="Client",
            communication_style="Firm, urgent, highly demanding, and impatient",
            voice_profile="upset_client",
        ),
        opening_message="I was promised the production deployment and client reporting deliverables would be live by 9:00 AM sharp. My leadership team is in an emergency board meeting right now waiting on these numbers, and your system shows nothing! What on earth happened, and how are you going to fix this right now?!",
        rubric=[
            RubricCriterion(
                id="deescalation_empathy",
                name="De-escalation & Customer Empathy",
                weight=20.0,
                description="Acknowledges the client's frustration with genuine empathy without making defensive excuses.",
                skill_id="communication",
                indicators={
                    1: "Dismissive, defensive, argues back, or ignores the client's emotional distress.",
                    2: "Offers a perfunctory apology but sounds mechanical and unconcerned.",
                    3: "Politely acknowledges the delay and business impact with acceptable poise.",
                    4: "Validates the high stakes of the board meeting and validates the client's urgency sincerely.",
                    5: "Exemplary de-escalation: quickly diffuses tension, validates specific board impacts, and calms the client."
                }
            ),
            RubricCriterion(
                id="root_cause_ownership",
                name="Root Cause Ownership & Accountability",
                weight=20.0,
                description="Accepts direct responsibility for the issue without shifting blame to teammates or third parties.",
                skill_id="accountability",
                indicators={
                    1: "Blames colleagues, vendors, or external systems; denies personal responsibility.",
                    2: "Minimizes the severity or claims the problem was beyond control.",
                    3: "Accepts responsibility for the company/team without detailed ownership.",
                    4: "Takes direct personal accountability for resolving the communication breakdown.",
                    5: "Flawless ownership: accepts full responsibility, states root causes transparently, shields team from unfair blame."
                }
            ),
            RubricCriterion(
                id="solution_actionability",
                name="Solution Actionability & Concrete Timeline",
                weight=30.0,
                description="Offers a realistic, concrete recovery plan with committed delivery checkpoints.",
                skill_id="problem-solving",
                indicators={
                    1: "No solution offered, or promises impossible deadlines that will fail again.",
                    2: "Vague assurances ('we are looking into it') with zero timeline.",
                    3: "Presents a basic remediation step with an approximate timeframe.",
                    4: "Provides specific action steps and a concrete interim deliverable timeframe.",
                    5: "Exceptional plan: offers immediate interim data for the board, followed by a verified live release window."
                }
            ),
            RubricCriterion(
                id="clear_expectation_setting",
                name="Expectation Setting & Follow-up Protocol",
                weight=20.0,
                description="Establishes exact milestone updates and a proactive follow-up schedule.",
                skill_id="prioritisation",
                indicators={
                    1: "Leaves the client hanging with no follow-up plan.",
                    2: "Tells the client to check back later themselves.",
                    3: "Mentions they will call back once there is an update.",
                    4: "Commits to explicit status intervals (e.g. update every 30 minutes).",
                    5: "Proactive communication cadence established with single point of contact and automated telemetry."
                }
            ),
            RubricCriterion(
                id="professional_poise",
                name="Professional Poise Under Fire",
                weight=10.0,
                description="Maintains executive composure, calm tone, and confident presence during aggressive verbal pressure.",
                skill_id="adaptability",
                indicators={
                    1: "Panics, freezes, becomes combative, or stammers uncontrollably.",
                    2: "Noticeably shaken, timid, or passive-aggressive.",
                    3: "Maintains reasonable composure throughout the exchange.",
                    4: "Calm, steady, confident, and professional throughout.",
                    5: "Masterful presence: anchors the interaction, projecting total competence and reassuring stability."
                }
            ),
        ],
        branching_rules=[
            BranchRule(
                branch_id="strong_response",
                trigger_condition="score_gte_70",
                character_reaction="Appreciates the immediate interim numbers and clear accountability.",
                dialogue="Alright, I appreciate you taking direct ownership rather than giving me excuses. If you can email that verified executive summary directly to me by 10:15 AM so I can brief the board, we can manage the fallout. Confirm right now: who is supervising the live deployment while we speak?",
                follow_up_prompt="Confirm your technical point of contact and immediate monitoring protocol to Elena.",
            ),
            BranchRule(
                branch_id="weak_response",
                trigger_condition="score_lt_70",
                character_reaction="Remains frustrated by vague promises and missing concrete times.",
                dialogue="That still doesn't tell me what happened or when my data will actually be ready! I cannot walk back into that boardroom with vague promises. Give me a concrete timeline and tell me what steps are being taken right this second!",
                follow_up_prompt="Provide a specific timeline, concrete containment action, and immediate interim report.",
            ),
            BranchRule(
                branch_id="fallback",
                trigger_condition="fallback",
                character_reaction="Demands clarity on next steps.",
                dialogue="I need a direct answer. What concrete steps are being taken right now, and when will this be delivered?",
                follow_up_prompt="Clarify your immediate remediation plan and deadline.",
            ),
        ],
        expected_behaviours=[
            "Acknowledge the client's stress and the high stakes of their board meeting immediately.",
            "Take direct ownership of the problem without blaming other engineers or third-party vendors.",
            "Provide an interim data export or partial summary right away to unblock the client's immediate meeting.",
            "Set a concrete, realistic timeline for the full fix with regular 30-minute status check-ins."
        ],
        critical_mistakes=[
            "Arguing with the client or telling them they are overreacting.",
            "Blaming other teams ('DevOps dropped the ball') to escape responsibility.",
            "Over-promising an impossible immediate fix that leads to a second broken promise.",
            "Staying silent or freezing without proposing a concrete path forward."
        ],
        feedback_guidance="Focus on whether the candidate balanced emotional de-escalation with practical operational triage.",
    ),

    # ── Scenario 2: The Deadline Collision ────────────────────────────────────
    "deadline-collision": WorkspaceScenario(
        id="deadline-collision",
        title="The Deadline Collision",
        description="Your manager assigns an urgent ad-hoc executive request while you already have two high-impact deliverables due today.",
        difficulty="Hard",
        industry_tags=["Technology and IT", "Business and Management", "Operations and Project Management", "Finance"],
        compatible_roles=["Software Engineer", "Project Manager", "Business Analyst", "Product Manager"],
        skill_tags=["Prioritisation", "Decision-making", "Communication", "Problem-solving"],
        character=CharacterMeta(
            name="Marcus Vance",
            role="Engineering & Delivery Director",
            authority_level="Manager",
            communication_style="High urgency, results-driven, expecting clear tradeoffs",
            voice_profile="manager",
        ),
        opening_message="We have a critical fire drill from the VP: I need an executive summary of the Q3 architecture audit on my desk in two hours. I know you have the security compliance patch and the client onboarding batch due today, but both are important. Tell me how you're going to handle this collision.",
        rubric=[
            RubricCriterion(
                id="triage_prioritization",
                name="Triage & Impact Prioritization",
                weight=30.0,
                description="Evaluates relative urgency, security risk, and business dependencies accurately.",
                skill_id="prioritisation",
                indicators={
                    1: "Treats everything as equally urgent or randomly selects tasks without justification.",
                    2: "Shows weak grasp of business impact; tries to do all three simultaneously with no priority.",
                    3: "Correctly identifies that security or executive visibility takes priority, with minor gaps.",
                    4: "Explicitly ranks the three tasks based on compliance risk, revenue impact, and executive urgency.",
                    5: "Exceptional triage: categorizes by non-negotiable compliance vs deferrable onboarding with zero ambiguity."
                }
            ),
            RubricCriterion(
                id="stakeholder_renegotiation",
                name="Stakeholder Renegotiation & Boundary Setting",
                weight=25.0,
                description="Proactively negotiates realistic deadlines with manager rather than making false commitments.",
                skill_id="decision-making",
                indicators={
                    1: "Blindly agrees to impossible workload or aggressively refuses the new request.",
                    2: "Expresses frustration or complains without offering a negotiation framework.",
                    3: "Asks manager which one to drop without offering their own reasoned proposal.",
                    4: "Presents clear tradeoff options and seeks manager sign-off on the deprioritized task.",
                    5: "Executive-level negotiation: sets healthy boundaries while aligning completely with organizational goals."
                }
            ),
            RubricCriterion(
                id="tradeoff_analysis",
                name="Tradeoff & Risk Analysis",
                weight=20.0,
                description="Articulates the downstream impacts of delaying each respective deliverable.",
                skill_id="problem-solving",
                indicators={
                    1: "Ignores downstream risks entirely.",
                    2: "Mentions stress or workload rather than objective business risk.",
                    3: "Identifies primary risks (e.g., security vulnerability vs delayed onboarding).",
                    4: "Thoroughly outlines mitigation for the delayed task (e.g. prep onboarding for tomorrow 9 AM).",
                    5: "Comprehensive impact analysis including client communication and SLA implications."
                }
            ),
            RubricCriterion(
                id="proactive_communication",
                name="Proactive Milestone Planning",
                weight=15.0,
                description="Details a structured timeline with specific check-in milestones throughout the day.",
                skill_id="communication",
                indicators={
                    1: "No timeline or milestone plan provided.",
                    2: "Vague promise to 'work as fast as possible'.",
                    3: "Gives basic time slots for the tasks.",
                    4: "Outlines clear milestone checkpoints and progress update schedule.",
                    5: "Crisp project management discipline: specific delivery times and blocker escalation checkpoints."
                }
            ),
            RubricCriterion(
                id="stress_resilience",
                name="Composure & Stress Resilience",
                weight=10.0,
                description="Maintains calm analytical focus under competing high-pressure demands.",
                skill_id="adaptability",
                indicators={
                    1: "Visible panic, exasperation, or helplessness.",
                    2: "Overwhelmed tone, difficulty formulating structured thoughts.",
                    3: "Maintains steady professional demeanor.",
                    4: "Demonstrates calm problem-solving leadership under sudden crunch.",
                    5: "Total command of situation; radiates dependable stability to management."
                }
            ),
        ],
        branching_rules=[
            BranchRule(
                branch_id="strong_response",
                trigger_condition="score_gte_70",
                character_reaction="Accepts the logical prioritization and trade-off plan.",
                dialogue="That triage logic is sound. Pausing the onboarding batch until 4:00 PM carries low risk, whereas the security compliance patch cannot slip past today. I will inform the onboarding team. Confirm you can deliver that audit summary by 1:30 PM.",
                follow_up_prompt="Confirm your delivery commitment for the audit summary and describe your immediate execution step.",
            ),
            BranchRule(
                branch_id="weak_response",
                trigger_condition="score_lt_70",
                character_reaction="Challenges the lack of clear priorities.",
                dialogue="Saying you'll 'try to do everything' isn't a plan—something is going to crash and burn. You have three conflicting tasks. Tell me explicitly: which one are we pausing or delegating, and what is your hard delivery commitment?",
                follow_up_prompt="State an explicit priority ranking and explain which task must be rescheduled and why.",
            ),
            BranchRule(
                branch_id="fallback",
                trigger_condition="fallback",
                character_reaction="Requests concrete prioritization.",
                dialogue="I need a clear decision: which task comes first, and how are we protecting the compliance deadline?",
                follow_up_prompt="Provide a direct decision on task priority and delivery.",
            ),
        ],
        expected_behaviours=[
            "Recognize that attempting all three without modification guarantees poor quality or missed deadlines.",
            "Rank the tasks based on compliance impact, risk, and executive urgency.",
            "Propose rescheduling the lowest-risk deliverable with a concrete alternate time.",
            "Commit to a specific delivery time for the 2-hour executive brief."
        ],
        critical_mistakes=[
            "Blindly saying 'Yes, I'll do all three by today' without addressing the physical impossibility.",
            "Refusing the manager's request outright without offering alternatives.",
            "Dropping the security compliance patch without analyzing regulatory penalties.",
            "Dumping the decision back onto the manager without offering a recommendation."
        ],
        feedback_guidance="Focus on whether the candidate managed workload proactively through reasoned tradeoffs rather than passive acceptance.",
    ),

    # ── Scenario 3: The Team Conflict ─────────────────────────────────────────
    "team-conflict": WorkspaceScenario(
        id="team-conflict",
        title="The Team Conflict",
        description="A teammate publicly blames you in a team channel for a shared project delay, accusing you of stalling progress.",
        difficulty="Medium",
        industry_tags=["Technology and IT", "Marketing", "Operations and Project Management", "General Corporate"],
        compatible_roles=["Software Developer", "Product Designer", "Scrum Master", "Team Member", "Marketer"],
        skill_tags=["Conflict resolution", "Teamwork", "Communication", "Accountability"],
        character=CharacterMeta(
            name="Alex Rivera",
            role="Senior Peer Specialist",
            authority_level="Peer",
            communication_style="Defensive, frustrated, accusatory, and stressed",
            voice_profile="coworker",
        ),
        opening_message="Great, the sprint demo is delayed again because we're still waiting on your component review. If you had just approved it yesterday instead of nitpicking formatting, we'd already be in staging. Why are you always blocking our deliveries?",
        rubric=[
            RubricCriterion(
                id="active_listening_impartiality",
                name="Active Listening & Non-Defensive Tone",
                weight=20.0,
                description="Listens to underlying frustration without launching into retaliatory personal counter-attacks.",
                skill_id="conflict-resolution",
                indicators={
                    1: "Retaliates with personal insults or aggressive blame ('You are incompetent').",
                    2: "Defensive and dismissive, ignores peer's stress entirely.",
                    3: "Polite and does not attack, though somewhat formal and detached.",
                    4: "Acknowledges the frustration regarding the sprint demo delay constructively.",
                    5: "Exemplary active listening: de-escalates hostility by focusing on shared team goals."
                }
            ),
            RubricCriterion(
                id="facilitation_mediation",
                name="Issue Depersonalization & Facts Focus",
                weight=30.0,
                description="Reframes the conflict from personal blame to technical/operational problem-solving.",
                skill_id="teamwork",
                indicators={
                    1: "Feeds into interpersonal drama; escalates the argument.",
                    2: "Focuses on defending own reputation rather than fixing the staging blocker.",
                    3: "States the factual reason for the review comments.",
                    4: "Distinguishes stylistic comments from critical functional bugs calmly.",
                    5: "Masterful reframing: pivots conversation from 'who is at fault' to 'how we unblock staging immediately'."
                }
            ),
            RubricCriterion(
                id="psychological_safety",
                name="Psychological Safety & Professionalism",
                weight=20.0,
                description="Protects team culture by keeping discussions constructive and suggesting appropriate channels.",
                skill_id="communication",
                indicators={
                    1: "Publicly humiliates the coworker or threatens escalation maliciously.",
                    2: "Passive-aggressive remarks that damage team trust.",
                    3: "Maintains standard professional etiquette.",
                    4: "Proposes hopping on a quick 1-on-1 huddle to avoid clogging public channels.",
                    5: "Builds psychological safety: validates pressures while establishing healthy peer collaboration norms."
                }
            ),
            RubricCriterion(
                id="action_oriented_resolution",
                name="Action-Oriented Resolution & Next Steps",
                weight=20.0,
                description="Proposes concrete next steps to review, resolve, and deploy the blocked component.",
                skill_id="problem-solving",
                indicators={
                    1: "No solution proposed; leaves the PR blocked indefinitely.",
                    2: "Tells peer to fix everything on their own.",
                    3: "Offers to look at the PR again later today.",
                    4: "Suggests pairing up immediately to approve non-blocking items and fast-track staging.",
                    5: "Provides an actionable resolution plan: pair review in 10 minutes, unblock staging, defer non-critical style tweaks."
                }
            ),
            RubricCriterion(
                id="emotional_intelligence",
                name="Emotional Intelligence & Self-Regulation",
                weight=10.0,
                description="Maintains emotional discipline despite provocative and unfair public accusations.",
                skill_id="accountability",
                indicators={
                    1: "Loses temper, uses hostile sarcasm or shouting.",
                    2: "Visibly irritated and defensive throughout.",
                    3: "Controls temper and speaks neutrally.",
                    4: "Demonstrates high self-awareness and empathy for the coworker's sprint stress.",
                    5: "Impeccable maturity: transforms a toxic outburst into a collaborative breakthrough."
                }
            ),
        ],
        branching_rules=[
            BranchRule(
                branch_id="strong_response",
                trigger_condition="score_gte_70",
                character_reaction="Softens stance and agrees to collaborative review.",
                dialogue="Fair enough, I was stressed about the demo deadline and shouldn't have blasted the channel. Let's jump on a five-minute call right now to clear the remaining functional blockers so we can hit staging before noon.",
                follow_up_prompt="Accept the call gracefully and outline the two critical items you want to align on.",
            ),
            BranchRule(
                branch_id="weak_response",
                trigger_condition="score_lt_70",
                character_reaction="Remains combative and insists on immediate sign-off.",
                dialogue="You're still dodging the issue. The team needs this out today. Are you going to approve the build or are we going to keep arguing over nitpicks?",
                follow_up_prompt="Clarify what is blocking approval and propose an immediate pragmatic way forward.",
            ),
            BranchRule(
                branch_id="fallback",
                trigger_condition="fallback",
                character_reaction="Seeks clarity on how to proceed.",
                dialogue="Look, can we resolve this right now so we don't miss the deployment cutoff?",
                follow_up_prompt="Propose an immediate actionable compromise.",
            ),
        ],
        expected_behaviours=[
            "Refuse to retaliate or engage in public mudslinging.",
            "Acknowledge the shared deadline pressure and desire to hit the demo.",
            "Separate critical functional/security concerns from non-blocking stylistic comments.",
            "Suggest moving to a quick 1-on-1 call or pair review to unblock staging within minutes."
        ],
        critical_mistakes=[
            "Insulting the peer or questioning their technical competence in public.",
            "Blanket approving broken or vulnerable code just to avoid conflict.",
            "Refusing to communicate and telling them to complain to HR/manager.",
            "Denying all review feedback validity without explaining why."
        ],
        feedback_guidance="Focus on how well the candidate balanced technical integrity with interpersonal diplomacy.",
    ),

    # ── Scenario 4: The CEO's Surprise Question ───────────────────────────────
    "ceo-surprise-question": WorkspaceScenario(
        id="ceo-surprise-question",
        title="The CEO's Surprise Question",
        description="The CEO unexpectedly stops you to ask why a flagship strategic rollout is behind schedule and what the recovery plan is.",
        difficulty="Hard",
        industry_tags=["General Corporate", "Technology and IT", "Finance", "Business and Management"],
        compatible_roles=["Technical Lead", "Product Manager", "Operations Lead", "Senior Engineer", "All Roles"],
        skill_tags=["Leadership", "Accountability", "Communication", "Decision-making"],
        character=CharacterMeta(
            name="Victoria Sterling",
            role="Chief Executive Officer",
            authority_level="Senior Executive",
            communication_style="Direct, analytical, time-constrained, bottom-line focused",
            voice_profile="executive",
        ),
        opening_message="I was just reviewing our Q3 executive scorecard, and the flagship rollout has slipped three weeks past the target. We're bleeding market momentum. In sixty seconds: what is the actual bottleneck, and what is our immediate recovery plan?",
        rubric=[
            RubricCriterion(
                id="executive_presence_poise",
                name="Executive Presence & Composure",
                weight=25.0,
                description="Speaks with confidence, authority, and conciseness appropriate for C-suite interaction.",
                skill_id="leadership",
                indicators={
                    1: "Intimidated, rambling, incoherent, or apologizes excessively.",
                    2: "Fidgety, uncertain, fills time with filler words and excuses.",
                    3: "Adequately poised, answers the question without panic.",
                    4: "Confident, crisp, professional tone that commands respect.",
                    5: "Flawless executive presence: radiates calm competence, strategic command, and credibility."
                }
            ),
            RubricCriterion(
                id="intellectual_honesty",
                name="Intellectual Honesty & Admitting Real Bottlenecks",
                weight=20.0,
                description="States the genuine root cause without sugarcoating, obfuscation, or misleading claims.",
                skill_id="accountability",
                indicators={
                    1: "Lies, hides bad news, or pretends everything is completely fine.",
                    2: "Sugarcoats issues with vague corporate buzzwords.",
                    3: "Names the bottleneck honestly (e.g. database migration complexity or vendor delay).",
                    4: "Articulates root cause concisely with precise scope of impact.",
                    5: "Exemplary candor: provides brutal honesty paired with constructive operational reality."
                }
            ),
            RubricCriterion(
                id="strategic_alignment",
                name="Strategic Alignment & Commercial Impact",
                weight=20.0,
                description="Connects the operational delay to business revenue, customer impact, and strategic goals.",
                skill_id="decision-making",
                indicators={
                    1: "Treats the issue purely as technical syntax with zero commercial awareness.",
                    2: "Shows weak understanding of why the CEO cares about market momentum.",
                    3: "Acknowledges the customer and market impact of the slippage.",
                    4: "Frames the recovery around protecting core customer value and revenue streams.",
                    5: "Demonstrates deep commercial alignment: articulates preserved revenue and customer retention."
                }
            ),
            RubricCriterion(
                id="concise_bottom_line_delivery",
                name="Bottom-Line-First (BLUF) Communication",
                weight=25.0,
                description="Delivers the key conclusion first within the 60-second executive window.",
                skill_id="communication",
                indicators={
                    1: "Drowns in irrelevant backstory and never reaches the solution.",
                    2: "Takes far too long to get to the point; buries the lede.",
                    3: "Delivers key points in acceptable sequence.",
                    4: "Crisp BLUF structure: Bottleneck -> Solution -> Revised Target Date.",
                    5: "Masterclass in executive brevity: complete high-impact synthesis in under 45 seconds."
                }
            ),
            RubricCriterion(
                id="structured_followup_plan",
                name="Structured Follow-up & Milestone Commitment",
                weight=10.0,
                description="Commits to a specific, concise follow-up brief and milestone tracking.",
                skill_id="prioritisation",
                indicators={
                    1: "Leaves the conversation open-ended with no next touchpoint.",
                    2: "Offers vague promise to 'keep you posted'.",
                    3: "Offers to send an email summary later.",
                    4: "Commits to a specific 1-page milestone update by end of business day.",
                    5: "Sets clear governance: weekly executive telemetry dashboard and immediate evening memo."
                }
            ),
        ],
        branching_rules=[
            BranchRule(
                branch_id="strong_response",
                trigger_condition="score_gte_70",
                character_reaction="Impressed by executive clarity and candor.",
                dialogue="That is the concise clarity I needed. Clear bottleneck, realistic containment, and zero hand-waving. Send me your two-bullet recovery milestones by 4:00 PM today so I can align the board.",
                follow_up_prompt="Confirm the two milestones you will include in the 4:00 PM executive update.",
            ),
            BranchRule(
                branch_id="weak_response",
                trigger_condition="score_lt_70",
                character_reaction="Frustrated by ambiguity and technical jargon.",
                dialogue="That's too vague and sounds like excuses. I don't need technical jargon; I need to know the business risk, who is accountable, and the revised hard delivery date.",
                follow_up_prompt="Provide a direct 30-second summary: exact bottleneck, business risk, and hard completion date.",
            ),
            BranchRule(
                branch_id="fallback",
                trigger_condition="fallback",
                character_reaction="Requests bottom-line summary.",
                dialogue="Give me the bottom line: when will this launch and what is the immediate fix?",
                follow_up_prompt="State the revised launch date and primary containment step.",
            ),
        ],
        expected_behaviours=[
            "Use BLUF (Bottom Line Up Front) delivery: answer the bottleneck and plan in the first 15 seconds.",
            "Be intellectually honest about why the project slipped without finger-pointing.",
            "Provide a concrete revised milestone date rather than open-ended promises.",
            "Offer a written 1-page executive brief with measurable checkpoints."
        ],
        critical_mistakes=[
            "Diving into minute technical minutiae that the CEO has no context for.",
            "Deflecting blame onto other departments or executives.",
            "Sugarcoating the slip ('Everything is actually on track!') when data shows a 3-week delay.",
            "Freezing or rambling past the 60-second window."
        ],
        feedback_guidance="Focus on whether the response demonstrated high executive gravitas and concise commercial focus.",
    ),

    # ── Scenario 5: The Production Failure ────────────────────────────────────
    "production-failure": WorkspaceScenario(
        id="production-failure",
        title="The Production Failure",
        description="Thirty minutes before a nationwide marketing campaign launch, the checkout processing system crashes in production.",
        difficulty="Hard",
        industry_tags=["Technology and IT", "Operations and Project Management", "Finance"],
        compatible_roles=["DevOps Engineer", "Backend Engineer", "SRE", "Tech Lead", "Incident Commander"],
        skill_tags=["Problem-solving", "Decision-making", "Prioritisation", "Communication", "Accountability"],
        character=CharacterMeta(
            name="Devon Vance",
            role="VP of Engineering & Incident Commander",
            authority_level="Team Leader",
            communication_style="Urgent, rigorous, authoritative, requiring immediate triage logic",
            voice_profile="team_leader",
        ),
        opening_message="Checkout is completely down in production. We are dropping hundreds of transactions a minute, and the nationwide marketing push goes live in 25 minutes. Walk me through your immediate containment and escalation steps right now.",
        rubric=[
            RubricCriterion(
                id="incident_triage_containment",
                name="Incident Triage & Immediate Containment",
                weight=25.0,
                description="Prioritizes blast radius containment (e.g. rollback, circuit breaker) over root cause debate.",
                skill_id="problem-solving",
                indicators={
                    1: "Wants to debug live in production while transactions bleed.",
                    2: "Slow to act; suggests lengthy investigation before containment.",
                    3: "Proposes rollback or maintenance page within reasonable time.",
                    4: "Immediately executes safe containment (rollback/feature flag toggle) to restore baseline.",
                    5: "Flawless incident triage: activates instant canary rollback and safe degraded-mode failover."
                }
            ),
            RubricCriterion(
                id="blameless_root_cause_mindset",
                name="Systematic Diagnostics & Blameless Mindset",
                weight=25.0,
                description="Investigates errors systematically using logs and metrics without assigning personal blame.",
                skill_id="decision-making",
                indicators={
                    1: "Guesses wildly without looking at telemetry; blames junior engineers.",
                    2: "Unsystematic approach; tries random changes in production.",
                    3: "Checks primary dashboards and APM logs methodically.",
                    4: "Correlates recent deployment diffs with error spikes systematically.",
                    5: "Exemplary systems diagnostics: isolates gateway timeout root cause with zero guesswork."
                }
            ),
            RubricCriterion(
                id="cross_team_status_communication",
                name="Cross-Team Status Communication",
                weight=20.0,
                description="Communicates clear status to marketing, customer support, and leadership immediately.",
                skill_id="communication",
                indicators={
                    1: "Silent; forgets to notify marketing or support.",
                    2: "Sends confusing technical errors to non-technical stakeholders.",
                    3: "Notifies team to hold marketing push.",
                    4: "Provides clear guidance to pause campaign spend and informs support with user messaging.",
                    5: "Proactive communication orchestration: status page updated, campaign paused, support scripted."
                }
            ),
            RubricCriterion(
                id="prioritization_escalation",
                name="Escalation Protocol & Resource Mobilization",
                weight=15.0,
                description="Mobilizes key on-call specialists and establishes an active incident bridge.",
                skill_id="prioritisation",
                indicators={
                    1: "Attempts to solve a major outage completely alone without escalation.",
                    2: "Over-escalates indiscriminately, pulling in unnecessary staff.",
                    3: "Calls payment gateway support and relevant on-call engineer.",
                    4: "Opens an incident command bridge with defined roles (Lead, Comms, Scribe).",
                    5: "Textbook incident command execution: clear roles, structured bridge, disciplined cadence."
                }
            ),
            RubricCriterion(
                id="postmortem_prevention",
                name="Rollback Verification & Post-Mortem Prevention",
                weight=15.0,
                description="Verifies recovery with synthetic tests and plans a blameless post-mortem.",
                skill_id="accountability",
                indicators={
                    1: "Assumes everything is fine once error rate drops slightly.",
                    2: "No verification plan or follow-up safeguards.",
                    3: "Checks checkout flow manually before resuming campaign.",
                    4: "Runs end-to-end synthetic transactions and schedules blameless post-mortem.",
                    5: "Comprehensive operational rigor: automated verification, chaos engineering safeguards, post-mortem."
                }
            ),
        ],
        branching_rules=[
            BranchRule(
                branch_id="strong_response",
                trigger_condition="score_gte_70",
                character_reaction="Appreciates swift containment and pausing the marketing spend.",
                dialogue="Good instinct on triggering immediate rollback and pausing the campaign spend before debugging. The rollback is deploying now. Once health checks clear, what is your verification procedure before we give marketing the green light?",
                follow_up_prompt="Explain your live verification checklist before authorizing the marketing launch.",
            ),
            BranchRule(
                branch_id="weak_response",
                trigger_condition="score_lt_70",
                character_reaction="Pushes back against debugging live in production.",
                dialogue="We don't have time to poke around logs in live production while transactions bleed! Are we rolling back immediately or pausing the gateway? Decide right now so marketing doesn't waste ad spend.",
                follow_up_prompt="Choose an immediate containment action (rollback vs failover) and justify it.",
            ),
            BranchRule(
                branch_id="fallback",
                trigger_condition="fallback",
                character_reaction="Demands containment decision.",
                dialogue="I need a decision now: rollback or failover? Walk me through the containment.",
                follow_up_prompt="Confirm your containment decision.",
            ),
        ],
        expected_behaviours=[
            "Prioritize containment (instant rollback/traffic drain) over diagnosing root cause in production.",
            "Advise immediately pausing the marketing campaign to prevent driving thousands of users to broken checkout.",
            "Establish a dedicated incident bridge with clear roles.",
            "Verify recovery with synthetic end-to-end payment runs before reopening."
        ],
        critical_mistakes=[
            "Trying to write and test code hotfixes directly in live production during active customer outage.",
            "Letting the marketing campaign launch while checkout is dropping orders.",
            "Failing to notify customer support teams.",
            "Assuming the system is healthy without verifying a test transaction."
        ],
        feedback_guidance="Focus on whether the candidate prioritized incident containment and business protection over intellectual curiosity.",
    ),

    # ── Scenario 6: The Costly Mistake ────────────────────────────────────────
    "costly-mistake": WorkspaceScenario(
        id="costly-mistake",
        title="The Costly Mistake",
        description="You discover your own configuration error caused an automated billing run to overcharge 120 key enterprise accounts by 15%.",
        difficulty="Medium",
        industry_tags=["General Corporate", "Finance", "Marketing", "Technology and IT"],
        compatible_roles=["Financial Analyst", "Marketing Specialist", "Data Engineer", "Account Executive", "Operations Associate"],
        skill_tags=["Accountability", "Problem-solving", "Communication", "Adaptability"],
        character=CharacterMeta(
            name="Rachel Bennett",
            role="Director of Operations & Finance",
            authority_level="Manager",
            communication_style="Serious, focused on risk, ethical integrity, and remediation speed",
            voice_profile="manager",
        ),
        opening_message="Three enterprise clients just called our account executives about unexpected 15% billing discrepancies on their monthly invoices. I traced the execution run to your batch update yesterday. What happened here, and what is our plan to make this right?",
        rubric=[
            RubricCriterion(
                id="immediate_accountability",
                name="Immediate Accountability & Ethical Ownership",
                weight=25.0,
                description="Immediately owns the error fully without minimizing, deflecting, or hiding details.",
                skill_id="accountability",
                indicators={
                    1: "Denies responsibility or falsely claims system bug was responsible.",
                    2: "Admits fault reluctantly while making multiple excuses.",
                    3: "Plainly states ownership of the erroneous batch run.",
                    4: "Takes unambiguous personal responsibility and explains the exact misconfiguration.",
                    5: "Exemplary professional ethics: complete transparency, total ownership, zero defensiveness."
                }
            ),
            RubricCriterion(
                id="damage_mitigation_plan",
                name="Damage Mitigation & Remediation Plan",
                weight=20.0,
                description="Details a concrete operational plan to reverse overcharges and refund affected clients.",
                skill_id="problem-solving",
                indicators={
                    1: "No reversal plan; expects finance to figure it out.",
                    2: "Vague suggestion to 'credit them next month'.",
                    3: "Proposes issuing automatic refunds or account credits.",
                    4: "Presents structured remediation: identify all 120 accounts, calculate delta, execute batch refund script.",
                    5: "Thorough remediation: automated credit memos, ledger audit, and financial reconciliation report."
                }
            ),
            RubricCriterion(
                id="transparent_upward_communication",
                name="Transparent Upward & Client Communication",
                weight=30.0,
                description="Prepares proactive communication for account managers and affected clients.",
                skill_id="communication",
                indicators={
                    1: "Suggests keeping quiet hoping clients don't notice.",
                    2: "Tells manager to handle the client communication alone.",
                    3: "Drafts a basic notification email template.",
                    4: "Drafts a transparent explanation and apology memo for account executives to send to all 120 clients.",
                    5: "Client-centric excellence: provides tailored client comms package with direct escalation hotline."
                }
            ),
            RubricCriterion(
                id="prevention_safeguards",
                name="Prevention Safeguards & Automated Validation",
                weight=15.0,
                description="Introduces safeguards (dry-run mode, peer sign-off, automated assertions) to prevent recurrence.",
                skill_id="decision-making",
                indicators={
                    1: "Promises to 'be more careful' with no systemic changes.",
                    2: "Suggests a slow manual checklist that will be skipped.",
                    3: "Suggests having someone double check scripts in the future.",
                    4: "Implements dry-run testing and threshold assertions before live execution.",
                    5: "Robust engineering safeguards: automated CI validation, two-person rule, and anomaly detection guardrails."
                }
            ),
            RubricCriterion(
                id="composure_under_fire",
                name="Composure & Professional Integrity",
                weight=10.0,
                description="Remains solution-oriented and composed rather than collapsing in panic or self-pity.",
                skill_id="adaptability",
                indicators={
                    1: "Overly emotional, catastrophic panic, or hostile.",
                    2: "Subdued, fearful, requires constant reassurance.",
                    3: "Maintains professional composure.",
                    4: "Demonstrates calm resolve to repair the damage immediately.",
                    5: "Inspires organizational confidence through mature resilience and rigorous follow-through."
                }
            ),
        ],
        branching_rules=[
            BranchRule(
                branch_id="strong_response",
                trigger_condition="score_gte_70",
                character_reaction="Appreciates immediate transparency and solid remediation plan.",
                dialogue="I appreciate you owning this directly without making excuses. Your refund script and draft client apology cover the critical bases. Run the reversal batch on staging first, and confirm when the 120 credit memos will be dispatched.",
                follow_up_prompt="Confirm your verification checkpoint before running the live refund batch.",
            ),
            BranchRule(
                branch_id="weak_response",
                trigger_condition="score_lt_70",
                character_reaction="Demands concrete numbers and accountability.",
                dialogue="I don't need generalities—we overcharged 120 key enterprise partners. What I need right now is an exact list of affected accounts, the total dollar overage, and how quickly we can reverse it.",
                follow_up_prompt="Specify the exact steps to audit the overcharge and reverse the transactions.",
            ),
            BranchRule(
                branch_id="fallback",
                trigger_condition="fallback",
                character_reaction="Asks for direct remediation plan.",
                dialogue="How soon can we reverse these charges and notify our account directors?",
                follow_up_prompt="Provide your timeline for reversing the erroneous charges.",
            ),
        ],
        expected_behaviours=[
            "Acknowledge the mistake directly without pointing fingers at others.",
            "Provide the exact scope: 120 accounts overcharged by 15%.",
            "Present a concrete remediation plan: automated reversal, audit log verification.",
            "Offer a draft client-facing apology and explanation for account leads.",
            "Propose automated guardrails (e.g. sanity checks, dry-run mode) to prevent recurrence."
        ],
        critical_mistakes=[
            "Hiding the scope or suggesting waiting to see if clients complain.",
            "Blaming ambiguous documentation or coworkers.",
            "Saying 'I'll just try harder' instead of implementing systemic technical controls.",
            "Becoming overly dramatic rather than executing remediation."
        ],
        feedback_guidance="Focus on whether the candidate treated accountability as an active problem-solving duty rather than passive guilt.",
    ),

    # ── Scenario 7: The Challenging Interviewer ───────────────────────────────
    "challenging-interviewer": WorkspaceScenario(
        id="challenging-interviewer",
        title="The Challenging Interviewer",
        description="A senior bar-raiser interviewer aggressively challenges a key architectural or strategy decision on your resume, arguing it was a costly mistake.",
        difficulty="Hard",
        industry_tags=["Technology and IT", "Business and Management", "Finance", "Human Resources"],
        compatible_roles=["Senior Engineer", "Architect", "Product Manager", "Consultant", "Engineering Lead"],
        skill_tags=["Interview communication", "Decision-making", "Adaptability", "Communication", "Problem-solving"],
        character=CharacterMeta(
            name="Dr. Aris Thorne",
            role="Principal Architect & Senior Bar Raiser",
            authority_level="Interviewer",
            communication_style="Skeptical, intellectually rigorous, challenging, probing for depth",
            voice_profile="interviewer",
        ),
        opening_message="Looking at your resume's migration project: choosing microservices for an 8-person engineering team looks like textbook over-engineering. You added massive operational overhead for minimal throughput gain. Defend that architecture decision to me.",
        rubric=[
            RubricCriterion(
                id="poise_under_skepticism",
                name="Poise & Composure Under Skepticism",
                weight=30.0,
                description="Responds to intellectual challenge without becoming flustered, hostile, or defensive.",
                skill_id="interview-communication",
                indicators={
                    1: "Gets visibly defensive, hostile, offended, or argumentative.",
                    2: "Folds instantly, abandoning their past work with zero rationale.",
                    3: "Maintains composure and answers politely.",
                    4: "Welcomes the challenge with intellectual confidence and calm body language.",
                    5: "Exemplary poise: turns an aggressive challenge into an engaging high-level peer dialogue."
                }
            ),
            RubricCriterion(
                id="evidence_based_defense",
                name="Evidence-Based Defense of Tradeoffs",
                weight=25.0,
                description="Defends the decision using data, constraints, team dynamics, and business requirements.",
                skill_id="decision-making",
                indicators={
                    1: "Quotes buzzwords ('microservices are modern') with no underlying substance.",
                    2: "Vague recollections with no supporting rationale or metrics.",
                    3: "Explains standard reasons (independent deployability, scaling requirements).",
                    4: "Cites specific business constraints (e.g. independent compliance audits, third-party SLA mandates).",
                    5: "Masterful architectural defense: articulates exact organizational tradeoffs and ROI."
                }
            ),
            RubricCriterion(
                id="receptivity_pushback",
                name="Receptivity to Valid Counter-Arguments",
                weight=20.0,
                description="Acknowledges the interviewer's valid point regarding operational overhead.",
                skill_id="adaptability",
                indicators={
                    1: "Denies that any overhead existed; claims everything was perfect.",
                    2: "Minimizes the valid downsides of the choice.",
                    3: "Concedes that operational complexity was a legitimate cost.",
                    4: "Thoughtfully discusses the overhead tax and how the team mitigated it.",
                    5: "High intellectual maturity: validates the interviewer's critique and articulates retrospective lessons."
                }
            ),
            RubricCriterion(
                id="executive_gravitas",
                name="Professional Gravitas & Articulate Delivery",
                weight=15.0,
                description="Communicates with clarity, structured reasoning, and professional terminology.",
                skill_id="communication",
                indicators={
                    1: "Incoherent, disjointed rambling with frequent hesitation.",
                    2: "Weak vocabulary and circular arguments.",
                    3: "Clear, understandable explanation.",
                    4: "Well-structured response: Context -> Constraints -> Decision -> Tradeoffs.",
                    5: "Commanding articulation: concise, compelling, and intellectually rigorous."
                }
            ),
            RubricCriterion(
                id="cognitive_agility",
                name="Cognitive Agility & Lessons Learned",
                weight=10.0,
                description="Shows ability to reflect retrospectively on what they would do differently today.",
                skill_id="problem-solving",
                indicators={
                    1: "Refuses to admit anything could be improved in retrospect.",
                    2: "Struggles to articulate any retrospective learnings.",
                    3: "Mentions one thing they learned from the project.",
                    4: "Explains how the experience informs their current architectural philosophy.",
                    5: "Nuanced cognitive agility: explains how organizational maturity dictates architectural paradigms."
                }
            ),
        ],
        branching_rules=[
            BranchRule(
                branch_id="strong_response",
                trigger_condition="score_gte_70",
                character_reaction="Respects the evidence-based defense and probes deeper.",
                dialogue="Good defense. Acknowledging the deployment overhead while highlighting independent compliance audits shows mature architectural thinking. Tell me: if you had to design it today with modern modular monolith tools, where would you draw the boundary?",
                follow_up_prompt="Discuss where you would draw the service boundaries today using modern practices.",
            ),
            BranchRule(
                branch_id="weak_response",
                trigger_condition="score_lt_70",
                character_reaction="Probes harder on buzzwords and lack of metrics.",
                dialogue="You're quoting industry buzzwords instead of giving me concrete engineering metrics. What were the latency numbers and infrastructure costs that justified that decision over a modular monolith?",
                follow_up_prompt="Provide concrete engineering metrics and tradeoffs that justify the architectural choice.",
            ),
            BranchRule(
                branch_id="fallback",
                trigger_condition="fallback",
                character_reaction="Asks for concrete justification.",
                dialogue="Give me the concrete engineering rationale: what specific problem did this architecture solve?",
                follow_up_prompt="State the specific problem solved by your architecture choice.",
            ),
        ],
        expected_behaviours=[
            "Stay completely calm and treat the skepticism as an invitation to demonstrate deep reasoning.",
            "Validate the interviewer's premise: acknowledge that microservices indeed introduce significant operational overhead.",
            "Provide the specific context or constraint (e.g. independent compliance boundaries, distinct failure domains).",
            "Demonstrate retrospective wisdom: discuss what worked well and what you would do differently."
        ],
        critical_mistakes=[
            "Becoming defensive or taking the critique personally.",
            "Dogmatically repeating marketing slogans ('Microservices are cloud-native!').",
            "Completely surrendering without defending valid past decisions.",
            "Pretending that zero operational overhead existed."
        ],
        feedback_guidance="Focus on whether the candidate demonstrated intellectual humility paired with evidence-backed conviction.",
    ),

    # ── Scenario 8: The Last-Minute Presentation ──────────────────────────────
    "last-minute-presentation": WorkspaceScenario(
        id="last-minute-presentation",
        title="The Last-Minute Presentation",
        description="Five minutes before pitching an executive client committee, your team discovers the primary analytics dataset is missing half its cohort numbers.",
        difficulty="Medium",
        industry_tags=["Marketing", "Business and Management", "Sales and Customer Success", "Technology and IT"],
        compatible_roles=["Product Marketing Manager", "Strategy Consultant", "Sales Engineer", "Business Analyst"],
        skill_tags=["Adaptability", "Prioritisation", "Communication", "Problem-solving", "Accountability"],
        character=CharacterMeta(
            name="David Chen",
            role="Managing Director & Strategy Lead",
            authority_level="Team Leader",
            communication_style="Fast-paced, high expectations, pragmatic under pressure",
            voice_profile="team_leader",
        ),
        opening_message="We walk into the client presentation room in five minutes, and the cohort retention slide is completely broken—half the data points didn't sync. We cannot show broken charts to the VP. How are we structuring the pitch right now?",
        rubric=[
            RubricCriterion(
                id="rapid_synthesis_prioritization",
                name="Rapid Synthesis & Core Narrative Focus",
                weight=25.0,
                description="Immediately identifies the core presentation message that does not rely on the missing data.",
                skill_id="prioritisation",
                indicators={
                    1: "Freezes; suggests canceling the entire meeting five minutes before.",
                    2: "Obsesses over the missing chart and panics.",
                    3: "Identifies that other slides can still be presented.",
                    4: "Quickly refocuses the narrative on verified qualitative outcomes and validated macro trends.",
                    5: "Masterful triage: preserves the core strategic proposition while seamlessly adapting the agenda."
                }
            ),
            RubricCriterion(
                id="audience_centric_messaging",
                name="Audience-Centric Messaging & Value Alignment",
                weight=25.0,
                description="Aligns the restructured presentation with what the client decision-makers truly care about.",
                skill_id="communication",
                indicators={
                    1: "Ignores client needs; talks about internal pipeline failures.",
                    2: "Shows weak grasp of what the executive audience expects.",
                    3: "Focuses on the high-level business goals of the client.",
                    4: "Tailors the remaining content directly to the VP's primary strategic priorities.",
                    5: "Exceptional audience calibration: delivers compelling executive story without missing a beat."
                }
            ),
            RubricCriterion(
                id="calm_delivery_under_pressure",
                name="Composure & Honest Transparency",
                weight=20.0,
                description="Delivers with calm poise and transparent honesty without guessing or fabricating numbers.",
                skill_id="adaptability",
                indicators={
                    1: "Suggests guessing or making up numbers on the fly.",
                    2: "Visibly frantic, shaking, or ungrounded.",
                    3: "Remains calm and advises against presenting unverified data.",
                    4: "Maintains steady executive demeanor and transparent handling of data limitations.",
                    5: "Flawless integrity: transparently handles data sync status with zero loss of executive authority."
                }
            ),
            RubricCriterion(
                id="resourcefulness_fallback",
                name="Resourcefulness & Practical Fallback Slides",
                weight=20.0,
                description="Proposes a clean slide hide/skip strategy and a concrete post-meeting follow-up deliverable.",
                skill_id="problem-solving",
                indicators={
                    1: "Leaves the broken slide in the deck and hopes no one notices.",
                    2: "Hastily deletes slides without a plan for follow-up.",
                    3: "Suggests hiding the slide and sending the numbers after the call.",
                    4: "Hides the broken slide, leads with verified case studies, commits full cohort data by 2 PM.",
                    5: "Complete contingency execution: backup appendix prepared, verified numbers staged for post-call memo."
                }
            ),
            RubricCriterion(
                id="handling_unknowns",
                name="Intellectual Integrity & Handling Unknowns",
                weight=10.0,
                description="Refuses to misrepresent incomplete data under executive client scrutiny.",
                skill_id="accountability",
                indicators={
                    1: "Bluffs or presents misleading partial numbers as complete.",
                    2: "Tempted to gloss over missing data points.",
                    3: "Refuses to bluff if asked a question.",
                    4: "Clearly frames what is verified versus what is undergoing sync verification.",
                    5: "Gold-standard intellectual honesty: turns data verification into proof of rigorous quality standards."
                }
            ),
        ],
        branching_rules=[
            BranchRule(
                branch_id="strong_response",
                trigger_condition="score_gte_70",
                character_reaction="Appreciates the rapid pivot and commitment to send full cohorts later.",
                dialogue="Smart move—pivoting to verified qualitative proof points and audited macro trends while committing the detailed cohorts in the post-meeting brief keeps our credibility intact. Let's hide slide 7 and walk into the boardroom.",
                follow_up_prompt="State how you will address the client if they specifically ask about the cohort retention data.",
            ),
            BranchRule(
                branch_id="weak_response",
                trigger_condition="score_lt_70",
                character_reaction="Pushes back against skipping slides without a narrative.",
                dialogue="We can't just skip the slide without a narrative or try to guess the numbers live. What specifically are you telling the client when they ask about retention?",
                follow_up_prompt="Provide the exact 1-sentence response you will give if asked about the missing retention slide.",
            ),
            BranchRule(
                branch_id="fallback",
                trigger_condition="fallback",
                character_reaction="Asks for meeting game plan.",
                dialogue="We are walking in now. What is the game plan for the retention section?",
                follow_up_prompt="Summarize the plan for the retention section.",
            ),
        ],
        expected_behaviours=[
            "Immediately suppress/hide the broken slide rather than showing broken charts.",
            "Refuse to fabricate or guess unverified data points.",
            "Pivot the presentation to verified business metrics and qualitative outcomes.",
            "Commit to delivering the audited cohort analysis in a post-meeting executive summary by afternoon."
        ],
        critical_mistakes=[
            "Leaving a broken, half-rendered chart in front of client executives.",
            "Fabricating numbers live on the spot.",
            "Panicking and recommending canceling a meeting scheduled weeks in advance.",
            "Blaming other analysts in front of the client."
        ],
        feedback_guidance="Focus on whether the candidate demonstrated rapid strategic adaptation under time constraints.",
    ),

    # ── Scenario 9: The Unrealistic Request ───────────────────────────────────
    "unrealistic-request": WorkspaceScenario(
        id="unrealistic-request",
        title="The Unrealistic Request",
        description="Your product manager demands you build and deploy five full complex feature modules within a 48-hour sprint for an impromptu investor demo.",
        difficulty="Medium",
        industry_tags=["Technology and IT", "Operations and Project Management", "Business and Management"],
        compatible_roles=["Software Developer", "Product Manager", "UI/UX Designer", "Technical Lead"],
        skill_tags=["Leadership", "Decision-making", "Problem-solving", "Communication", "Conflict resolution"],
        character=CharacterMeta(
            name="Samantha Brooks",
            role="Head of Product & Sprint Owner",
            authority_level="Manager",
            communication_style="Ambitious, aggressive, highly persuasive, deadline-driven",
            voice_profile="manager",
        ),
        opening_message="I just spoke with our lead investor, and they want to see our full multi-tenant billing, team roles, and analytics dashboard live by Friday. That gives us 48 hours. I need your commitment that we'll have all five modules deployed.",
        rubric=[
            RubricCriterion(
                id="boundary_setting_tact",
                name="Boundary Setting with Professional Tact",
                weight=25.0,
                description="Sets firm, realistic boundaries without being cynical, insubordinate, or dismissive.",
                skill_id="leadership",
                indicators={
                    1: "Aggressively tells the manager 'No way, you are crazy' or shuts down.",
                    2: "Passive-aggressively agrees while knowing it will fail.",
                    3: "Politely states that 48 hours is insufficient for five modules.",
                    4: "Articulates professional boundaries clearly while validating the high-stakes investor context.",
                    5: "Masterful boundary setting: protects team sustainability and code quality while aligning on investor success."
                }
            ),
            RubricCriterion(
                id="data_driven_feasibility_pushback",
                name="Data-Driven Feasibility Pushback",
                weight=25.0,
                description="Explains technical bottlenecks, QA requirements, and security risks with objective facts.",
                skill_id="decision-making",
                indicators={
                    1: "Complains about being tired or busy without factual arguments.",
                    2: "Gives vague 'it takes too long' statements.",
                    3: "Points out that payment security and billing logic require thorough testing.",
                    4: "Details the exact engineering breakdown (schema migrations, webhook testing, PCI compliance).",
                    5: "Irrefutable technical rigor: demonstrates that shipping unvetted billing risks financial liability and outages."
                }
            ),
            RubricCriterion(
                id="collaborative_alternative_solutions",
                name="Collaborative Alternative Solutions (MVP)",
                weight=20.0,
                description="Proposes a pragmatic, compelling MVP compromise (e.g. interactive click-through or mock data).",
                skill_id="problem-solving",
                indicators={
                    1: "Offers zero alternatives; leaves the manager with nothing.",
                    2: "Proposes an alternative that does not help the investor demo.",
                    3: "Suggests demoing one completed feature with slides for the rest.",
                    4: "Proposes a high-fidelity staged demo: real billing sandbox flow paired with realistic prototype dashboards.",
                    5: "Exceptional MVP scoping: delivers 100% of the investor wow-factor with 20% of the engineering risk."
                }
            ),
            RubricCriterion(
                id="expectation_management",
                name="Stakeholder Expectation Management",
                weight=20.0,
                description="Aligns the product lead and stakeholders on what can be guaranteed with high quality.",
                skill_id="communication",
                indicators={
                    1: "Promises everything to avoid immediate confrontation.",
                    2: "Leaves the scope fuzzy and undefined.",
                    3: "Clearly states what will and will not be ready.",
                    4: "Documents explicit commitments and secures mutual agreement.",
                    5: "Flawless alignment: ensures zero surprises for leadership, investors, or engineering."
                }
            ),
            RubricCriterion(
                id="relationship_preservation",
                name="Constructive Partnership & Tone",
                weight=10.0,
                description="Maintains an allied, collaborative tone ('How we win together') rather than adversarial stance.",
                skill_id="conflict-resolution",
                indicators={
                    1: "Adversarial, sarcastic, or creates an 'engineering vs product' battle.",
                    2: "Cold and transactional.",
                    3: "Maintains standard polite teamwork.",
                    4: "Positions themselves as a strategic partner helping the product lead succeed.",
                    5: "Inspires deep trust: turns a tense scope conflict into a shared victory for the company."
                }
            ),
        ],
        branching_rules=[
            BranchRule(
                branch_id="strong_response",
                trigger_condition="score_gte_70",
                character_reaction="Appreciates the pragmatic MVP approach to satisfy the investor.",
                dialogue="That's a pragmatic compromise. An interactive prototype of the analytics coupled with a live Stripe sandbox checkout proves traction without risking a production database crash. Let's scope those two and lock the plan.",
                follow_up_prompt="Confirm the two modules you will polish and specify your milestone checkpoint for Thursday afternoon.",
            ),
            BranchRule(
                branch_id="weak_response",
                trigger_condition="score_lt_70",
                character_reaction="Pushes back against generic refusals.",
                dialogue="Simply saying 'it's impossible' leaves me empty-handed for the investor meeting. What can we realistically put in front of them Friday that looks completely functional?",
                follow_up_prompt="Propose a specific subset of features or prototype strategy for Friday's investor demo.",
            ),
            BranchRule(
                branch_id="fallback",
                trigger_condition="fallback",
                character_reaction="Asks for concrete compromise.",
                dialogue="What exactly can we deliver by Friday that proves this product works?",
                follow_up_prompt="Specify your concrete Friday deliverable.",
            ),
        ],
        expected_behaviours=[
            "Avoid saying 'Yes' to an impossible request that will result in broken code during the investor demo.",
            "Avoid an adversarial 'No' that leaves the product manager stranded.",
            "Explain the concrete risks: unvetted billing logic risks regulatory violations and transaction failures.",
            "Propose a compelling alternative: live sandbox demo for the core payment flow + polished clickable prototypes for analytics."
        ],
        critical_mistakes=[
            "Agreeing to deliver all five modules knowing it cannot be done.",
            "Insulting the manager's technical competence.",
            "Failing to propose an alternative that solves the investor demonstration need.",
            "Ignoring the security and financial compliance risks of rushed billing code."
        ],
        feedback_guidance="Focus on whether the candidate protected technical standards while actively helping the business achieve its goal.",
    ),

    # ── Scenario 10: The Ambiguous Assignment ─────────────────────────────────
    "ambiguous-assignment": WorkspaceScenario(
        id="ambiguous-assignment",
        title="The Ambiguous Assignment",
        description="Your supervisor rushes past your desk, gives vague instructions to 'analyze competitors and make our platform better' by 3:00 PM, and expects immediate work.",
        difficulty="Easy",
        industry_tags=["General Corporate", "Technology and IT", "Human Resources", "Marketing"],
        compatible_roles=["Associate", "Junior Developer", "Business Analyst", "Product Associate", "All Roles"],
        skill_tags=["Communication", "Problem-solving", "Prioritisation", "Teamwork", "Adaptability"],
        character=CharacterMeta(
            name="Jordan Cole",
            role="Lead Architect & Team Supervisor",
            authority_level="Team Leader",
            communication_style="Busy, brisk, distracted, high-level, low patience for fluff",
            voice_profile="team_leader",
        ),
        opening_message="Hey, leadership wants us to do something about competitor pressure. Look into what our competitors are doing with AI features and put together some recommendations by 3:00 PM. Thanks!",
        rubric=[
            RubricCriterion(
                id="clarifying_question_formulation",
                name="Clarifying Question Formulation",
                weight=25.0,
                description="Asks targeted, high-value questions to define scope, audience, and key deliverables.",
                skill_id="communication",
                indicators={
                    1: "Asks no questions; wanders off with zero understanding.",
                    2: "Asks 15 trivial questions that irritate the busy supervisor.",
                    3: "Asks 2-3 basic questions about format and target competitors.",
                    4: "Asks crisp, high-leverage clarifying questions (scope, target audience, format).",
                    5: "Masterful scoping: frames questions as proposed hypotheses that require only a quick yes/no."
                }
            ),
            RubricCriterion(
                id="proactive_assumption_testing",
                name="Proactive Assumption Testing & Hypothesis Framing",
                weight=25.0,
                description="States reasonable working assumptions rather than remaining paralyzed by ambiguity.",
                skill_id="problem-solving",
                indicators={
                    1: "Paralyzed; does nothing because instructions were incomplete.",
                    2: "Makes wild assumptions without stating or verifying them.",
                    3: "Proposes a sensible working assumption (focus on top 2 competitors).",
                    4: "Outlines clear hypotheses on where competitor AI offers the highest threat.",
                    5: "Exceptional initiative: defines clear boundary parameters and strategic intent proactively."
                }
            ),
            RubricCriterion(
                id="incremental_milestone_scoping",
                name="Timeboxing & Deliverable Scoping",
                weight=20.0,
                description="Calibrates the output format (1-page briefing doc vs deck) realistically for the 3:00 PM deadline.",
                skill_id="prioritisation",
                indicators={
                    1: "Attempts to write a 40-page report in 4 hours.",
                    2: "Produces a hasty bulleted list with zero structure.",
                    3: "Proposes a concise 1-2 page executive brief.",
                    4: "Timeboxes the research: 2 hours research, 1 hour synthesis into a 3-bullet action memo.",
                    5: "Flawless time management: sets an interim 1:00 PM outline review to ensure alignment before finalizing."
                }
            ),
            RubricCriterion(
                id="alignment_seeking",
                name="Strategic Alignment Seeking",
                weight=20.0,
                description="Connects the analysis directly to current product differentiators and company strengths.",
                skill_id="teamwork",
                indicators={
                    1: "Copies and pastes random competitor marketing blurbs.",
                    2: "Shows no connection to our company's actual platform.",
                    3: "Compares competitor features to our primary feature set.",
                    4: "Evaluates competitor AI specifically against our core user journey and retention levers.",
                    5: "Strategic acumen: identifies gaps where competitor AI is superficial and proposes true differentiators."
                }
            ),
            RubricCriterion(
                id="autonomous_initiative",
                name="Autonomous Initiative Without Rogue Drift",
                weight=10.0,
                description="Demonstrates healthy autonomy without going rogue or wasting team cycles.",
                skill_id="adaptability",
                indicators={
                    1: "Helpless, needs hand-holding for every step.",
                    2: "Goes completely rogue, building an unrelated prototype.",
                    3: "Takes reasonable initiative on research.",
                    4: "Demonstrates balanced autonomy with planned alignment check-in.",
                    5: "Ideal self-starter: operates independently while proactively managing alignment."
                }
            ),
        ],
        branching_rules=[
            BranchRule(
                branch_id="strong_response",
                trigger_condition="score_gte_70",
                character_reaction="Relieved by clear thinking and targeted scoping.",
                dialogue="Great clarifying questions. Focusing on our top two direct rivals, specifically comparing their AI summaries against our workflow, is spot on. Keep it to a 1-page executive memo and Slack me the draft by 2:00 PM.",
                follow_up_prompt="Confirm the two competitors you will analyze and the structure of your 1-page memo.",
            ),
            BranchRule(
                branch_id="weak_response",
                trigger_condition="score_lt_70",
                character_reaction="Reminds user to confirm scope and format.",
                dialogue="I don't need a 50-page thesis or generic Google results. Tell me what specific competitor angle you're looking at and what your deliverable format is before you burn the whole morning.",
                follow_up_prompt="Specify the scope, format, and primary question your 3:00 PM brief will answer.",
            ),
            BranchRule(
                branch_id="fallback",
                trigger_condition="fallback",
                character_reaction="Asks for deliverable format.",
                dialogue="What format are you delivering at 3:00 PM and what are the main points?",
                follow_up_prompt="State your deliverable format and focus areas.",
            ),
        ],
        expected_behaviours=[
            "Don't freeze in paralysis or complain about vague instructions.",
            "Ask 2-3 focused clarifying questions or state your working assumptions.",
            "Propose a manageable format suited for a few hours: a 1-2 page executive brief.",
            "Schedule a quick 5-minute alignment check at 1:00 PM to ensure direction matches expectations."
        ],
        critical_mistakes=[
            "Starting immediately without confirming scope, leading to wasted hours.",
            "Attempting an unachievable comprehensive market audit by 3:00 PM.",
            "Bombarding the busy supervisor with dozens of open-ended questions.",
            "Waiting until 3:00 PM to admit you didn't know what they wanted."
        ],
        feedback_guidance="Focus on whether the candidate handled ambiguity with proactive, structured initiative.",
    ),
}


# ── Scenario Library Validation ────────────────────────────────────────────────

def validate_scenario_library() -> Dict[str, Any]:
    """
    Validates that:
    1. Exactly 10 predefined scenarios are loaded.
    2. All IDs are unique and URL-friendly.
    3. Every scenario's rubric criterion weights sum to exactly 100.0%.
    4. Behaviorally anchored definitions exist for all criteria.
    5. Branching rules have valid trigger conditions.
    """
    errors = []
    scenario_count = len(PREDEFINED_SCENARIOS)

    if scenario_count != 10:
        errors.append(f"Expected exactly 10 scenarios, found {scenario_count}")

    for sc_id, scenario in PREDEFINED_SCENARIOS.items():
        if sc_id != scenario.id:
            errors.append(f"Key '{sc_id}' does not match scenario.id '{scenario.id}'")

        # Validate weights sum to 100.0
        total_weight = sum(c.weight for c in scenario.rubric)
        if abs(total_weight - 100.0) > 0.001:
            errors.append(f"Scenario '{sc_id}' rubric weights sum to {total_weight}%, expected exactly 100.0%")

        # Validate criterion IDs unique
        c_ids = [c.id for c in scenario.rubric]
        if len(c_ids) != len(set(c_ids)):
            errors.append(f"Scenario '{sc_id}' contains duplicate rubric criterion IDs")

        # Validate branching rules
        has_strong = any(b.trigger_condition == "score_gte_70" for b in scenario.branching_rules)
        has_weak = any(b.trigger_condition == "score_lt_70" for b in scenario.branching_rules)
        if not (has_strong and has_weak):
            errors.append(f"Scenario '{sc_id}' must have both 'score_gte_70' and 'score_lt_70' branching rules")

    is_valid = len(errors) == 0
    return {
        "valid": is_valid,
        "scenario_count": scenario_count,
        "errors": errors
    }


# Run validation at import time to ensure absolute integrity
_validation_result = validate_scenario_library()
if not _validation_result["valid"]:
    logger.error(f"Scenario library validation errors: {_validation_result['errors']}")


# ── Deterministic Scoring Function ─────────────────────────────────────────────

def calculate_rubric_score(scenario_id: str, criterion_ratings: Dict[str, int]) -> Dict[str, Any]:
    """
    Authoritative deterministic scoring formula:
      weighted_points_i = (rating_i / 5.0) * weight_i
      total_score = sum(weighted_points_i)

    Takes scenario_id and a dict of criterion_id -> rating (1 to 5).
    Returns total score (0.0 to 100.0) and criterion breakdown.
    """
    scenario = PREDEFINED_SCENARIOS.get(scenario_id)
    if not scenario:
        raise ValueError(f"Unknown scenario ID: {scenario_id}")

    breakdown = {}
    total_score = 0.0

    for criterion in scenario.rubric:
        # Default to 0 (unaddressed/non-substantive) if missing from ratings
        try:
            raw_rating = int(criterion_ratings.get(criterion.id, 0))
        except (ValueError, TypeError):
            raw_rating = 0
        # Clamp rating between 0 and 5
        clamped_rating = max(0, min(5, raw_rating))
        
        weighted_points = (clamped_rating / 5.0) * criterion.weight
        total_score += weighted_points

        breakdown[criterion.id] = {
            "name": criterion.name,
            "skill_id": criterion.skill_id,
            "rating": clamped_rating,
            "weight": criterion.weight,
            "weighted_points": round(weighted_points, 2),
            "max_points": criterion.weight,
        }

    rounded_total = round(total_score, 1)

    # Determine branch
    selected_branch = None
    if rounded_total >= 70.0:
        for b in scenario.branching_rules:
            if b.trigger_condition == "score_gte_70":
                selected_branch = b
                break
    else:
        for b in scenario.branching_rules:
            if b.trigger_condition == "score_lt_70":
                selected_branch = b
                break

    if not selected_branch:
        for b in scenario.branching_rules:
            if b.trigger_condition == "fallback":
                selected_branch = b
                break
        if not selected_branch and scenario.branching_rules:
            selected_branch = scenario.branching_rules[0]

    selected_branch_dict = None
    if selected_branch:
        selected_branch_dict = selected_branch.model_dump() if hasattr(selected_branch, "model_dump") else selected_branch.dict()

    return {
        "scenario_id": scenario_id,
        "score": rounded_total,
        "passed": rounded_total >= 70.0,
        "criterion_breakdown": breakdown,
        "selected_branch": selected_branch_dict,
    }


# ── AI Evaluation with Gemini ──────────────────────────────────────────────────

def evaluate_scenario_response(
    scenario_id: str,
    candidate_answer: str,
    turn_id: int = 1,
    chat_fn: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Evaluates candidate's response using Gemini strictly to rate the criteria (0–5)
    and provide behavioral evidence.
    The final score is authoritatively computed by calculate_rubric_score.
    """
    scenario = PREDEFINED_SCENARIOS.get(scenario_id)
    if not scenario:
        raise ValueError(f"Unknown scenario ID: {scenario_id}")

    # Check for empty, trivial, greeting-only, or non-substantive answers
    answer_clean = (candidate_answer or "").strip()
    words = [w for w in re.findall(r'\b\w+\b', answer_clean.lower())]
    TRIVIAL_WORDS = {
        "hello", "hi", "hey", "hola", "howdy", "test", "testing",
        "ok", "okay", "yes", "no", "pass", "skip", "idk", "nothing",
        "none", "good", "fine", "cool", "thanks", "thank you"
    }
    is_trivial = (
        not answer_clean
        or (len(words) < 3 and all(w in TRIVIAL_WORDS or len(w) <= 2 for w in words))
        or (len(words) == 1 and words[0] in TRIVIAL_WORDS)
    )

    if is_trivial:
        ratings = {c.id: 0 for c in scenario.rubric}
        feedback = {
            c.id: f"No substantive operational response provided for {c.name}. Trivial greetings or non-answers receive 0 marks."
            for c in scenario.rubric
        }
        score_result = calculate_rubric_score(scenario_id, ratings)

        dim_scores = {}
        for c in scenario.rubric:
            skill = c.skill_id.lower().replace("-", "_")
            dim_scores[skill] = 0.0

        return {
            "scenario_id": scenario_id,
            "scenario_title": scenario.title,
            "turn_id": turn_id,
            "score": 0.0,
            "overall_score": 0.0,
            "passed": False,
            "dimension_scores": dim_scores,
            "criterion_breakdown": score_result["criterion_breakdown"],
            "criterion_feedback": feedback,
            "selected_branch": score_result["selected_branch"],
            "strengths": [],
            "improvements": [
                "Provide a detailed, practical action plan rather than greetings or trivial answers",
                "Directly address stakeholder concerns with timelines and accountability"
            ],
            "evidence_cited": [f"Candidate submitted non-substantive input: '{answer_clean[:60]}'"],
            "suggested_approach": scenario.expected_behaviours[0] if scenario.expected_behaviours else "Acknowledge the core dilemma, outline immediate mitigation steps, and provide clear timeline commitments.",
        }

    # Build rubric description for Gemini
    rubric_prompt_items = []
    for c in scenario.rubric:
        indicators_str = "\n".join([f"      Rating {k}: {v}" for k, v in sorted(c.indicators.items())])
        rubric_prompt_items.append(
            f"- Criterion ID: {c.id}\n"
            f"  Name: {c.name} (Weight: {c.weight}%)\n"
            f"  Description: {c.description}\n"
            f"  Behavioral Anchors:\n{indicators_str}"
        )
    rubric_str = "\n\n".join(rubric_prompt_items)

    system_prompt = f"""You are a rigorous occupational psychologist evaluating a workplace simulation response using the U.S. Office of Personnel Management (OPM) structured interview principles.

Scenario: {scenario.title}
Difficulty: {scenario.difficulty}
Character: {scenario.character.name} ({scenario.character.role}, Authority: {scenario.character.authority_level})
Opening Situation:
"{scenario.opening_message}"

Expected Desirable Behaviors:
{json.dumps(scenario.expected_behaviours, indent=2)}

Critical Mistakes to Watch For:
{json.dumps(scenario.critical_mistakes, indent=2)}

Evaluation Rubric:
{rubric_str}

TASK & GRADING POLICY:
1. Objectively and rigorously evaluate the candidate's response against each criterion.
2. Assign an integer rating from 0 to 5 for each criterion based strictly on observable behavioral evidence:
   - 0: Completely missing, greeting only (e.g. 'hello'), off-topic, or non-substantive (0 points).
   - 1: Highly deficient, counter-productive, or dangerous lack of operational judgment.
   - 2: Developing / superficial; vague intentions without concrete implementation steps.
   - 3: Competent / acceptable baseline; solves the immediate issue but lacks depth.
   - 4: Strong / proactive; well-structured plan, high empathy, clear timelines.
   - 5: Exemplary / master-level leadership, risk mitigation, and flawless communication.
3. Be rigorous: Candidates MUST provide concrete problem diagnosis, prioritization, and actionable next steps to earn marks.
4. Cite verbatim or specific evidence from the candidate's response.
5. Provide constructive feedback, strengths, improvements, and an exemplary suggested approach.
6. DO NOT calculate the overall score; the backend will calculate it deterministically from your 0-5 ratings.

Return a single valid JSON object with the following schema:
{{
  "criterion_ratings": {{
    "<criterion_id>": <integer 0 to 5>
  }},
  "criterion_feedback": {{
    "<criterion_id>": "<1-2 sentence evidence-based justification>"
  }},
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "evidence_cited": ["<specific quote or behavior observed>"],
  "suggested_approach": "<example of an exemplary response in plain professional language>"
}}"""

    user_prompt = f"Candidate Response to Evaluate:\n\"\"\"{candidate_answer.strip()}\"\"\""

    ratings = {}
    feedback = {}
    strengths = []
    improvements = []
    evidence_cited = []
    suggested_approach = ""

    if chat_fn:
        try:
            raw_response = chat_fn(system_prompt, user_prompt, temperature=0.2)
            # Parse JSON safely
            match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", raw_response)
            clean_text = match.group(1).strip() if match else raw_response.strip()
            data = json.loads(clean_text)

            ratings = data.get("criterion_ratings", {})
            feedback = data.get("criterion_feedback", {})
            strengths = data.get("strengths", [])
            improvements = data.get("improvements", [])
            evidence_cited = data.get("evidence_cited", [])
            suggested_approach = data.get("suggested_approach", "")
        except Exception as e:
            logger.warning(f"Gemini evaluation failed or returned malformed JSON: {e}. Using deterministic heuristic fallback.")

    # Fallback heuristic if LLM unavailable or failed
    if not ratings:
        ans_len = len(candidate_answer.strip().split())
        if ans_len < 3:
            base_rating = 0
        elif ans_len < 10:
            base_rating = 1
        elif ans_len < 25:
            base_rating = 2
        elif ans_len < 50:
            base_rating = 3
        else:
            base_rating = 3

        for c in scenario.rubric:
            ratings[c.id] = base_rating
            feedback[c.id] = f"Evaluated response substance for {c.name} based on operational parameters."
        strengths = ["Attempted direct response"] if base_rating >= 2 else []
        improvements = ["Add concrete milestones and timelines", "Proactively confirm stakeholder communication"]
        suggested_approach = scenario.expected_behaviours[0] if scenario.expected_behaviours else "Provide a direct, evidence-based plan."

    # Compute authoritative score
    score_result = calculate_rubric_score(scenario_id, ratings)

    # Populate standard dimension_scores for report aggregation
    dim_scores = {}
    for c in scenario.rubric:
        skill = c.skill_id.lower().replace("-", "_")
        c_rating = score_result["criterion_breakdown"].get(c.id, {}).get("rating", 0)
        dim_scores[skill] = round((c_rating / 5.0) * 100.0, 1)

    return {
        "scenario_id": scenario_id,
        "scenario_title": scenario.title,
        "turn_id": turn_id,
        "score": score_result["score"],
        "overall_score": score_result["score"],
        "passed": score_result["passed"],
        "dimension_scores": dim_scores,
        "criterion_breakdown": score_result["criterion_breakdown"],
        "criterion_feedback": feedback,
        "selected_branch": score_result["selected_branch"],
        "strengths": strengths,
        "improvements": improvements,
        "evidence_cited": evidence_cited,
        "suggested_approach": suggested_approach,
    }


# ── Personalised Scenario Recommendation Engine ────────────────────────────────

TRACKED_SKILLS = [
    "communication",
    "problem-solving",
    "prioritisation",
    "accountability",
    "teamwork",
    "adaptability",
    "conflict-resolution",
    "decision-making",
    "leadership",
    "interview-communication"
]

def get_scenario_recommendation(
    completed_scenarios: List[str],
    skill_scores: Optional[Dict[str, float]] = None,
    preferred_industry: Optional[str] = None,
    preferred_difficulty: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Identifies the candidate's lowest-scoring skill and finds the best uncompleted
    matching scenario in the library with a concise 1-sentence rationale.
    """
    available_ids = [s_id for s_id in PREDEFINED_SCENARIOS.keys() if s_id not in completed_scenarios]
    if not available_ids:
        # If all 10 are completed, recommend reviewing the toughest or first scenario
        available_ids = list(PREDEFINED_SCENARIOS.keys())

    # Find lowest skill
    lowest_skill = "prioritisation"
    lowest_val = 100.0

    if skill_scores:
        for skill, score in skill_scores.items():
            norm_skill = skill.lower().replace(" ", "-")
            if score < lowest_val:
                lowest_val = score
                lowest_skill = norm_skill

    # Match scenarios that assess this skill
    best_candidate_id = None
    for s_id in available_ids:
        sc = PREDEFINED_SCENARIOS[s_id]
        sc_skills = [c.skill_id.lower() for c in sc.rubric]
        if lowest_skill in sc_skills:
            if preferred_difficulty and sc.difficulty.lower() != preferred_difficulty.lower():
                continue
            best_candidate_id = s_id
            break

    if not best_candidate_id:
        best_candidate_id = available_ids[0]

    recommended = PREDEFINED_SCENARIOS[best_candidate_id]
    display_skill = lowest_skill.replace("-", " ").title()

    rationale = (
        f"You scored lower in {display_skill}, so we recommend '{recommended.title}' "
        f"to sharpen your {display_skill.lower()} skills under pressure."
    )

    return {
        "scenario_id": recommended.id,
        "title": recommended.title,
        "difficulty": recommended.difficulty,
        "primary_skills": recommended.skill_tags,
        "rationale": rationale,
        "target_skill": display_skill,
    }


def get_all_scenarios_catalog() -> List[Dict[str, Any]]:
    """Returns safe, frontend-ready catalog representation of all 10 scenarios."""
    catalog = []
    for sc in PREDEFINED_SCENARIOS.values():
        catalog.append({
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
            "time_limit_seconds": sc.time_limit_seconds,
            "pressure_room_compatible": sc.pressure_room_compatible,
            "criteria_names": [c.name for c in sc.rubric],
            "version": sc.version,
        })
    return catalog
