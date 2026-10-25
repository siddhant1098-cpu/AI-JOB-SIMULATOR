/**
 * Predefined Workspace Scenario Library Catalog
 * Contains full client-side metadata for all 10 prebuilt scenarios.
 */

export const PREDEFINED_SCENARIOS_CATALOG = [
  {
    id: "angry-client",
    title: "The Angry Client",
    difficulty: "Medium",
    industry_tags: ["General Corporate", "Technology and IT", "Sales and Customer Success", "Business and Management"],
    compatible_roles: ["Account Manager", "Customer Success Manager", "Project Manager", "Consultant", "Client Lead"],
    skill_tags: ["Communication", "Problem-solving", "Accountability", "Adaptability"],
    character: {
      name: "Elena Rostova",
      role: "VP of Operations, Client Enterprise",
      authority_level: "Client",
      communication_style: "Firm, urgent, highly demanding, and impatient",
      voice_profile: "upset_client",
    },
    opening_message: "I was promised the production deployment and client reporting deliverables would be live by 9:00 AM sharp. My leadership team is in an emergency board meeting right now waiting on these numbers, and your system shows nothing! What on earth happened, and how are you going to fix this right now?!",
    description: "A key enterprise client discovers a critical deliverable promised for this morning is delayed and demands an immediate explanation and concrete recovery.",
    time_limit_seconds: 60,
    pressure_room_compatible: true,
    expected_behaviours: [
      "Acknowledge the client's stress and the high stakes of their board meeting immediately.",
      "Take direct ownership of the problem without blaming other engineers or vendors.",
      "Provide an interim data export or partial summary right away to unblock the client's meeting.",
      "Set a concrete, realistic timeline for the full fix with regular status check-ins."
    ],
    rubric: [
      { id: "deescalation_empathy", name: "De-escalation & Customer Empathy", weight: 20.0, description: "Diffuses emotional tension without making defensive excuses.", skill_id: "communication" },
      { id: "root_cause_ownership", name: "Root Cause Ownership & Accountability", weight: 20.0, description: "Accepts direct responsibility for the issue without shifting blame.", skill_id: "accountability" },
      { id: "solution_actionability", name: "Solution Actionability & Concrete Timeline", weight: 30.0, description: "Offers a realistic, concrete recovery plan with committed delivery checkpoints.", skill_id: "problem-solving" },
      { id: "clear_expectation_setting", name: "Expectation Setting & Follow-up Protocol", weight: 20.0, description: "Establishes exact milestone updates and a proactive follow-up schedule.", skill_id: "prioritisation" },
      { id: "professional_poise", name: "Professional Poise Under Fire", weight: 10.0, description: "Maintains executive composure and steady tone during aggressive pressure.", skill_id: "adaptability" },
    ]
  },
  {
    id: "deadline-collision",
    title: "The Deadline Collision",
    difficulty: "Hard",
    industry_tags: ["Technology and IT", "Business and Management", "Operations and Project Management", "Finance"],
    compatible_roles: ["Software Engineer", "Project Manager", "Business Analyst", "Product Manager"],
    skill_tags: ["Prioritisation", "Decision-making", "Communication", "Problem-solving"],
    character: {
      name: "Marcus Vance",
      role: "Engineering & Delivery Director",
      authority_level: "Manager",
      communication_style: "High urgency, results-driven, expecting clear tradeoffs",
      voice_profile: "manager",
    },
    opening_message: "We have a critical fire drill from the VP: I need an executive summary of the Q3 architecture audit on my desk in two hours. I know you have the security compliance patch and the client onboarding batch due today, but both are important. Tell me how you're going to handle this collision.",
    description: "Your manager assigns an urgent ad-hoc executive request while you already have two high-impact deliverables due today.",
    time_limit_seconds: 60,
    pressure_room_compatible: true,
    expected_behaviours: [
      "Recognize that attempting all three without modification guarantees poor quality or missed deadlines.",
      "Rank the tasks based on compliance impact, risk, and executive urgency.",
      "Propose rescheduling the lowest-risk deliverable with a concrete alternate time.",
      "Commit to a specific delivery time for the 2-hour executive brief."
    ],
    rubric: [
      { id: "triage_prioritization", name: "Triage & Impact Prioritization", weight: 30.0, description: "Evaluates relative urgency, security risk, and business dependencies accurately.", skill_id: "prioritisation" },
      { id: "stakeholder_renegotiation", name: "Stakeholder Renegotiation & Boundary Setting", weight: 25.0, description: "Proactively negotiates realistic deadlines rather than making false commitments.", skill_id: "decision-making" },
      { id: "tradeoff_analysis", name: "Tradeoff & Risk Analysis", weight: 20.0, description: "Articulates the downstream impacts of delaying each respective deliverable.", skill_id: "problem-solving" },
      { id: "proactive_communication", name: "Proactive Milestone Planning", weight: 15.0, description: "Details a structured timeline with specific check-in milestones throughout the day.", skill_id: "communication" },
      { id: "stress_resilience", name: "Composure & Stress Resilience", weight: 10.0, description: "Maintains calm analytical focus under competing high-pressure demands.", skill_id: "adaptability" },
    ]
  },
  {
    id: "team-conflict",
    title: "The Team Conflict",
    difficulty: "Medium",
    industry_tags: ["Technology and IT", "Marketing", "Operations and Project Management", "General Corporate"],
    compatible_roles: ["Software Developer", "Product Designer", "Scrum Master", "Team Member", "Marketer"],
    skill_tags: ["Conflict resolution", "Teamwork", "Communication", "Accountability"],
    character: {
      name: "Alex Rivera",
      role: "Senior Peer Specialist",
      authority_level: "Peer",
      communication_style: "Defensive, frustrated, accusatory, and stressed",
      voice_profile: "coworker",
    },
    opening_message: "Great, the sprint demo is delayed again because we're still waiting on your component review. If you had just approved it yesterday instead of nitpicking formatting, we'd already be in staging. Why are you always blocking our deliveries?",
    description: "A teammate publicly blames you in a team channel for a shared project delay, accusing you of stalling progress.",
    time_limit_seconds: 60,
    pressure_room_compatible: true,
    expected_behaviours: [
      "Refuse to retaliate or engage in public mudslinging.",
      "Acknowledge the shared deadline pressure and desire to hit the demo.",
      "Separate critical functional/security concerns from non-blocking stylistic comments.",
      "Suggest moving to a quick 1-on-1 call or pair review to unblock staging within minutes."
    ],
    rubric: [
      { id: "active_listening_impartiality", name: "Active Listening & Non-Defensive Tone", weight: 20.0, description: "Listens to underlying frustration without launching into retaliatory counter-attacks.", skill_id: "conflict-resolution" },
      { id: "facilitation_mediation", name: "Issue Depersonalization & Facts Focus", weight: 30.0, description: "Reframes the conflict from personal blame to technical problem-solving.", skill_id: "teamwork" },
      { id: "psychological_safety", name: "Psychological Safety & Professionalism", weight: 20.0, description: "Protects team culture by keeping discussions constructive and suggesting appropriate channels.", skill_id: "communication" },
      { id: "action_oriented_resolution", name: "Action-Oriented Resolution & Next Steps", weight: 20.0, description: "Proposes concrete next steps to review, resolve, and deploy the blocked component.", skill_id: "problem-solving" },
      { id: "emotional_intelligence", name: "Emotional Intelligence & Self-Regulation", weight: 10.0, description: "Maintains emotional discipline despite provocative public accusations.", skill_id: "accountability" },
    ]
  },
  {
    id: "ceo-surprise-question",
    title: "The CEO's Surprise Question",
    difficulty: "Hard",
    industry_tags: ["General Corporate", "Technology and IT", "Finance", "Business and Management"],
    compatible_roles: ["Technical Lead", "Product Manager", "Operations Lead", "Senior Engineer", "All Roles"],
    skill_tags: ["Leadership", "Accountability", "Communication", "Decision-making"],
    character: {
      name: "Victoria Sterling",
      role: "Chief Executive Officer",
      authority_level: "Senior Executive",
      communication_style: "Direct, analytical, time-constrained, bottom-line focused",
      voice_profile: "executive",
    },
    opening_message: "I was just reviewing our Q3 executive scorecard, and the flagship rollout has slipped three weeks past the target. We're bleeding market momentum. In sixty seconds: what is the actual bottleneck, and what is our immediate recovery plan?",
    description: "The CEO unexpectedly stops you to ask why a flagship strategic rollout is behind schedule and what the recovery plan is.",
    time_limit_seconds: 60,
    pressure_room_compatible: true,
    expected_behaviours: [
      "Use BLUF (Bottom Line Up Front) delivery: state the bottleneck and plan in the first 15 seconds.",
      "Be intellectually honest about why the project slipped without finger-pointing.",
      "Provide a concrete revised milestone date rather than open-ended promises.",
      "Offer a written 1-page executive brief with measurable checkpoints."
    ],
    rubric: [
      { id: "executive_presence_poise", name: "Executive Presence & Composure", weight: 25.0, description: "Speaks with confidence, authority, and conciseness appropriate for C-suite interaction.", skill_id: "leadership" },
      { id: "intellectual_honesty", name: "Intellectual Honesty & Real Bottlenecks", weight: 20.0, description: "States the genuine root cause without sugarcoating or misleading claims.", skill_id: "accountability" },
      { id: "strategic_alignment", name: "Strategic Alignment & Commercial Impact", weight: 20.0, description: "Connects the operational delay to business revenue, customer impact, and strategic goals.", skill_id: "decision-making" },
      { id: "concise_bottom_line_delivery", name: "Bottom-Line-First (BLUF) Communication", weight: 25.0, description: "Delivers the key conclusion first within the 60-second executive window.", skill_id: "communication" },
      { id: "structured_followup_plan", name: "Structured Follow-up & Milestone Commitment", weight: 10.0, description: "Commits to a specific, concise follow-up brief and milestone tracking.", skill_id: "prioritisation" },
    ]
  },
  {
    id: "production-failure",
    title: "The Production Failure",
    difficulty: "Hard",
    industry_tags: ["Technology and IT", "Operations and Project Management", "Finance"],
    compatible_roles: ["DevOps Engineer", "Backend Engineer", "SRE", "Tech Lead", "Incident Commander"],
    skill_tags: ["Problem-solving", "Decision-making", "Prioritisation", "Communication", "Accountability"],
    character: {
      name: "Devon Vance",
      role: "VP of Engineering & Incident Commander",
      authority_level: "Team Leader",
      communication_style: "Urgent, rigorous, authoritative, requiring immediate triage logic",
      voice_profile: "team_leader",
    },
    opening_message: "Checkout is completely down in production. We are dropping hundreds of transactions a minute, and the nationwide marketing push goes live in 25 minutes. Walk me through your immediate containment and escalation steps right now.",
    description: "Thirty minutes before a nationwide marketing campaign launch, the checkout processing system crashes in production.",
    time_limit_seconds: 60,
    pressure_room_compatible: true,
    expected_behaviours: [
      "Prioritize containment (instant rollback/traffic drain) over diagnosing root cause in production.",
      "Advise immediately pausing the marketing campaign to prevent driving thousands of users to broken checkout.",
      "Establish a dedicated incident bridge with clear roles.",
      "Verify recovery with synthetic end-to-end payment runs before reopening."
    ],
    rubric: [
      { id: "incident_triage_containment", name: "Incident Triage & Containment", weight: 25.0, description: "Prioritizes blast radius containment (e.g. rollback) over root cause debate.", skill_id: "problem-solving" },
      { id: "blameless_root_cause_mindset", name: "Diagnostics & Blameless Mindset", weight: 25.0, description: "Investigates errors systematically using logs and metrics without assigning personal blame.", skill_id: "decision-making" },
      { id: "cross_team_status_communication", name: "Cross-Team Status Communication", weight: 20.0, description: "Communicates clear status to marketing, customer support, and leadership immediately.", skill_id: "communication" },
      { id: "prioritization_escalation", name: "Escalation & Resource Mobilization", weight: 15.0, description: "Mobilizes key on-call specialists and establishes an active incident bridge.", skill_id: "prioritisation" },
      { id: "postmortem_prevention", name: "Rollback Verification & Post-Mortem", weight: 15.0, description: "Verifies recovery with synthetic tests and plans a blameless post-mortem.", skill_id: "accountability" },
    ]
  },
  {
    id: "costly-mistake",
    title: "The Costly Mistake",
    difficulty: "Medium",
    industry_tags: ["General Corporate", "Finance", "Marketing", "Technology and IT"],
    compatible_roles: ["Financial Analyst", "Marketing Specialist", "Data Engineer", "Account Executive"],
    skill_tags: ["Accountability", "Problem-solving", "Communication", "Adaptability"],
    character: {
      name: "Rachel Bennett",
      role: "Director of Operations & Finance",
      authority_level: "Manager",
      communication_style: "Serious, focused on risk, ethical integrity, and remediation speed",
      voice_profile: "manager",
    },
    opening_message: "Three enterprise clients just called our account executives about unexpected 15% billing discrepancies on their monthly invoices. I traced the execution run to your batch update yesterday. What happened here, and what is our plan to make this right?",
    description: "You discover your own configuration error caused an automated billing run to overcharge 120 key enterprise accounts by 15%.",
    time_limit_seconds: 60,
    pressure_room_compatible: true,
    expected_behaviours: [
      "Acknowledge the mistake directly without pointing fingers at others.",
      "Provide the exact scope: 120 accounts overcharged by 15%.",
      "Present a concrete remediation plan: automated reversal, audit log verification.",
      "Offer a draft client-facing apology and explanation for account leads.",
      "Propose automated guardrails (e.g. sanity checks, dry-run mode) to prevent recurrence."
    ],
    rubric: [
      { id: "immediate_accountability", name: "Immediate Ethical Accountability", weight: 25.0, description: "Immediately owns the error fully without minimizing, deflecting, or hiding details.", skill_id: "accountability" },
      { id: "damage_mitigation_plan", name: "Damage Mitigation & Remediation", weight: 20.0, description: "Details a concrete operational plan to reverse overcharges and refund affected clients.", skill_id: "problem-solving" },
      { id: "transparent_upward_communication", name: "Transparent Client Communication", weight: 30.0, description: "Prepares proactive communication for account managers and affected clients.", skill_id: "communication" },
      { id: "prevention_safeguards", name: "Prevention Safeguards & Automated Validation", weight: 15.0, description: "Introduces safeguards (dry-run mode, peer sign-off) to prevent recurrence.", skill_id: "decision-making" },
      { id: "composure_under_fire", name: "Composure & Professional Integrity", weight: 10.0, description: "Remains solution-oriented and composed rather than collapsing in panic.", skill_id: "adaptability" },
    ]
  },
  {
    id: "challenging-interviewer",
    title: "The Challenging Interviewer",
    difficulty: "Hard",
    industry_tags: ["Technology and IT", "Business and Management", "Finance", "Human Resources"],
    compatible_roles: ["Senior Engineer", "Architect", "Product Manager", "Consultant", "Engineering Lead"],
    skill_tags: ["Interview communication", "Decision-making", "Adaptability", "Communication"],
    character: {
      name: "Dr. Aris Thorne",
      role: "Principal Architect & Senior Bar Raiser",
      authority_level: "Interviewer",
      communication_style: "Skeptical, intellectually rigorous, challenging, probing for depth",
      voice_profile: "interviewer",
    },
    opening_message: "Looking at your resume's migration project: choosing microservices for an 8-person engineering team looks like textbook over-engineering. You added massive operational overhead for minimal throughput gain. Defend that architecture decision to me.",
    description: "A senior bar-raiser interviewer aggressively challenges a key architectural or strategy decision on your resume, arguing it was a costly mistake.",
    time_limit_seconds: 60,
    pressure_room_compatible: true,
    expected_behaviours: [
      "Stay completely calm and treat the skepticism as an invitation to demonstrate deep reasoning.",
      "Validate the interviewer's premise: acknowledge that microservices indeed introduce significant operational overhead.",
      "Provide the specific context or constraint (e.g. independent compliance boundaries, distinct failure domains).",
      "Demonstrate retrospective wisdom: discuss what worked well and what you would do differently."
    ],
    rubric: [
      { id: "poise_under_skepticism", name: "Poise & Composure Under Skepticism", weight: 30.0, description: "Responds to intellectual challenge without becoming flustered, hostile, or defensive.", skill_id: "interview-communication" },
      { id: "evidence_based_defense", name: "Evidence-Based Defense of Tradeoffs", weight: 25.0, description: "Defends the decision using data, constraints, team dynamics, and business requirements.", skill_id: "decision-making" },
      { id: "receptivity_pushback", name: "Receptivity to Valid Counter-Arguments", weight: 20.0, description: "Acknowledges the interviewer's valid point regarding operational overhead.", skill_id: "adaptability" },
      { id: "executive_gravitas", name: "Professional Gravitas & Delivery", weight: 15.0, description: "Communicates with clarity, structured reasoning, and professional terminology.", skill_id: "communication" },
      { id: "cognitive_agility", name: "Cognitive Agility & Lessons Learned", weight: 10.0, description: "Shows ability to reflect retrospectively on what they would do differently today.", skill_id: "problem-solving" },
    ]
  },
  {
    id: "last-minute-presentation",
    title: "The Last-Minute Presentation",
    difficulty: "Medium",
    industry_tags: ["Marketing", "Business and Management", "Sales and Customer Success", "Technology and IT"],
    compatible_roles: ["Product Marketing Manager", "Strategy Consultant", "Sales Engineer", "Business Analyst"],
    skill_tags: ["Adaptability", "Prioritisation", "Communication", "Problem-solving"],
    character: {
      name: "David Chen",
      role: "Managing Director & Strategy Lead",
      authority_level: "Team Leader",
      communication_style: "Fast-paced, high expectations, pragmatic under pressure",
      voice_profile: "team_leader",
    },
    opening_message: "We walk into the client presentation room in five minutes, and the cohort retention slide is completely broken—half the data points didn't sync. We cannot show broken charts to the VP. How are we structuring the pitch right now?",
    description: "Five minutes before pitching an executive client committee, your team discovers the primary analytics dataset is missing half its cohort numbers.",
    time_limit_seconds: 60,
    pressure_room_compatible: true,
    expected_behaviours: [
      "Immediately suppress/hide the broken slide rather than showing broken charts.",
      "Refuse to fabricate or guess unverified data points.",
      "Pivot the presentation to verified business metrics and qualitative outcomes.",
      "Commit to delivering the audited cohort analysis in a post-meeting executive summary by afternoon."
    ],
    rubric: [
      { id: "rapid_synthesis_prioritization", name: "Rapid Synthesis & Core Narrative", weight: 25.0, description: "Immediately identifies the core presentation message that does not rely on missing data.", skill_id: "prioritisation" },
      { id: "audience_centric_messaging", name: "Audience-Centric Messaging", weight: 25.0, description: "Aligns restructured presentation with what client decision-makers truly care about.", skill_id: "communication" },
      { id: "calm_delivery_under_pressure", name: "Composure & Honest Transparency", weight: 20.0, description: "Delivers with calm poise and transparent honesty without fabricating numbers.", skill_id: "adaptability" },
      { id: "resourcefulness_fallback", name: "Resourcefulness & Fallback Slides", weight: 20.0, description: "Proposes a clean slide hide strategy and a concrete post-meeting deliverable.", skill_id: "problem-solving" },
      { id: "handling_unknowns", name: "Integrity & Handling Unknowns", weight: 10.0, description: "Refuses to misrepresent incomplete data under executive client scrutiny.", skill_id: "accountability" },
    ]
  },
  {
    id: "unrealistic-request",
    title: "The Unrealistic Request",
    difficulty: "Medium",
    industry_tags: ["Technology and IT", "Operations and Project Management", "Business and Management"],
    compatible_roles: ["Software Developer", "Product Manager", "UI/UX Designer", "Technical Lead"],
    skill_tags: ["Leadership", "Decision-making", "Problem-solving", "Communication"],
    character: {
      name: "Samantha Brooks",
      role: "Head of Product & Sprint Owner",
      authority_level: "Manager",
      communication_style: "Ambitious, aggressive, highly persuasive, deadline-driven",
      voice_profile: "manager",
    },
    opening_message: "I just spoke with our lead investor, and they want to see our full multi-tenant billing, team roles, and analytics dashboard live by Friday. That gives us 48 hours. I need your commitment that we'll have all five modules deployed.",
    description: "Your product manager demands you build and deploy five full complex feature modules within a 48-hour sprint for an impromptu investor demo.",
    time_limit_seconds: 60,
    pressure_room_compatible: true,
    expected_behaviours: [
      "Avoid saying 'Yes' to an impossible request that will result in broken code during the investor demo.",
      "Avoid an adversarial 'No' that leaves the product manager stranded.",
      "Explain the concrete risks: unvetted billing logic risks regulatory violations and transaction failures.",
      "Propose a compelling alternative: live sandbox demo for the core payment flow + polished clickable prototypes for analytics."
    ],
    rubric: [
      { id: "boundary_setting_tact", name: "Boundary Setting with Tact", weight: 25.0, description: "Sets firm, realistic boundaries without being cynical, insubordinate, or dismissive.", skill_id: "leadership" },
      { id: "data_driven_feasibility_pushback", name: "Data-Driven Feasibility Pushback", weight: 25.0, description: "Explains technical bottlenecks, QA requirements, and security risks with objective facts.", skill_id: "decision-making" },
      { id: "collaborative_alternative_solutions", name: "Collaborative MVP Compromise", weight: 20.0, description: "Proposes a pragmatic, compelling MVP compromise (e.g. interactive click-through).", skill_id: "problem-solving" },
      { id: "expectation_management", name: "Stakeholder Expectation Management", weight: 20.0, description: "Aligns the product lead and stakeholders on what can be guaranteed with high quality.", skill_id: "communication" },
      { id: "relationship_preservation", name: "Constructive Partnership & Tone", weight: 10.0, description: "Maintains an allied, collaborative tone rather than adversarial stance.", skill_id: "conflict-resolution" },
    ]
  },
  {
    id: "ambiguous-assignment",
    title: "The Ambiguous Assignment",
    difficulty: "Easy",
    industry_tags: ["General Corporate", "Technology and IT", "Human Resources", "Marketing"],
    compatible_roles: ["Associate", "Junior Developer", "Business Analyst", "Product Associate", "All Roles"],
    skill_tags: ["Communication", "Problem-solving", "Prioritisation", "Teamwork"],
    character: {
      name: "Jordan Cole",
      role: "Lead Architect & Team Supervisor",
      authority_level: "Team Leader",
      communication_style: "Busy, brisk, distracted, high-level, low patience for fluff",
      voice_profile: "team_leader",
    },
    opening_message: "Hey, leadership wants us to do something about competitor pressure. Look into what our competitors are doing with AI features and put together some recommendations by 3:00 PM. Thanks!",
    description: "Your supervisor rushes past your desk, gives vague instructions to 'analyze competitors and make our platform better' by 3:00 PM, and expects immediate work.",
    time_limit_seconds: 60,
    pressure_room_compatible: true,
    expected_behaviours: [
      "Don't freeze in paralysis or complain about vague instructions.",
      "Ask 2-3 focused clarifying questions or state your working assumptions.",
      "Propose a manageable format suited for a few hours: a 1-2 page executive brief.",
      "Schedule a quick 5-minute alignment check at 1:00 PM to ensure direction matches expectations."
    ],
    rubric: [
      { id: "clarifying_question_formulation", name: "Clarifying Question Formulation", weight: 25.0, description: "Asks targeted, high-value questions to define scope, audience, and key deliverables.", skill_id: "communication" },
      { id: "proactive_assumption_testing", name: "Proactive Assumption Testing", weight: 25.0, description: "States reasonable working assumptions rather than remaining paralyzed by ambiguity.", skill_id: "problem-solving" },
      { id: "incremental_milestone_scoping", name: "Timeboxing & Deliverable Scoping", weight: 20.0, description: "Calibrates output format realistically for the 3:00 PM deadline.", skill_id: "prioritisation" },
      { id: "alignment_seeking", name: "Strategic Alignment Seeking", weight: 20.0, description: "Connects analysis directly to current product differentiators and company strengths.", skill_id: "teamwork" },
      { id: "autonomous_initiative", name: "Autonomous Initiative Without Drift", weight: 10.0, description: "Demonstrates healthy autonomy without going rogue or wasting team cycles.", skill_id: "adaptability" },
    ]
  }
];
